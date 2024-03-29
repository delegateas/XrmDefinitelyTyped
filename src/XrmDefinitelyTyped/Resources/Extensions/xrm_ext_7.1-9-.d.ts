﻿// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="..\xrm.d.ts" />
declare namespace Xrm {
  interface context {
    /**
     * Returns the difference between the local time and Coordinated Universal Time (UTC).
     */
    getTimeZoneOffsetMinutes(): number;
  }
}
