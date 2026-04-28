export function sanitizeUrl(input: string): string {
  let url = input.trim();

  // Remove leading/trailing whitespace and quotes
  url = url.replace(/^[\s"']+|[\s"']+$/g, "");

  // Remove any HTML tags
  url = url.replace(/<[^>]*>/g, "");

  // Ensure URL starts with http:// or https://
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  // Basic XSS sanitization
  url = url.replace(/javascript:/gi, "").replace(/on\w+=/gi, "");

  // Remove null bytes
  url = url.replace(/\0/g, "");

  return url;
}

export function sanitizeString(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .trim();
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}
