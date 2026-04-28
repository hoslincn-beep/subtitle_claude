import type { SubtitleIR, SubtitleSegment, BilingualOptions, SubtitleFormat } from "@/types/subtitle";
import { parseInput, toFormat } from "./converter";

/**
 * Merge two subtitle tracks into a bilingual subtitle.
 * Uses time-overlap matching to align segments between languages.
 */
export function mergeBilingual(
  firstContent: string,
  secondContent: string,
  firstFormat: SubtitleFormat,
  secondFormat: SubtitleFormat,
  outputFormat: SubtitleFormat
): string {
  const ir1 = parseInput(firstContent, firstFormat);
  const ir2 = parseInput(secondContent, secondFormat);

  const merged: SubtitleSegment[] = [];
  const OVERLAP_THRESHOLD = 0.8;

  let i = 0;
  let j = 0;

  while (i < ir1.segments.length && j < ir2.segments.length) {
    const s1 = ir1.segments[i];
    const s2 = ir2.segments[j];

    const overlap = calculateOverlap(s1, s2);

    if (overlap > OVERLAP_THRESHOLD) {
      // Good overlap: merge
      merged.push({
        index: merged.length + 1,
        start: Math.min(s1.start, s2.start),
        end: Math.max(s1.end, s2.end),
        text: `${s1.text}\n${s2.text}`,
      });
      i++;
      j++;
    } else if (s1.end <= s2.start) {
      // s1 is entirely before s2
      merged.push({
        index: merged.length + 1,
        start: s1.start,
        end: s1.end,
        text: `${s1.text}\n`,
      });
      i++;
    } else if (s2.end <= s1.start) {
      // s2 is entirely before s1
      merged.push({
        index: merged.length + 1,
        start: s2.start,
        end: s2.end,
        text: `\n${s2.text}`,
      });
      j++;
    } else {
      // Partial overlap but below threshold: include both with merge
      merged.push({
        index: merged.length + 1,
        start: Math.min(s1.start, s2.start),
        end: Math.max(s1.end, s2.end),
        text: `${s1.text}\n${s2.text}`,
      });
      i++;
      j++;
    }
  }

  // Append remaining segments
  while (i < ir1.segments.length) {
    const s = ir1.segments[i];
    merged.push({ index: merged.length + 1, start: s.start, end: s.end, text: `${s.text}\n` });
    i++;
  }
  while (j < ir2.segments.length) {
    const s = ir2.segments[j];
    merged.push({ index: merged.length + 1, start: s.start, end: s.end, text: `\n${s.text}` });
    j++;
  }

  const mergedIR: SubtitleIR = { segments: merged };
  return toFormat(mergedIR, outputFormat);
}

function calculateOverlap(a: SubtitleSegment, b: SubtitleSegment): number {
  const overlapStart = Math.max(a.start, b.start);
  const overlapEnd = Math.min(a.end, b.end);
  if (overlapStart >= overlapEnd) return 0;

  const overlapDuration = overlapEnd - overlapStart;
  const minDuration = Math.min(a.end - a.start, b.end - b.start);
  return minDuration > 0 ? overlapDuration / minDuration : 0;
}
