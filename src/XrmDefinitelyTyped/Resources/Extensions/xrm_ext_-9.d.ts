/// <reference path="..\xrm.d.ts" />
declare namespace Xrm {
  interface DataModule<T extends AttributeCollectionBase> {
    /**
     * Asynchronously refreshes and optionally saves all the data of the form without reloading the page.
     * 
     * @param save true if the data should be saved after it is refreshed, otherwise false.
     */
    refresh(save?: boolean): Then<undefined>;

    /**
     * Saves the record asynchronously with the option to set callback functions to be executed after the save operation is completed.
     *
     * @param saveOptions This option is only applicable when used with appointment, recurring appointment, or service activity records.
     */
    save(saveOptions?: SaveOptions): Then<undefined>;
  }
}