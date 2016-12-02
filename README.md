# XrmDefinitelyTyped [![NuGet version](https://badge.fury.io/nu/Delegate.XrmDefinitelyTyped.svg)](https://badge.fury.io/nu/Delegate.XrmDefinitelyTyped)

XrmDefinitelyTyped generates [TypeScript](http://www.typescriptlang.org/) 
declaration files based on *your* Dynamics 365/CRM/xRM solution.

It is the TypeScript equivalent of [CrmSvcUtil](https://msdn.microsoft.com/en-us/library/gg327844.aspx), but instead of 
generating early-bound .NET classes for server-side code, it generates TypeScript interfaces for all your client-side coding.

[Read more here](http://delegateas.github.io/Delegate.XrmDefinitelyTyped/)


## Getting started

* [Getting started](http://delegateas.github.io/Delegate.XrmDefinitelyTyped/getting-started.html)
* [Arguments and usage](http://delegateas.github.io/Delegate.XrmDefinitelyTyped/tool-usage.html)


## Contribute


### Build

Recommended environment: [Visual Studio 2015](https://www.visualstudio.com/downloads/)

**Requirements:**

* [F# 4.0+](https://www.microsoft.com/en-us/download/details.aspx?id=48179)
* [TypeScript 2.0+](https://www.microsoft.com/en-us/download/details.aspx?id=48593)
* [Java JRE/SDK](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) (to minimize JavaScript code with closure)


### Test

Recommended environment: [Visual Studio Code](https://code.visualstudio.com/)


**Requirements:**

* [Node.js and npm](https://nodejs.org/)

#### Run tests

When the main Visual Studio project is run, it generates files for the test project.

You can then go to the `test`-folder, and run:

    npm install
    npm test