/** This is an text field element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.InvisibleElement = class extends apogeeapp.ui.ConfigurableElement {
    constructor(form,elementInitData) {
        //supress the dom element - this is hidden
        super(form,elementInitData,true);
        
        this.value = elementInitData.value;       
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.value;
    }   

    /** This method updates the data for the given element. See the specific element
     * type for fields that can be updated. */
    updateData(elementInitData) {
        //no action
    }

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    updateValue(value) {
        this.value = value;
    }
}

apogeeapp.ui.InvisibleElement.TYPE_NAME = "invisible";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.InvisibleElement.TYPE_NAME,apogeeapp.ui.InvisibleElement);