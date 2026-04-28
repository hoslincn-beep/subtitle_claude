interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestEntry {
  timestamp: number;
}

class SlidingWindowLimiter {
  private requests: Map<string, RequestEntry[]> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  addRule(name: string, maxRequests: number, windowMs: number): void {
    this.configs.set(name, { maxRequests, windowMs });
  }

  isAllowed(key: string, ruleName: string = "default"): boolean {
    const config = this.configs.get(ruleName);
    if (!config) return true;

    const now = Date.now();
    const windowStart = now - config.windowMs;

    let entries = this.requests.get(key) || [];
    entries = entries.filter((e) => e.timestamp > windowStart);

    if (entries.length >= config.maxRequests) {
      return false;
    }

    entries.push({ timestamp: now });
    this.requests.set(key, entries);
    return true;
  }

  getRemaining(key: string, ruleName: string = "default"): number {
    const config = this.configs.get(ruleName);
    if (!config) return Infinity;

    const now = Date.now();
    const windowStart = now - config.windowMs;
    const entries = (this.requests.get(key) || []).filter(
      (e) => e.timestamp > windowStart
    );
    return Math.max(0, config.maxRequests - entries.length);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entries] of this.requests) {
      const filtered = entries.filter(
        (e) => e.timestamp > now - 60 * 60 * 1000
      );
      if (filtered.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, filtered);
      }
    }
  }
}

export const platformLimiter = new SlidingWindowLimiter();

platformLimiter.addRule("youtube", 30, 60_000);
platformLimiter.addRule("bilibili", 20, 60_000);
platformLimiter.addRule("default", 50, 60_000);
