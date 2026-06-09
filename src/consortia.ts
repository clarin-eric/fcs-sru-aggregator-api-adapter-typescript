import type { ClientParams } from "./utils";
import { doGet } from "./utils";

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

export async function getConsortia(params: ClientParams) {
  const consortia = await doGet<(string | null)[]>("consortia", params);
  console.debug("[getConsortia]", consortia);
  return consortia.filter((consortium) => consortium !== null);
}
