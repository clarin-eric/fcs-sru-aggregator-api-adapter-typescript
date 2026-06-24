import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";

import * as utils from "../src/utils";

// see: https://stevekinney.com/courses/testing/mocking-fetch-and-network-requests

describe("response caching", () => {
  // beforeEach(() => { utils.ramStorage.clear(); });
  afterEach(() => {
    // Reset all mocked calls between tests
    vi.clearAllMocks();
  });

  test("doGet with caching enabled", async () => {
    const ramStorage = new utils.RAMStorage();

    const baseURL = "https://contentsearch.app/rest/";

    const dummyEtag = '"dummy-etag"';
    const mockResponse = { dummy: 1 };
    // @ts-ignore: 2322
    const fetchMock = (globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers([["ETag", dummyEtag]]),
        json: () => Promise.resolve(mockResponse),
      }),
    ));
    // console.log(fetchMock)
    // console.log("headers", (new Headers([["ETag", dummyEtag]])).get("ETaG"))

    expect(ramStorage.length).toBe(0);

    const result1 = await utils.doGet("languages", {
      baseURL,
      enableETagCache: true,
      cacheStorage: ramStorage,
    });

    expect(result1).toStrictEqual(mockResponse);
    expect(ramStorage.length).toBe(2);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      new URL("https://contentsearch.app/rest/languages"),
      expect.objectContaining({ headers: {}, method: "GET" }),
    );

    // ------------------------------------------------

    fetchMock.mockReturnValueOnce(
      // @ts-ignore: 2322
      Promise.resolve({
        ok: true,
        status: 304,
        headers: new Map([]),
        json: () => Promise.reject("should not have been called"),
      }),
    );

    const result2 = await utils.doGet("languages", {
      baseURL,
      enableETagCache: true,
      cacheStorage: ramStorage,
    });

    expect(result2).toStrictEqual(mockResponse);
    expect(ramStorage.length).toBe(2);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      new URL("https://contentsearch.app/rest/languages"),
      expect.objectContaining({
        headers: { "If-None-Match": dummyEtag },
        method: "GET",
      }),
    );

    expect(result1).toStrictEqual(result2);
  });

  test("doGet with no caching from server", async () => {
    const ramStorage = new utils.RAMStorage();

    const baseURL = "https://contentsearch.app/rest/";

    const dummyEtag = '"dummy-etag"';
    const mockResponse = { dummy: 1 };
    // @ts-ignore: 2322
    const fetchMock = (globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve(mockResponse),
      }),
    ));

    expect(ramStorage.length).toBe(0);

    const result1 = await utils.doGet("languages", {
      baseURL,
      enableETagCache: true,
      cacheStorage: ramStorage,
    });

    expect(result1).toStrictEqual(mockResponse);
    expect(ramStorage.length).toBe(0);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      new URL("https://contentsearch.app/rest/languages"),
      expect.objectContaining({ headers: {}, method: "GET" }),
    );

    // ------------------------------------------------

    fetchMock.mockReturnValueOnce(
      // @ts-ignore: 2322
      Promise.resolve({
        ok: true,
        status: 304,
        headers: new Map([]),
        json: () => Promise.resolve(mockResponse),
      }),
    );

    const result2 = await utils.doGet("languages", {
      baseURL,
      enableETagCache: true,
      cacheStorage: ramStorage,
    });

    expect(result2).toStrictEqual(mockResponse);
    expect(ramStorage.length).toBe(0);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      new URL("https://contentsearch.app/rest/languages"),
      expect.objectContaining({ headers: {}, method: "GET" }),
    );

    expect(result1).toStrictEqual(result2);
  });

  test("doGet with caching disabled", async () => {
    const ramStorage = new utils.RAMStorage();

    const baseURL = "https://contentsearch.app/rest/";

    const dummyEtag = '"dummy-etag"';
    const mockResponse = { dummy: 1 };
    // @ts-ignore: 2322
    const fetchMock = (globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers([["ETag", dummyEtag]]),
        json: () => Promise.resolve(mockResponse),
      }),
    ));

    expect(ramStorage.length).toBe(0);

    const result1 = await utils.doGet("languages", {
      baseURL,
      enableETagCache: false,
      cacheStorage: ramStorage,
    });

    expect(result1).toStrictEqual(mockResponse);
    expect(ramStorage.length).toBe(0);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      new URL("https://contentsearch.app/rest/languages"),
      expect.objectContaining({ headers: {}, method: "GET" }),
    );

    // ------------------------------------------------

    fetchMock.mockReturnValueOnce(
      // @ts-ignore: 2322
      Promise.resolve({
        ok: true,
        status: 304,
        headers: new Map([]),
        json: () => Promise.resolve(mockResponse),
      }),
    );

    const result2 = await utils.doGet("languages", {
      baseURL,
      enableETagCache: false,
      cacheStorage: ramStorage,
    });

    expect(result2).toStrictEqual(mockResponse);
    expect(ramStorage.length).toBe(0);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      new URL("https://contentsearch.app/rest/languages"),
      expect.objectContaining({ headers: {}, method: "GET" }),
    );

    expect(result1).toStrictEqual(result2);
  });

  test("doGet with default (no caching)", async () => {
    const ramStorage = new utils.RAMStorage();

    const baseURL = "https://contentsearch.app/rest/";

    const dummyEtag = '"dummy-etag"';
    const mockResponse = { dummy: 1 };
    // @ts-ignore: 2322
    const fetchMock = (globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers([["ETag", dummyEtag]]),
        json: () => Promise.resolve(mockResponse),
      }),
    ));

    expect(ramStorage.length).toBe(0);

    const result1 = await utils.doGet("languages", {
      baseURL,
      cacheStorage: ramStorage,
    });

    expect(result1).toStrictEqual(mockResponse);
    expect(ramStorage.length).toBe(0);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      new URL("https://contentsearch.app/rest/languages"),
      expect.objectContaining({ headers: {}, method: "GET" }),
    );
  });

  test("caching helpers", async () => {
    const ramStorage = new utils.RAMStorage();

    const baseURL = "https://contentsearch.app/rest/";

    const dummyEtag = '"dummy-etag"';
    const mockResponse = { dummy: 1 };
    // @ts-ignore: 2322
    const fetchMock = (globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers([["ETag", dummyEtag]]),
        json: () => Promise.resolve(mockResponse),
      }),
    ));

    expect(ramStorage.length).toBe(0);

    const result1 = await utils.doGet("languages", {
      baseURL,
      enableETagCache: true,
      cacheStorage: ramStorage,
    });

    expect(result1).toStrictEqual(mockResponse);
    expect(ramStorage.length).toBe(2);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      new URL("https://contentsearch.app/rest/languages"),
      expect.objectContaining({ headers: {}, method: "GET" }),
    );

    // ------------------------------------------------

    const requestUrl = new URL("https://contentsearch.app/rest/languages");

    expect(
      utils.hasCachedResponse(requestUrl, null, { cacheStorage: ramStorage }),
    ).toBe(true);

    // other storages (custom or default)
    expect(
      utils.hasCachedResponse(requestUrl, null, {
        cacheStorage: new utils.RAMStorage(),
      }),
    ).toBe(false);
    expect(utils.hasCachedResponse(requestUrl)).toBe(false);

    // delete (from wrong storage)
    expect(utils.deleteCachedResponse(requestUrl)).toBe(false);
    // delete from storage where it is actually cached
    expect(
      utils.deleteCachedResponse(requestUrl, null, {
        cacheStorage: ramStorage,
      }),
    ).toBe(true);

    // now it is not cached anymore
    expect(
      utils.hasCachedResponse(requestUrl, null, { cacheStorage: ramStorage }),
    ).toBe(false);

    // to delete everything...
    // ramStorage.clear()
  });
});
