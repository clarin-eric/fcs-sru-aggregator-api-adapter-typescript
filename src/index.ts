// https://app.quicktype.io/?l=ts

// --------------------------------------------------------------------------

import type { CreateAxiosDefaults } from "axios";
import axios from "axios";

// --------------------------------------------------------------------------

export * from "./consortia";
export * from "./download";
export * from "./resources";
export * from "./results";
export * from "./statistics";
export * from "./utils";

// --------------------------------------------------------------------------

export type MakeAxiosClient = Omit<CreateAxiosDefaults, "baseURL"> & {
  baseURL: string;
};

export function makeAxiosClient({
  baseURL,
  timeout = 5000,
  ...options
}: MakeAxiosClient) {
  if (!baseURL) throw new Error('Invalid "baseURL" parameter!');

  return axios.create({
    baseURL,
    timeout,
    // throw if response is not JSON
    // - https://stackoverflow.com/a/75785157/9360161
    responseType: "json",
    transitional: {
      silentJSONParsing: false,
    },
    ...options,
  });
}
