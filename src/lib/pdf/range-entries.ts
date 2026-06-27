export type PageRangeEntry = {
  id: string;
  from: number;
  to: number;
};

export function createRangeEntry(
  from: number = 1,
  to: number = 1,
): PageRangeEntry {
  return { id: crypto.randomUUID(), from, to };
}

export function clampPageNumber(value: number, pageCount: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(1, Math.trunc(value)), pageCount);
}

export function parsePageInput(
  raw: string,
  pageCount: number,
): number | null {
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return null;
  return clampPageNumber(parseInt(digits, 10), pageCount);
}

export function applyRangeFieldChange(
  entry: PageRangeEntry,
  field: "from" | "to",
  value: number,
  pageCount: number,
): PageRangeEntry {
  const next = { ...entry, [field]: clampPageNumber(value, pageCount) };

  if (next.from > next.to) {
    if (field === "from") {
      next.to = next.from;
    } else {
      next.from = next.to;
    }
  }

  return next;
}

export function rangesToString(entries: PageRangeEntry[]): string {
  return entries
    .map((entry) =>
      entry.from === entry.to ? `${entry.from}` : `${entry.from}-${entry.to}`,
    )
    .join(", ");
}

export function buildFixedRanges(
  pageCount: number,
  pagesPerRange: number,
): PageRangeEntry[] {
  if (pageCount <= 0 || pagesPerRange <= 0) return [];

  const entries: PageRangeEntry[] = [];
  for (let start = 1; start <= pageCount; start += pagesPerRange) {
    const end = Math.min(start + pagesPerRange - 1, pageCount);
    entries.push(createRangeEntry(start, end));
  }
  return entries;
}

export function isRangeEntryValid(
  entry: PageRangeEntry,
  pageCount: number,
): boolean {
  return (
    Number.isInteger(entry.from) &&
    Number.isInteger(entry.to) &&
    entry.from >= 1 &&
    entry.to >= 1 &&
    entry.from <= entry.to &&
    entry.to <= pageCount
  );
}

export function hasValidRanges(
  entries: PageRangeEntry[],
  pageCount: number,
): boolean {
  return entries.length > 0 && entries.every((e) => isRangeEntryValid(e, pageCount));
}
