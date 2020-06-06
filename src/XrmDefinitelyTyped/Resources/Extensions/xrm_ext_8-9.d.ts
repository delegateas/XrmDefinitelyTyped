/// <reference path="..\xrm.d.ts" />
declare namespace Xrm {
  /**
   * Interface for the business process flow on a form.
   */
  interface ProcessModule {
    /**
     * Set a Process as the active process. 123
     *
     * @param processId The Id of the process to make the active process.
     * @param callback A function to call when the operation is complete. This callback function is passed one of the following string
     *    values to indicate whether the operation succeeded. Is "success" or "invalid".
     */
    setActiveProcess(processId: string, callback: (successOrInvalid: "success" | "invalid") => any): void;
  }
}
