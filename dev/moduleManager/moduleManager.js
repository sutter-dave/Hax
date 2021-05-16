//======================
// Fields
//======================
let callingWindow = null;
let callingUrl = null;
let appModules = null;
let moduleDataList = [];

const STATUS_UNKNOWN = -1;

const NPM_NOT_INSTALL = 0;
const NPM_INTALLED_NOT_LOADED = 1;
const NPM_INSTALLED_AND_LOADED = 2;

const ES_NOT_LOADED = 3;
const ES_LOADED = 4;

const MODULE_REQUEST_URL = "moduleData.json";

//======================
// Functions
//======================
/** This method loads the module list. */
async function load() {

    //get the url for the calling app, for message passing
    callingWindow = window.opener;
    callingUrl = readQueryField("callingUrl");

    //listener for messages from the app
    window.addEventListener("message",event => receiveMessage(event));

    //this message lets the main window know the module manager closed
    window.addEventListener("unload",() => closeModuleManager());

    //get module data from server
    let modulesConfig = await fetch(MODULE_REQUEST_URL).then(response => {
        if(response.ok) {
            return response.json();
        }
        else {
            alert("Error loading module data from server");
            return null;
        }
    })

    if(modulesConfig) {
        //populate base info in dom elements
        populateDomList(modulesConfig.modules);

        //populate status based on app/workspace data
        let initialAppModules = readAppModules();
        updateAppModuleData(initialAppModules);
    }
}

//==================
// External Functions
//==================
function loadEsModule(moduleUrl,moduleName) {
    let messageData = {
        moduleIdentifier: moduleUrl,
        moduleName: moduleName
    }
    sendMessage("loadModule",messageData);
}

function unloadESModule(moduleUrl) {
    let messageData = {
        moduleIdentifier: moduleUrl
    }
    sendMessage("unloadModule",messageData);
}

function switchEsModule(newUrl,oldUrl) {
    let messageData = {
        newIdentifier: newUrl,
        oldIdentifier: oldUrl
    }
    sendMessage("switchModule",messageData);
}

function installNpmModule(moduleName,moduleVersion) {
    let messageData = {
        moduleName: moduleName,
        moduleVersion: moduleVersion
    }
    sendMessage("installNpmModule",messageData);
}

function installAndLoadNpmModule(npmModuleName,version) {
    let messageData = {
        moduleName: moduleName,
        moduleVersion: moduleVersion
    }
    sendMessage("installAndLoadNpmModule",messageData);
}

function loadNpmModule(moduleName) {
    let messageData = {
        moduleIdentifier: moduleName,
        moduleName: moduleName
    }
    sendMessage("loadModule",messageData);
}

function uninstallNpmModule(moduleName) {
    let messageData = {
        moduleName: moduleName
    }
    sendMessage("uninstallNpmModule",messageData);
}

function unloadModule(moduleName) {
    let messageData = {
        moduleIdentifier: moduleName
    }
    sendMessage("unloadModule",messageData);
}

function switchNpmModule(moduleName,newVersion,oldVersion) {
    let messageData = {
        moduleName: moduleName,
        newVersion: newVersion,
        oldVersion: oldVersion
    }
    sendMessage("switchEsModule",messageData);
}

function openWebWorkspace(workspaceUrl) {
    let messageData = {
        workspaceUrl: workspaceUrl
    }
    sendMessage("openWorkspace",messageData);
}

function openWebLink(linkUrl) {
    let messageData = {
        linkUrl: linkUrl
    }
    sendMessage("openLink",messageData);
}

function closeModuleManager() {
    sendMessage("closeModuleManager",null);
}


//========================
// Handlers
//========================
function moreClicked(moduleData) {
    //make sure the proper version data is populated
    loadBodyForVersion(moduleData)

    moduleData.moreContainer.style.display = "none";
    moduleData.bodyCell.style.display = "";
    moduleData.isOpened = true;
}

function lessClicked(moduleData) {
    moduleData.moreContainer.style.display = "";
    moduleData.bodyCell.style.display = "none";
    moduleData.isOpened = false;
}

function versionSelectorChanged(moduleData) {
    loadBodyForVersion(moduleData);
}

//=================
// Messaging Functions
//=================

function receiveMessage(event) {
    switch(event.data.message) {
        case "appModules": 
            updateAppModuleData(event.data.value);
            break;
    }
}

function sendMessage(messageType,messageValue) {
    if((callingWindow)&&(callingWindow.postMessage)) {
        callingWindow.postMessage({message: messageType, value: messageValue},callingUrl);
    }
}
        

//=================
// Internal Functions - DOM
//=================

/** This function initially populates the module list. */
function populateDomList(moduleListConfig) {

    let listContainerElement = document.getElementById("moduleListContainer");
    if(!listContainerElement) {
        alert("Error loading page: list container not found!");
        return;
    }

    moduleListConfig.forEach(moduleConfig => {
        let moduleData = {};
        moduleData.moduleConfig = moduleConfig;
        moduleData.moduleName = moduleConfig.moduleName;

        //create the main cells
        let moduleCell = document.createElement("div");
        moduleCell.className = "moduleCell";
        let headerCell = document.createElement("div");
        headerCell.className = "headerCell";
        moduleCell.appendChild(headerCell);
        let bodyCell = document.createElement("div");
        bodyCell.className = "bodyCell";
        moduleCell.appendChild(bodyCell);
        moduleData.bodyCell = bodyCell; //save this

        //fill in the header
        let titleField = document.createElement("div");
        titleField.className = "titleField";
        titleField.innerHTML = getTitle(moduleConfig);
        headerCell.appendChild(titleField);
        let statusField = document.createElement("div");
        statusField.className = "statusField";
        headerCell.appendChild(statusField);
        moduleData.statusField = statusField; //save this
        let shortDescField = document.createElement("div");
        shortDescField.className = "shortDescField";
        shortDescField.innerHTML = getShortDesc(moduleConfig);
        headerCell.appendChild(shortDescField);

        let moreContainer = document.createElement("div");
        moreContainer.className = "moreOrLessContainer";
        headerCell.appendChild(moreContainer);
        let moreLink = document.createElement("a");
        moreLink.href = "#";
        moreLink.className = "moreOrLessLink";
        moreLink.onclick = () => moreClicked(moduleData);
        moreLink.innerHTML = "show more";
        moreContainer.appendChild(moreLink);
        moduleData.moreContainer = moreContainer; //save this

        //start in a closed state
        bodyCell.style.display = "none"; //initially invisible
        moreLink.style.display = ""; //initially visible
        moduleData.isOpened = false;

        //fill in the parts of the body that do not depend on the selected version
        let leftCell = document.createElement("div");
        leftCell.className = "leftCell";
        bodyCell.appendChild(leftCell);
        let rightCell = document.createElement("div");
        rightCell.className = "rightCell";
        bodyCell.appendChild(rightCell);

        //left cell
        let versionContainer = document.createElement("div");
        versionContainer.className = "versionContainer";
        leftCell.appendChild(versionContainer);
        let versionLabel = document.createElement("span");
        versionLabel.classname = "versionLabel";
        versionLabel.innerHTML = "Version:";
        versionContainer.appendChild(versionLabel);
        versionSelector = document.createElement("select");
        versionSelector.onchange = () => versionSelectorChanged(moduleData);
        versionContainer.appendChild(versionSelector);
        let notLatestContainer = document.createElement("div");
        notLatestContainer.className = "notLatestContainer";
        notLatestContainer.innerHTML = "Not Latest Version!"
        versionContainer.appendChild(notLatestContainer);
        populateVersionSelector(moduleConfig,versionSelector,notLatestContainer);
        moduleData.versionSelector = versionSelector; //save this
        moduleData.notLatestContainer = notLatestContainer; //save this
        
        let workspaceCommandSetContainer = document.createElement("div");
        workspaceCommandSetContainer.className = "workspaceCommandSetContainer";
        leftCell.appendChild(workspaceCommandSetContainer);
        moduleData.workspaceCommandSetContainer = workspaceCommandSetContainer; //save this

        let lessContainer = document.createElement("div");
        lessContainer.className = "moreOrLessContainer";
        leftCell.appendChild(lessContainer);
        let lessLink = document.createElement("a");
        lessLink.href = "#";
        lessLink.className = "moreOrLessLink";
        lessLink.onclick = () => lessClicked(moduleData);
        lessLink.innerHTML = "show less";
        lessContainer.appendChild(lessLink);

        //right cell
        let demoLinkSetContainer = document.createElement("div");
        demoLinkSetContainer.className = "referenceCommandSetContainer";
        rightCell.appendChild(demoLinkSetContainer);
        moduleData.demoLinkSetContainer = demoLinkSetContainer; //save this

        let webLinkSetContainer = document.createElement("div");
        webLinkSetContainer.className = "referenceCommandSetContainer";
        rightCell.appendChild(webLinkSetContainer);
        moduleData.webLinkSetContainer = webLinkSetContainer; //save this

        //add to the module list
        listContainerElement.appendChild(moduleCell);  
        moduleDataList.push(moduleData);      
    })
}

/** This sets or updates the part of the module display that depends on the current app/workspace modules. */
function updateModuleStatus(moduleData) {
    let newStatusInfo = getStatus(moduleData);
    if(isStatusEqual(newStatusInfo,moduleData.statusInfo)) return;

    moduleData.statusInfo = newStatusInfo;

    //set status message
    moduleData.statusField.innerHTML = getStatusMsg(newStatusInfo);

    //set the workspace commands
    if(moduleData.isOpened) {
        let version = moduleData.versionSelector.value;
        let selectedVersionInfo = lookupVersionInfo(version,moduleData);
        setWorkspaceCommands(selectedVersionInfo,moduleData) 
    }
}

/** This method returns the title text for a given module. */
function getTitle(moduleConfig) {
    let title;
    if(moduleConfig.displayName) title = moduleConfig.displayName + ": ";
    else title = "";

    title += moduleConfig.moduleName;
    return title;
}

/** This method returns the status text for a given status value. */
function getStatusMsg(statusInfo) {
    switch(statusInfo.status) {
        case STATUS_UNKNOWN:
            return "Status Unknown";

        case ES_NOT_LOADED:
            return "Not Loaded in Workspace"

        case ES_LOADED:
            return "Loaded in Workspace: " + statusInfo.version;

        case NPM_NOT_INSTALL:
            return "Not Installed in App"

        case NPM_INSTALLED_NOT_LOADED:
            return "Not loaded in Workspace; Installed in App: " + statusInfo.version;

        case NPM_INSTALLED_AND_LOADED:
            return "Installed and Loaded in Workspace: " + statusInfo.version;
    }
}

/** This function returns the short description for a module. */
function getShortDesc(moduleConfig) {
    if(moduleConfig.shortDesc) return moduleConfig.shortDesc;
    else return "No description available";
}

/** This function populates the version selector for a module. */
function populateVersionSelector(moduleConfig,versionSelector,notLatestContainer) {
    moduleConfig.versions.forEach(versionInfo => {
        let optionElement = document.createElement("option");
        optionElement.text = versionInfo.version;
        versionSelector.add(optionElement);
        //make the initial selection the latest
        if(versionInfo.isLatest) {
            versionSelector.selectedIndex = versionSelector.length-1;
        }
    })
    notLatestContainer.style.display = "none"; 
}

/** This method loads the body for a given bersion of a given module */
function loadBodyForVersion(moduleData) {
    let version = moduleData.versionSelector.value;
    if((moduleData.loadedBodyVersion != version)&&(moduleData.moduleConfig.versions)) {
        //load the new data
        let selectedVersionInfo = lookupVersionInfo(version,moduleData);
        if(selectedVersionInfo) {
            //update commands for the app/workspace
            setWorkspaceCommands(selectedVersionInfo,moduleData);
            if(selectedVersionInfo.demoWorkspaces) {
                //add each demo workspace link
                selectedVersionInfo.demoWorkspaces.forEach(workspaceInfo => {
                    setReferenceWorkspace(workspaceInfo,moduleData);
                });
            }
            if(selectedVersionInfo.webLink) {
                //add the web link
                setReferenceWebLink(selectedVersionInfo.webLink,moduleData);
            }
            //set the visibility of the "not latest" label
            moduleData.notLatestContainer.style.display = selectedVersionInfo.isLatest ? "none" : "";
            
            moduleData.loadedBodyVersion = version;
        }
    }
}

/** This function adds the workspace commands for a module, which is the commands to add and remove
 * the module from the application/workspace. */
function setWorkspaceCommands(selectedVersionInfo,moduleData) {
    let domContainer = moduleData.workspaceCommandSetContainer;
    let statusInfo = moduleData.statusInfo;

    //clear data
    domContainer.innerHTML = "";

    switch(statusInfo.status) {
        case STATUS_UNKNOWN:
            //figure out what to do here
            break;

        case ES_NOT_LOADED:
            //load the selected version
            {
                let handler = () => loadEsModule(selectedVersionInfo.esUrl,moduleData.moduleName); 
                let msg;
                if(selectedVersionInfo.isLatest) {
                    msg = "Load Module to Workspace";
                }
                else {
                    msg = "Load this Version to Workspace (not latest) "
                }
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msg,handler));
            }
            break;

        case ES_LOADED:
            //unload the current version, whichever that is
            {
                let handler = () => unloadEsModule(statusInfo.url); 
                let msg = "Unload Module from Workspace";
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msg,handler));
            }

            //if the selected version is not loaded, allow for a switch
            //specify if the selected is latest/newer, not latest/older
            if(statusInfo.version != selectedVersionInfo.version) {
                let handler = () => switchEsModule(statusInfo.url,selectedVersionInfo.esUrl);
                let msg;
                if(selectedVersionInfo.isLatest) msg = "Upgrade to this Version (latest)"
                else if(selectedVersionInfo.version > statusInfo.version) msg = "Upgrade to this Version (not latest version)"
                else msg = "Downgrade to this Older Version"
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msg,handler));
            }
            break;

        case NPM_NOT_INSTALL:
            //two commands - install and load, or just install
            {
                let handlerInstall = () => installNpmModule(moduleData.moduleName,selectedVersionInfo.version);
                let handlerInstallAndLoad = () => installAndLoadNpmModule(moduleData.moduleName,selectedVersionInfo.version);
                let msgInstall, msgInstallAndLoad;
                //message is different for latest versus not latest
                if(selectedVersionInfo.isLatest) {
                    msgInstall = "Install Module, without Loading to Workspace";
                    msgInstallAndLoad = "Install Module and Load to Workspace";
                }
                else {
                    msgInstall = "Install this Version, without Loading to Workspace (not latest)"
                    msgInstallAndLoad = "Install this Version and Load to Workspace (not latest)"
                }
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msgInstallAndLoad,handlerInstallAndLoad));
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msgInstall,handlerInstall));
            }
            break;

        case NPM_INSTALLED_NOT_LOADED:
            //load module to workspace
            {
                let handler = () => loadNpmModule(moduleData.moduleName); 
                let msg = "Load Module to Workspace";
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msg,handler));
            }

            //if the selected version is not installed, allow for a switch
            if(statusInfo.version != selectedVersionInfo.version) {
                let newVersion = selectedVersionInfo.version;
                let oldVersion = statusInfo.version;
                let handler = () => switchNpmModule(moduleData.moduleName,newVersion,oldVersion);
                let msg;
                if(selectedVersionInfo.isLatest) msg = "Upgrade Installed to this Version (latest)"
                else if(selectedVersionInfo.version > statusInfo.version) msg = "Upgrade Installed to this Version (not latest version)"
                else msg = "Downgrade Installed to this Version (older!)"
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msg,handler));
            }

            //uninstall, whicher version is installed
            {
                let handler = () => uninstallNpmModule(moduleData.moduleName);
                let msg = "Uninstall Module from App";
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msg,handler));
            }
            break;

        case NPM_INSTALLED_AND_LOADED:
            //unload module to workspace
            {
                let handler = () => unloadNpmModule(moduleData.moduleName); 
                let msg = "Unload Module from Workspace";
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msg,handler));
            }

            //if the selected version is not installed, allow for a switch
            //specify if the selected is latest/newer, not latest/older (same logic as above)
            //if the selected version is not installed, allow for a switch
            if(statusInfo.version != selectedVersionInfo.version) {
                let newVersion = selectedVersionInfo.version;
                let oldVersion = statusInfo.version;
                let handler = () => switchNpmModule(moduleData.moduleName,newVersion,oldVersion);
                let msg;
                if(selectedVersionInfo.isLatest) msg = "Upgrade Installed to this Version (latest)"
                else if(selectedVersionInfo.version > statusInfo.version) msg = "Upgrade Installed to this Version (not latest version)"
                else msg = "Downgrade Installed to this Version (older!)"
                moduleData.workspaceCommandSetContainer.appendChild(createWorkspaceCommand(msg,handler));
            }

            //note - no uninstall command
            break;
    }
}

function createWorkspaceCommand(text,handler) {
    let container = document.createElement("div");
    container.className = "referenceCommandSetContainer";
    let link = document.createElement("a");
    link.className = "workspaceCommandLink";
    link.onclick = handler;
    link.innerHTML = text;
    container.appendChild(link);
    return container;
}

/** This method adds the demo workspaces to a module for a given version. */
function setReferenceWorkspace(workspaceInfo,moduleData) {
    //clear data
    moduleData.demoLinkSetContainer.innerHTML = "";

    if(workspaceInfo.webUrl) {
        let referenceLinkContainer = document.createElement("div");
        referenceLinkContainer.className = "referenceCommandSetContainer";

        let workspaceLink = document.createElement("a");
        workspaceLink.className = "referenceCommandLink";
        workspaceLink.onclick = () => openWebWorkspace(workspaceInfo.webUrl);
        let text = "Open Sample Workspace";
        if(workspaceInfo.name) text += ": " + workspaceInfo.name;
        workspaceLink.innerHTML = text;
        referenceLinkContainer.appendChild(workspaceLink);

        moduleData.demoLinkSetContainer.appendChild(referenceLinkContainer);
    }
}

/** This method adds the web links to a module for a given version. */
function setReferenceWebLink(url,moduleData) {
    //clear data
    moduleData.webLinkSetContainer.innerHTML = "";

    let referenceLinkContainer = document.createElement("div");
    referenceLinkContainer.className = "referenceCommandSetContainer";

    let webLink = document.createElement("a");
    webLink.className = "referenceCommandLink";
    webLink.onclick = () => openWebLink(url);
    webLink.innerHTML = "Open Web Link";
    referenceLinkContainer.appendChild(webLink);

    moduleData.webLinkSetContainer.appendChild(referenceLinkContainer);
}

//=================
// Internal Functions - Other
//=================

/** This updates the status for each module entry. */
function updateAppModuleData(updatedAppModules) {
    appModules = updatedAppModules; //store this
    moduleDataList.forEach(moduleData => updateModuleStatus(moduleData));
}

function lookupVersionInfo(version,moduleData) {
    return moduleData.moduleConfig.versions.find(versionInfo => versionInfo.version == version);
}

function isStatusEqual(statusInfo1,statusInfo2) {
    //treat both "false" as not equal
    if((!statusInfo1)||(!statusInfo2)) return false;

    //just use type, status and version for equality (may be other fields too)
    return ( (statusInfo1.type == statusInfo2.type) &&
            (statusInfo1.status == statusInfo2.status) &&
            (statusInfo1.version == statusInfo2.version) &&
            (statusInfo1.url == statusInfo2.url) && //es only 
            (statusInfo1.unrecognizedVersion == statusInfo2.unrecognizedVersion) //npm only, for now
        );
}

/** This function gets the status value for a given module. */
function getStatus(moduleData) {
    let statusInfo = {};

    if(!appModules) {
        statusInfo.status = STATUS_UNKNOWN;
        return statusInfo;
    }
    
    if(appModules.moduleType == "es") {
        statusInfo.type = "es";
        //based on url (for now), see if a version of this module is loaded
        let loadedVersionInfo = moduleData.moduleConfig.versions.find(versionInfo => (appModules.esModules.indexOf(versionInfo.esUrl) >= 0));
        if(loadedVersionInfo) {
            statusInfo.status = ES_LOADED;
            statusInfo.url = loadedVersionInfo.esUrl;
            statusInfo.version = loadedVersionInfo.version;
        }
        else {
            //not loaded, or an unrecognized version is loaded (we don't know)
            statusInfo.status = ES_NOT_LOADED;
        }
    }
    else if(appModules.moduleType == "npm") {
        statusInfo.type = "npm";
        let installedVersion = appModules.npmModules.installed[moduleData.moduleName];
        let isLoaded = (appModules.npmModules.loaded.indexOf[moduleData.moduleName] >= 0);
        if(installedVersion !== undefined) {
            statusInfo.status = isLoaded ? NPM_INSTALLED_AND_LOADED : NPM_INSTALLED_NOT_LOADED;
            statusInfo.version = installedVersion;
            //check if this is an unknown version
            let installedVersionInfo = moduleData.moduleConfig.versions.find(versionInfo => (versionInfo.version == installedVersion));
            if(!installedVersionInfo) {
                statusInfo.unrecognizedVersion = true;
            }
        }
        else {
            statusInfo.status = NPM_NOT_INSTALLED;
        }
    }
    else {
        alert("Error: Unknown module type!");
        statusInfo.status = STATUS_UNKNOWN;
    }

    return statusInfo;
}

function readInputData() {
    let appModuleString = readQueryField("appModules");
    if(appModuleString) {
        try {
            return JSON.parse(appModuleString);
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            console.log(error.toString);
            alert("Error loading page: unable to read input data.");
        }
    }
    
    //if we get here we don't have the data
    return {};
}

function readQueryField(field) {
    var params = new URLSearchParams(window.location.search);
    return params.get(field);
}