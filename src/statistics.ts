import type { AxiosInstance } from "axios";

import type { ExtraScopingParams } from "./consortia";
import { REQ_PARAM_CONSORTIA } from "./consortia";
import type { Capability, ProtocolVersion } from "./resources";
import type { Diagnostic, Exception } from "./utils";

// --------------------------------------------------------------------------
// API response types

export interface Statistics {
  "last-scan": StatisticsSection;
  "recent-searches": StatisticsSection;
}

export interface StatisticsSection {
  institutions: {
    [institutionName: string]: {
      [endpointUrl: string]: InstitutionEndpointInfo;
    };
  };
  date: number;
  timeout: number;
  isScan: boolean;
}

// --------------------------------------------------------------------------
// internal data types

export interface InstitutionEndpointInfo {
  version: ProtocolVersion;
  searchCapabilities: Capability[];

  rootResources: string[] | StatisticsResourceInfo[];

  diagnostics: Diagnostics;
  errors: Errors;

  maxConcurrentRequests: number;

  numberOfRequests: number;

  maxQueueTime: number;
  avgQueueTime: number;
  avgExecutionTime: number;
  maxExecutionTime: number;
}

export interface StatisticsResourceInfo {
  handle: string;
  title: string;
  valid: boolean;
  notes: string[];
}

export interface Diagnostics {
  [reason: string]: DiagnosticInfo;
}
export interface Errors {
  [reason: string]: ErrorInfo;
}

export interface DiagnosticInfo {
  diagnostic: Diagnostic;
  context: string;
  counter: number;
}

export interface ErrorInfo {
  exception: Exception;
  context: string;
  counter: number;
}

// --------------------------------------------------------------------------
// API

export async function getStatisticsData(
  axios: AxiosInstance,
  params?: ExtraScopingParams
) {
  const urlParams = new URLSearchParams();
  if (params?.consortia !== undefined && params?.consortia !== null) {
    urlParams.set(REQ_PARAM_CONSORTIA, params.consortia);
  }
  const url =
    "statistics" + (urlParams.entries().next().done ? "" : `?${urlParams}`);

  const response = await axios.get(url);
  console.debug("[getStatisticsData]", response);
  return response.data as Statistics;

  // TODO: mock
  // return {
  //   'last-scan': { institutions: {}, date: 0, timeout: 0, isScan: true },
  //   'Recent Searches': { institutions: {}, date: 0, timeout: 0, isScan: false },
  // }
}

// --------------------------------------------------------------------------
