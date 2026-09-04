import type { Consortium, ExtraScopingParams } from "./consortia";
import type { ClientParams, MultilingualStrings } from "./utils";
import { doGet } from "./utils";

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
  name: null | string | MultilingualStrings;
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
  | "LEX_SEARCH"
  | "LEXICAL_SEARCH"
  | "LEXICAL_SEARCH_V1_0";

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
  | "transcription"
  | "translation"
  | "phonetic"
  | "definition"
  | "etymology"
  | "case"
  | "degree"
  | "gender"
  | "mood"
  | "number"
  | "pos"
  | "tense"
  | "grammar"
  | "baseform"
  | "segmentation"
  | "sentiment"
  | "frequency"
  | "antonym"
  | "holonym"
  | "hypernym"
  | "hyponym"
  | "meronym"
  | "synonym"
  | "related"
  | "ref"
  | "senseRef"
  | "citation";

export type VirtualLexFieldType = "any" | "lang";

// --------------------------------------------------------------------------
// API methods

export async function getInitData(params: ClientParams & ExtraScopingParams) {
  const result = await doGet<InitData>("init", params);
  console.debug("[getInitData]", result);
  return result;

  // TODO: mock
  // return { languages: [], resources: [], weblichtLanguages: [] }
}

export async function getResources(params: ClientParams & ExtraScopingParams) {
  const result = await doGet<Resource[]>("resources", params);
  console.debug("[getResources]", result);
  return result;

  // TODO: mock
  // return [] satisfies Resource[]
}

export async function getLanguages(params: ClientParams & ExtraScopingParams) {
  const result = await doGet<LanguageCode2NameMap>("languages", params);
  console.debug("[getLanguages]", result);
  return result;

  // TODO: mock
  // return {} satisfies LanguageCode2NameMap
}
