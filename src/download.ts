import type { ClientParams } from "./utils";
import { makeURL } from "./utils";

// --------------------------------------------------------------------------
// parameter types

export type DownloadFormats = "text" | "csv" | "tcf" | "ods" | "excel";
export type LanguageFilterOptions = "byMeta" | "byGuess" | "byMetaAndGuess";

// --------------------------------------------------------------------------
// API methods

export function getURLForDownload(
  params: ClientParams,
  searchID: string,
  resourceID: string,
  format: DownloadFormats,
  language?: string | null,
  languageFilter?: LanguageFilterOptions | null,
) {
  const url = makeURL(`search/${searchID}/download`, params);

  url.searchParams.set("resourceId", resourceID); // encodeURIComponent
  url.searchParams.set("format", format);
  if (
    (languageFilter === "byGuess" || languageFilter === "byMetaAndGuess") &&
    language !== undefined &&
    language !== null
  ) {
    url.searchParams.set("filterLanguage", language);
  }

  return url;
}

export function getURLForWeblicht(
  params: ClientParams,
  searchID: string,
  resourceID: string,
  languageForWeblicht: string | null,
  language?: string | null,
  languageFilter?: LanguageFilterOptions | null,
) {
  const url = makeURL(`search/${searchID}/toWeblicht`, params);

  url.searchParams.set("resourceId", resourceID); // encodeURIComponent
  if (languageForWeblicht) {
    url.searchParams.set("filterLanguage", languageForWeblicht);
  } else if (
    (languageFilter === "byGuess" || languageFilter === "byMetaAndGuess") &&
    language !== undefined &&
    language !== null
  ) {
    url.searchParams.set("filterLanguage", language);
  }

  return url;
}
