import "/apogee/webGlobals.js";
import "/apogee/debugHook.js";

export {ApogeeWebView} from "/apogeewebview/apogeeWebViewLib.js";

//expose these apogee libraries globally so plugins can use them
import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import * as apogee from "/apogee/apogeeCoreLib.js";
import * as apogeeapp from "/apogeeapp/apogeeAppLib.js";
import * as apogeeui from "/apogeeui/apogeeUiLib.js";
import * as apogeeview from "/apogeeview/apogeeViewLib.js";
window.apogeeutil = apogeeutil;
window.apogee = apogee;
window.apogeeapp = apogeeapp;
window.apogeeui = apogeeui;
window.apogeeview = apogeeview;

//implementation of global alert functions
//__globals__.apogeeLog = (msg) => console.log(message);
__globals__.apogeeUserAlert = (msg) => apogeeui.showSimpleActionDialog(msg,null,["OK"]);
__globals__.apogeeUserConfirm = (msg,okText,cancelText,okAction,cancelAction,defaultToOk) => apogeeui.showSimpleActionDialog(msg,null,[okText,cancelText],[okAction,cancelAction]);
__globals__.apogeeUserConfirmSynchronous = (msg,okText,cancelText,defaultToOk) => confirm(msg);

//initialize resource path
const INCLUDE_BASE_PATH = "";
const INCLUDE_PATH_INFO = {
    "resources": INCLUDE_BASE_PATH + "/resources",
    "aceIncludes": INCLUDE_BASE_PATH + "/ext/ace/ace_1.4.3/ace_includes"
};
apogeeview.initIncludePath(INCLUDE_PATH_INFO);