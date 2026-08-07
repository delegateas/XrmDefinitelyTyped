import { FORMATTED_VALUE_ID } from "./parse.js";
import type { RequestHeader } from "./http.js";

export const FORMATTED_VALUES_HEADER: RequestHeader = {
  type: "Prefer",
  value: `odata.include-annotations="${FORMATTED_VALUE_ID}"`,
};

export const INCLUDE_ANNOTATIONS_HEADER: RequestHeader = {
  type: "Prefer",
  value: `odata.include-annotations="*"`,
};

export const maxPageSizeHeader = (size: number): RequestHeader => ({
  type: "Prefer",
  value: `odata.maxpagesize=${size}`,
});
