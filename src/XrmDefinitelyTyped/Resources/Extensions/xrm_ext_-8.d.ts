// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="..\xrm.d.ts" />
declare namespace Xrm {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PageTab<T extends SectionCollectionBase> {
    /**
     * Add an event handler on tab state change.
     *
     * @param reference Event handler for tab state change.
     */
    add_tabStateChange(reference: Function): void; //eslint-disable-line @typescript-eslint/ban-types
  }
}
