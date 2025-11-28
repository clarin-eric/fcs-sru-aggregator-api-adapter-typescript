import { expect, test, describe, it } from "vitest";

import * as api from "../src";

describe("makeAxiosClient", () => {
  test("makeAxiosClient() with baseURL and timeout", () => {
    const axiosClient = api.makeAxiosClient({
      baseURL: "http://example.org/rest",
      timeout: 1234,
    });

    expect(axiosClient).toHaveProperty(
      "defaults.baseURL",
      "http://example.org/rest"
    );
    expect(axiosClient).toHaveProperty("defaults.timeout", 1234);
    expect(axiosClient).toHaveProperty("defaults.responseType", "json");

    expect(axiosClient.getUri({ url: "test" })).toBe(
      "http://example.org/rest/test"
    );
  });

  test("makeAxiosClient() without arguments to throw an error", () => {
    expect(() => api.makeAxiosClient({} as api.MakeAxiosClient)).toThrowError(
      'Invalid "baseURL" parameter!'
    );
  });
});

test("api", () => {
  expect(api.REQ_PARAM_CONSORTIA).toBe("x-consortia");
});
