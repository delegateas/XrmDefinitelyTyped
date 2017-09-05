/// <reference path="..\xrm.d.ts" />
declare namespace Xrm {

    interface context {
        /**
        * Returns a Boolean value indicating if the user is using Microsoft Dynamics CRM for Microsoft Office Outlook.
        */
        isOutlookClient(): boolean;

        /**
        * Returns a Boolean value that indicates whether the user is connected to the Microsoft Dynamics CRM server
        * while using Microsoft Dynamics CRM for Microsoft Office Outlook with Offline Access.
        * When this function returns false, the user is working offline without a connection to the server.
        */
        isOutlookOnline(): boolean;
    }
}