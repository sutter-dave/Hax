/* 
 * This is a mixin to give event functionality.
 */
hax.EventManager = {};
    
/** This serves as the constructor for the child object, when extending it. */
hax.EventManager.init = function() {
     /** This field holds the event listeners
    * @private */
    this.listenerTable = {};
    
    /** This field holds the event handlers
    * @private */
    this.handlerTable = {};
}

/** This method adds a listener for the given event. */
hax.EventManager.addListener = function(eventName, callback) {
    var callbackList = this.listenerTable[eventName];
    if(!callbackList) {
        callbackList = [];
        this.listenerTable[eventName] = callbackList;
    }
    //make sure the object is not already in the list
    for(var i = 0; i < callbackList.length; i++) {
        var c = callbackList[i];
        if(c == callback) {
            return;
        }
    }
    //add to the list
    callbackList.push(callback);
}

/** This method removes a listener for the event. */
hax.EventManager.removeListener = function(eventName, callback) {
    var callbackList = this.listenerTable[eventName];
    if(callbackList) {
        var index = callbackList.indexOf(callback);
        if(index >= 0) {
            callbackList.splice(index,1);
        }
    }
}

/** THis method dispatches an event. */
hax.EventManager.dispatchEvent = function(eventName, eventData) {
    var callbackList = this.listenerTable[eventName];
    if(callbackList) {
        for(var i = 0; i < callbackList.length; i++) {
            var callback = callbackList[i];
            callback.call(null,eventData);
        }
    }
}


/** This method adds a handler. */
hax.EventManager.addHandler = function(handlerName, callback) {
    this.handlerTable[handlerName] = callback;
}

/** This method clears a handler. */
hax.EventManager.removeHandler = function(handlerName) {
    delete this.handlerTable[handlerName];
}

/** This method calls a handler by name and returns the result. If no 
 * handler is found undefined is returned. */
hax.EventManager.callHandler = function(handlerName, handlerData) {
    var callback = this.handlerTable[handlerName];
    if(callback) {
        return callback(handlerData)
    }
    else {
        return undefined;
    }
}

