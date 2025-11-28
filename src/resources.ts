import type { AxiosInstance } from "axios";

import type { Consortium, ExtraScopingParams } from "./consortia";
import { REQ_PARAM_CONSORTIA } from "./consortia";
import type { MultilingualStrings } from "./utils";

// --------------------------------------------------------------------------
// API response types

/**
 * Response for `/init`
 *
 * @see {@link getInitData} API endpoint
 */
export interface InitData {
  languages: LanguageCode2NameMap;
  resources: Resource[];
  weblichtLanguages: string[];
}

/**
 * Response for `/languages`
 *
 * @see {@link getLanguages} API endpoint
 */
export interface LanguageCode2NameMap {
  [code: string]: string | null;
}

/**
 * Response for `/resources`
 *
 * @see {@link getResources} API endpoint
 */
export type Resources = Resource[];

// --------------------------------------------------------------------------
// basic data types

export interface Resource {
  endpointInstitution: EndpointInstitution;
  endpoint: Endpoint;

  handle: string;
  id: string;

  numberOfRecords: null;

  title: string | MultilingualStrings;
  description: null | string | MultilingualStrings;
  institution: string | MultilingualStrings;
  landingPage: null | string;
  languages: string[];

  searchCapabilities: Capability[];
  searchCapabilitiesResolved: Capability[];

  availabilityRestriction: AvailabilityRestriction;
  availableDataViews: AvailableDataView[] | null;
  availableLayers: AvailableLayer[] | null;
  availableLexFields: AvailableLexField[] | null;

  exampleQueries?: ExampleQuery[];

  subResources: Resource[];

  // // field will be set in resources.ts#fromApi
  // rootResourceId: string | null;
}

export interface Endpoint {
  url: string;
  protocol: ProtocolVersion;
  searchCapabilities: Capability[];
}

export interface EndpointInstitution {
  name: string;
  link: string | null;
  endpoints: Endpoint[];

  consortium?: Consortium;

  sideloaded?: true | boolean;
}

// --------------------------------------------------------------------------

export interface AvailableDataView {
  identifier: AvailableDataViewIdentifier | string;
  mimeType: MIMEType;
  deliveryPolicy: DeliveryPolicy;
}

export interface AvailableLayer {
  identifier: string;
  resultId: string;
  layerType: LayerType;
  encoding: Encoding;
  qualifier?: null | string;
  altValueInfo?: null;
  altValueInfoURI?: null;
}

export interface AvailableLexField {
  id: string;
  type: LexFieldType | VirtualLexFieldType;
}

export interface ExampleQuery {
  query: string;
  queryType: QueryType;
  description: MultilingualStrings;
}

// --------------------------------------------------------------------------

/**
 * Query types (also used as query parameters to REST API)
 */
export type QueryType = "cql" | "fcs" | "lex";

/**
 * FCS protocol versions
 */
export type ProtocolVersion = "VERSION_2" | "VERSION_1" | "LEGACY";

export type Capability = SearchCapability | "AUTHENTICATED_SEARCH";
export type SearchCapability =
  | "BASIC_SEARCH"
  | "ADVANCED_SEARCH"
  | "LEX_SEARCH";

/**
 * Resource availability restriction types
 */
export type AvailabilityRestriction =
  | "NONE"
  | "AUTH_ONLY"
  | "PERSONAL_IDENTIFIER";

// --------------------------------------------------------------------------
// data views

export type Encoding = "VALUE" | "EMPTY";
export type DeliveryPolicy = "SEND_BY_DEFAULT" | "NEED_TO_REQUEST";

export type MIMEType =
  | "application/x-clarin-fcs-hits+xml"
  | "application/x-clarin-fcs-adv+xml"
  | "application/x-clarin-fcs-lex+xml"
  | "application/x-clarin-fcs-kwic+xml"
  | "application/x-cmdi+xml";

export type AvailableDataViewIdentifier =
  | "hits"
  | "adv"
  | "cmdi"
  | "kwic"
  | "lex";

// --------------------------------------------------------------------------
// advanced search

export type LayerType =
  | "text"
  | "lemma"
  | "pos"
  | "orth"
  | "norm"
  | "phonetic"
  | "word" // TODO: 'word' non-standard/legacy layer type?
  | "entity";

// --------------------------------------------------------------------------
// lexical search

export type LexFieldType =
  | "entryId"
  | "lemma"
  | "translation"
  | "transcription"
  | "phonetic"
  | "definition"
  | "etymology"
  | "case"
  | "number"
  | "gender"
  | "pos"
  | "baseform"
  | "segmentation"
  | "sentiment"
  | "frequency"
  | "antonym"
  | "hyponym"
  | "hypernym"
  | "meronym"
  | "holonym"
  | "synonym"
  | "related"
  | "ref"
  | "senseRef"
  | "citation";

export type VirtualLexFieldType = "lang";

// --------------------------------------------------------------------------
// API methods

export async function getInitData(
  axios: AxiosInstance,
  params?: ExtraScopingParams
) {
  const urlParams = new URLSearchParams();
  if (params?.consortia !== undefined && params?.consortia !== null) {
    urlParams.set(REQ_PARAM_CONSORTIA, params.consortia);
  }
  const url = "init" + (urlParams.entries().next().done ? "" : `?${urlParams}`);

  const response = await axios.get(url);
  console.debug("[getInitData]", response);
  return response.data as InitData;

  // TODO: mock
  // return { languages: [], resources: [], weblichtLanguages: [] }
}

export async function getResources(
  axios: AxiosInstance,
  params?: ExtraScopingParams
) {
  const urlParams = new URLSearchParams();
  if (params?.consortia !== undefined && params?.consortia !== null) {
    urlParams.set(REQ_PARAM_CONSORTIA, params.consortia);
  }
  const url =
    "resources" + (urlParams.entries().next().done ? "" : `?${urlParams}`);

  const response = await axios.get(url);
  console.debug("[getResources]", response);
  return response.data as Resource[];

  // TODO: mock
  // return [] satisfies Resource[]
}

export async function getLanguages(
  axios: AxiosInstance,
  params?: ExtraScopingParams
) {
  const urlParams = new URLSearchParams();
  if (params?.consortia !== undefined && params?.consortia !== null) {
    urlParams.set(REQ_PARAM_CONSORTIA, params.consortia);
  }
  const url =
    "languages" + (urlParams.entries().next().done ? "" : `?${urlParams}`);

  const response = await axios.get(url);
  console.debug("[getLanguages]", response);
  return response.data as LanguageCode2NameMap;

  // TODO: mock
  // return {} satisfies LanguageCode2NameMap
}
