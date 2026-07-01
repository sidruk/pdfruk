export const ADMIN_COOKIE_NAME = "pdfruk_admin_auth";

export const TRACKABLE_TOOL_IDS = [
  "merge",
  "split",
  "rotate",
  "delete-reorder",
  "jpg-to-pdf",
  "edit-pdf",
  "sign-pdf",
  "watermark",
  "page-numbers",
  "crop",
  "pdf-forms",
  "pdf-to-jpg",
  "protect",
  "unlock",
] as const;

export type TrackableToolId = (typeof TRACKABLE_TOOL_IDS)[number];

export const PAGEVIEW_FIELD = "pageviews";

export function isTrackableToolId(value: string): value is TrackableToolId {
  return (TRACKABLE_TOOL_IDS as readonly string[]).includes(value);
}
