import type { AxiosInstance } from "axios";

// --------------------------------------------------------------------------

export const REQ_PARAM_CONSORTIA = "x-consortia";

export interface ExtraScopingParams {
  consortia?: Consortium | null;
}

// --------------------------------------------------------------------------
// API response types

/**
 * Response for `/consortia`
 *
 * @see {@link getConsortia} API endpoint
 * @see {@link Consortium} known consortia names
 */
export type Consortia = Consortium[];

// --------------------------------------------------------------------------

/**
 * CLARIN centre registry consortia identifier
 *
 * (from: 2025-11-28)
 */
export type Consortium =
  | "CLARIAH-AT"
  | "CLARIN-BE"
  | "CLARIN-D"
  | "CLARIN-DK"
  | "CLARIN-IT"
  | "CLARIN-LV"
  | "CLARIN-PL"
  | "FIN-CLARIN"
  | "LINDAT/CLARIAH-CZ"
  | "PORTULAN CLARIN"
  | "SWE-CLARIN"
  | string;

// --------------------------------------------------------------------------
// API methods

export async function getConsortia(axios: AxiosInstance) {
  const url = "consortia";
  const response = await axios.get(url);
  console.debug("[getConsortia]", response);
  return (response.data as (string | null)[]).filter(
    (consortium) => consortium !== null
  );
}
