/** This class encapsulatees a data table */
visicomp.core.Table = function(workspace,name) {
    //base init
    visicomp.core.Child.init.call(this,workspace,name,"table");
    visicomp.core.Dependant.init.call(this);
	visicomp.core.Codeable.init.call(this,"()");
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Table,visicomp.core.Child);
visicomp.core.util.mixin(visicomp.core.Table,visicomp.core.Dependant);
visicomp.core.util.mixin(visicomp.core.Table,visicomp.core.Codeable);

/** This method sets the data for this object. It also
 * freezes the object so it is immutable. */
visicomp.core.Table.prototype.setData = function(data) {
    
	//make this object immutable
	visicomp.core.util.deepFreeze(data);

	//store the new object in the parent
    visicomp.core.Child.setData.call(this,data);
}

/** This method sets the data for this object. It also
 * freezes the object so it is immutable. */
visicomp.core.Table.prototype.hasCode = function() {
	return (this.funtionGeneratorBody != null);
}
	
visicomp.core.Table.prototype.processObjectFunction = function(objectFunction) {	
    //tjhe data is the output of the function
    var data = objectFunction();
	this.setData(data);
}



