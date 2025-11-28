export interface MultilingualStrings {
  [language: string]: string;
}

// --------------------------------------------------------------------------

export interface Diagnostic {
  uri: string;
  message: string;
  diagnostic: null | string;
}

export interface Exception {
  klass: string;
  message: string;
  cause: null | string;
}
