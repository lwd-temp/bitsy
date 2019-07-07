/*
- TODO
	- add / remove nodes
	- move nodes (by dragging them)
	- make nesting clear
	- use real dialog renderer
	- minimize / maximize blocks
	- share more code between node editors
	- make order of nodes clearer (some kind of arrow?)
	- update game when nodes change
		- insert sequence nodes and so on if you try to type supported code into a dialog node text editor
*/

// TODO : rename? factory?
function ScriptEditor() {
	this.CreateEditor = function(scriptStr) {
		var scriptRootNode = scriptInterpreter.Parse( scriptStr );
		return new BlockNodeEditor(scriptRootNode, true);
	}
} // ScriptEditor

// TODO : name? editor or viewer? or something else?
function BlockNodeEditor(blockNode, isEven) {
	Object.assign( this, new NodeEditorBase(isEven) );

	this.div.classList.add("blockNode");

	// var minimizeButton = document.createElement("button");
	// minimizeButton.innerText = "minimize";
	// this.div.appendChild(minimizeButton);

	var dialogNodeList = [];
	function addGatheredDialogNodes(div) {
		if (dialogNodeList.length > 0) {
			var dialogNodeEditor = new DialogNodeEditor(dialogNodeList, isEven);
			div.appendChild(dialogNodeEditor.GetElement());

			dialogNodeList = [];
		}
	}

	for (var i = 0; i < blockNode.children.length; i++) {
		var childNode = blockNode.children[i];
		if (childNode.type === "sequence" || childNode.type === "cycle" || childNode.type === "shuffle") {
			addGatheredDialogNodes(this.div);

			var sequenceNodeEditor = new SequenceNodeEditor(childNode, isEven);
			this.div.appendChild(sequenceNodeEditor.GetElement());
		}
		else {
			// gather dialog nodes
			dialogNodeList.push(childNode);
		}
	}

	addGatheredDialogNodes(this.div);
}

function DialogNodeEditor(dialogNodeList, isEven) {
	Object.assign( this, new NodeEditorBase(isEven) );
	// Object.assign( this, new SelectableElement(this) );

	this.div.classList.add("dialogNode");

	var span = document.createElement("span");
	span.innerText = "show dialog";
	span.style.display = "block";
	this.div.appendChild(span);

	// TODO: I still find this hacky
	var fakeDialogRoot = scriptUtils.CreateDialogBlock(dialogNodeList);

	var textArea = document.createElement("textarea");
	textArea.value = fakeDialogRoot.Serialize();
	this.div.appendChild(textArea);

	var OnChangeText = function() {
		console.log(textArea.value);
		fakeDialogRoot = scriptInterpreter.Parse(textArea.value);
		dialogNodeList = fakeDialogRoot.children;
		// TODO -- how do I make sure everything updates correctly??
	}
	textArea.addEventListener("change", OnChangeText);
	textArea.addEventListener("keyup", OnChangeText);
}

function SequenceNodeEditor(sequenceNode, isEven) {
	Object.assign( this, new NodeEditorBase(isEven) );
	// Object.assign( this, new SelectableElement(this) );

	this.div.classList.add("sequenceNode");

	var span = document.createElement("span");
	span.innerText = sequenceNode.type;
	this.div.appendChild(span);

	for (var i = 0; i < sequenceNode.options.length; i++) {
		var optionBlockNode = sequenceNode.options[i];
		var optionBlockNodeEditor = new BlockNodeEditor(optionBlockNode, !isEven);
		this.div.appendChild(optionBlockNodeEditor.GetElement());
	}
}

function NodeEditorBase(isEven) {
	this.div = document.createElement("div");
	this.div.classList.add(isEven ? "scriptNodeEven" : "scriptNodeOdd");

	this.GetElement = function() {
		return this.div;
	}
}

// TODO : work in progress
var lastSelectedScriptNode = null; // hacky global
function SelectableElement(base) {
	var self = this; // I hate doing this..

	base.div.classList.add("scriptNodeSelectable");

	base.div.onclick = function(event) {
		if (lastSelectedScriptNode != null) {
			lastSelectedScriptNode.Deselect();
		}

		base.div.classList.add("scriptNodeSelected");

		// window.addEventListener("keypress", OnKeyPress);
		window.addEventListener("keydown", OnKeyDown);
		// window.addEventListener("keyup", OnKeyUp);

		lastSelectedScriptNode = self;

		event.stopPropagation();
	}

	this.Deselect = function() {
		base.div.classList.remove("scriptNodeSelected");
		// window.removeEventListener("keypress", OnKeyPress);
		window.removeEventListener("keydown", OnKeyDown);
		// window.removeEventListener("keyup", OnKeyUp);
	}

	// var OnKeyPress = function(event) {
	// 	event.preventDefault();
	// }

	var OnKeyDown = function(event) {
		event.preventDefault();
		console.log(event);
	}

	// var OnKeyUp = function(event) {
	// 	event.preventDefault();
	// }
}