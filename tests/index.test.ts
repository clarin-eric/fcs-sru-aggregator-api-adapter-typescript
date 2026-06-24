import { expect, test, describe } from "vitest";

import * as api from "../src";

describe("makeAxiosClient", () => {
  test("ClientParams with baseURL and timeout", () => {
    const clientParams: api.ClientParams = {
      baseURL: "http://example.org/rest/",
      timeout: 1234,
    };

    expect(clientParams).toHaveProperty("baseURL", "http://example.org/rest/");
    expect(clientParams).toHaveProperty("timeout", 1234);

    expect(api.makeURL("test", clientParams).toString()).toBe(
      "http://example.org/rest/test",
    );
  });

  test("ClientParams.baseURL requires trailing slash", () => {
    const clientParams: api.ClientParams = {
      baseURL: "http://example.org/rest",
    };
    expect(clientParams).toHaveProperty("baseURL", "http://example.org/rest");
    // CAUTION
    expect(api.makeURL("test", clientParams).toString()).not.toBe(
      "http://example.org/rest/test",
    );
  });
});

test("api", () => {
  expect(api.REQ_PARAM_CONSORTIA).toBe("x-consortia");
});
