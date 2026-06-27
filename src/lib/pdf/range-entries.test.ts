import { describe, expect, it } from "vitest";

import {
  applyRangeFieldChange,
  clampPageNumber,
  createRangeEntry,
  parsePageInput,
} from "@/lib/pdf/range-entries";

describe("clampPageNumber", () => {
  it("clamps values to the document page count", () => {
    expect(clampPageNumber(0, 10)).toBe(1);
    expect(clampPageNumber(15, 10)).toBe(10);
    expect(clampPageNumber(4, 10)).toBe(4);
  });
});

describe("parsePageInput", () => {
  it("strips leading zeros and clamps to page count", () => {
    expect(parsePageInput("03", 10)).toBe(3);
    expect(parsePageInput("99", 10)).toBe(10);
    expect(parsePageInput("", 10)).toBeNull();
  });
});

describe("applyRangeFieldChange", () => {
  it("keeps from before to when from is increased", () => {
    const entry = createRangeEntry(1, 5);
    const updated = applyRangeFieldChange(entry, "from", 7, 10);

    expect(updated.from).toBe(7);
    expect(updated.to).toBe(7);
  });

  it("keeps to after from when to is decreased", () => {
    const entry = createRangeEntry(4, 8);
    const updated = applyRangeFieldChange(entry, "to", 2, 10);

    expect(updated.from).toBe(2);
    expect(updated.to).toBe(2);
  });
});
