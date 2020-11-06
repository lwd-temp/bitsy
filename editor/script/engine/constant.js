/* CONSTANTS */
var width = 128;
var height = 128;
var scale = 4; //this is stupid but necessary
var tilesize = 8;
var roomsize = 16;
var mapsize = 8;

var MAP_MAX = 4;
var ROOM_MAX = 256;
var TILE_MAX = 256;
var DIALOG_MAX = 128; // todo : too small?
var PALETTE_MAX = 128; // todo : too small?
var PALETTE_SIZE = 16;
var ANIMATION_SIZE = 4;

var COLOR_INDEX = {
	TEXTBOX : 0,
	TEXT : 1,
	RAINBOW_START : 2,
	RAINBOW_END : 11,
	TRANSPARENT : 12,
	BACKGROUND : 13,
	TILE : 14,
	SPRITE : 15,
};

var WRITABLE_COLOR_START = COLOR_INDEX.BACKGROUND;
var ENABLE_COLOR_OVERRIDE = true; // todo : should be false by default

/* KEYWORDS */
var TYPE_KEY = {
	PALETTE : "PAL",
	ROOM : "ROOM",
	MAP : "MAP",
	AVATAR : "AVA",
	TILE : "TIL",
	SPRITE : "SPR",
	ITEM : "ITM",
	EXIT : "EXT",
	ENDING : "END",
	DIALOG : "DLG",
	DEFAULT_FONT : "DEFAULT_FONT",
	TEXT_DIRECTION : "TEXT_DIRECTION",
	FONT : "FONT",
};

var ARG_KEY = {
	NAME : "NAME",
	IS_WALL : "WAL",
	TRANSITION_EFFECT : "FX",
	TRANSITION_EFFECT_UP : "FXU",
	TRANSITION_EFFECT_DOWN : "FXD",
	TRANSITION_EFFECT_LEFT : "FXL",
	TRANSITION_EFFECT_RIGHT : "FXR",
	COLOR : "COL",
	BACKGROUND : "BGC",
	DIALOG_SCRIPT : "DLG",
	FRAME_TICK_SCRIPT : "TIK",
	KNOCK_INTO_SCRIPT : "NOK",
	BUTTON_DOWN_SCRIPT : "BTN",
	EXIT_DESTINATION : "OUT",
	LOCK : "LOK",
};

var BUTTON_KEY = {
	UP : "UP",
	DOWN : "DWN",
	LEFT : "LFT",
	RIGHT : "RGT",
	OKAY : "OK",
	// TODO: any others? or is this it?
	
	// stub for possible future cancel button -
	// I don't think I need it yet and it complicates touch controls,
	// but I might want it eventually
	// CANCEL : "X",
};

// move other symbol codes in here? SEQ? rename CURLY_KEY?
var SYM_KEY = {
	OPEN : "{",
	CLOSE : "}",
	DIALOG : "->",
	ENTRY : ":",
	VARIABLE : "VAR",
};

var BOOL_KEY = {
	YES : "YES", // => TRUE
	NO : "NO", // => FALSE, NULL, NIL
};

var TRANSITION_KEY = {
	FADE_WHITE : "FDW",
	FADE_BLACK : "FDB",
	WAVE : "WVE",
	TUNNEL : "TNL",
	SLIDE_UP : "SLU",
	SLIDE_DOWN : "SLD",
	SLIDE_LEFT : "SLL",
	SLIDE_RIGHT : "SLR",
};

var FONT_KEY = {
	SIZE : "SIZE",
	CHARACTER_START : "CHAR",
	CHARACTER_SIZE : "CHAR_SIZE",
	CHARACTER_OFFSET : "CHAR_OFFSET",
	CHARACTER_SPACING : "CHAR_SPACING",
};

var TEXT_DIRECTION_KEY = {
	LEFT_TO_RIGHT : "LTR",
	RIGHT_TO_LEFT : "RTL",
};

var MISC_KEY = {
	COMMENT : "#",
	FLAG : "!",
	NEXT : ">",
};

// for back compat with old versions
var LEGACY_KEY = {
	ROOM : "SET",
	POSITION : "POS",
};