import type { AxiosInstance } from "axios";

// --------------------------------------------------------------------------
// parameter types

export type DownloadFormats = "text" | "csv" | "tcf" | "ods" | "excel";
export type LanguageFilterOptions = "byMeta" | "byGuess" | "byMetaAndGuess";

// --------------------------------------------------------------------------
// API methods

export function getURLForDownload(
  axios: AxiosInstance,
  searchID: string,
  resourceID: string,
  format: DownloadFormats,
  language: string,
  languageFilter: LanguageFilterOptions
) {
  const params = new URLSearchParams({
    resourceId: resourceID, // encodeURIComponent
    format: format,
  });
  if (languageFilter === "byGuess" || languageFilter === "byMetaAndGuess") {
    params.set("filterLanguage", language);
  }
  const relURL = `search/${searchID}/download?${params.toString()}`;
  return axios.getUri({ url: relURL });
}

export function getURLForWeblicht(
  axios: AxiosInstance,
  searchID: string,
  resourceID: string,
  languageForWeblicht: string | null,
  language: string,
  languageFilter: LanguageFilterOptions
) {
  const params = new URLSearchParams({
    resourceId: resourceID, // encodeURIComponent
  });
  if (languageForWeblicht) {
    params.set("filterLanguage", languageForWeblicht);
  } else if (
    languageFilter === "byGuess" ||
    languageFilter === "byMetaAndGuess"
  ) {
    params.set("filterLanguage", language);
  }
  const relURL = `search/${searchID}/toWeblicht?${params.toString()}`;
  return axios.getUri({ url: relURL });
}
