import DataDisplay from "/apogeeapp/app/datadisplay/DataDisplay.js";
import DATA_DISPLAY_CONSTANTS from "/apogeeapp/app/datadisplay/dataDisplayConstants.js";
import apogeeui from "/apogeeapp/ui/apogeeui.js";

/** Editor that uses the basic text editor */
export default class TextAreaEditor extends DataDisplay {
    
    constructor(displayContainer,callbacks) {
        super(displayContainer,callbacks);

        var textArea = apogeeui.createElement("TEXTAREA",null,{
//            "position":"absolute",
//            "top":"0px",
//            "left":"0px",
//            "width":"100%",
//            "height":"100%",
//            "overflow":"auto"
            "position":"relative",
            "width":"400px",
            "height":"300px",
            "overflow":"auto"
        });
        this.textArea = textArea;

        this.workingData = null;

        //enter edit mode on change to the data
        this.textArea.addEventListener("input",() => this.checkStartEditMode());
    }
    
    getContent() {
        return this.textArea;
    }
    
    getContentType() {
        return apogeeui.RESIZABLE;
    }

    getData() {
        return this.textArea.value;
    }
    
    setData(text) {
        this.uneditedValue = text;
        this.textArea.value = text;

        //set the background color
        if(this.editOk) {
            this.textArea.style.backgroundColor = "";
            this.textArea.readOnly = false;
        }
        else {
            this.textArea.style.backgroundColor = DATA_DISPLAY_CONSTANTS.NO_EDIT_BACKGROUND_COLOR;
            this.textArea.readOnly = true;
        }
    }
 
    endEditMode() {
        super.endEditMode();
    }
    
    startEditMode() {
        super.startEditMode();
    }
    
    checkStartEditMode() {
        if(!this.displayContainer.isInEditMode()) {
            if(this.getData() != this.uneditedValue) {
                this.onTriggerEditMode();
            }
        }
    }
}


