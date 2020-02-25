import {addActionInfo} from "/apogee/actions/action.js";
import {createMember} from "/apogee/actions/createmember.js";
import base from "/apogeeutil/base.js";
import Model from "/apogee/data/Model.js";

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 *
 * Action Data format:
 * {
 *  "action": "loadModel",
 *  
 *  "modelJson": model json
 *  
 * }
 *
 * MEMBER CREATED EVENT: "modelUpdated"
 * Event member format:
 * {
 *  "member": (member)
 * }
 */


/** This method instantiates a member, without setting the update data. 
 *@private */
function loadModel(model,actionData) {

    let actionResult = {};
    actionResult.event = ACTION_EVENT;

    let modelJson = actionData.modelJson;
    
    //check the file format
    var fileType = modelJson.fileType;
    if(fileType !== Model.SAVE_FILE_TYPE) {
        throw base.createError("Bad file format.",false);
    }
    if(modelJson.version !== Model.SAVE_FILE_VERSION) {
        throw base.createError("Incorrect file version. CHECK APOGEEJS.COM FOR VERSION CONVERTER.",false);
    }

    //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    // modify model
    // - modify the model
    //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

    //set the model name
    if(modelJson.name !== undefined) {
        model.setName(modelJson.name);
    }

    //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    // create member - (THE NEW MEMBER INSTANCES IS HANDLED THERE)
    // - modify the member
    // - modify parent and all parents up to model
    //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

    //load the model members (root folder and its children)
    let memberActionResult = createMember(model,model,modelJson.data);
    actionResult.childActionResults = [memberActionResult];

    actionResult.actionDone = true;
    
    return actionResult;
}

let ACTION_EVENT = "modelUpdated";

//This line of code registers the action 
addActionInfo("loadModel",loadModel);