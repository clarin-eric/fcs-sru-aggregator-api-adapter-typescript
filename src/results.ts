import { AxiosError } from "axios";
import type { AxiosInstance } from "axios";

import type { LexFieldType, Resource, VirtualLexFieldType } from "./resources";
import type { Diagnostic, Exception } from "./utils";

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
  axios: AxiosInstance,
  searchParams: PostSearchData
) {
  const response = await axios.post("search", searchParams, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  console.debug("[postSearch]", searchParams, response);
  return response.data as string; // UUID with searchID
}

export async function postSearchMoreResults(
  axios: AxiosInstance,
  searchID: string,
  searchParams: PostSearchMoreResultsData
) {
  const response = await axios.post(`search/${searchID}`, searchParams, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  console.debug(
    "[postSearchMoreResults]",
    { searchID, searchParams },
    response
  );
  return response.data as string; // UUID with searchID
}

export async function postSearchStop(axios: AxiosInstance, searchID: string) {
  try {
    const response = await axios.post(
      `search/${searchID}/stop`,
      {},
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    console.debug("[postStopSearch]", { searchID }, response);
    return response.status === 202 || response.status !== 204;
  } catch (err) {
    if (err instanceof AxiosError) {
      if (
        err.status === 404 &&
        err.response?.data.message === "HTTP 404 Not Found"
      ) {
        // method is not yet supported by the API, so return `false`
        console.warn("Search stopping is not supported at this API!");
        return false;
      }
    }
    throw err;
  }
}

export function getSearchResultsURL(
  axios: AxiosInstance,
  searchID: string,
  resourceID: string | undefined = undefined,
  metaOnly: boolean = false
) {
  if (!searchID) throw new Error('Invalid "searchID" parameter!');

  let url = `search/${searchID}`;
  if (metaOnly) url = `${url}/metaonly`;

  if (resourceID !== undefined)
    url = `${url}?resourceId=${encodeURIComponent(resourceID)}`;

  return axios.getUri({ url });
}

export async function getSearchResults(axios: AxiosInstance, searchID: string) {
  if (!searchID) throw new Error('Invalid "searchID" parameter!');

  const response = await axios.get(`search/${searchID}`);
  console.debug("[getSearchResults]", { searchID }, response);

  if (
    (response.data as SearchResults)?.results?.length > 0 &&
    (response.data as SearchResults).results[0].records === undefined
  ) {
    console.warn(
      "Using legacy FCS SRU Aggregator API with Search Results not in '.records'!",
      { searchID },
      response.data
    );
  }

  return response.data as SearchResults;
}

export async function getSearchResultsMetaOnly(
  axios: AxiosInstance,
  searchID: string
) {
  if (!searchID) throw new Error('Invalid "searchID" parameter!');

  const response = await axios.get(`search/${searchID}/metaonly`);
  console.debug("[getSearchResultsMetaOnly]", { searchID }, response);
  return response.data as SearchResultsMetaOnly;
}

export async function getSearchResultsMetaOnlyForResource(
  axios: AxiosInstance,
  searchID: string,
  resourceID: string
) {
  if (!searchID) throw new Error('Invalid "searchID" parameter!');
  if (!resourceID) throw new Error('Invalid "resourceID" parameter!');

  const response = await axios.get(
    `search/${searchID}/metaonly?resourceId=${encodeURIComponent(resourceID)}`
  );
  console.debug(
    "[getSearchResultsMetaOnlyForResource]",
    { searchID, resourceID },
    response
  );

  const results = (response.data as SearchResultsMetaOnly).results.filter(
    (result) => result.id === resourceID
  );
  if (results.length === 0)
    throw new Error(
      `Results (meta) for resource not found! (searchId: ${searchID}, resourceId: ${resourceID})`
    );

  return results[0];
}

export async function getSearchResultDetails(
  axios: AxiosInstance,
  searchID: string,
  resourceID: string
) {
  if (!searchID) throw new Error('Invalid "searchID" parameter!');
  if (!resourceID) throw new Error('Invalid "resourceID" parameter!');

  const response = await axios.get(
    `search/${searchID}?resourceId=${encodeURIComponent(resourceID)}`
  );
  console.debug("[getSearchResultDetails]", { searchID, resourceID }, response);

  const results = (response.data as SearchResults).results.filter(
    (result) => result.resource.id === resourceID
  );
  if (results.length === 0)
    throw new Error(
      `Results for resource not found! (searchId: ${searchID}, resourceId: ${resourceID})`
    );

  if (results[0].records === undefined) {
    console.warn(
      "Using legacy FCS SRU Aggregator API with Search Results not in '.records'!",
      { searchID },
      results
    );
  }

  return results[0];
}
