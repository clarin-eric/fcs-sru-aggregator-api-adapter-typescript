import type { ExtraScopingParams } from "./consortia";
import type { Capability, ProtocolVersion } from "./resources";
import type { ClientParams, Diagnostic, Exception } from "./utils";
import { doGet } from "./utils";

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
  params: ClientParams & ExtraScopingParams,
) {
  const result = await doGet<Statistics>("statistics", params);
  console.debug("[getStatisticsData]", result);
  return result;

  // TODO: mock
  // return {
  //   'last-scan': { institutions: {}, date: 0, timeout: 0, isScan: true },
  //   'Recent Searches': { institutions: {}, date: 0, timeout: 0, isScan: false },
  // }
}

// --------------------------------------------------------------------------
