import type { ExtraScopingParams } from "./consortia";
import { REQ_PARAM_CONSORTIA } from "./consortia";

// --------------------------------------------------------------------------

export interface MultilingualStrings {
  [language: string]: string;
}

// --------------------------------------------------------------------------

export interface Diagnostic {
  uri: string;
  message: string;
  diagnostic: null | string;
}

export interface Exception {
  klass: string;
  message: string;
  cause: null | string;
}

// --------------------------------------------------------------------------

// polyfill: https://stackoverflow.com/a/50101022/9360161
AbortSignal.timeout ??= function timeout(ms) {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
};

function makeTimeoutSignal(
  timeout: number | undefined | null = 5000,
  signal?: AbortSignal | null,
) {
  if (timeout === undefined || timeout === null || timeout <= 0) return signal;

  const timeoutSignal = AbortSignal.timeout(timeout);

  if (signal !== undefined && signal !== null) {
    return AbortSignal.any([signal, timeoutSignal]);
  } else {
    return timeoutSignal;
  }
}

// --------------------------------------------------------------------------

interface CustomParams {
  /** base URL for all requests */
  baseURL: string;
  /** (optional) request timeout */
  timeout?: number;

  /**
   * (optional) enable caching of requests using ETags
   *
   * Only GET requests will be cached, so far.
   *
   * @see {@link https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Headers/ETag}
   * @see {@link cacheStorage}
   */
  enableETagCache?: boolean;
  /**
   * Storage for cached responses.
   *
   * Only if {@link enableETagCache} is <code>true</code>.
   *
   * @default sessionStorage
   */
  cacheStorage?: Storage;
}

export type ClientParams = CustomParams & Omit<RequestInit, "method">;

// --------------------------------------------------------------------------
// etags caching

// TODO: maybe combine both etag and response, add date
// interface EtagCacheEntry {
//   etag: string
//   response: any
//   date: number
// }

export class RAMStorage implements Storage {
  // [key: string]: any;
  // TODO: not sure how to implement this: storage[key] -> value

  #data: Map<string, any> = new Map();

  get length(): number {
    return this.#data.size;
  }

  clear(): void {
    this.#data.clear();
  }
  getItem(key: string): string | null {
    return this.#data.get(key) ?? null;
  }
  key(index: number): string | null {
    return Array.from(this.#data.keys()).at(index) ?? null;
  }
  removeItem(key: string): void {
    this.#data.delete(key);
  }
  setItem(key: string, value: string): void {
    this.#data.set(key, value);
  }
}

export const ramStorage = new RAMStorage();

function makeUrlEtagCacheKey(url: string | URL) {
  return `@clarin-eric/fcs-sru-aggregator-api-adapter-typescript:etag:${url.toString()}`;
}

function makeResponseCacheKey(url: string | URL, etag: string) {
  return `@clarin-eric/fcs-sru-aggregator-api-adapter-typescript:response:${url.toString()}:${etag}`;
}

function etagFromCache(
  url: string | URL,
  etag: string | null = null,
  { cacheStorage = ramStorage }: { cacheStorage?: Storage } = {},
) {
  if (etag !== null) return etag;

  // if not provided, try to load from cache
  const etagCacheKey = makeUrlEtagCacheKey(url);
  etag = cacheStorage.getItem(etagCacheKey);

  return etag;
}

function getCachedResponse(
  url: string | URL,
  etag: string | null = null,
  {
    cacheStorage = ramStorage,
    clearIfNotFound = true,
  }: { cacheStorage?: Storage; clearIfNotFound?: boolean } = {},
) {
  etag = etagFromCache(url, etag, { cacheStorage });
  // if not found, then we likely have no cached etag/response
  if (etag === null) return [null, false] as const;

  const cacheKey = makeResponseCacheKey(url, etag);
  const cachedResponseJSON = cacheStorage.getItem(cacheKey);

  if (cachedResponseJSON !== null) {
    return [JSON.parse(cachedResponseJSON), true] as const;
  } else {
    if (clearIfNotFound) {
      cacheStorage.removeItem(cacheKey);
      const etagCacheKey = makeUrlEtagCacheKey(url);
      cacheStorage.removeItem(etagCacheKey);
    }
    return [null, false] as const;
  }
}

function setCachedResponse(
  url: string | URL,
  etag: string | null | undefined = null,
  response: any,
  {
    cacheStorage = ramStorage,
    clearPreviousEtag = true,
  }: { cacheStorage?: Storage; clearPreviousEtag?: boolean } = {},
) {
  // if no etag, then we won't store anything!
  if (etag === undefined || etag === null) return;

  if (clearPreviousEtag) {
    // try to load etag from url alone (should be previously stored response if any)
    deleteCachedResponse(url, null, { cacheStorage });
  }

  const etagCacheKey = makeUrlEtagCacheKey(url);
  const cacheKey = makeResponseCacheKey(url, etag);

  const cachedResponseJSON = JSON.stringify(response);

  // console.debug("Cache response", { etag, cacheKey, cachedResponseJSON });
  try {
    cacheStorage.setItem(cacheKey, cachedResponseJSON);
    cacheStorage.setItem(etagCacheKey, etag);
  } catch (e) {
    console.error("Unable to cache data. Storage limit exceeded!", e);
  }
}

export function deleteCachedResponse(
  url: string | URL,
  etag: string | null = null,
  { cacheStorage = ramStorage }: { cacheStorage?: Storage } = {},
) {
  etag = etagFromCache(url, etag, { cacheStorage });
  // if not found, then we likely have no cached etag/response
  if (etag === null) return false;

  const cacheKey = makeResponseCacheKey(url, etag);
  cacheStorage.removeItem(cacheKey);

  const etagCacheKey = makeUrlEtagCacheKey(url);
  cacheStorage.removeItem(etagCacheKey);

  return true;
}

export function hasCachedResponse(
  url: string | URL,
  etag: string | null = null,
  {
    cacheStorage = ramStorage,
    clearIfNotFound = true,
  }: { cacheStorage?: Storage; clearIfNotFound?: boolean } = {},
) {
  const [, foundCached] = getCachedResponse(url, etag, {
    cacheStorage,
    clearIfNotFound,
  });
  return foundCached;
}

// --------------------------------------------------------------------------

export class RequestError extends Error {
  url: string;
  method: string;
  status: number | undefined;

  constructor(
    message: string | undefined,
    url: string,
    method: string,
    status: number | undefined = undefined,
  ) {
    super(message);
    this.url = url;
    this.method = method;
    this.status = status;
  }
}

export function makeURL(
  url: string,
  { baseURL, consortia }: { baseURL: string } & ExtraScopingParams,
) {
  const uUrl = new URL(url, baseURL);

  if (consortia !== undefined && consortia !== null) {
    uUrl.searchParams.set(REQ_PARAM_CONSORTIA, consortia);
  }
  // const url = "..." + (urlParams.entries().next().done ? "" : `?${urlParams}`);

  return uUrl;
}

export async function doGet<R>(
  url: string,
  {
    baseURL,
    consortia,
    headers,
    timeout,
    signal,
    enableETagCache,
    cacheStorage = ramStorage,
    ...params
  }: ClientParams & ExtraScopingParams,
) {
  const uUrl = makeURL(url, { baseURL, consortia });
  signal = makeTimeoutSignal(timeout, signal);

  cacheStorage = cacheStorage || ramStorage;

  const etag = enableETagCache
    ? etagFromCache(uUrl, null, { cacheStorage })
    : null;

  headers = {
    ...(headers || undefined),
    ...(etag !== null ? { "If-None-Match": etag } : undefined),
  };

  const response = await fetch(uUrl, {
    ...params,
    method: "GET",
    headers,
    signal,
  });

  if (enableETagCache) {
    if (response.status === 304 && etag !== null) {
      // check for cached response
      const [cachedResponse, foundCached] = getCachedResponse(uUrl, etag, {
        cacheStorage,
      });
      if (foundCached) {
        return cachedResponse as R;
      }
    }
  }

  if (!response.ok) {
    throw new RequestError(
      `Response status: ${response.status}`,
      response.url,
      "GET",
      response.status,
    );
  }

  const result = await response.json();

  if (enableETagCache) {
    // (try) store response
    const etag = response.headers.get("ETag");
    // console.debug("Store ETag cache key:", { etag, uUrl });
    setCachedResponse(uUrl, etag, result, { cacheStorage });
  }

  return result as R;
}

export async function doPost<R>(
  url: string,
  data: any,
  params: ClientParams & ExtraScopingParams,
) {
  const response = await doPostRaw(url, data, params);
  if (!response.ok) {
    throw new RequestError(
      `Response status: ${response.status}`,
      response.url,
      "POST",
      response.status,
    );
  }

  const result = await response.json();
  return result as R;
}

export async function doPostRaw(
  url: string,
  data: any,
  {
    baseURL,
    consortia,
    headers,
    timeout,
    signal,
    ...params
  }: ClientParams & ExtraScopingParams,
) {
  const uUrl = makeURL(url, { baseURL, consortia });
  signal = makeTimeoutSignal(timeout, signal);

  headers = {
    ...(headers || {}),
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const response = await fetch(uUrl, {
    ...params,
    method: "POST",
    headers,
    body: new URLSearchParams(data),
    signal,
  });
  return response;
}

// --------------------------------------------------------------------------
