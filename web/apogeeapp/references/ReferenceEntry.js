import FieldObject from "/apogeeutil/FieldObject.js";
import {bannerConstants} from "/apogeeview/componentdisplay/banner.js";
import CommandManager from "/apogeeapp/commands/CommandManager.js";

/** This class manages references for the web page.*/
export default class ReferenceEntry extends FieldObject {
    
    /** The reference data is a json entry with the referenceType, url and optionally nickname.
     * If this is a copy, the reference data wil be ignored and can be set to null. */
    constructor(referenceData,instanceToCopy,keepUpdatedFixed) {
        super("referenceEntry",instanceToCopy,keepUpdatedFixed);

        if(instanceToCopy) {
            this.referenceType = instanceToCopy.referenceType;
        }
        else {
            this.referenceType = referenceData.entryType;
        }

        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            this.setField("url",referenceData.url);

            //we create in a pending state because the link is not loaded.
            this.setField("state",bannerConstants.BANNER_TYPE_PENDING);

            let nickname = referenceData.nickname;
            if(!nickname) nickname = NO_NICKNAME_EMPTY_STRING; 
            this.setField("nickname",nickname);
        }

        //==============
        //Working variables
        //==============
        this.viewStateCallback = null;
        this.cachedViewState = null;    
    }

    //---------------------------
    // references entry interface
    //---------------------------
    
    getEntryType() {
        return this.referenceType;
    }

    getState() {
        return this.getField("state");
    }

    getUrl() {
        return this.getField("url");
    }

    getNickname() {
        return this.getField("nickname");
    }

    getLabel() {
        let nickname = this.getNickname();
        return nickname ? nickname : this.getUrl();
    }

    getIsLabelUpdated() {
        //this will return true sometimes where there is no update to the label
        return this.areAnyFieldsUpdated(["url","nickname"]);
    }

    setViewStateCallback(viewStateCallback) {
        this.viewStateCallback = viewStateCallback;
    }

    getCachedViewState() {
        return this.cachedViewState;
    }



    ///////////////////////////////////////////////////////////////////////////

    /** This method loads the link onto the page. If passed, the onLoadComplete
     * callback will be called when load completes successfully or fails. */
    loadEntry(workspaceManager) {

        let entryLoadPromise = new Promise( (resolve,reject) => {

            //create load event handlers
            //on completion execute a command to update the link status
            let onLoad = () => {
                let commandData = {
                    type: "updateLinkLoadStatus",
                    entryType: this.referenceType,
                    url: this.getUrl(),
                    success: true
                };
                workspaceManager.runFutureCommand(commandData);
                //call resolve in any case
                resolve();
            };
            let onError = (error) => {
                let commandData = {
                    type: "updateLinkLoadStatus",
                    entryType: this.referenceType,
                    url: this.getUrl(),
                    success: false,
                    error: error
                };
                workspaceManager.runFutureCommand(commandData);
                //call resolve in any case
                resolve();
            }

            this.implementationLoadEntry(onLoad,onError,workspaceManager);
        });

        return entryLoadPromise;
    }

    /** This method loads the link onto the page. It should call the 
     * appropriate callback on completion. */
    //implementationLoadEntry(onLoad,onError);
    
    /** This method removes the reference. It returns true if the link remove is successful. */
    //remove()
    
    
    ///////////////////////////////////////////////////////////////////////////

    /** This method loads the link onto the page. It returns a promise that
     * resolves when the link is loaded. */
    toJson() {
        var entryJson = {};
        entryJson.url = this.getUrl();
        if(this.nickname != NO_NICKNAME_EMPTY_STRING) entryJson.nickname = this.getNickname();
        entryJson.entryType = this.referenceType;
        return entryJson;
    }

    //-------------------------
    // Entry specific management methods
    //-------------------------

    /** This method removes and reloads the link, returning a promise. */
    updateData(workspaceManager,url,nickname) {

        //update nickname
        if(!nickname) nickname = NO_NICKNAME_EMPTY_STRING;
        if(this.nickname != nickname) {
            this.setField("nickname",nickname);
        }

        //update url
        if(this.url != url) {
            this.removeEntry();
            this.setField("url",url);
            var promise = this.loadEntry(workspaceManager);
        }

        //if we didn't do a URL update, make a promise that says update was successful
        if(!promise) promise = Promise.resolve({
            cmdDone: true,
            target: this,
            eventAction: "updated"
        });

        return promise;
    }

    //===================================
    // private methods
    //===================================

    setClearState() {
        this.setState(bannerConstants.BANNER_TYPE_NONE);
    }

    setError(errorMsg) {
        this.setState(bannerConstants.BANNER_TYPE_ERROR,errorMsg);
    }

    setPendingState() {
        this.setState(bannerConstants.BANNER_TYPE_PENDING,"loading");
    }

    setState(state,msg) {
        if(this.state != state) {
            //for now we are not tracking msg. If we do, we should check for that change too
            this.setField("state",state);
        }
    }

}

//====================================
// Static Fields
//====================================


ReferenceEntry.ELEMENT_ID_BASE = "__apogee_link_element_";

let NO_NICKNAME_EMPTY_STRING = "";

//=====================================
// Status Commands
// These are commands run to update the status of the link after loading completes
//=====================================

/*
 *
 * Command JSON format:
 * {
 *   "type":"updateLinkLoadStatus",
 *   "entryType":(entry type),
 *   "url":(url),
 *   "success":(boolean),
 *   "error":(error object or error string - optional. Only used in the success=false case)
 * }
 * 
 */ 

let updatelinkstatus = {};

//No undo command. Only the original call needs to be undone.
//updatelinkstatus.createUndoCommand = function(workspaceManager,commandData) {

updatelinkstatus.executeCommand = function(workspaceManager,commandData) {
    
    var commandResult = {};
    var referenceManager = workspaceManager.getMutableReferenceManager();
    
    //lookup entry for this reference
    let refEntryId = referenceManager.lookupRefEntryId(commandData.entryType,commandData.url);
    let referenceEntry = referenceManager.getMutableRefEntryById(refEntryId);
    if(referenceEntry) {
        //update entry status
        //add event handlers
        if(commandData.success) {
            commandResult.cmdDone = true;
            referenceEntry.setClearState();
        }
        else {
            var errorMsg = "Failed to load link '" + this.url + "':" + commandData.error.toString();
            referenceEntry.setError(errorMsg);
        }

        //save the updated entry
        referenceManager.registerRefEntry(referenceEntry);
    }
    else {
        //reference entry not found
        throw new Error("Reference entry not found: " + commandData.url);
    }
    
    return commandResult;
}

updatelinkstatus.commandInfo = {
    "type": "updateLinkLoadStatus",
    "targetType": "referenceEntry",
    "event": "updated"
}

CommandManager.registerCommand(updatelinkstatus);