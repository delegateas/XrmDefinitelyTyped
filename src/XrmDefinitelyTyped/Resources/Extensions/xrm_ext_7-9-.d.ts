// <reference path="..\xrm.d.ts" />
declare namespace Xrm {
  interface context {
    /**
     * Returns whether Autosave is enabled for the organization.
     */
    getIsAutoSaveEnabled(): boolean;
  }
}
