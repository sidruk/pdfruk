export const ADMIN_COOKIE_NAME = "pdfruk_admin_auth";

export const TRACKABLE_TOOL_IDS = [
  "merge",
  "split",
  "rotate",
  "jpg-to-pdf",
  "edit-pdf",
  "watermark",
  "page-numbers",
  "crop",
  "pdf-forms",
  "compress",
  "pdf-to-jpg",
] as const;

export type TrackableToolId = (typeof TRACKABLE_TOOL_IDS)[number];

export const PAGEVIEW_FIELD = "pageviews";

export function isTrackableToolId(value: string): value is TrackableToolId {
  return (TRACKABLE_TOOL_IDS as readonly string[]).includes(value);
}
