/**
 * lib/linkChecker.ts
 * Crawls a webpage, extracts all anchor links, and checks which ones are alive or dead.
 * Uses browser-compatible APIs (fetch, DOMParser) – works in both Node and browser.
 */

export type LinkResult = {
  url: string;
  status: number | 'ERR';
  ok: boolean;
  reason?: string; // only present when status === 'ERR'
};

/**
 * Fetch a page and extract all unique absolute URLs from <a href>.
 * Skips fragments (#) and mailto: links.
 */
export async function crawlLinks(pageUrl: string): Promise<string[]> {
  const response = await fetch(pageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
  }
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const base = new URL(pageUrl);
  const links: string[] = [];
  const seen = new Set<string>();
  const anchors = doc.querySelectorAll('a[href]');
  for (const a of anchors) {
    const href = a.getAttribute('href')?.trim() ?? '';
    if (!href || href.startsWith('#') || href.startsWith('mailto:')) continue;
    try {
      const absolute = new URL(href, base).toString();
      if (!seen.has(absolute)) {
        seen.add(absolute);
        links.push(absolute);
      }
    } catch {
      // skip malformed URLs
    }
  }
  return links;
}

/**
 * Check a single URL with a HEAD request and a timeout.
 */
export async function checkLink(url: string, timeoutMs: number = 8000): Promise<LinkResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'dead-link-checker/1.0' },
    });
    clearTimeout(timer);
    return { url, status: res.status, ok: res.ok };
  } catch (error: unknown) {
    clearTimeout(timer);
    const err = error as Error;
    const reason = err.name === 'AbortError' ? 'TIMEOUT' : err.message;
    return { url, status: 'ERR', ok: false, reason };
  }
}

/**
 * Check many URLs in concurrent batches.
 */
export async function checkLinks(
  urls: string[],
  concurrency: number = 10,
  timeoutMs: number = 8000
): Promise<LinkResult[]> {
  const results: LinkResult[] = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((url) => checkLink(url, timeoutMs)));
    results.push(...batchResults);
  }
  return results;
}
