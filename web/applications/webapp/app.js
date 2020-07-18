import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import * as apogee from "/apogee/apogeeCoreLib.js";
import * as apogeeapp from "/apogeeapp/apogeeAppLib.js";
import * as apogeeui from "/apogeeui/apogeeUiLib.js";
import * as apogeeview from "/apogeeview/apogeeViewLib.js";
import { ApogeeView, initIncludePath } from "/apogeeview/apogeeViewLib.js";
import CutNPasteAppConfigManager from "/applications/webapp/CutNPasteAppConfigManager.js";

//expose these apogee libraries globally so plugins can use them
window.apogeeutil = apogeeutil;
window.apogee = apogee;
window.apogeeapp = apogeeapp;
window.apogeeui = apogeeui;
window.apogeeview = apogeeview;

let appView;

window.init = function(includeBasePathInfo) {
    //initialize include directories
    initIncludePath(includeBasePathInfo);
    
    //use cutnpaste file access
    let appConfigManager = new CutNPasteAppConfigManager();
    
    //create the application
    appView = new ApogeeView("appContainer",appConfigManager);
}

window.beforeUnloadHandler = function(e) {
    var app = appView.getApp();
    if((app)&&(app.getWorkspaceIsDirty())) {
        return "There is unsaved data. Exit?";
    }
    else {
        return undefined;
    }
}
