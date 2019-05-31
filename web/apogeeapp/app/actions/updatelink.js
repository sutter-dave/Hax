apogeeapp.app.updatelink = {};


apogeeapp.app.updatelink.createAddEntryCommand = function(referenceManager,entryJson) {
    var command = {};
    command.cmd = () => apogeeapp.app.updatelink.doAddEntry(referenceManager,entryJson);
    command.undoCmd = () => apogeeapp.app.updatelink.doRemoveEntry(referenceManager,entryJson.entryType,entryJson.url)
    command.desc = "Insert reference: " + (entryJson.nickname ? entryJson.nickname : entryJson.url);
    return command;
}

apogeeapp.app.updatelink.createUpdateEntryCommand = function(referenceEntry,newUrl,newNickname) {
    var referenceManager = referenceEntry.getReferenceManager();
    var entryType = referenceEntry.getEntryType();
    var oldUrl = referenceEntry.getUrl();
    var oldNickname = referenceEntry.getNickname();
    
    var command = {};
    command.cmd = () => apogeeapp.app.updatelink.doUpdateEntry(referenceManager,entryType,oldUrl,newUrl,newNickname);
    command.undoCmd = () => apogeeapp.app.updatelink.doUpdateEntry(referenceManager,entryType,newUrl,oldUrl,oldNickname);
    command.desc = "Update reference: " + (oldNickname ? oldNickname : oldUrl);
    return command;
}

apogeeapp.app.updatelink.createRemoveEntryCommand = function(referenceEntry) {
    var referenceManager = referenceEntry.getReferenceManager();
    var entryJson = {};
    entryJson.entryType = referenceEntry.getEntryType();
    entryJson.url = referenceEntry.getUrl();
    entryJson.nickname = referenceEntry.getNickname();
    
    var command = {};
    command.cmd = () => apogeeapp.app.updatelink.doRemoveEntry(referenceManager,entryJson.entryType,entryJson.url);
    command.undoCmd = () => apogeeapp.app.updatelink.doAddEntry(referenceManager,entryJson);
    command.desc = "Remove reference: " + (entryJson.nickname ? entryJson.nickname : entryJson.url);
    return command;
}

/** This is the command function to add a reference entry */
apogeeapp.app.updatelink.doAddEntry = function(referenceManager,entryJson) {
    var actionResponse = new apogee.ActionResponse();
    try {
        //add entry function
        var promise = referenceManager.addEntry(entryJson);

        promise.catch(errorMsg => {alert("There was an error loading the link: " + errorMsg);});
    }
    catch(error) {
        var actionError = apogee.ActionError.processException(error,apogee.ActionError.ERROR_TYPE_APP,false);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}

/** This is the command function to update a reference entry */
apogeeapp.app.updatelink.doUpdateEntry = function(referenceManager,entryType,oldUrl,newUrl,newNickname) {
    var actionResponse = new apogee.ActionResponse();
    try {
        //lookup entry for this reference
        var referenceEntry = referenceManager.lookupEntry(entryType,oldUrl);
        
        if(referenceEntry) {
            //update entry
            referenceEntry.updateData(newUrl,newNickname);
        }
        else {
            //entry not found
            var actionError = new apogee.ActionError("Entry to update not found!",apogee.ActionError.ERROR_TYPE_APP);
            actionResponse.addError(actionError);
        }
    }
    catch(error) {
        //unkown error
        var actionError = apogee.ActionError.processException(error,apogee.ActionError.ERROR_TYPE_APP,false);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}

/** This is the command function to delete a reference entry */
apogeeapp.app.updatelink.doRemoveEntry = function(referenceManager,entryType,url) {
    var actionResponse = new apogee.ActionResponse();
    try {
        //lookup entry for this reference
        var referenceEntry = referenceManager.lookupEntry(entryType,url);
        
        if(referenceEntry) {
            //update entry
            referenceEntry.remove();
        }
        else {
            //entry not found
            var actionError = new apogee.ActionError("Entry to delete not found!",apogee.ActionError.ERROR_TYPE_APP);
            actionResponse.addError(actionError);
        }
    }
    catch(error) {
        //unkown error
        var actionError = apogee.ActionError.processException(error,apogee.ActionError.ERROR_TYPE_APP,false);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}











