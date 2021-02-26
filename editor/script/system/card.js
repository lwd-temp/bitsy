/*
TODO / NOTES
- general decisions to make include...
	- what should the naming conventions be for the APIs? flat functions?? namespaced? uppercase or lowercase?
- what should the name of this system be?
	- card? io? sys?
*/

// public
function registerCard(initFunc) { // todo : should this be a free floating func?
	var c = {};
	initFunc(c);

	_cardRegistry[c.name] = initFunc;
}

var card = {};

// private
_cardRegistry = {}; // todo : name? cardInitRegistry?

// methods
card.load = function(name) { // todo : name? card.create()??
	var c = {};
	_cardRegistry[name](c);

	return c;
}




// HACKY sticking my prototype menu stuff in here...
var menu = {}; // todo : should this be just part of the card module?

function setCurMenuElement(el) {
	_curMenuEl = el;
}

_curMenuEl = null;

menu.add = function(options) {
	if (_curMenuEl === null) {
		return;
	}

	// todo : how much of this should be here? how much in card_ui.js?
	if (options.control === "label") {
		var label = document.createElement("span");
		label.innerText = options.value;
		_curMenuEl.appendChild(label);
	}
	else if (options.control === "button") {
		var button = document.createElement("button");
		button.innerText = options.value;

		button.onclick = function() {
			console.log("CLICK " + options.value);
		}

		_curMenuEl.appendChild(button);
	}
}