/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
apogeeapp.app.CustomControlComponent = function(workspaceUI,control,componentJson) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,control,apogeeapp.app.CustomControlComponent.generator,componentJson);
    
    this.uiCodeFields = {};
    this.currentCss = "";
    this.loadResourceFromJson(componentJson);
    
    //create a resource based on the json (or lack of a json)
    if((componentJson)&&(componentJson.doKeepAlive)) {
        this.doKeepAlive = true;
    }
    else {
        this.doKeepAlive = false;
    }
	
	this.memberUpdated();
    
    //add a cleanup and save actions
    this.addSaveAction(apogeeapp.app.CustomControlComponent.writeToJson);
};

apogeeapp.app.CustomControlComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.CustomControlComponent.prototype.constructor = apogeeapp.app.CustomControlComponent;

//==============================
//Resource Accessors
//==============================

apogeeapp.app.CustomControlComponent.prototype.getDataDisplay = function(viewMode) {
    var html = this.getUiCodeField(apogeeapp.app.CustomControlComponent.CODE_FIELD_HTML);
    var resource = this.createResource();
    var dataDisplay = new apogeeapp.app.HtmlJsDataDisplay(html,resource,viewMode);
    return dataDisplay;
}

apogeeapp.app.CustomControlComponent.prototype.getUiCodeFields = function() {
    return this.uiCodeFields;
}

apogeeapp.app.CustomControlComponent.prototype.getUiCodeField = function(codeField) {
    var text = this.uiCodeFields[codeField];
    if((text === null)||(text === undefined)) text = "";
    return text;
}

apogeeapp.app.CustomControlComponent.prototype.getDoKeepAlive = function() {
    return this.doKeepAlive;
}

apogeeapp.app.CustomControlComponent.prototype.setDoKeepAlive = function(doKeepAlive) {
    this.doKeepAlive = doKeepAlive;
    
    if(this.outputMode) {
        this.outputMode.setDoKeepAlive(doKeepAlive);
    }
}

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.CustomControlComponent.CODE_FIELD_HTML = "html";
apogeeapp.app.CustomControlComponent.CODE_FIELD_CSS = "css";
apogeeapp.app.CustomControlComponent.CODE_FIELD_INIT = "init";
apogeeapp.app.CustomControlComponent.CODE_FIELD_SET_DATA = "setData";
apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_HIDE = "onHide";
apogeeapp.app.CustomControlComponent.CODE_FIELD_DESTROY = "destroy";
apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_LOAD = "onLoad";
apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_RESIZE = "onResize";
apogeeapp.app.CustomControlComponent.CODE_FIELD_CONSTRUCTOR = "constructorAddition";

apogeeapp.app.CustomControlComponent.VIEW_OUTPUT = "Output";
apogeeapp.app.CustomControlComponent.VIEW_CODE = "Model Code";
apogeeapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.CustomControlComponent.VIEW_HTML = "HTML";
apogeeapp.app.CustomControlComponent.VIEW_CSS = "CSS";
apogeeapp.app.CustomControlComponent.VIEW_INIT = "init(element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_SET_DATA = "setData(data,element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_ON_HIDE = "onHide(element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_DESTROY = "destroy(element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_ON_LOAD = "onLoad(element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_ON_RESIZE = "onResize(element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_CONSTRUCTOR = "constructor(mode)";
apogeeapp.app.CustomControlComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.CustomControlComponent.VIEW_MODES = [
	apogeeapp.app.CustomControlComponent.VIEW_OUTPUT,
	apogeeapp.app.CustomControlComponent.VIEW_CODE,
    apogeeapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.CustomControlComponent.VIEW_HTML,
    apogeeapp.app.CustomControlComponent.VIEW_CSS,
    apogeeapp.app.CustomControlComponent.VIEW_INIT,
    apogeeapp.app.CustomControlComponent.VIEW_SET_DATA,
    apogeeapp.app.CustomControlComponent.VIEW_ON_HIDE,
    apogeeapp.app.CustomControlComponent.VIEW_DESTROY,
    apogeeapp.app.CustomControlComponent.VIEW_ON_LOAD,
    apogeeapp.app.CustomControlComponent.VIEW_ON_RESIZE,
    apogeeapp.app.CustomControlComponent.VIEW_CONSTRUCTOR,
    apogeeapp.app.CustomControlComponent.VIEW_DESCRIPTION
];

apogeeapp.app.CustomControlComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.CustomControlComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.CustomControlComponent.VIEW_OUTPUT
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.CustomControlComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.CustomControlComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
apogeeapp.app.CustomControlComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
		
		case apogeeapp.app.CustomControlComponent.VIEW_OUTPUT:
			if(!this.outputMode) {
				this.outputMode = new apogeeapp.app.ControlOutputMode(editComponentDisplay,this.doKeepAlive);
			}
			return this.outputMode;
			
		case apogeeapp.app.CustomControlComponent.VIEW_CODE:
			return new apogeeapp.app.AceCodeMode(editComponentDisplay);
			
		case apogeeapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE:
			return new apogeeapp.app.AceSupplementalMode(editComponentDisplay);
            
        
        case apogeeapp.app.CustomControlComponent.VIEW_HTML:
            return new apogeeapp.app.AceCustomControlMode(editComponentDisplay,apogeeapp.app.CustomControlComponent.CODE_FIELD_HTML);
    
        case apogeeapp.app.CustomControlComponent.VIEW_CSS:
            return new apogeeapp.app.AceCustomControlMode(editComponentDisplay,apogeeapp.app.CustomControlComponent.CODE_FIELD_CSS);
            
        case apogeeapp.app.CustomControlComponent.VIEW_INIT:
            return new apogeeapp.app.AceCustomControlMode(editComponentDisplay,apogeeapp.app.CustomControlComponent.CODE_FIELD_INIT);
    
        case apogeeapp.app.CustomControlComponent.VIEW_SET_DATA:
            return new apogeeapp.app.AceCustomControlMode(editComponentDisplay,apogeeapp.app.CustomControlComponent.CODE_FIELD_SET_DATA);
     
        case apogeeapp.app.CustomControlComponent.VIEW_ON_HIDE:
            return new apogeeapp.app.AceCustomControlMode(editComponentDisplay,apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_HIDE);    
            
        case apogeeapp.app.CustomControlComponent.VIEW_DESTROY:
            return new apogeeapp.app.AceCustomControlMode(editComponentDisplay,apogeeapp.app.CustomControlComponent.CODE_FIELD_DESTROY);    
            
        case apogeeapp.app.CustomControlComponent.VIEW_ON_LOAD:
            return new apogeeapp.app.AceCustomControlMode(editComponentDisplay,apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_LOAD);
			
        case apogeeapp.app.CustomControlComponent.VIEW_ON_RESIZE:
            return new apogeeapp.app.AceCustomControlMode(editComponentDisplay,apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_RESIZE);
			
        case apogeeapp.app.CustomControlComponent.VIEW_CONSTRUCTOR:
            return new apogeeapp.app.AceCustomControlMode(editComponentDisplay,apogeeapp.app.CustomControlComponent.CODE_FIELD_CONSTRUCTOR); 


        case apogeeapp.app.CustomControlComponent.VIEW_DESCRIPTION:
			return new apogeeapp.app.AceDescriptionMode(editComponentDisplay);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

/** This method deseriliazes data for the custom resource component. */
apogeeapp.app.CustomControlComponent.prototype.updateFromJson = function(json) {  
    this.loadResourceFromJson(json);
}

/** This method deseriliazes data for the custom resource component. This will
 * work is no json is passed in. */
apogeeapp.app.CustomControlComponent.prototype.loadResourceFromJson = function(json) {   
	var uiCodeFields;
    if((!json)||(!json.resource)) {
		uiCodeFields = {};
	} 
	else {
		uiCodeFields = json.resource;
	}  
    this.update(uiCodeFields);
}


apogeeapp.app.CustomControlComponent.prototype.createResource = function() {
    try {
        var resourceMethodsCode = "";
        var uiCodeFields = this.getUiCodeFields();
        
        for(var fieldName in apogeeapp.app.CustomControlComponent.GENERATOR_INTERNAL_FORMATS) {
            var fieldCode = uiCodeFields[fieldName];
            if((fieldCode)&&(fieldCode != "")) {
                
                var format = apogeeapp.app.CustomControlComponent.GENERATOR_INTERNAL_FORMATS[fieldName];
                var codeSnippet = apogee.util.formatString(format,fieldCode);
                
                resourceMethodsCode += codeSnippet + "\n";
            }
        }
        
        //create the resource generator wrapped with its closure
        var generatorFunctionBody = apogee.util.formatString(
            apogeeapp.app.CustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT,
            resourceMethodsCode
        );

        //create the function generator, with the aliased variables in the closure
        var generatorFunction = new Function(generatorFunctionBody);
        var resourceFunction = generatorFunction();

        var resource = resourceFunction();

        return resource;
    }
    catch(error) {
        alert("Error creating custom control: " + error.message);
    }
}

//=============================
// Action
//=============================

apogeeapp.app.CustomControlComponent.prototype.update = function(uiCodeFields) {   
    
    this.uiCodeFields = uiCodeFields;
    
    var newCss = this.getUiCodeField(apogeeapp.app.CustomControlComponent.CODE_FIELD_CSS);
    
    //update the css right away
    
    if(newCss !== this.currentCss) {
        if(!((newCss == "")&&(this.currentCss == ""))) {
            apogeeapp.ui.setMemberCssData(this.getObject().getId(),newCss);
            this.currentCss = newCss;
        }
    }
    
	var actionResponse = new apogee.ActionResponse();
    return actionResponse; 
}

//======================================
// Callbacks
// These are defined as static but are called in the objects context
//======================================

/** This serializes the table component. */
apogeeapp.app.CustomControlComponent.writeToJson = function(json) {
    //store the resource info
    json.resource = this.uiCodeFields;
}

/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: resouce methods code
 * 1: uiPrivate
 * @private
 */
apogeeapp.app.CustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT = [
"//member functions",
"var resourceFunction = function(component) {",
"var resource = {};",
"{0}",
"return resource;",
"}",
"//end member functions",
"return resourceFunction;",
""
   ].join("\n");
   
   
   
/** This is the format string to create the resource method code
 * @private
 */
apogeeapp.app.CustomControlComponent.GENERATOR_INTERNAL_FORMATS = {
    "constructorAddition":"resource.constructorAddition = function(mode) {\n{0}\n};",
    "init":"resource.init = function(element,mode) {\n{0}\n};",
    "setData":"resource.setData = function(data,element,mode) {\n{0}\n};",
    "onHide":"resource.onHide = function(element,mode) {\n{0}\n};",
    "destroy":"resource.destroy = function(element,mode) {\n{0}\n};",
    "onLoad":"resource.onLoad = function(element,mode) {\n{0}\n};",
    "onResize":"resource.onResize = function(element,mode) {\n{0}\n};"
}


//======================================
// Static methods
//======================================


/** This method creates the control. */
apogeeapp.app.CustomControlComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.workspace = data.parent.getWorkspace();
    json.name = data.name;
    json.type = apogee.JsonTable.generator.type;
    var actionResponse = apogee.action.doAction(json);
    
    var control = json.member;
    
    if(control) {
        
        if(!data.destroyOnHide) {
            //update the component options, but don't modify the options structure passed in.
            var activeComponentOptions;
            if(componentOptions) {
                activeComponentOptions = apogee.util.deepJsonCopy(componentOptions);
            }
            else {
                activeComponentOptions = {};
            }
            activeComponentOptions.doKeepAlive = true;
        }
        
        //create the component
        var customControlComponent = new apogeeapp.app.CustomControlComponent.createComponentFromJson(workspaceUI,control,activeComponentOptions);
        actionResponse.component = customControlComponent;
    }
    return actionResponse;
}

apogeeapp.app.CustomControlComponent.createComponentFromJson = function(workspaceUI,control,componentJson) {
    var customControlComponent = new apogeeapp.app.CustomControlComponent(workspaceUI,control,componentJson);
    return customControlComponent;
}

apogeeapp.app.CustomControlComponent.addPropFunction = function(component,values) {
    var keepAlive = component.getDoKeepAlive();
    values.destroyOnHide = !keepAlive;
}

apogeeapp.app.CustomControlComponent.updateProperties = function(component,oldValues,newValues,actionResponse) {
    var doKeepAlive = (newValues.destroyOnHide) ? false : true;
    component.setDoKeepAlive(doKeepAlive);
}


//======================================
// This is the control generator, to register the control
//======================================

apogeeapp.app.CustomControlComponent.generator = {};
apogeeapp.app.CustomControlComponent.generator.displayName = "Custom Control";
apogeeapp.app.CustomControlComponent.generator.uniqueName = "apogeeapp.app.CustomControlComponent";
apogeeapp.app.CustomControlComponent.generator.createComponent = apogeeapp.app.CustomControlComponent.createComponent;
apogeeapp.app.CustomControlComponent.generator.createComponentFromJson = apogeeapp.app.CustomControlComponent.createComponentFromJson;
apogeeapp.app.CustomControlComponent.generator.DEFAULT_WIDTH = 500;
apogeeapp.app.CustomControlComponent.generator.DEFAULT_HEIGHT = 500;
apogeeapp.app.CustomControlComponent.generator.ICON_RES_PATH = "/controlIcon.png";

apogeeapp.app.CustomControlComponent.generator.propertyDialogLines = [
    {
        "type":"checkbox",
        "heading":"Destroy on Hide: ",
        "resultKey":"destroyOnHide"
    }
];

apogeeapp.app.CustomControlComponent.generator.addPropFunction = apogeeapp.app.CustomControlComponent.addPropFunction;
apogeeapp.app.CustomControlComponent.generator.updateProperties = apogeeapp.app.CustomControlComponent.updateProperties;
