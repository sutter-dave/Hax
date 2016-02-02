/** This control represents a table object. */
visicomp.app.visiui.FolderControl = function(workspaceUI,folder,controlJson) {
    //base init
    visicomp.app.visiui.Control.init.call(this,workspaceUI,folder,visicomp.app.visiui.FolderControl.generator,controlJson);
    visicomp.visiui.ParentContainer.init.call(this,this.getContentElement(),this.getWindow());
    
    //register this folder as a parent container
    workspaceUI.addControlContainer(folder,this);
};

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.FolderControl,visicomp.app.visiui.Control);
visicomp.core.util.mixin(visicomp.app.visiui.FolderControl,visicomp.visiui.ParentContainer);

//==============================
// Protected and Private Instance Methods
//==============================

/** This serializes the table control. */
visicomp.app.visiui.FolderControl.prototype.writeToJson = function(json) {
    var folder = this.getObject();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderControlContentJson(folder);
}

/** This method populates the frame for this control. 
 * @protected */
visicomp.app.visiui.FolderControl.prototype.populateFrame = function() {
}

//======================================
// Static methods
//======================================

//add table listener
visicomp.app.visiui.FolderControl.createControl = function(workspaceUI,parent,name) {
    
    var json = {};
    json.name = name;
    json.type = visicomp.core.Folder.generator.type;
    var returnValue = visicomp.core.createmember.createMember(parent,json);
    
    if(returnValue.success) {
        var folder = returnValue.member;
        var folderControl = new visicomp.app.visiui.FolderControl(workspaceUI,folder);
        returnValue.control = folderControl;
    }
    else {
        //no action for now
    }
    return returnValue;
}

visicomp.app.visiui.FolderControl.createControlFromJson = function(workspaceUI,member,controlData) {
    var folderControl = new visicomp.app.visiui.FolderControl(workspaceUI,member);
    if((controlData)&&(controlData.children)) {
        workspaceUI.loadFolderControlContentFromJson(member,controlData.children);
    }
    
    return folderControl;
}


//======================================
// This is the control generator, to register the control
//======================================

visicomp.app.visiui.FolderControl.generator = {};
visicomp.app.visiui.FolderControl.generator.displayName = "Folder";
visicomp.app.visiui.FolderControl.generator.uniqueName = "visicomp.app.visiui.FolderControl";
visicomp.app.visiui.FolderControl.generator.createControl = visicomp.app.visiui.FolderControl.createControl;
visicomp.app.visiui.FolderControl.generator.createControlFromJson = visicomp.app.visiui.FolderControl.createControlFromJson;
visicomp.app.visiui.FolderControl.generator.DEFAULT_WIDTH = 500;
visicomp.app.visiui.FolderControl.generator.DEFAULT_HEIGHT = 500;