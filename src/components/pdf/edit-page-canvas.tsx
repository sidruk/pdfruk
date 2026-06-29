"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { canvasFontFamily } from "@/lib/pdf/edit-fonts";
import { cn } from "@/lib/utils";
import type {
  EditAnnotation,
  EditFontFamily,
  EditTool,
  ImageAnnotation,
  ShapeAnnotation,
  ShapeKind,
  TextAnnotation,
} from "@/types/pdf";

type EditPageCanvasProps = {
  pageIndex: number;
  pageWidth: number;
  pageHeight: number;
  annotations: EditAnnotation[];
  activeTool: EditTool;
  activeShape: ShapeKind;
  selectedId: string | null;
  editingTextId?: string | null;
  color: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: EditFontFamily;
  bold: boolean;
  italic: boolean;
  onSelect: (id: string | null) => void;
  onAdd: (annotation: EditAnnotation) => void;
  onUpdate: (id: string, patch: Partial<EditAnnotation>) => void;
  onRemove: (id: string) => void;
  onTextPlaced?: (textId: string) => void;
  onEditingTextChange?: (id: string | null) => void;
};

type DraftState =
  | { kind: "draw"; points: Array<{ x: number; y: number }> }
  | { kind: "shape"; shape: ShapeKind; x1: number; y1: number; x2: number; y2: number };

function createId(): string {
  return crypto.randomUUID();
}

function toNormalizedPoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };

  const local = point.matrixTransform(ctm.inverse());
  const { width, height } = svg.viewBox.baseVal;
  if (width <= 0 || height <= 0) return { x: 0, y: 0 };

  return {
    x: Math.min(1, Math.max(0, local.x / width)),
    y: Math.min(1, Math.max(0, local.y / height)),
  };
}

function getPoint(
  event: React.MouseEvent,
  svg: SVGSVGElement,
): { x: number; y: number } {
  return toNormalizedPoint(svg, event.clientX, event.clientY);
}

function getPagePointFromClient(
  clientX: number,
  clientY: number,
  svg: SVGSVGElement,
): { x: number; y: number } {
  return toNormalizedPoint(svg, clientX, clientY);
}

function shapeBounds(annotation: ShapeAnnotation): {
  left: number;
  top: number;
  width: number;
  height: number;
} {
  return {
    left: Math.min(annotation.x1, annotation.x2),
    top: Math.min(annotation.y1, annotation.y2),
    width: Math.abs(annotation.x2 - annotation.x1),
    height: Math.abs(annotation.y2 - annotation.y1),
  };
}

function clampPosition(
  x: number,
  y: number,
  width: number,
  height: number,
): { x: number; y: number } {
  return {
    x: Math.min(Math.max(0, x), 1 - width),
    y: Math.min(Math.max(0, y), 1 - height),
  };
}

type MoveInteraction = {
  kind: "move";
  startClientX: number;
  startClientY: number;
  origX: number;
  origY: number;
  scaleX: number;
  scaleY: number;
};

type TextInteraction =
  | MoveInteraction
  | {
      kind: "rotate";
      startAngle: number;
      origRotation: number;
      centerX: number;
      centerY: number;
    };

const MOVE_BAR_HEIGHT = 14;
const ROTATE_HANDLE_OFFSET = 32;
const RESIZE_HANDLE_SIZE = 8;
const TEXT_HANDLE_SIZE = 7;
const TEXT_SELECTION_COLOR = "#3b82f6";
const TEXT_PLACEHOLDER = "Your text here";
const TEXT_LINE_PADDING = 8;
const TEXT_DRAG_HANDLE_SPACE = 14;
const MIN_PLACED_SIZE = 0.03;

let textMeasureCanvas: HTMLCanvasElement | null = null;

function measureTextWidth(
  text: string,
  fontSize: number,
  fontFamily: EditFontFamily,
  bold: boolean,
  italic: boolean,
): number {
  const sample = text || TEXT_PLACEHOLDER;
  if (typeof document === "undefined") {
    return sample.length * fontSize * 0.55;
  }

  textMeasureCanvas ??= document.createElement("canvas");
  const context = textMeasureCanvas.getContext("2d");
  if (!context) {
    return sample.length * fontSize * 0.55;
  }

  context.font = `${italic ? "italic " : ""}${bold ? "bold " : ""}${fontSize}px ${canvasFontFamily(fontFamily)}`;
  return context.measureText(sample).width;
}

function singleLineBoxSize(
  text: string,
  fontSize: number,
  fontFamily: EditFontFamily,
  bold: boolean,
  italic: boolean,
  pageWidth: number,
  pageHeight: number,
): { width: number; height: number } {
  const textWidth = measureTextWidth(text, fontSize, fontFamily, bold, italic);

  return {
    width: Math.max(
      MIN_PLACED_SIZE,
      Math.min(1, (textWidth + TEXT_LINE_PADDING * 2) / pageWidth),
    ),
    height: Math.max(
      MIN_PLACED_SIZE,
      (fontSize + TEXT_LINE_PADDING * 2 + TEXT_DRAG_HANDLE_SPACE) / pageHeight,
    ),
  };
}

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

type ResizeInteraction = {
  kind: "resize";
  handle: ResizeHandle;
  origX: number;
  origY: number;
  origWidth: number;
  origHeight: number;
  origRotation: number;
  anchorPageX: number;
  anchorPageY: number;
};

function rotatePoint(x: number, y: number, degrees: number) {
  const rad = (degrees * Math.PI) / 180;
  return {
    x: x * Math.cos(rad) - y * Math.sin(rad),
    y: x * Math.sin(rad) + y * Math.cos(rad),
  };
}

function pageToLocalPoint(
  pageX: number,
  pageY: number,
  box: { x: number; y: number; width: number; height: number; rotation: number },
) {
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const dx = pageX - centerX;
  const dy = pageY - centerY;
  const unrotated = rotatePoint(dx, dy, -box.rotation);
  return {
    x: unrotated.x + box.width / 2,
    y: unrotated.y + box.height / 2,
  };
}

function anchorOffsetForHandle(
  handle: ResizeHandle,
  width: number,
  height: number,
): { x: number; y: number } {
  switch (handle) {
    case "nw":
      return { x: width / 2, y: height / 2 };
    case "n":
      return { x: 0, y: height / 2 };
    case "ne":
      return { x: -width / 2, y: height / 2 };
    case "e":
      return { x: -width / 2, y: 0 };
    case "se":
      return { x: -width / 2, y: -height / 2 };
    case "s":
      return { x: 0, y: -height / 2 };
    case "sw":
      return { x: width / 2, y: -height / 2 };
    case "w":
      return { x: width / 2, y: 0 };
  }
}

function computeResizedBox(
  handle: ResizeHandle,
  localPoint: { x: number; y: number },
  interaction: ResizeInteraction,
): { x: number; y: number; width: number; height: number } {
  const { origWidth, origHeight } = interaction;
  let newWidth = origWidth;
  let newHeight = origHeight;

  switch (handle) {
    case "se":
      newWidth = Math.max(MIN_PLACED_SIZE, localPoint.x);
      newHeight = Math.max(MIN_PLACED_SIZE, localPoint.y);
      break;
    case "nw":
      newWidth = Math.max(MIN_PLACED_SIZE, origWidth - localPoint.x);
      newHeight = Math.max(MIN_PLACED_SIZE, origHeight - localPoint.y);
      break;
    case "ne":
      newWidth = Math.max(MIN_PLACED_SIZE, localPoint.x);
      newHeight = Math.max(MIN_PLACED_SIZE, origHeight - localPoint.y);
      break;
    case "sw":
      newWidth = Math.max(MIN_PLACED_SIZE, origWidth - localPoint.x);
      newHeight = Math.max(MIN_PLACED_SIZE, localPoint.y);
      break;
    case "e":
      newWidth = Math.max(MIN_PLACED_SIZE, localPoint.x);
      break;
    case "w":
      newWidth = Math.max(MIN_PLACED_SIZE, origWidth - localPoint.x);
      break;
    case "s":
      newHeight = Math.max(MIN_PLACED_SIZE, localPoint.y);
      break;
    case "n":
      newHeight = Math.max(MIN_PLACED_SIZE, origHeight - localPoint.y);
      break;
  }

  newWidth = Math.min(newWidth, 1);
  newHeight = Math.min(newHeight, 1);

  const anchorLocal = anchorOffsetForHandle(handle, newWidth, newHeight);
  const anchorRotated = rotatePoint(
    anchorLocal.x,
    anchorLocal.y,
    interaction.origRotation,
  );
  const centerX = interaction.anchorPageX - anchorRotated.x;
  const centerY = interaction.anchorPageY - anchorRotated.y;
  const position = clampPosition(
    centerX - newWidth / 2,
    centerY - newHeight / 2,
    newWidth,
    newHeight,
  );

  return {
    x: position.x,
    y: position.y,
    width: Math.min(newWidth, 1 - position.x),
    height: Math.min(newHeight, 1 - position.y),
  };
}

const RESIZE_HANDLES: Array<{
  handle: ResizeHandle;
  x: (width: number) => number;
  y: (height: number) => number;
  cursorClass: string;
}> = [
  { handle: "nw", x: () => 0, y: () => 0, cursorClass: "cursor-nwse-resize" },
  { handle: "n", x: (width) => width / 2, y: () => 0, cursorClass: "cursor-ns-resize" },
  { handle: "ne", x: (width) => width, y: () => 0, cursorClass: "cursor-nesw-resize" },
  { handle: "e", x: (width) => width, y: (height) => height / 2, cursorClass: "cursor-ew-resize" },
  { handle: "se", x: (width) => width, y: (height) => height, cursorClass: "cursor-nwse-resize" },
  { handle: "s", x: (width) => width / 2, y: (height) => height, cursorClass: "cursor-ns-resize" },
  { handle: "sw", x: () => 0, y: (height) => height, cursorClass: "cursor-nesw-resize" },
  { handle: "w", x: () => 0, y: (height) => height / 2, cursorClass: "cursor-ew-resize" },
];

function textFontStyles(annotation: TextAnnotation) {
  const family = annotation.fontFamily ?? "helvetica";
  const isBold = annotation.bold ?? false;
  const isItalic = annotation.italic ?? false;

  return {
    fontFamily: canvasFontFamily(family),
    fontWeight: isBold ? "bold" : "normal",
    fontStyle: isItalic ? "italic" : "normal",
  } as const;
}

type ShapeMoveInteraction = {
  kind: "move";
  startClientX: number;
  startClientY: number;
  scaleX: number;
  scaleY: number;
  origX1: number;
  origY1: number;
  origX2: number;
  origY2: number;
};

function getSvgScale(svg: SVGSVGElement | null): { scaleX: number; scaleY: number } | null {
  if (!svg) return null;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  return { scaleX: ctm.a, scaleY: ctm.d };
}

function clientDeltaToNormalized(
  deltaX: number,
  deltaY: number,
  scale: { scaleX: number; scaleY: number },
  pageWidth: number,
  pageHeight: number,
): { x: number; y: number } {
  return {
    x: deltaX / scale.scaleX / pageWidth,
    y: deltaY / scale.scaleY / pageHeight,
  };
}

function textContentStyles(annotation: TextAnnotation) {
  const fontStyles = textFontStyles(annotation);
  const opacity = (annotation.opacity ?? 100) / 100;

  return {
    ...fontStyles,
    color: annotation.color,
    opacity,
    textAlign: annotation.textAlign ?? "left",
    textDecoration: annotation.underline ? "underline" : "none",
  } as const;
}

function TextBoxBorder({
  width,
  height,
  showHandles,
}: {
  width: number;
  height: number;
  showHandles: boolean;
}) {
  return (
    <rect
      x={0}
      y={0}
      width={width}
      height={height}
      fill="transparent"
      stroke={showHandles ? TEXT_SELECTION_COLOR : "transparent"}
      strokeWidth={showHandles ? 1 : 0}
      pointerEvents="none"
    />
  );
}

function TextBoxHandles({
  width,
  height,
  showHandles,
  onResizeStart,
}: {
  width: number;
  height: number;
  showHandles: boolean;
  onResizeStart: (event: React.PointerEvent, handle: ResizeHandle) => void;
}) {
  if (!showHandles) return null;

  return (
    <>
      {RESIZE_HANDLES.map(({ handle, x, y, cursorClass }) => {
        const handleX = x(width);
        const handleY = y(height);
        return (
          <rect
            key={handle}
            x={handleX - TEXT_HANDLE_SIZE / 2}
            y={handleY - TEXT_HANDLE_SIZE / 2}
            width={TEXT_HANDLE_SIZE}
            height={TEXT_HANDLE_SIZE}
            fill={TEXT_SELECTION_COLOR}
            stroke="white"
            strokeWidth={0.75}
            className={cursorClass}
            onPointerDown={(event) => {
              event.stopPropagation();
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              onResizeStart(event, handle);
            }}
          />
        );
      })}
    </>
  );
}

function PlacedItemChrome({
  width,
  height,
  color,
  showHandles,
  showRotate = true,
  resizable = false,
  editing,
  interaction,
  onMoveStart,
  onRotateStart,
  onResizeStart,
}: {
  width: number;
  height: number;
  color: string;
  showHandles: boolean;
  showRotate?: boolean;
  resizable?: boolean;
  editing?: boolean;
  interaction: TextInteraction | ShapeMoveInteraction | ResizeInteraction | null;
  onMoveStart: (event: React.MouseEvent) => void;
  onRotateStart: (event: React.MouseEvent) => void;
  onResizeStart?: (event: React.MouseEvent, handle: ResizeHandle) => void;
}) {
  return (
    <>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="transparent"
        stroke={showHandles ? color : "transparent"}
        strokeWidth={showHandles ? 1 : 0}
        strokeDasharray={showHandles ? "4 2" : undefined}
        className={cn(showHandles && !editing && "cursor-move")}
        onMouseDown={(event) => {
          if (!showHandles || editing) return;
          onMoveStart(event);
        }}
      />

      {showHandles ? (
        <>
          {showRotate ? (
            <>
              <line
                x1={width / 2}
                y1={0}
                x2={width / 2}
                y2={-ROTATE_HANDLE_OFFSET + 10}
                stroke={color}
                strokeWidth={1}
              />
              <g
                transform={`translate(${width / 2}, ${-ROTATE_HANDLE_OFFSET})`}
                className={cn(
                  interaction?.kind === "rotate" ? "cursor-grabbing" : "cursor-grab",
                )}
                onMouseDown={onRotateStart}
              >
                <circle
                  r={10}
                  fill="white"
                  stroke={color}
                  strokeWidth={1.5}
                />
                <path
                  d="M -4 -1 A 4 4 0 1 1 3 -3"
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
                <path
                  d="M 3 -3 L 3 -6 L 0 -3 Z"
                  fill={color}
                />
              </g>
            </>
          ) : null}

          <rect
            x={0}
            y={0}
            width={width}
            height={MOVE_BAR_HEIGHT}
            fill={color}
            fillOpacity={0.12}
            stroke={color}
            strokeWidth={0.5}
            strokeOpacity={0.35}
            className={cn(
              interaction?.kind === "move" ? "cursor-grabbing" : "cursor-move",
            )}
            onMouseDown={onMoveStart}
          />
          <g
            pointerEvents="none"
            transform={`translate(${width / 2}, ${MOVE_BAR_HEIGHT / 2})`}
          >
            <path
              d="M -8 0 H 8 M -5 -3 H 5 M -5 3 H 5"
              stroke={color}
              strokeWidth={1.25}
              strokeLinecap="round"
            />
          </g>

          {resizable && onResizeStart
            ? RESIZE_HANDLES.map(({ handle, x, y, cursorClass }) => {
                const handleX = x(width);
                const handleY = y(height);
                return (
                  <rect
                    key={handle}
                    x={handleX - RESIZE_HANDLE_SIZE / 2}
                    y={handleY - RESIZE_HANDLE_SIZE / 2}
                    width={RESIZE_HANDLE_SIZE}
                    height={RESIZE_HANDLE_SIZE}
                    fill="white"
                    stroke={color}
                    strokeWidth={1.25}
                    className={cursorClass}
                    onMouseDown={(event) => {
                      event.stopPropagation();
                      onResizeStart(event, handle);
                    }}
                  />
                );
              })
            : null}
        </>
      ) : null}
    </>
  );
}

function usePlacedItemInteraction({
  annotation,
  pageWidth,
  pageHeight,
  getPagePoint,
  getMoveScale,
  onSelect,
  onUpdate,
  resizable = false,
}: {
  annotation: { x: number; y: number; width: number; height: number; rotation: number };
  pageWidth: number;
  pageHeight: number;
  getPagePoint: (clientX: number, clientY: number) => { x: number; y: number };
  getMoveScale: () => { scaleX: number; scaleY: number } | null;
  onSelect: () => void;
  onUpdate: (patch: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rotation?: number;
  }) => void;
  resizable?: boolean;
}) {
  const [interaction, setInteraction] = useState<
    TextInteraction | ResizeInteraction | null
  >(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!interaction) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (interaction.kind === "move") {
        const delta = clientDeltaToNormalized(
          event.clientX - interaction.startClientX,
          event.clientY - interaction.startClientY,
          interaction,
          pageWidth,
          pageHeight,
        );
        const next = clampPosition(
          interaction.origX + delta.x,
          interaction.origY + delta.y,
          annotation.width,
          annotation.height,
        );
        onUpdateRef.current(next);
        return;
      }

      const point = getPagePoint(event.clientX, event.clientY);

      if (interaction.kind === "resize") {
        const localPoint = pageToLocalPoint(point.x, point.y, {
          x: interaction.origX,
          y: interaction.origY,
          width: interaction.origWidth,
          height: interaction.origHeight,
          rotation: interaction.origRotation,
        });
        onUpdateRef.current(computeResizedBox(interaction.handle, localPoint, interaction));
        return;
      }

      const angle =
        (Math.atan2(
          point.y - interaction.centerY,
          point.x - interaction.centerX,
        ) *
          180) /
        Math.PI;
      onUpdateRef.current({
        rotation: Math.round(
          interaction.origRotation + (angle - interaction.startAngle),
        ),
      });
    };

    const handlePointerUp = () => setInteraction(null);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [annotation.height, annotation.width, getPagePoint, interaction, pageHeight, pageWidth]);

  const startMove = (event: React.PointerEvent | React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    onSelect();
    const scale = getMoveScale();
    if (!scale) return;

    setInteraction({
      kind: "move",
      startClientX: event.clientX,
      startClientY: event.clientY,
      origX: annotation.x,
      origY: annotation.y,
      scaleX: scale.scaleX,
      scaleY: scale.scaleY,
    });
  };

  const startRotate = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    onSelect();
    const point = getPagePoint(event.clientX, event.clientY);
    const centerX = annotation.x + annotation.width / 2;
    const centerY = annotation.y + annotation.height / 2;
    const startAngle =
      (Math.atan2(point.y - centerY, point.x - centerX) * 180) / Math.PI;

    setInteraction({
      kind: "rotate",
      startAngle,
      origRotation: annotation.rotation,
      centerX,
      centerY,
    });
  };

  const startResize = (event: React.PointerEvent | React.MouseEvent, handle: ResizeHandle) => {
    if (!resizable) return;
    event.stopPropagation();
    event.preventDefault();
    onSelect();

    const centerX = annotation.x + annotation.width / 2;
    const centerY = annotation.y + annotation.height / 2;
    const anchorLocal = anchorOffsetForHandle(
      handle,
      annotation.width,
      annotation.height,
    );
    const anchorRotated = rotatePoint(
      anchorLocal.x,
      anchorLocal.y,
      annotation.rotation,
    );

    setInteraction({
      kind: "resize",
      handle,
      origX: annotation.x,
      origY: annotation.y,
      origWidth: annotation.width,
      origHeight: annotation.height,
      origRotation: annotation.rotation,
      anchorPageX: centerX + anchorRotated.x,
      anchorPageY: centerY + anchorRotated.y,
    });
  };

  return { interaction, startMove, startRotate, startResize };
}

function TextAnnotationView({
  annotation,
  selected,
  isEditing,
  pageWidth,
  pageHeight,
  getPagePoint,
  getMoveScale,
  onSelect,
  onUpdate,
  onStartEdit,
  onStopEdit,
}: {
  annotation: TextAnnotation;
  selected: boolean;
  isEditing: boolean;
  pageWidth: number;
  pageHeight: number;
  getPagePoint: (clientX: number, clientY: number) => { x: number; y: number };
  getMoveScale: () => { scaleX: number; scaleY: number } | null;
  onSelect: () => void;
  onUpdate: (patch: Partial<TextAnnotation>) => void;
  onStartEdit: () => void;
  onStopEdit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const isPlaceholder = annotation.text === TEXT_PLACEHOLDER;
  const [hovered, setHovered] = useState(false);
  const { interaction, startMove, startResize } = usePlacedItemInteraction({
    annotation,
    pageWidth,
    pageHeight,
    getPagePoint,
    getMoveScale,
    onSelect,
    onUpdate,
    resizable: true,
  });
  const contentStyles = textContentStyles(annotation);
  const textOpacity = (annotation.opacity ?? 100) / 100;
  const lineHeightPx = annotation.fontSize + TEXT_LINE_PADDING * 2;

  useEffect(() => {
    if (!isEditing) return;

    const frame = window.requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;
      input.focus();
      if (isPlaceholder) {
        input.select();
        window.setTimeout(() => input.select(), 0);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [annotation.id, isEditing, isPlaceholder]);

  useEffect(() => {
    const nextSize = singleLineBoxSize(
      annotation.text,
      annotation.fontSize,
      annotation.fontFamily ?? "helvetica",
      annotation.bold,
      annotation.italic,
      pageWidth,
      pageHeight,
    );

    if (
      Math.abs(annotation.width - nextSize.width) > 0.001 ||
      Math.abs(annotation.height - nextSize.height) > 0.001
    ) {
      onUpdateRef.current(nextSize);
    }
  }, [
    annotation.bold,
    annotation.fontFamily,
    annotation.fontSize,
    annotation.italic,
    annotation.text,
    pageHeight,
    pageWidth,
  ]);

  const x = annotation.x * pageWidth;
  const y = annotation.y * pageHeight;
  const width = annotation.width * pageWidth;
  const height = annotation.height * pageHeight;
  const showHandles = hovered || selected || interaction !== null;

  const stopPointer = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const handleTextChange = (rawValue: string) => {
    let text = rawValue.replace(/[\r\n]/g, "");
    if (
      annotation.text === TEXT_PLACEHOLDER &&
      text.startsWith(TEXT_PLACEHOLDER) &&
      text.length > TEXT_PLACEHOLDER.length
    ) {
      text = text.slice(TEXT_PLACEHOLDER.length);
    }
    onUpdate({
      text,
      ...singleLineBoxSize(
        text,
        annotation.fontSize,
        annotation.fontFamily,
        annotation.bold,
        annotation.italic,
        pageWidth,
        pageHeight,
      ),
    });
  };

  const handleMoveStart = (event: React.PointerEvent) => {
    inputRef.current?.blur();
    startMove(event);
  };

  return (
    <g
      transform={`translate(${x + width / 2}, ${y + height / 2}) rotate(${annotation.rotation}) translate(${-width / 2}, ${-height / 2})`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={stopPointer}
      onClick={(event) => {
        event.stopPropagation();
        if (isEditing) return;
        if (isPlaceholder && selected) {
          onStartEdit();
          return;
        }
        onSelect();
      }}
    >
      {annotation.backgroundColor ? (
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={annotation.backgroundColor}
          fillOpacity={textOpacity}
          pointerEvents="none"
        />
      ) : null}

      <TextBoxBorder width={width} height={height} showHandles={showHandles} />

      {isEditing ? (
        <foreignObject
          x={0}
          y={0}
          width={width}
          height={lineHeightPx}
        >
          <div className="h-full w-full overflow-hidden">
            <input
              ref={inputRef}
              type="text"
              autoFocus={selected}
              value={annotation.text}
              onChange={(event) => handleTextChange(event.target.value)}
              onFocus={(event) => {
                if (isPlaceholder) {
                  event.target.select();
                }
              }}
              onBlur={() => {
                onStopEdit();
              }}
              onMouseDown={stopPointer}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (
                  isPlaceholder &&
                  event.key.length === 1 &&
                  !event.ctrlKey &&
                  !event.metaKey &&
                  !event.altKey
                ) {
                  event.preventDefault();
                  handleTextChange(event.key);
                  return;
                }
                if (event.key === "Enter") {
                  event.preventDefault();
                  onStopEdit();
                }
                if (event.key === "Escape") {
                  onStopEdit();
                }
              }}
              className="block h-full w-full border-0 bg-transparent px-1 outline-none"
              style={{
                fontSize: annotation.fontSize,
                lineHeight: `${annotation.fontSize}px`,
                ...contentStyles,
              }}
            />
          </div>
        </foreignObject>
      ) : (
        <>
          <text
            x={
              (annotation.textAlign ?? "left") === "center"
                ? width / 2
                : (annotation.textAlign ?? "left") === "right"
                  ? width - TEXT_LINE_PADDING
                  : TEXT_LINE_PADDING
            }
            y={annotation.fontSize + TEXT_LINE_PADDING / 2}
            fill={annotation.color}
            fillOpacity={textOpacity}
            fontSize={annotation.fontSize}
            fontFamily={contentStyles.fontFamily}
            fontWeight={contentStyles.fontWeight}
            fontStyle={contentStyles.fontStyle}
            textDecoration={contentStyles.textDecoration}
            textAnchor={
              (annotation.textAlign ?? "left") === "center"
                ? "middle"
                : (annotation.textAlign ?? "left") === "right"
                  ? "end"
                  : "start"
            }
            className="select-none pointer-events-none"
          >
            {annotation.text}
          </text>
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="transparent"
            className={cn(
              interaction?.kind === "move" ? "cursor-grabbing" : "cursor-grab",
            )}
            onPointerDown={handleMoveStart}
            onDoubleClick={(event) => {
              event.stopPropagation();
              onSelect();
              onStartEdit();
            }}
          />
        </>
      )}

      <TextBoxHandles
        width={width}
        height={height}
        showHandles={showHandles && !isEditing}
        onResizeStart={startResize}
      />
    </g>
  );
}

function ImageAnnotationView({
  annotation,
  selected,
  pageWidth,
  pageHeight,
  getPagePoint,
  getMoveScale,
  onSelect,
  onUpdate,
}: {
  annotation: ImageAnnotation;
  selected: boolean;
  pageWidth: number;
  pageHeight: number;
  getPagePoint: (clientX: number, clientY: number) => { x: number; y: number };
  getMoveScale: () => { scaleX: number; scaleY: number } | null;
  onSelect: () => void;
  onUpdate: (patch: Partial<ImageAnnotation>) => void;
}) {
  const { interaction, startMove, startRotate, startResize } = usePlacedItemInteraction({
    annotation,
    pageWidth,
    pageHeight,
    getPagePoint,
    getMoveScale,
    onSelect,
    onUpdate,
    resizable: true,
  });

  const x = annotation.x * pageWidth;
  const y = annotation.y * pageHeight;
  const width = annotation.width * pageWidth;
  const height = annotation.height * pageHeight;
  const showHandles = selected || interaction !== null;
  const contentTop = showHandles ? MOVE_BAR_HEIGHT : 0;
  const contentHeight = height - contentTop;

  const stopPointer = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <g
      transform={`translate(${x + width / 2}, ${y + height / 2}) rotate(${annotation.rotation}) translate(${-width / 2}, ${-height / 2})`}
      onMouseDown={stopPointer}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <PlacedItemChrome
        width={width}
        height={height}
        color={annotation.color}
        showHandles={showHandles}
        resizable
        interaction={interaction}
        onMoveStart={startMove}
        onRotateStart={startRotate}
        onResizeStart={startResize}
      />
      <image
        href={annotation.imageData}
        x={0}
        y={contentTop}
        width={width}
        height={Math.max(contentHeight, 1)}
        preserveAspectRatio="xMidYMid meet"
        className={cn(showHandles && "cursor-move")}
        onMouseDown={startMove}
      />
    </g>
  );
}

function useShapeInteraction({
  annotation,
  pageWidth,
  pageHeight,
  getMoveScale,
  onSelect,
  onUpdate,
  enabled,
}: {
  annotation: ShapeAnnotation;
  pageWidth: number;
  pageHeight: number;
  getMoveScale: () => { scaleX: number; scaleY: number } | null;
  onSelect: () => void;
  onUpdate: (patch: Partial<ShapeAnnotation>) => void;
  enabled: boolean;
}) {
  const [interaction, setInteraction] = useState<ShapeMoveInteraction | null>(
    null,
  );
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!interaction) return;

    const handlePointerMove = (event: PointerEvent) => {
      const delta = clientDeltaToNormalized(
        event.clientX - interaction.startClientX,
        event.clientY - interaction.startClientY,
        interaction,
        pageWidth,
        pageHeight,
      );
      onUpdateRef.current({
        x1: interaction.origX1 + delta.x,
        y1: interaction.origY1 + delta.y,
        x2: interaction.origX2 + delta.x,
        y2: interaction.origY2 + delta.y,
      });
    };

    const handlePointerUp = () => setInteraction(null);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [interaction, pageHeight, pageWidth]);

  const startMove = (event: React.MouseEvent) => {
    if (!enabled) return;
    event.stopPropagation();
    event.preventDefault();
    onSelect();
    const scale = getMoveScale();
    if (!scale) return;

    setInteraction({
      kind: "move",
      startClientX: event.clientX,
      startClientY: event.clientY,
      origX1: annotation.x1,
      origY1: annotation.y1,
      origX2: annotation.x2,
      origY2: annotation.y2,
      scaleX: scale.scaleX,
      scaleY: scale.scaleY,
    });
  };

  return { interaction, startMove };
}

function ShapeAnnotationView({
  annotation,
  selected,
  activeTool,
  pageWidth,
  pageHeight,
  getMoveScale,
  onSelect,
  onUpdate,
}: {
  annotation: ShapeAnnotation;
  selected: boolean;
  activeTool: EditTool;
  pageWidth: number;
  pageHeight: number;
  getMoveScale: () => { scaleX: number; scaleY: number } | null;
  onSelect: () => void;
  onUpdate: (patch: Partial<ShapeAnnotation>) => void;
}) {
  const canMove = selected && activeTool === "select";
  const { interaction, startMove } = useShapeInteraction({
    annotation,
    pageWidth,
    pageHeight,
    getMoveScale,
    onSelect,
    onUpdate,
    enabled: canMove,
  });
  const bounds = shapeBounds(annotation);
  const showHandles = canMove || interaction !== null;
  const boxLeft = bounds.left * pageWidth;
  const boxTop = bounds.top * pageHeight;
  const boxWidth = Math.max(bounds.width * pageWidth, 1);
  const boxHeight = Math.max(bounds.height * pageHeight, 1);
  const handleWidth = Math.max(boxWidth, 24);
  const handleHeight = Math.max(boxHeight, 24);
  const handleLeft = boxLeft - (handleWidth - boxWidth) / 2;
  const handleTop = boxTop - (handleHeight - boxHeight) / 2;

  const stopPointer = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <g
      onMouseDown={stopPointer}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      className={cn(
        selected && "drop-shadow-[0_0_2px_rgba(37,99,235,0.8)]",
      )}
    >
      <ShapePreview
        annotation={annotation}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
        interactive
        onMoveStart={canMove ? startMove : undefined}
      />

      {showHandles ? (
        <g transform={`translate(${handleLeft}, ${handleTop})`}>
          <PlacedItemChrome
            width={handleWidth}
            height={handleHeight + MOVE_BAR_HEIGHT}
            color={annotation.color}
            showHandles
            showRotate={false}
            interaction={interaction}
            onMoveStart={startMove}
            onRotateStart={(event) => {
              event.stopPropagation();
            }}
          />
        </g>
      ) : null}
    </g>
  );
}

function ShapePreview({
  annotation,
  pageWidth,
  pageHeight,
  interactive = false,
  onMoveStart,
}: {
  annotation: ShapeAnnotation;
  pageWidth: number;
  pageHeight: number;
  interactive?: boolean;
  onMoveStart?: (event: React.MouseEvent) => void;
}) {
  const x1 = annotation.x1 * pageWidth;
  const y1 = annotation.y1 * pageHeight;
  const x2 = annotation.x2 * pageWidth;
  const y2 = annotation.y2 * pageHeight;
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  const stroke = annotation.color;
  const sw = annotation.strokeWidth;
  const hitStrokeWidth = interactive ? Math.max(sw, 12) : sw;
  const pointerProps = interactive
    ? ({
        className: cn(
          "pointer-events-stroke",
          onMoveStart ? "cursor-move" : "cursor-pointer",
        ),
        onMouseDown: onMoveStart,
      } as const)
    : {};

  switch (annotation.shape) {
    case "rectangle":
      return (
        <rect
          x={left}
          y={top}
          width={width}
          height={height}
          fill={interactive ? "transparent" : "none"}
          stroke={stroke}
          strokeWidth={sw}
          {...pointerProps}
        />
      );
    case "ellipse":
      return (
        <ellipse
          cx={left + width / 2}
          cy={top + height / 2}
          rx={width / 2}
          ry={height / 2}
          fill={interactive ? "transparent" : "none"}
          stroke={stroke}
          strokeWidth={sw}
          {...pointerProps}
        />
      );
    case "line":
      return (
        <>
          {interactive ? (
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="transparent"
              strokeWidth={hitStrokeWidth}
              className={cn(
                "pointer-events-stroke",
                onMoveStart ? "cursor-move" : "cursor-pointer",
              )}
              onMouseDown={onMoveStart}
            />
          ) : null}
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={stroke}
            strokeWidth={sw}
            className={cn(interactive && "pointer-events-none")}
          />
        </>
      );
    case "triangle":
      return (
        <polygon
          points={`${(x1 + x2) / 2},${Math.min(y1, y2)} ${Math.min(x1, x2)},${Math.max(y1, y2)} ${Math.max(x1, x2)},${Math.max(y1, y2)}`}
          fill={interactive ? "transparent" : "none"}
          stroke={stroke}
          strokeWidth={sw}
          {...pointerProps}
        />
      );
  }
}

export function EditPageCanvas({
  pageIndex,
  pageWidth,
  pageHeight,
  annotations,
  activeTool,
  activeShape,
  selectedId,
  editingTextId = null,
  color,
  strokeWidth,
  fontSize,
  fontFamily,
  bold,
  italic,
  onSelect,
  onAdd,
  onUpdate,
  onRemove,
  onTextPlaced,
  onEditingTextChange = () => undefined,
}: EditPageCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const isDrawing = useRef(false);

  const getPagePoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    return getPagePointFromClient(clientX, clientY, svg);
  }, []);

  const getMoveScale = useCallback(() => getSvgScale(svgRef.current), []);

  useEffect(() => {
    setDraft(null);
    isDrawing.current = false;
  }, [pageIndex, activeTool]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === "Delete" || event.key === "Backspace") && selectedId) {
        const target = event.target as HTMLElement;
        if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;
        onRemove(selectedId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRemove, selectedId]);

  const finishDraft = useCallback(() => {
    if (!isDrawing.current || !draft) return;
    isDrawing.current = false;

    if (draft.kind === "draw" && draft.points.length >= 2) {
      onAdd({
        id: createId(),
        type: "draw",
        pageIndex,
        points: draft.points,
        color,
        strokeWidth,
      });
    }

    if (draft.kind === "shape") {
      const width = Math.abs(draft.x2 - draft.x1);
      const height = Math.abs(draft.y2 - draft.y1);
      if (width > 0.005 || height > 0.005) {
        onAdd({
          id: createId(),
          type: "shape",
          pageIndex,
          shape: draft.shape,
          x1: draft.x1,
          y1: draft.y1,
          x2: draft.x2,
          y2: draft.y2,
          color,
          strokeWidth,
        });
      }
    }

    setDraft(null);
  }, [color, draft, onAdd, pageIndex, strokeWidth]);

  const handleBackgroundMouseDown = useCallback(
    (event: React.MouseEvent<SVGRectElement>) => {
      const svg = svgRef.current;
      if (!svg) return;

      const point = getPoint(event, svg);

      if (activeTool === "select") {
        onSelect(null);
        return;
      }

      if (activeTool === "text") {
        const id = createId();
        const initialSize = singleLineBoxSize(
          TEXT_PLACEHOLDER,
          fontSize,
          fontFamily,
          bold,
          italic,
          pageWidth,
          pageHeight,
        );
        onAdd({
          id,
          type: "text",
          pageIndex,
          x: Math.max(0, point.x - initialSize.width / 2),
          y: Math.max(0, point.y - initialSize.height / 2),
          width: initialSize.width,
          height: initialSize.height,
          text: TEXT_PLACEHOLDER,
          fontSize,
          fontFamily,
          bold,
          italic,
          rotation: 0,
          color,
          strokeWidth,
        });
        onEditingTextChange?.(id);
        onTextPlaced?.(id);
        return;
      }

      if (activeTool === "draw") {
        isDrawing.current = true;
        setDraft({ kind: "draw", points: [point] });
        return;
      }

      if (activeTool === "shape") {
        isDrawing.current = true;
        setDraft({
          kind: "shape",
          shape: activeShape,
          x1: point.x,
          y1: point.y,
          x2: point.x,
          y2: point.y,
        });
      }
    },
    [activeShape, activeTool, bold, color, fontFamily, fontSize, italic, onAdd, onEditingTextChange, onSelect, onTextPlaced, pageHeight, pageIndex, pageWidth, strokeWidth],
  );

  useEffect(() => {
    if (!draft) return;

    const handleMouseMove = (event: MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return;

      const point = getPagePointFromClient(event.clientX, event.clientY, svg);

      setDraft((current) => {
        if (!current) return current;
        if (current.kind === "draw") {
          return { kind: "draw", points: [...current.points, point] };
        }
        return { ...current, x2: point.x, y2: point.y };
      });
    };

    const handleMouseUp = () => finishDraft();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draft, finishDraft]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${pageWidth} ${pageHeight}`}
      className={cn(
        "absolute inset-0 h-full w-full touch-none overflow-hidden",
        activeTool === "select" && "cursor-default",
        activeTool === "text" && "cursor-text",
        (activeTool === "draw" || activeTool === "shape") && "cursor-crosshair",
      )}
      onMouseLeave={finishDraft}
    >
      <rect
        x={0}
        y={0}
        width={pageWidth}
        height={pageHeight}
        fill="transparent"
        onMouseDown={handleBackgroundMouseDown}
      />
      {annotations.map((annotation) => {
        if (annotation.type === "text") {
          return (
            <TextAnnotationView
              key={annotation.id}
              annotation={annotation}
              selected={selectedId === annotation.id}
              isEditing={editingTextId === annotation.id}
              pageWidth={pageWidth}
              pageHeight={pageHeight}
              getPagePoint={getPagePoint}
              getMoveScale={getMoveScale}
              onSelect={() => onSelect(annotation.id)}
              onUpdate={(patch) => onUpdate(annotation.id, patch)}
              onStartEdit={() => onEditingTextChange(annotation.id)}
              onStopEdit={() => onEditingTextChange(null)}
            />
          );
        }

        if (annotation.type === "image") {
          return (
            <ImageAnnotationView
              key={annotation.id}
              annotation={annotation}
              selected={selectedId === annotation.id}
              pageWidth={pageWidth}
              pageHeight={pageHeight}
              getPagePoint={getPagePoint}
              getMoveScale={getMoveScale}
              onSelect={() => onSelect(annotation.id)}
              onUpdate={(patch) => onUpdate(annotation.id, patch)}
            />
          );
        }

        if (annotation.type === "draw") {
          const points = annotation.points
            .map((point) => `${point.x * pageWidth},${point.y * pageHeight}`)
            .join(" ");
          return (
            <polyline
              key={annotation.id}
              points={points}
              fill="none"
              stroke={annotation.color}
              strokeWidth={annotation.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(annotation.id);
              }}
              className={cn(
                selectedId === annotation.id && "drop-shadow-[0_0_2px_rgba(37,99,235,0.8)]",
              )}
            />
          );
        }

        if (annotation.type === "shape") {
          return (
            <ShapeAnnotationView
              key={annotation.id}
              annotation={annotation}
              selected={selectedId === annotation.id}
              activeTool={activeTool}
              pageWidth={pageWidth}
              pageHeight={pageHeight}
              getMoveScale={getMoveScale}
              onSelect={() => onSelect(annotation.id)}
              onUpdate={(patch) => onUpdate(annotation.id, patch)}
            />
          );
        }

        return null;
      })}

      {draft?.kind === "draw" ? (
        <polyline
          points={draft.points
            .map((point) => `${point.x * pageWidth},${point.y * pageHeight}`)
            .join(" ")}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}

      {draft?.kind === "shape" ? (
        <ShapePreview
          annotation={{
            id: "draft",
            type: "shape",
            pageIndex,
            shape: draft.shape,
            x1: draft.x1,
            y1: draft.y1,
            x2: draft.x2,
            y2: draft.y2,
            color,
            strokeWidth,
          }}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
        />
      ) : null}
    </svg>
  );
}
