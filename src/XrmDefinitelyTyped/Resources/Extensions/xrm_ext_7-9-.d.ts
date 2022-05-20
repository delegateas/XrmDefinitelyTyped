// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="..\xrm.d.ts" />
declare namespace Xrm {
  interface context {
    /**
     * Returns whether Autosave is enabled for the organization.
     */
    getIsAutoSaveEnabled(): boolean;
  }
}
