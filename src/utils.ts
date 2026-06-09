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
}

export type ClientParams = CustomParams & Omit<RequestInit, "method">;

// --------------------------------------------------------------------------

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
    timeout,
    signal,
    ...params
  }: ClientParams & ExtraScopingParams,
) {
  const uUrl = makeURL(url, { baseURL, consortia });
  signal = makeTimeoutSignal(timeout, signal);

  const response = await fetch(uUrl, {
    ...params,
    method: "GET",
    signal,
  });
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  const result = await response.json();
  return result as R;
}

export async function doPost<R>(
  url: string,
  data: any,
  params: ClientParams & ExtraScopingParams,
) {
  const response = await doPostRaw(url, data, params);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
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
