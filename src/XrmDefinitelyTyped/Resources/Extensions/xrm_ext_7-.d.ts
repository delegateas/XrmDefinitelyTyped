﻿// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="..\xrm.d.ts" />
declare namespace _XRMNS_ {
  /**
   * Interface for the ui of a form.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface UiModule<T extends TabCollectionBase, U extends ControlCollectionBase> {
    /**
     * Access UI controls for the business process flow on the form.
     */
    process: UiProcessModule;
  }

  interface UiProcessModule {
    /**
     * Use this method to retrieve the display state for the business process control.
     */
    getDisplayState(): CollapsableDisplayState;

    /**
     * Use this method to expand or collapse the business process flow control.
     */
    setDisplayState(val: CollapsableDisplayState): void;

    /**
     * Use getVisible to retrieve whether the business process control is visible.
     */
    getVisible(): boolean;

    /**
     * Use setVisible to show or hide the business process control.
     */
    setVisible(visible: boolean): void;
  }
}
