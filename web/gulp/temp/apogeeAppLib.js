import Apogee from "/apogeeapp/app/Apogee.js";
import WebAppConfigManager from "/apogeeapp/impl/webAppLib/WebAppConfigManager.js";
import WebComponentDisplay from "/apogeeapp/app/component/webpage/WebComponentDisplay.js";

import util from "/apogeeutil/util.js";
import net from "/apogeeutil/net.js";
import apogeeui from "/apogeeapp/ui/apogeeui.js";
import ace from "/ext/ace/ace_1.4.3/ace_to_es6.js";

let apogeeAppLib = {};
let app;

export {apogeeAppLib as default};

/** This method initializes the workspace. */
apogeeAppLib.initWebApp = function(workspaceUrl,onWorkspaceLoad,onWorkspaceLoadFailed) { 

    //==========================
    //some global initialization
    //==========================

    window.apogee = {};
    apogee.util = util;
    apogee.net = net;

    const HOST_OUTPUT_ROOT = "https://apogeejs.com/lib/v1.0.0";

    //initialize resource path
    apogeeui.initResourcePath(HOST_OUTPUT_ROOT + "/resources");

    //any needs mode or theme files for the ace editor should go in the folder set below
    ace.config.set("basePath",HOST_OUTPUT_ROOT + "/ace_includes");
                
    //==========================
    //app initialization
    //==========================

    var appConfigManager = new WebAppConfigManager(workspaceUrl);
    
    //create the application
    app = Apogee.createApp(null,appConfigManager);

    app.addListener("workspaceComponentLoaded",onWorkspaceLoad);
    if(onWorkspaceLoadFailed) app.addListener("workspaceComponentLoadFailed",onWorkspaceLoadFailed);
}

/** This method attaches the apgee output display to the dom element. See the 
 * documentation for CSS requirements for the host element.
 * 
 * @param {type} memberName - The full name of the member to add to the web page (including the top level folder name)
 * @param {type} parentElementId - This is the DOM element ID into which the display should be added.
 * @param {type} isShowing - If the element is currently showing, this flag should be set to true. Otherwise, it 
 * should be set to false and the isShowing event used when the element becomes visible
 * @param {type} optionalViewType - For this component, the name of the data view can optionally be specified. Otherwise the default is used.
 * @returns {undefined} There is no return value
 */ 
apogeeAppLib.addDisplay = function(memberName,parentElementId,isShowing,optionalViewType) {
                
    var parentElement = document.getElementById(parentElementId);
    if(!parentElement) {
        console.error("DOM Element not found:" + parentElementId);
        return;
    }

    //show the display
    var componentDisplay = _createComponentDisplay(memberName,optionalViewType);
    if(!componentDisplay) {
        console.error("Workspace member not found not found:" + memberName);
        return;
    }

    //put the display element in the parent
    var element = componentDisplay.getElement();
    parentElement.appendChild(element);

    //the display frame method "setIsShowing" must be called when
    //the object is shown or hidden for proper operation
    if(isShowing) {
        componentDisplay.setIsShowing(true);
    }
}

/** If the DOM element is loaded or unloaded, this method should be called to update
 * the state. This state is available to all component displays and is used by some of them.
 */
apogeeAppLib.setIsShowing = function(memberName,isShowing) {
    var componentDisplay = _getComponentDisplay(memberName);
    if(!componentDisplay) {
        console.error("Workspace member not found not found:" + memberName);
        return;
    }
    
    componentDisplay.setIsShowing(isShowing);
}

/** If the DOM element is resized this method should be called. This information is available
 * to all component display and is sued by some of them.
 */
apogeeAppLib.onResize = function(memberName) {
    var componentDisplay = _getComponentDisplay(memberName);
    if(!componentDisplay) {
        console.error("Workspace member not found not found:" + memberName);
        return;
    }
    
    componentDisplay.onResize();
}

/** This method returns a WebComponentDisplay object which contains the component display object. 
* If the optionalViewType is not set, the default view (which is typically the desired one) will be used.*/
function _createComponentDisplay(memberName,optionalViewType) {
   var workspace = app.getWorkspace();
   var workspaceUI = app.getWorkspaceUI();

   var member = workspace.getMemberByFullName(memberName); 
   if(!member) {
       console.error("Member not found: " + memberName);
       return;
   }
   var component = workspaceUI.getComponent(member);
   
   var activeView = optionalViewType ? optionalViewType : component.componentGenerator.TABLE_EDIT_SETTINGS.defaultView;

   var componentDisplay = new WebComponentDisplay(component, activeView);

   component.setComponentDisplay(componentDisplay);

   return componentDisplay;
}

/** This method returns a PlainFrame object which contains the component display object. 
* If the optionalViewType is not set, the default view (which is typically the desired one) will be used.*/
function _getComponentDisplay(memberName) {
    var workspace = app.getWorkspace();
    var workspaceUI = app.getWorkspaceUI();
 
    var member = workspace.getMemberByFullName(memberName); 
    if(!member) {
        console.error("Member not found: " + memberName);
        return;
    }
    var component = workspaceUI.getComponent(member);
 
    return component.getComponentDisplay();

 }

