/** This is a mixin that encapsulates the base functionality of a Component
 *that edits a table. This mixin requires the object be a component.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
visicomp.app.visiui.TableEditComponent = {};

/** This is the initializer for the component. The object passed is the core object
 * associated with this component. */
visicomp.app.visiui.TableEditComponent.init = function() {
    //this.viewModeElement
    //this.viewType
    //this.viewModeElementShowing
    //this.select
}

/** This method populates the frame for this component. 
 * @protected */
visicomp.app.visiui.TableEditComponent.setViewType = function(viewType) {
	//return if there is no change
	if(this.viewType === viewType) return;
	
	//if there is an old view, remove it
	if(this.viewModeElement) {
		this.showModeElement(null);
	}
    
    this.viewModeElement = this.getViewModeElement(viewType);
    this.viewType = viewType;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
//visicomp.app.visiui.TableEditComponent.getViewModeElement = function(viewType);

/** This method creates the view tuype selector UI. 
 * @protected */
visicomp.app.visiui.TableEditComponent.setViewTypes = function(viewTypes,defaultView) {
    this.select = visicomp.visiui.createElement("select",null,{
        "margin-right":"3px",
        "background-color":"transparent"
    });
    this.defaultView = defaultView;
    
    for(var i = 0; i < viewTypes.length; i++) {
        var entry = viewTypes[i];
        this.select.add(visicomp.visiui.createElement("option",{"text":entry}));
    }
    
    //create on functions
    var instance = this;
    var onViewSet = function(event) {
        instance.setViewType(instance.select.value);
        instance.memberUpdated();
        return true;
    }
    
    this.select.onchange = onViewSet;
   
    //add the view select to the title bar
    this.window.addRightTitleBarElement(this.select);
    
    this.setViewType(this.defaultView);
    this.updateViewDropdown();
}

//this function will update the view shown in the dropdown
visicomp.app.visiui.TableEditComponent.updateViewDropdown = function(viewType) {
    if(!viewType) {
        viewType = this.defaultView;
    }
    this.select.value = viewType;
}

/** This method updates the table data 
 * @private */    
visicomp.app.visiui.TableEditComponent.memberUpdated = function() {
    var object = this.getObject();
    if(object.hasError()) {
        var errorMsg = "Error: \n";
        var actionErrors = object.getErrors();
        for(var i = 0; i < actionErrors.length; i++) {
            errorMsg += actionErrors[i].msg + "\n";
        }
        
        this.showErrorBar(errorMsg);
    }
    else {   
        this.hideErrorBar();
    }
        
    if(this.viewModeElementShowing !== this.viewModeElement) {
        this.showModeElement(this.viewModeElement);
    }

    var editable = ((this.viewModeElement.isData === false)||(!object.hasCode()));

    this.viewModeElement.showData(editable);
}

/** @private */
visicomp.app.visiui.TableEditComponent.showModeElement = function(viewModeElement) {
    
	var contentDiv = this.getContentElement();
	visicomp.core.util.removeAllChildren(contentDiv);
	
    if(viewModeElement) {
		var viewDiv = viewModeElement.getElement();
		contentDiv.appendChild(viewDiv);
	}
	
	if(this.viewModeElementShowing) {
		this.viewModeElementShowing.destroy();
	}
	this.viewElementShowing = viewModeElement;
}
