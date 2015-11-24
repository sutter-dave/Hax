/* 
 * Serialization and deserialization are put in the app because the UI is holding
 * special information to create and edit the objects, as opposed to the data that
 * is held by thee objects themselves. The child object allows for the object to store 
 * some unspecified data to be used by the editor.
 * 
 * IO am not 100% sure about this right now, but it is the most sesible thign for the time being.
 */

/** PLAN
 * - read all the objects
 * - create all named objects
 * - do a single multi object update event to set all data as needed 

/** This is used for saving the workspace. */
visicomp.app.visiui.workspaceToJson = function(workspace) {
    var json = {};
    json.name = workspace.getName();
    json.fileType = "visicomp workspace";
    json.data = {};
	var childMap = workspace.getRootPackage().getChildMap();
	for(var key in childMap) {
		var child = childMap[key];
		json.data[key] = visicomp.app.visiui.childToJson(child);
	}
    return json;
}

/** This mehtod serializes a child object. 
 * @private */
visicomp.app.visiui.childToJson = function(child) {
    var json = {};
    json.name = child.getName();
    json.type = child.getType();
    
    var temp;
    
    switch(json.type) {
        case "package":
            json.children = {};
            var childMap = child.getChildMap();
            for(var key in childMap) {
                var childChild = childMap[key];
                json.children[key] = visicomp.app.visiui.childToJson(childChild);
            }
            break;
            
        case "table":
            temp = child.getEditorInfo();
            if(temp) {
                json.formula = temp;
                json.supplementalCode = child.getSupplementalCode();
            }
            else {
                json.data = child.getData();
            }
            break;
            
        case "function":
            json.argParens = child.getArgParensString();
            json.functionBody = child.getEditorInfo();
			if((json.functionBody === null)||(json.functionBody === undefined)) json.functionBody = "";
            json.supplementalCode = child.getSupplementalCode();
            break;
            
    }
    
    return json;
}


/** This is used for saving the workspace. */
visicomp.app.visiui.workspaceFromJson = function(app, json) {
    var name = json.name;
    var fileType = json.fileType;
	if((fileType !== "visicomp workspace")||(!name)) {
		alert("Error openging file");
		return;
	}
	
	//create the workspace
	app.createWorkspace(name);
	
	//create children
	var workspaceUI = app.workspaceUI;
	var parent = workspaceUI.getWorkspace().getRootPackage();
	var childMap = json.data;
	var childUpdateDataList = [];
	for(var key in childMap) {
		var childJson = childMap[key];
		visicomp.app.visiui.childFromJson(workspaceUI, parent, childJson, childUpdateDataList);
	}
	
	//set child data
	//we need to run the child updates all at once because we don't know the order of execution yet
	var result = app.getEventManager().callHandler(
        visicomp.core.updatemember.UPDATE_MEMBERS_HANDLER,
        childUpdateDataList);
	
//handle this differently?
	return result
}

/** This mehtod serializes a child object. 
 * @private */
visicomp.app.visiui.childFromJson = function(workspaceUI,parent,childJson,childUpdateDataList) {
    var name = childJson.name;
    var type = childJson.type;
	
	var childObject;
	var childUIObject;
	var childUpdateData;
    
	//create the object
    switch(type) {
        case "package":
            workspaceUI.addPackage(parent,name,false);
            break;
            
        case "table":
			workspaceUI.addTable(parent,name);

			//lookup the child and create the update event objecct for it
			childObject = parent.lookupChild(name);
			childUpdateData = visicomp.app.visiui.TableUI.getUpdateEventData(childObject,childJson.data,childJson.formula,childJson.supplementalCode);
			childUpdateDataList.push(childUpdateData);
            break;
            
        case "function":
			var argParens = childJson.argParens;
			workspaceUI.addFunction(parent,name + argParens);
			
			//lookup the child and create the update event objecct for it
			childObject = parent.lookupChild(name);
			childUpdateData = visicomp.app.visiui.FunctionUI.getUpdateEventData(childObject,childJson.functionBody,childJson.supplementalCode);
			childUpdateDataList.push(childUpdateData);
            break;
            
    }
}

