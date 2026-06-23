import type { LexFieldType, Resource, VirtualLexFieldType } from "./resources";
import type { ClientParams, Diagnostic, Exception } from "./utils";
import { doGet, doPost, doPostRaw, makeURL } from "./utils";

// --------------------------------------------------------------------------
// API search request types

export interface PostSearchData {
  query: string;
  queryType: string;
  language: string;
  numberOfResults: number | string;
  resourceIds: string[];
}

export interface PostSearchMoreResultsData {
  resourceId: string;
  numberOfResults: number;
}

// --------------------------------------------------------------------------
// API response types

/**
 * Response for `/search/<uuid>`
 *
 * @see {@link getSearchResults} API endpoint (all resources)
 * @see {@link getSearchResultDetails} API endpoint (single resource)
 */
export interface SearchResults {
  inProgress: number;
  cancelled?: number;
  results: ResourceSearchResult[];
}

/**
 * Response for `/search/<uuid>/metaonly`
 *
 * @see {@link getSearchResultsMetaOnly} API endpoint (all resources)
 * @see {@link getSearchResultsMetaOnlyForResource} API endpoint (single resource)
 */
export interface SearchResultsMetaOnly {
  inProgress: number;
  cancelled?: number;
  results: ResourceSearchResultMetaOnly[];
}

// --------------------------------------------------------------------------
// basic data types

export interface ResourceSearchResultMetaOnly {
  id: string;
  resourceHandle: string;
  endpointUrl: string;

  inProgress: boolean;
  cancelled?: boolean;

  nextRecordPosition: number;
  numberOfRecords: number;
  numberOfRecordsLoaded: number;

  exception: Exception | null;
  diagnostics: Diagnostic[];
  requestUrl?: string | null;

  hasAdvResults: boolean;
  hasLexResults: boolean;
  isLexHits?: boolean;
}

export interface ResourceSearchResult extends ResourceSearchResultMetaOnly {
  resource: Resource;

  records: ResultRecord[];
}

// --------------------------------------------------------------------------
// result data

export interface ResultRecord {
  pid: string;
  ref: string | null;

  lang?: string | null;

  hits: Kwic;
  adv: AdvancedLayer[] | null;
  lex: LexEntry | null;
}

// --------------------------------------------------------------------------
// result data - cql

export interface Kwic {
  fragments: KwicFragment[];
  left: string;
  keyword: string;
  right: string;
}

export interface KwicFragment {
  text: string;
  hit: boolean;
  hitKind?: string;
}

// --------------------------------------------------------------------------
// result data - fcs

export interface AdvancedLayer {
  id: string;
  spans: LayerFragment[];
}

export interface LayerFragment {
  text: string;
  hit: boolean;
  range?: [number, number];
}

// --------------------------------------------------------------------------
// result data - lex

export interface LexEntry {
  fields: LexField[];
  lang: string;
  langUri: string | null;
  pid?: string;
  reference?: string | null;
}

export interface LexField {
  type: LexFieldType | VirtualLexFieldType; // TODO: test API responses
  values: LexValue[];
}

export interface LexValue {
  value: string | null; // ?
  xmlId?: string;
  xmlLang?: string;
  langUri?: string;
  preferred?: boolean;
  ref?: string;
  idRefs?: string[];
  vocabRef?: string;
  vocabValueRef?: string;
  type?: string;
  source?: string;
  sourceRef?: string;
  date?: string;
}

// --------------------------------------------------------------------------
// API methods

export async function postSearch(
  params: ClientParams,
  searchParams: PostSearchData,
) {
  const result = await doPost<string>(
    "search",
    [
      // for URLSearchParams.constructor()
      ...Object.entries({
        query: searchParams.query,
        queryType: searchParams.queryType,
        language: searchParams.language,
        numberOfResults: searchParams.numberOfResults,
      }),
      // nested arrays must be handled manually
      ...searchParams.resourceIds.map((resourceId) => [
        "resourceIds[]",
        resourceId,
      ]),
    ],
    params,
  );
  console.debug("[postSearch]", searchParams, result);
  return result; // UUID with searchID
}

export async function postSearchMoreResults(
  params: ClientParams,
  searchID: string,
  searchParams: PostSearchMoreResultsData,
) {
  const result = await doPost<string>(
    `search/${searchID}`,
    searchParams,
    params,
  );
  console.debug("[postSearchMoreResults]", { searchID, searchParams }, result);
  return result; // UUID with searchID
}

export async function postSearchStop(params: ClientParams, searchID: string) {
  try {
    const response = await doPostRaw(`search/${searchID}/stop`, {}, params);
    console.debug("[postStopSearch]", { searchID }, response);
    return response.status === 202 || response.status !== 204;
  } catch (err) {
    // method is not yet supported by the API, so return `false`
    console.warn("Search stopping is not supported at this API!", err);
    return false;
  }
}

export function getSearchResultsURL(
  params: ClientParams,
  searchID: string,
  resourceID: string | undefined = undefined,
  metaOnly: boolean = false,
) {
  if (!searchID) throw new Error('Invalid "searchID" parameter!');

  let url = `search/${searchID}`;
  if (metaOnly) url = `${url}/metaonly`;

  if (resourceID !== undefined)
    url = `${url}?resourceId=${encodeURIComponent(resourceID)}`;

  return makeURL(url, params);
}

export async function getSearchResults(params: ClientParams, searchID: string) {
  if (!searchID) throw new Error('Invalid "searchID" parameter!');

  const result = await doGet<SearchResults>(`search/${searchID}`, params);
  console.debug("[getSearchResults]", { searchID }, result);
  return result;
}

export async function getSearchResultsMetaOnly(
  params: ClientParams,
  searchID: string,
) {
  if (!searchID) throw new Error('Invalid "searchID" parameter!');

  const result = await doGet<SearchResultsMetaOnly>(
    `search/${searchID}/metaonly`,
    params,
  );
  console.debug("[getSearchResultsMetaOnly]", { searchID }, result);
  return result;
}

export async function getSearchResultsMetaOnlyForResource(
  params: ClientParams,
  searchID: string,
  resourceID: string,
) {
  if (!searchID) throw new Error('Invalid "searchID" parameter!');
  if (!resourceID) throw new Error('Invalid "resourceID" parameter!');

  // TODO: search params via makeURL?
  const result = await doGet<SearchResultsMetaOnly>(
    `search/${searchID}/metaonly?resourceId=${encodeURIComponent(resourceID)}`,
    params,
  );
  console.debug(
    "[getSearchResultsMetaOnlyForResource]",
    { searchID, resourceID },
    result,
  );

  const results = result.results.filter((result) => result.id === resourceID);
  if (results.length === 0)
    throw new Error(
      `Results (meta) for resource not found! (searchId: ${searchID}, resourceId: ${resourceID})`,
    );

  return results[0];
}

export async function getSearchResultDetails(
  params: ClientParams,
  searchID: string,
  resourceID: string,
) {
  if (!searchID) throw new Error('Invalid "searchID" parameter!');
  if (!resourceID) throw new Error('Invalid "resourceID" parameter!');

  const result = await doGet<SearchResults>(
    `search/${searchID}?resourceId=${encodeURIComponent(resourceID)}`,
    params,
  );
  console.debug("[getSearchResultDetails]", { searchID, resourceID }, result);

  const results = result.results.filter(
    (result) => result.resource.id === resourceID,
  );
  if (results.length === 0)
    throw new Error(
      `Results for resource not found! (searchId: ${searchID}, resourceId: ${resourceID})`,
    );

  if (results[0].records === undefined) {
    console.warn(
      "Using legacy FCS SRU Aggregator API with Search Results not in '.records'!",
      { searchID },
      results,
    );
  }

  return results[0];
}
