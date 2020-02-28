/// <reference path="..\xrm.d.ts" />
declare namespace Xrm {
  interface ProcessModule {
    /**
     * Returns the current status of the process instance.
     */
    getStatus(): ProcessStatus;

    /**
     * Sets the current status of the active process instance.
     * @param status The new status. The values can be active, aborted, or finished.
     * @param callbackFunction A function to call when the operation is complete. This callback function is passed the new status as a string value.
     */
    setStatus(status: ProcessStatus, callbackFunction?: (status: ProcessStatus) => any): ProcessStatus;
  }
}
