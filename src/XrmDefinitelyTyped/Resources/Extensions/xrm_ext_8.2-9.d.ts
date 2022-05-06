// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="..\xrm.d.ts" />
declare namespace Xrm {
  interface Process {
    /**
     * Use this method to get the current status of the process instance
     * @returns The current status of the process
     */
    getStatus(): ProcessStatus;
  }
}
