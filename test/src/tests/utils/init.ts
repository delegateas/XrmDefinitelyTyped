import execFile from './execfile'; 

declare var global: any;

// Setup window
global.window = { location: {} };
global.GetGlobalContext = () => ({ getClientUrl: () => "" });


// Setup JavaScript dependencies
const libPath = __dirname + "/../../../lib/";

execFile(libPath + "sdk.rest.js");
execFile(libPath + "sdk.metadata.js");
execFile(libPath + "dg.xrmquery.web.js");
execFile(libPath + "dg.xrmquery.rest.js");

global.XrmQuery.setApiUrl("");

