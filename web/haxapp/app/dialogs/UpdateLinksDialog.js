/** This method shows a dialog to update the workspace links. */
haxapp.app.dialog.showUpdateLinksDialog = function(workspaceUI) {
    
    var dialog = haxapp.ui.createDialog({"minimizable":true,"maximizable":true,"movable":true,"resizable":true});
            
//    //create body
//    var content = haxapp.ui.createElement("div",{"className":"dialogBody"}); 
    
    //add a scroll container
    var contentContainer = haxapp.ui.createElement("div",null,
        {
			"display":"block",
            "position":"relative",
            "top":"0px",
            "height":"100%",
            "overflow": "auto"
        });
	dialog.setContent(contentContainer);
    
    var line;
    
	var content = haxapp.ui.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
			});
	contentContainer.appendChild(content);
    
    var line;
    
    //title
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(haxapp.ui.createElement("div",{"className":"dialogTitle","innerHTML":"Update Links"}));
    content.appendChild(line);
        
    //editor selector
    line = haxapp.ui.createElement("div",{"className":"dialogLine"}); 
    var jsLinksRadio = haxapp.ui.createElement("input",{"type":"radio","name":"componentContent","value":"jsLinks"});
    line.appendChild(jsLinksRadio);
    line.appendChild(document.createTextNode("JS Links"));
    content.appendChild(line);
    var cssLinksRadio = haxapp.ui.createElement("input",{"type":"radio","name":"componentContent","value":"cssLinks"});
    line.appendChild(cssLinksRadio);
    line.appendChild(document.createTextNode("CSS Links"));
    
    //editors
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    var editorDiv = haxapp.ui.createElement("div",null,
        {
            "position":"relative",
            "width":"500px",
            "height":"300px",
            "border":"1px solid darkgray"
        });
    line.appendChild(editorDiv);
    content.appendChild(line);
        
    //create editor containers - will be hiddedn and shown
    var jsLinksEditorDiv = haxapp.ui.createElement("div",null,{
        "position":"absolute",
        "top":"0px",
        "bottom":"0px",
        "right":"0px",
        "left":"0px"
    });
    var jsLinksEditor = null;
    editorDiv.appendChild(jsLinksEditorDiv);
    
    var cssLinksEditorDiv = haxapp.ui.createElement("div",null,{
        "position":"absolute",
        "top":"0px",
        "bottom":"0px",
        "right":"0px",
        "left":"0px"
    });
    var cssLinksEditor = null;
    editorDiv.appendChild(cssLinksEditorDiv);
    
    //save and cancel buttons
    //buttons and handler
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        closeDialog();
    }
    
    var onSave = function() {
        
        var jsLinkArray;
        var cssLinkArray;

        //get js links
        if(jsLinksEditor) {
            var jsLinks = jsLinksEditor.getSession().getValue().trim();
            jsLinkArray = haxapp.app.dialog.createLinkArray(jsLinks);
        }
        else {
            jsLinkArray = [];
        }

        //get css links
        if(cssLinksEditor) {
            var cssLinks = cssLinksEditor.getSession().getValue().trim();
            cssLinkArray = haxapp.app.dialog.createLinkArray(cssLinks);
        }
        else {
            cssLinkArray = [];
        }

        //load links if we have any
        workspaceUI.setLinks(jsLinkArray,cssLinkArray);

        closeDialog();
    }
    
    var closeDialog = function() {
        haxapp.ui.closeDialog(dialog);
        
        //clean up the editor
        if(jsLinksEditor) { 
            jsLinksEditor.destroy();
            jsLinksEditor = null;
        }
        if(cssLinksEditor) { 
            cssLinksEditor.destroy();
            cssLinksEditor = null;
        }  
    }
    
    line.appendChild(haxapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Save","onclick":onSave}));
    line.appendChild(haxapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    dialog.setContent(content);
    
    //show dialog
    dialog.show();
    
    //size the dialog to the content
    dialog.fitToContent();
    dialog.centerInParent();
    
    var showJsLinksFunction = function() {
        //hide the onLoad div and show the html dive
        cssLinksEditorDiv.style.display = "none";
        jsLinksEditorDiv.style.display = "";
        
        //create html editor if needed
        if(!jsLinksEditor) {
            jsLinksEditor = ace.edit(jsLinksEditorDiv);
//this stops an error message
jsLinksEditor.$blockScrolling = Infinity;
            jsLinksEditor.setTheme("ace/theme/eclipse");
            jsLinksEditor.getSession().setMode("ace/mode/text");
            //set the value
            var jsLinks = workspaceUI.getJsLinks();
            if(jsLinks) {
                var linkText = jsLinks.join("\n");
                jsLinksEditor.getSession().setValue(linkText);
            }
        }
    }
    
    var showCssLinksFunction = function() {
        //hide the onLoad div and show the html dive
        cssLinksEditorDiv.style.display = "";
        jsLinksEditorDiv.style.display = "none";
        
        //create html editor if needed
        if(!cssLinksEditor) {
            cssLinksEditor = ace.edit(cssLinksEditorDiv);
//this stops an error message
cssLinksEditor.$blockScrolling = Infinity;
            cssLinksEditor.setTheme("ace/theme/eclipse");
            cssLinksEditor.getSession().setMode("ace/mode/text");
            //set the value
            var cssLinks = workspaceUI.getCssLinks();
            if(cssLinks) {
                var linkText = cssLinks.join("\n");
                cssLinksEditor.getSession().setValue(linkText);
            }
        }
    }
    
    //show html first
    jsLinksRadio.checked = true;
    showJsLinksFunction();
    
    //radio change handler
    var onRadioChange = function() {
        if(cssLinksRadio.checked) {
            showCssLinksFunction();
        }
        else if(jsLinksRadio.checked) {
            showJsLinksFunction();
        }
    }
    
    cssLinksRadio.onchange = onRadioChange;
    jsLinksRadio.onchange = onRadioChange;
    
    //set the resize handler
    //resize the editor on window size change
    var resizeCallback = function() {
        //this needs to be fixed
        var container = content.parentElement;
        //this is kind of cludgy, I am using this as the last line and assuming it has even margins
        var margin = line.offsetLeft;
        var endPosition = line.offsetTop + line.offsetHeight + margin;
        var totalWidth = container.clientWidth - 2 * margin;
        var extraHeight = container.clientHeight - endPosition;
        //size the editor, with some arbitrary padding
        editorDiv.style.width = (totalWidth - 5) + "px";
        editorDiv.style.height = (editorDiv.offsetHeight + extraHeight - 5) + "px";
       
        if(cssLinksEditor) cssLinksEditor.resize();
        if(jsLinksEditor) jsLinksEditor.resize();
    }
    var container = content.parentElement;
    haxapp.ui.setResizeListener(container, resizeCallback);
}

/** @private */
haxapp.app.dialog.createLinkText = function(linkArray) {
    return linkArray.join("\n");
}

/** @private */
haxapp.app.dialog.createLinkArray = function(linkText) {
    if((!linkText)||(linkText.length === 0)) {
        return [];
    }
    else {
        return linkText.split(/\s/);
    }
}


