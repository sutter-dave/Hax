import CommandHistory from "./CommandHistory.js";

/* 
 * This class manages executing commands and storign and operating the command history for undo/redo.
 * It provides standarde error handling for the commands in addition to managing undo/redo or commands.
 * 
 * Command Structure:
 * {
 *      type - This is a string giving the command type. This will be used to dispatch
 *      the command to the proper execution function. The string should correspond to 
 *      a command that was registered with the regiter command function.  
 *     
 *     ?: setsDirty?
 *     
 *     ?: noUndo?
 *     
 *     (everything else depends on the specific command)
 * }
 * 
 * Command Object - Should be registered with "registerFunction". It should contain the following things:
 * - function executeCommand(workspaceManager,commandData,optionalAsynchOnComplete) = This exectues the command and return a commandResult object.
 * - function createUnfoCommand(workspceUI,commandData) - This creates an undo command json from the given command json.
 * - object commandInfo - This is metadata for the command:
 *      - type - A string giving the name of the command type
 *      - targetType - This identifies the type of the command target (what the command acts on) This may be missing if there is no event.
 *      - event - This is the name of the event the command will fire. (It should be "created", "updated", "deleted" or missing if there is no event) 
 *
 * Command functions should throw an error if they fail to execute. If there is no error thrown it is assumed the command completed 
 * successfully.
 */
export default class CommandManager {
    constructor(app) {
        this.app = app;

        this.commandHistory = new CommandHistory(this,app);
    }
    
    /** This method executes the given command and, if applicable, adds it to the queue. 
     * Supress history does not add this command to the history. It is used by the history for
     * undo commands/redo commands.
    */
    executeCommand(command,suppressFromHistory) {
        //get a mutable workspace manager instance
        let oldWorkspaceManager = this.app.getWorkspaceManager();
        let newWorkspaceManager;
        if(oldWorkspaceManager) {
            newWorkspaceManager = oldWorkspaceManager.getMutableWorkspaceManager();
        }
        else {
            //instantiate a new empty workspace manager
            newWorkspaceManager = this.app.createWorkspaceManager();
        }

        var commandObject = CommandManager.getCommandObject(command.type);
        let undoCommand;
        let description;

        let undoError = false;
        let undoErrorMsg;
        let commandError = false;
        let commandErrrorMsg;

        if(commandObject) {
            //create the undo command - handle this error separately from command error
            try {
                //create undo command before doing command (since it may depend on current state)
                if((!suppressFromHistory)&&(commandObject.createUndoCommand)) {   
                    undoCommand = commandObject.createUndoCommand(newWorkspaceManager,command);  
                }

            }
            catch(error) {
                if(error.stack) console.error(error.stack);

                undoError = true;
                undoErrorMsg = error.toString();
            }

            //execute the command
            try {
                //read the desrition (this needs to be improved)
                description = commandObject.commandInfo.type;

                //execute the command
                commandObject.executeCommand(newWorkspaceManager,command);
            }
            catch(error) {
                if(error.stack) console.error(error.stack);

                commandError = true;
                commandErrrorMsg = error.toString();
            }
        }
        else {
            commandError = true;
            commandErrrorMsg = "Command type not found: " + command.type;
        }

        //--------------------------
        // Accept or reject update
        //--------------------------

        //if the command succceeded, update the workspace manager instance
        if(!commandError) {
            //success - commit accept change
            this.app.setWorkspaceManager(newWorkspaceManager);

            //add to history if the command was done and there is an undo command
            if(undoCommand) {   
                this.commandHistory.addToHistory(undoCommand,command,description);
            }

            //fire events!!
            let changeMap = newWorkspaceManager.getChangeMap();
            let changeList = this._changeMapToChangeList(changeMap);

            newWorkspaceManager.lockAll();

            this._publishEvents(changeList);

            if(undoError) {
                //process an error on creating the history - clear the current history
                this.commandHistory.clearHistory();
                alert("The command was succesful but there was an error in the history. Undo is not available. Error: " + undoErrorMsg);
            }

            return true;
        }
        else {
            //failure - keep the old workspace 
            alert("Command failed: " + commandErrrorMsg);
        }

        return false;
    }

    /** This returns the command history. */
    getCommandHistory() {
        return this.commandHistory;
    }

    //=========================================
    // Private Methods
    //=========================================

    _changeMapToChangeList(changeMap) {
        let changeList = [];
        for(let id in changeMap) {
            let changeMapEntry = changeMap[id];
            if(changeMapEntry.action != "transient") {
                let changeListEntry = {};
                changeListEntry.target = changeMapEntry.instance;
                changeListEntry.eventName = changeMapEntry.action;
                changeList.push(changeListEntry);
            }
        }
        return changeList;
    }

    /** This fires all the necessary events for the given command result */
    _publishEvents(changeList) {
        changeList.forEach( changeEntry => {
            //fire event
            if(changeEntry.eventName) {
                this.app.dispatchEvent(changeEntry.eventName,changeEntry.target);
            } 
        })
    }

    //=========================================
    // Static Methods
    //=========================================
    
    /** This message does a standard error alert for the user. If the error is
     * fatal, meaning the application is not in a stable state, the flag isFatal
     * should be set to true. Otherwise it can be omitted or set to false.  */
    static errorAlert(errorMsg) {
        alert(errorMsg);
    }
    
    /** This registers a command. The command object should hold two functions,
     * executeCommand(workspaceManager,commandData,optionalAsynchOnComplete) and, if applicable, createUndoCommand(workspaceManager,commandData)
     * and it should have the metadata commandInfo.
     */
    static registerCommand(commandObject) {
        
        //repeat warning
        let existingCommandObject = CommandManager.commandMap[commandObject.commandInfo.type];
        if(existingCommandObject) {
            alert("The given command already exists in the command manager: " + commandObject.commandInfo.type + ". It will be replaced with the new command");
        }
        
        CommandManager.commandMap[commandObject.commandInfo.type] = commandObject;
    }
    
    static getCommandObject(commandType) {
        return CommandManager.commandMap[commandType];
    }
    
}

/** This is a map of commands accessibly to the command manager. */
CommandManager.commandMap = {};


