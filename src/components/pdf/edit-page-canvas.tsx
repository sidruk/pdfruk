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
  onTextPlaced?: () => void;
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

type TextInteraction =
  | {
      kind: "move";
      startX: number;
      startY: number;
      origX: number;
      origY: number;
    }
  | {
      kind: "rotate";
      startAngle: number;
      origRotation: number;
      centerX: number;
      centerY: number;
    };

const MOVE_BAR_HEIGHT = 14;
const ROTATE_HANDLE_OFFSET = 32;

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
  startX: number;
  startY: number;
  origX1: number;
  origY1: number;
  origX2: number;
  origY2: number;
};

function PlacedItemChrome({
  width,
  height,
  color,
  showHandles,
  showRotate = true,
  editing,
  interaction,
  onMoveStart,
  onRotateStart,
}: {
  width: number;
  height: number;
  color: string;
  showHandles: boolean;
  showRotate?: boolean;
  editing?: boolean;
  interaction: TextInteraction | ShapeMoveInteraction | null;
  onMoveStart: (event: React.MouseEvent) => void;
  onRotateStart: (event: React.MouseEvent) => void;
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
        onMouseDown={(event) => {
          if (!showHandles || editing) return;
          onMoveStart(event);
        }}
        style={{
          cursor: showHandles && !editing ? "move" : undefined,
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
                style={{
                  cursor: interaction?.kind === "rotate" ? "grabbing" : "grab",
                }}
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
            style={{
              cursor: interaction?.kind === "move" ? "grabbing" : "move",
            }}
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
        </>
      ) : null}
    </>
  );
}

function usePlacedItemInteraction({
  annotation,
  getPagePoint,
  onSelect,
  onUpdate,
}: {
  annotation: { x: number; y: number; width: number; height: number; rotation: number };
  getPagePoint: (clientX: number, clientY: number) => { x: number; y: number };
  onSelect: () => void;
  onUpdate: (patch: { x?: number; y?: number; rotation?: number }) => void;
}) {
  const [interaction, setInteraction] = useState<TextInteraction | null>(null);

  useEffect(() => {
    if (!interaction) return;

    const handleMouseMove = (event: MouseEvent) => {
      const point = getPagePoint(event.clientX, event.clientY);

      if (interaction.kind === "move") {
        const next = clampPosition(
          interaction.origX + point.x - interaction.startX,
          interaction.origY + point.y - interaction.startY,
          annotation.width,
          annotation.height,
        );
        onUpdate(next);
        return;
      }

      const angle =
        (Math.atan2(
          point.y - interaction.centerY,
          point.x - interaction.centerX,
        ) *
          180) /
        Math.PI;
      onUpdate({
        rotation: Math.round(
          interaction.origRotation + (angle - interaction.startAngle),
        ),
      });
    };

    const handleMouseUp = () => setInteraction(null);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [annotation.height, annotation.width, getPagePoint, interaction, onUpdate]);

  const startMove = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    onSelect();
    const point = getPagePoint(event.clientX, event.clientY);
    setInteraction({
      kind: "move",
      startX: point.x,
      startY: point.y,
      origX: annotation.x,
      origY: annotation.y,
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

  return { interaction, startMove, startRotate };
}

function TextAnnotationView({
  annotation,
  selected,
  pageWidth,
  pageHeight,
  getPagePoint,
  onSelect,
  onUpdate,
}: {
  annotation: TextAnnotation;
  selected: boolean;
  pageWidth: number;
  pageHeight: number;
  getPagePoint: (clientX: number, clientY: number) => { x: number; y: number };
  onSelect: () => void;
  onUpdate: (patch: Partial<TextAnnotation>) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isPlaceholder = annotation.text === "Text";
  const [editing, setEditing] = useState(isPlaceholder);
  const { interaction, startMove, startRotate } = usePlacedItemInteraction({
    annotation,
    getPagePoint,
    onSelect,
    onUpdate,
  });
  const fontStyles = textFontStyles(annotation);

  useEffect(() => {
    if (!isPlaceholder || !selected) return;

    setEditing(true);
    const frame = requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    });

    return () => cancelAnimationFrame(frame);
  }, [annotation.id, isPlaceholder, selected]);

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
        if (isPlaceholder) {
          setEditing(true);
        }
      }}
    >
      <PlacedItemChrome
        width={width}
        height={height}
        color={annotation.color}
        showHandles={showHandles}
        editing={editing}
        interaction={interaction}
        onMoveStart={startMove}
        onRotateStart={startRotate}
      />

      {editing ? (
        <foreignObject
          x={0}
          y={contentTop}
          width={width}
          height={Math.max(contentHeight, annotation.fontSize + 8)}
        >
          <div className="h-full w-full">
            <textarea
              ref={textareaRef}
              autoFocus={isPlaceholder}
              value={annotation.text}
              onChange={(event) => onUpdate({ text: event.target.value })}
              onBlur={() => {
                if (isPlaceholder) return;
                setEditing(false);
              }}
              onMouseDown={stopPointer}
              onDoubleClick={(event) => {
                event.stopPropagation();
                setEditing(true);
              }}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === "Escape") {
                  setEditing(false);
                }
              }}
              className="h-full w-full resize-none border border-blue-400 bg-white/95 p-1 text-gray-900 outline-none"
              style={{ fontSize: annotation.fontSize, ...fontStyles }}
            />
          </div>
        </foreignObject>
      ) : (
        <text
          x={4}
          y={contentTop + annotation.fontSize}
          fill={annotation.color}
          fontSize={annotation.fontSize}
          fontFamily={fontStyles.fontFamily}
          fontWeight={fontStyles.fontWeight}
          fontStyle={fontStyles.fontStyle}
          onDoubleClick={(event) => {
            event.stopPropagation();
            onSelect();
            setEditing(true);
          }}
          style={{ userSelect: "none", pointerEvents: "all" }}
        >
          {annotation.text}
        </text>
      )}
    </g>
  );
}

function ImageAnnotationView({
  annotation,
  selected,
  pageWidth,
  pageHeight,
  getPagePoint,
  onSelect,
  onUpdate,
}: {
  annotation: ImageAnnotation;
  selected: boolean;
  pageWidth: number;
  pageHeight: number;
  getPagePoint: (clientX: number, clientY: number) => { x: number; y: number };
  onSelect: () => void;
  onUpdate: (patch: Partial<ImageAnnotation>) => void;
}) {
  const { interaction, startMove, startRotate } = usePlacedItemInteraction({
    annotation,
    getPagePoint,
    onSelect,
    onUpdate,
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
        interaction={interaction}
        onMoveStart={startMove}
        onRotateStart={startRotate}
      />
      <image
        href={annotation.imageData}
        x={0}
        y={contentTop}
        width={width}
        height={Math.max(contentHeight, 1)}
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={startMove}
        style={{ cursor: showHandles ? "move" : undefined }}
      />
    </g>
  );
}

function useShapeInteraction({
  annotation,
  getPagePoint,
  onSelect,
  onUpdate,
  enabled,
}: {
  annotation: ShapeAnnotation;
  getPagePoint: (clientX: number, clientY: number) => { x: number; y: number };
  onSelect: () => void;
  onUpdate: (patch: Partial<ShapeAnnotation>) => void;
  enabled: boolean;
}) {
  const [interaction, setInteraction] = useState<ShapeMoveInteraction | null>(
    null,
  );

  useEffect(() => {
    if (!interaction) return;

    const handleMouseMove = (event: MouseEvent) => {
      const point = getPagePoint(event.clientX, event.clientY);
      const dx = point.x - interaction.startX;
      const dy = point.y - interaction.startY;
      onUpdate({
        x1: interaction.origX1 + dx,
        y1: interaction.origY1 + dy,
        x2: interaction.origX2 + dx,
        y2: interaction.origY2 + dy,
      });
    };

    const handleMouseUp = () => setInteraction(null);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [getPagePoint, interaction, onUpdate]);

  const startMove = (event: React.MouseEvent) => {
    if (!enabled) return;
    event.stopPropagation();
    event.preventDefault();
    onSelect();
    const point = getPagePoint(event.clientX, event.clientY);
    setInteraction({
      kind: "move",
      startX: point.x,
      startY: point.y,
      origX1: annotation.x1,
      origY1: annotation.y1,
      origX2: annotation.x2,
      origY2: annotation.y2,
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
  getPagePoint,
  onSelect,
  onUpdate,
}: {
  annotation: ShapeAnnotation;
  selected: boolean;
  activeTool: EditTool;
  pageWidth: number;
  pageHeight: number;
  getPagePoint: (clientX: number, clientY: number) => { x: number; y: number };
  onSelect: () => void;
  onUpdate: (patch: Partial<ShapeAnnotation>) => void;
}) {
  const canMove = selected && activeTool === "select";
  const { interaction, startMove } = useShapeInteraction({
    annotation,
    getPagePoint,
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
        style: {
          pointerEvents: "stroke" as const,
          cursor: onMoveStart ? "move" : "pointer",
        },
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
              style={{ pointerEvents: "stroke", cursor: onMoveStart ? "move" : "pointer" }}
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
            style={interactive ? { pointerEvents: "none" } : undefined}
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
}: EditPageCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const isDrawing = useRef(false);

  const getPagePoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    return getPagePointFromClient(clientX, clientY, svg);
  }, []);

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
        onAdd({
          id,
          type: "text",
          pageIndex,
          x: Math.max(0, point.x - 0.125),
          y: Math.max(0, point.y - 0.03),
          width: 0.25,
          height: 0.08,
          text: "Text",
          fontSize,
          fontFamily,
          bold,
          italic,
          rotation: 0,
          color,
          strokeWidth,
        });
        onTextPlaced?.();
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
    [activeShape, activeTool, bold, color, fontFamily, fontSize, italic, onAdd, onSelect, onTextPlaced, pageIndex, strokeWidth],
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
        "absolute inset-0 h-full w-full",
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
              pageWidth={pageWidth}
              pageHeight={pageHeight}
              getPagePoint={getPagePoint}
              onSelect={() => onSelect(annotation.id)}
              onUpdate={(patch) => onUpdate(annotation.id, patch)}
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
              getPagePoint={getPagePoint}
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
