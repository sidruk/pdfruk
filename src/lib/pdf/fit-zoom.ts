export const PDF_VIEWER_BASE_SCALE = 1.5;
export const PDF_VIEWER_MIN_ZOOM = 0.1;
export const PDF_VIEWER_MAX_ZOOM = 3;

export function getFitZoom(
  container: HTMLElement,
  renderWidth: number,
  renderHeight: number,
  zoom: number,
): number | null {
  const style = window.getComputedStyle(container);
  const availableWidth =
    container.clientWidth -
    parseFloat(style.paddingLeft) -
    parseFloat(style.paddingRight);
  const availableHeight =
    container.clientHeight -
    parseFloat(style.paddingTop) -
    parseFloat(style.paddingBottom);

  if (availableWidth <= 0 || availableHeight <= 0 || zoom <= 0) return null;

  const baseWidth = renderWidth / zoom;
  const baseHeight = renderHeight / zoom;
  const targetZoom = Math.min(
    availableWidth / baseWidth,
    availableHeight / baseHeight,
  );

  return Math.max(
    PDF_VIEWER_MIN_ZOOM,
    Math.min(targetZoom, PDF_VIEWER_MAX_ZOOM),
  );
}
