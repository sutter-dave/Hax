haxapp.jsonedit = {};

var OBJECT_CONSTRUCTOR = {}.constructor;
var ARRAY_CONSTRUCTOR = [].constructor;
var STRING_CONSTRUCTOR = "".constructor;
var NUMBER_CONSTRUCTOR = (0).constructor;
var BOOLEAN_CONSTRUCTOR = (true).constructor;

//inputs to this should be "object", "array" or "value". Other type objects will not be processed properly
haxapp.jsonedit.getObjectType = function(data) {
	if(data == null) return "value";
	
	if(data.constructor == OBJECT_CONSTRUCTOR) {
		return "object";
	}
	else if(data.constructor == ARRAY_CONSTRUCTOR) {
		return "array";
	}
	else {
		return "value";
	}
}

//this tells a type value: "string", "number", "boolean", "other", "null"
haxapp.jsonedit.getValueType = function(value) {
	if(value == null) return "null";
	
	if(value.constructor == STRING_CONSTRUCTOR) {
		return "string";
	}
	else if(value.constructor == NUMBER_CONSTRUCTOR) {
		return "number";
	}
	else if(value.constructor == BOOLEAN_CONSTRUCTOR) {
		return "boolean";
	}
	else {
		return "other";
	}
}

haxapp.jsonedit.isBoolString = function(stringValue) {
    return (stringValue === "false" || stringValue === "true");
}

haxapp.jsonedit.isNullString = function(stringValue) {
    return (stringValue === "null");
}

//This method retuns true if the stringToNonString method will successfully convet the object.
haxapp.jsonedit.canBeConvertedToNonString = function(stringValue) {
	return(isFinite(stringValue) || haxapp.jsonedit.isBoolString(stringValue) || haxapp.jsonedit.isNullString(stringValue) );
}

//This method coverts a string value to non-string value (currently a number or boolean). 
//If the conversion fails, it returns the string value.
//before the method is called it should be checked that it is a valid
//number or boolean.
haxapp.jsonedit.stringToNonString = function(stringValue) {
	var stringToValueCode = "value = " + stringValue;
	var value;
	try {
	  eval(stringToValueCode);
	  return value;
	}
	catch(error) {
	  return stringValue;
	}
}

var PIXELS_PER_INDENT = 10;
haxapp.jsonedit.createIndentElement = function(indentLevel) {
	var cell = document.createElement("div");
	cell.className = "indentCell";
	cell.style.width = (PIXELS_PER_INDENT * indentLevel) + "px";
	return cell;
}

haxapp.jsonedit.createObjectDelimiter = function(delimiter) {
	var cell = document.createElement("div");
	cell.className = "objectDelimCell";
	cell.innerHTML = delimiter;
	return cell;
}
haxapp.jsonedit.createExpandButton = function(valueEntry) {
	var cell = document.createElement("div");
	cell.className = "buttonCell";
	cell.innerHTML = "+";
	cell.onclick = function() {
		valueEntry.setExpanded(true);
	}
	return cell;
}
haxapp.jsonedit.createContractButton = function(valueEntry) {
	var cell = document.createElement("div");
	cell.className = "buttonCell";
	cell.innerHTML = "-";
	cell.onclick = function() {
		valueEntry.setExpanded(false);
	}
	return cell;
}

