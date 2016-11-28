Getting started
=================

Get up and running with XrmDefinitelyTyped in a few minutes by following this guide.

Prerequisities
--------------

* Latest [TypeScript](http://www.typescriptlang.org/index.html#download-links) installed
* TypeScript is set up to compile `.ts` files in your project


Step-by-step
------------

**Setup:**

1. Download the [self-contained install file][install], and place it in a folder relative to your web resource project folder (*Windows only*).
2. Run the `install.cmd` file to install the latest version of XrmDefinitelyTyped along with its dependencies in the folder (*Windows only*).
3. Generate a configuration file by opening a command prompt and running XrmDefinitelyTyped with the `/gc` parameter: `XrmDefinitelyTyped.exe /gc`
4. Edit the AppSettings in the generated configuration file (`XrmDefinitelyTyped.exe.config`) to fit your CRM environment and needs
   (see [arguments available to XDT](tool-usage.html)).


**Usage:**

1. Run `XrmDefinitelyTyped.exe`. This will generate the desired declaration files at the specified location (or in the current folder if none specified)
2. Create a TypeScript file, or convert your old .js files to .ts
3. Reference the necessary declaration file(s) you need for your logic - see examples below. 
   * *Note: this can be skipped if typings files are already included in your TypeScript compilation context*
4. Making form logic? Cast the `Xrm.Page` object to the form you are coding towards
5. Start coding!


Recommended form script file-setup
----------------------


Either make a new variable (`Page`), and set it to `Xrm.Page` casted to the desired form type:

    [lang=typescript]
    namespace DG.Contact {
        const Page = <Form.contact.Main.Information>Xrm.Page;

        export function onLoad() {
            // Code here..
            Page.getAttribute("firstname");
        }
    }

Or declare the Xrm object to be the form your want it to match:

    [lang=typescript]
    namespace DG.Contact {
        declare var Xrm: Xrm<Form.contact.Main.Information>;

        export function onLoad() {
            // Code here..
            Xrm.Page.getAttribute("firstname");
        }
    }



[install]: files/install-latest.cmd