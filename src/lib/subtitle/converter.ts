import type { SubtitleIR, SubtitleSegment, SubtitleFormat } from "@/types/subtitle";

// --- Parser: Format → IR ---

function parseTimestampSrt(ts: string): number {
  const [h, m, s] = ts.split(":");
  const [sec, ms] = (s || "0").split(",");
  return parseInt(h) * 3600000 + parseInt(m) * 60000 + parseInt(sec) * 1000 + parseInt(ms || "0");
}

function parseTimestampVtt(ts: string): number {
  const cleaned = ts.replace(/[\r\n]/g, "");
  const [h, m, s] = cleaned.split(":");
  const parts = (s || "0").split(".");
  const ms = parts[1] ? parseInt(parts[1].padEnd(3, "0").slice(0, 3)) : 0;
  return parseInt(h) * 3600000 + parseInt(m) * 60000 + parseInt(parts[0]) * 1000 + ms;
}

export function parseSRT(content: string): SubtitleIR {
  const segments: SubtitleSegment[] = [];
  const blocks = content.trim().replace(/\r\n/g, "\n").split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 3) continue;
    const index = parseInt(lines[0]);
    if (isNaN(index)) continue;

    const timeMatch = lines[1].match(/([\d:,]+)\s*-->\s*([\d:,]+)/);
    if (!timeMatch) continue;

    const text = lines.slice(2).join("\n").trim();
    if (!text) continue;

    segments.push({
      index,
      start: parseTimestampSrt(timeMatch[1]),
      end: parseTimestampSrt(timeMatch[2]),
      text,
    });
  }
  return { segments };
}

export function parseVTT(content: string): SubtitleIR {
  const segments: SubtitleSegment[] = [];
  const cleaned = content.replace(/\r\n/g, "\n");
  // Remove WEBVTT header
  const body = cleaned.replace(/^WEBVTT.*\n(?:[\s\S]*?\n\n)?/i, "");
  const blocks = body.trim().split(/\n\n+/);
  let index = 1;

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    // Find timestamp line
    let timeLineIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("-->")) {
        timeLineIdx = i;
        break;
      }
    }
    if (timeLineIdx === -1) continue;

    const timeMatch = lines[timeLineIdx].match(/([\d:.]+)\s*-->\s*([\d:.]+)/);
    if (!timeMatch) continue;

    const text = lines
      .slice(timeLineIdx + 1)
      .join("\n")
      .replace(/<[^>]*>/g, "")
      .trim();
    if (!text) continue;

    segments.push({
      index: index++,
      start: parseTimestampVtt(timeMatch[1]),
      end: parseTimestampVtt(timeMatch[2]),
      text,
    });
  }
  return { segments };
}

export function parseASS(content: string): SubtitleIR {
  const segments: SubtitleSegment[] = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  let inEvents = false;
  let formatFields: string[] = [];
  let index = 1;

  for (const line of lines) {
    if (line.startsWith("[Events]")) {
      inEvents = true;
      continue;
    }
    if (line.startsWith("[") && inEvents) {
      inEvents = false;
      continue;
    }
    if (inEvents && line.startsWith("Format:")) {
      formatFields = line
        .replace("Format:", "")
        .trim()
        .split(",")
        .map((f) => f.trim());
      continue;
    }
    if (inEvents && line.startsWith("Dialogue:")) {
      const values = line.replace("Dialogue:", "").trim().split(",");
      const startIdx = formatFields.indexOf("Start");
      const endIdx = formatFields.indexOf("End");
      const textIdx = formatFields.indexOf("Text");

      if (startIdx < 0 || endIdx < 0) continue;

      const start = parseTimestampVtt(values[startIdx].trim());
      const end = parseTimestampVtt(values[endIdx].trim());
      const text = (textIdx >= 0 ? values.slice(textIdx).join(",") : "")
        .replace(/\{[^}]*\}/g, "") // Remove ASS tags
        .replace(/\\N/g, "\n")
        .replace(/\\n/g, "\n")
        .trim();

      if (!text) continue;

      segments.push({ index: index++, start, end, text });
    }
  }
  return { segments };
}

export function parsePlainText(content: string): SubtitleIR {
  const segments: SubtitleSegment[] = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n").filter(Boolean);
  // Assume each line is a segment, even spacing
  const durationPerLine = 4000; // 4 seconds per line
  for (let i = 0; i < lines.length; i++) {
    segments.push({
      index: i + 1,
      start: i * durationPerLine,
      end: (i + 1) * durationPerLine,
      text: lines[i].trim(),
    });
  }
  return { segments };
}

function parseInput(input: string, format: SubtitleFormat): SubtitleIR {
  switch (format) {
    case "srt": return parseSRT(input);
    case "vtt": return parseVTT(input);
    case "ass": return parseASS(input);
    case "txt": return parsePlainText(input);
    default: return parseSRT(input);
  }
}

// --- Serializer: IR → Format ---

function padMs(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const mil = ms % 1000;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function toSRT(ir: SubtitleIR): string {
  return ir.segments.map((seg) => {
    const start = padMs(seg.start) + `,${(seg.start % 1000).toString().padStart(3, "0")}`;
    const end = padMs(seg.end) + `,${(seg.end % 1000).toString().padStart(3, "0")}`;
    return `${seg.index}\n${start} --> ${end}\n${seg.text}\n`;
  }).join("\n");
}

function toVTT(ir: SubtitleIR): string {
  const cues = ir.segments.map((seg) => {
    const start = padMs(seg.start) + `.${(seg.start % 1000).toString().padStart(3, "0")}`;
    const end = padMs(seg.end) + `.${(seg.end % 1000).toString().padStart(3, "0")}`;
    return `${start} --> ${end}\n${seg.text}\n`;
  }).join("\n");
  return `WEBVTT\n\n${cues}`;
}

function toASS(ir: SubtitleIR): string {
  const events = ir.segments.map((seg) => {
    const start = padMs(seg.start) + `.${((seg.start % 1000) / 10).toFixed(0).padStart(2, "0")}`;
    const end = padMs(seg.end) + `.${((seg.end % 1000) / 10).toFixed(0).padStart(2, "0")}`;
    return `Dialogue: 0,${start},${end},Default,,0,0,0,,${seg.text.replace(/\n/g, "\\N")}`;
  }).join("\n");

  return `[Script Info]
Title: SubExtract Generated
ScriptType: v4.00+
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${events}`;
}

function toTXT(ir: SubtitleIR): string {
  return ir.segments.map((seg) => seg.text).join("\n\n");
}

function toHTML(ir: SubtitleIR): string {
  const rows = ir.segments.map((seg) => {
    const start = padMs(seg.start) + `.${(seg.start % 1000).toString().padStart(3, "0")}`;
    const end = padMs(seg.end) + `.${(seg.end % 1000).toString().padStart(3, "0")}`;
    return `<tr>
  <td class="time">${start}</td>
  <td class="time">${end}</td>
  <td class="text">${seg.text.replace(/\n/g, "<br>")}</td>
</tr>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Subtitles</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e6e4e0; }
  .time { white-space: nowrap; font-family: monospace; width: 120px; color: #6b6b6b; }
  .text { line-height: 1.5; }
</style>
</head>
<body>
<table>
<thead><tr><th>Start</th><th>End</th><th>Text</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
</body>
</html>`;
}

function serializeToFormat(ir: SubtitleIR, format: SubtitleFormat): string {
  switch (format) {
    case "srt": return toSRT(ir);
    case "vtt": return toVTT(ir);
    case "ass": return toASS(ir);
    case "txt": return toTXT(ir);
    case "html": return toHTML(ir);
    default: return toSRT(ir);
  }
}

// --- Main conversion API ---

export function convertSubtitle(
  input: string,
  fromFormat: SubtitleFormat,
  toFormat: SubtitleFormat
): string {
  if (fromFormat === toFormat) return input;
  const ir = parseInput(input, fromFormat);
  return serializeToFormat(ir, toFormat);
}

export function detectFormat(content: string): SubtitleFormat {
  if (/^WEBVTT/i.test(content.trim())) return "vtt";
  if (/^\[Script Info\]/i.test(content.trim())) return "ass";
  if (/^\d+\s*\n\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->/m.test(content)) return "srt";
  if (/^<!DOCTYPE html/i.test(content.trim())) return "html";
  return "txt";
}

export { parseInput, serializeToFormat as toFormat };
