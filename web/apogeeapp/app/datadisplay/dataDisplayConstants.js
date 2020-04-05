/** 
 * This namespace includes some data display constants.
 * @namespace
 */
let DATA_DISPLAY_CONSTANTS = {};

export {DATA_DISPLAY_CONSTANTS as default};

//these are responses to hide request and close request
DATA_DISPLAY_CONSTANTS.UNSAVED_DATA = -1;
DATA_DISPLAY_CONSTANTS.CLOSE_OK = 1;

DATA_DISPLAY_CONSTANTS.VIEW_STATE_INACTIVE = 1;
DATA_DISPLAY_CONSTANTS.VIEW_STATE_MINIMIZED = 2;

//this should probably go somewhere else
DATA_DISPLAY_CONSTANTS.NO_EDIT_BACKGROUND_COLOR = "#f4f4f4";

//some common cases - made of the view state flags
DATA_DISPLAY_CONSTANTS.DISPLAY_DESTROY_FLAG_NEVER = 0;
DATA_DISPLAY_CONSTANTS.DISPLAY_DESTROY_FLAG_INACTIVE = 1;
DATA_DISPLAY_CONSTANTS.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED = 3;

//display view size constants
DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME = "resize_height_mode_some";
DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX = "resize_height_mode_max";

DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_LESS = 1;
DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MORE = 2;
DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_NONE = 0;