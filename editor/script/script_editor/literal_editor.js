function LiteralEditor(expression, parentEditor, isInline, valueName, onCreateInput, getDisplayValue) {
	var div = isInline ? document.createElement("span") : document.createElement("div");

	if (!isInline) {
		div.classList.add("actionEditor");
	}

	var orderControls = null;
	if (!isInline) {
		orderControls = new OrderControls(this, parentEditor);
		div.appendChild(orderControls.GetElement());
	}

	if (!isInline) {
		var titleDiv = document.createElement("div");
		titleDiv.classList.add("actionTitle");
		titleDiv.innerText = valueName;
		div.appendChild(titleDiv);
	}

	var span = document.createElement("span");
	span.classList.add("parameterEditor");
	div.appendChild(span);

	function CreateValueInput(isEditable) {
		span.innerHTML = "";

		if (isEditable) {
			var input = onCreateInput(); // todo : any params?
			span.appendChild(input);
		}
		else {
			var valueSpan = document.createElement("span");
			valueSpan.classList.add("parameterUneditable");
			valueSpan.classList.add(GetColorClassForParameterType(expression.type));
			valueSpan.innerText = getDisplayValue ? getDisplayValue() : scriptNext.SerializeValue(expression.value, expression.type);
			
			span.appendChild(valueSpan)
		}
	}

	this.GetElement = function() {
		return div;
	}

	this.NotifyUpdate = function() {
		parentEditor.NotifyUpdate();
	}

	AddSelectionBehavior(
		this,
		function() { CreateValueInput(true); },
		function() { CreateValueInput(false); },
		isInline);

	CreateValueInput(false);
}

// todo : how do I want to handle inline stuff now?
function NumberEditor(expression, parentEditor, isInline) {
	Object.assign(
		this,
		new LiteralEditor(
			expression,
			parentEditor,
			isInline,
			"number", // todo : localize
			function() {
				var input = document.createElement("input");
				input.type = "number";
				input.min = 0;
				input.step = "any";
				input.value = expression.value;
				input.onchange = function(event) {
					expression.value = event.target.value;
					parentEditor.NotifyUpdate();
				}

				return input;
			}
		));
}

// todo: do I want any of these names to differ from the script type? text or variable for example?
function StringEditor(expression, parentEditor, isInline) {
	Object.assign(
		this,
		new LiteralEditor(
			expression,
			parentEditor,
			isInline,
			"text", // todo : localize
			function() {
				var input = document.createElement("input");
				input.type = "string";
				input.value = expression.value;
				input.onchange = function(event) {
					expression.value = event.target.value;
					parentEditor.NotifyUpdate();
				}

				return input;
			}
		));
}

function BooleanEditor(expression, parentEditor, isInline) {
	Object.assign(
		this,
		new LiteralEditor(
			expression,
			parentEditor,
			isInline,
			"boolean", // todo : localize // todo : friendlier name?
			function() {
				var input = document.createElement("select");

				var boolTrueOption = document.createElement("option");
				boolTrueOption.value = "YES";
				boolTrueOption.innerText = "yes"; // TODO : localize
				boolTrueOption.selected = expression.value;
				input.appendChild(boolTrueOption);

				var boolFalseOption = document.createElement("option");
				boolFalseOption.value = "NO";
				boolFalseOption.innerText = "no"; // TODO : localize
				boolFalseOption.selected = !expression.value;
				input.appendChild(boolFalseOption);

				input.onchange = function(event) {
					expression.value = event.target.value === "YES";
					parentEditor.NotifyUpdate();
				}

				return input;
			},
			function() {
				return expression.value ? "yes" : "no"; // todo : localize
			},
		));
}

function SymbolEditor(expression, parentEditor, isInline) {
	Object.assign(
		this,
		new LiteralEditor(
			expression,
			parentEditor,
			isInline,
			"symbol", // todo : localize // todo : name variable instead??
			function() {
				var input = document.createElement("span");

				var variableInput = document.createElement("input");
				variableInput.type = "string";
				variableInput.setAttribute("list", "variable_datalist");
				variableInput.value = expression.value;
				input.appendChild(variableInput);
				
				// todo : make this more robust?
				var variableDatalist = document.createElement("datalist");
				variableDatalist.id = "variable_datalist"; // will duplicates break this?
				for (var name in variable) {
					var variableOption = document.createElement("option");
					variableOption.value = name;
					variableDatalist.appendChild(variableOption);
				}
				input.appendChild(variableDatalist);

				input.onchange = function(event) {
					expression.value = event.target.value;
					parentEditor.NotifyUpdate();
				}

				return input;
			}
		));
}

function EntrySymbolEditor(expression, parentEditor, isInline) {
	Object.assign(
		this,
		new LiteralEditor(
			expression,
			parentEditor,
			isInline,
			"symbol", // todo : localize // todo : name variable instead??
			function() {
				var input = document.createElement("span");

				var variableInput = document.createElement("input");
				variableInput.type = "string";
				variableInput.setAttribute("list", "variable_datalist");
				variableInput.value = expression.value.slice(1);
				input.appendChild(variableInput);
				
				// todo : make this more robust?
				var variableDatalist = document.createElement("datalist");
				variableDatalist.id = "variable_datalist"; // will duplicates break this?
				for (var name in variable) {
					var variableOption = document.createElement("option");
					variableOption.value = name;
					variableDatalist.appendChild(variableOption);
				}
				input.appendChild(variableDatalist);

				input.onchange = function(event) {
					expression.value = SYM_KEY.ENTRY + event.target.value;
					parentEditor.NotifyUpdate();
				}

				return input;
			},
			function() {
				return scriptNext.SerializeValue(expression.value, expression.type).slice(1);
			},
		));
}

function RoomIdEditor(expression, parentEditor, isInline) {
	var roomSelect;

	Object.assign(
		this,
		new LiteralEditor(
			expression,
			parentEditor,
			isInline,
			"room select", // todo : localize
			function() {
				var span = document.createElement("span");

				TryCreateRoomSelect();

				if (roomSelect) {
					span.appendChild(roomSelect.GetElement());
				}

				return span;
			},
			function() {
				return findTool ? findTool.GetDisplayName("room", expression.value) : "";
			},
		));

	function TryCreateRoomSelect() {
		if (findTool && !roomSelect) {
			roomSelect = findTool.CreateSelectControl(
				"room",
				{
					onSelectChange : function(id) {
						expression.value = id;

						if (parentEditor && "NotifyUpdate" in parentEditor) {
							parentEditor.NotifyUpdate();
						}
					},
					toolId : "dialogPanel",
					getSelectMessage : function() {
						// todo : localize
						return "select room";
					},
				});

			roomSelect.SetSelection(expression.value);
		}
	}

	TryCreateRoomSelect();
}

function ItemIdEditor(expression, parentEditor, isInline) {
	var itemSelect;

	Object.assign(
		this,
		new LiteralEditor(
			expression,
			parentEditor,
			isInline,
			"item select", // todo : localize
			function() {
				var span = document.createElement("span");

				TryCreateItemSelect();

				if (itemSelect) {
					span.appendChild(itemSelect.GetElement());
				}

				return span;
			},
			function() {
				return findTool ? findTool.GetDisplayName("drawing", expression.value) : "";
			},
		));

	function TryCreateItemSelect() {
		if (findTool && !itemSelect) {
			itemSelect = findTool.CreateSelectControl(
				"drawing",
				{
					onSelectChange : function(id) {
						expression.value = id;

						if (parentEditor && "NotifyUpdate" in parentEditor) {
							parentEditor.NotifyUpdate();
						}
					},
					filters : ["item"],
					toolId : "dialogPanel",
					getSelectMessage : function() {
						// todo : localize
						return "select item";
					},
				});

			itemSelect.SetSelection(expression.value);
		}
	}

	TryCreateItemSelect();
}

function TransitionIdEditor(expression, parentEditor, isInline) {
	var transitionEffectControl = new TransitionEffectControl(function(id) {
		expression.value = event.target.value;
		parentEditor.NotifyUpdate();
	}, false);

	Object.assign(
		this,
		new LiteralEditor(
			expression,
			parentEditor,
			isInline,
			"transition select", // todo : localize
			function() {
				return transitionEffectControl.GetElement();
			},
			function() {
				// todo : broken??
				return transitionEffectControl.GetName();
			},
		));
}

// todo : localize all of these
var directionTypes = {
	"LFT": {
		GetName : function() { return "left"; },
	},
	"RGT": {
		GetName : function() { return "right"; },
	},
	"UP": {
		GetName : function() { return "up"; },
	},
	"DWN": {
		GetName : function() { return "down"; },
	},
};

function DirectionEditor(expression, parentEditor, isInline) {
	Object.assign(
		this,
		new LiteralEditor(
			expression,
			parentEditor,
			isInline,
			"direction select", // todo : localize
			function() {
				var input = document.createElement("select");
				input.title = "choose direction";

				for (var id in directionTypes) {
					var directionOption = document.createElement("option");
					directionOption.value = id;
					directionOption.innerText = directionTypes[id].GetName();
					directionOption.selected = id === expression.value;
					input.appendChild(directionOption);
				}

				input.onchange = function(event) {
					expression.value = event.target.value;
					parentEditor.NotifyUpdate();
				}

				return input;
			},
			function() {
				return directionTypes[expression.value].GetName();
			},
		));
}

// todo : rename? SetTo? Make? Update?
function CreateDefaultExpression(type, exp) {
	if (exp === undefined || exp === null) {
		exp = {};
	}

	if (exp.hasOwnProperty("value")) {
		delete exp.value;
	}

	if (exp.hasOwnProperty("list")) {
		delete exp.list;
	}

	if (type === "number") {
		// todo : replace these with helper function from script module?
		exp.type = "number";
		exp.value = 0;
	}
	else if (type === "text") {
		exp.type = "string";
		exp.value = "hello";
	}
	else if (type === "boolean") {
		exp.type = "boolean";
		exp.value = true;
	}
	else if (type === "symbol") {
		exp.type = "symbol";
		exp.value = "a"; // TODO : find first var instead?
	}
	else if (type === "room") {
		exp.type = "string";
		exp.value = "0"; // TODO : find first room instead?
	}
	else if (type === "item") {
		exp.type = "string";
		exp.value = "0"; // TODO : find first item instead?
	}
	else if (type === "transition") {
		exp.type = "string";
		exp.value = "FDW";
	}
	else if (type === "direction") {
		exp.type = "string";
		exp.value = "LFT";
	}
	else if (type === "list") {
		// todo : provide more specialized options: fn, tbl, etc
		exp.type = "list";
		exp.list = [{ type: "symbol", value: "ITM" }, CreateDefaultExpression("item")];
	}

	return exp;
}

// todo : rename?
function GetColorClassForParameterType(type) {
	if (type === "number") {
		return "pinkColor";
	}
	else if (type === "string") {
		return "greenColor";
	}
	else if (type === "boolean") {
		return "greenColor";
	}
	else if (type === "symbol") {
		return "goldColor";
	}
}

function ExpressionTypePicker(expression, parentEditor, types, options) {
	var self = this;

	var curType;
	var editor;
	var typeSelect;

	var span = document.createElement("span");

	this.SkipAutoSelect = false;

	function UpdateEditor(type) {
		curType = type;

		span.innerHTML = "";

		typeSelect = document.createElement("select");
		typeSelect.style.display = "none";
		span.appendChild(typeSelect);
		for (var i = 0; i < types.length; i++) {
			var typeOption = document.createElement("option");
			typeOption.value = types[i];
			typeOption.innerText = types[i]; // TODO : localize
			typeOption.selected = curType === types[i];
			typeSelect.appendChild(typeOption);
		}

		typeSelect.onchange = function(event) {
			ChangeEditorType(event.target.value);
		}

		editor = createExpressionEditor(expression, self, true, curType);

		self.SkipAutoSelect = "SkipAutoSelect" in editor && editor.SkipAutoSelect;

		span.appendChild(editor.GetElement());
	}

	function ChangeEditorType(type) {
		CreateDefaultExpression(type, expression);

		console.log(expression);

		UpdateEditor(type);

		// kind of hacky...
		if (isSelected) {
			editor.Select();
		}
		typeSelect.style.display = isTypeEditable ? "inline" : "none";

		parentEditor.NotifyUpdate();
	}

	function DoesEditorTypeMatchExpression(type, exp) {
		if (type === "boolean" && exp.value === null) {
			// todo : keep this catch all for weird cases?
			return true;
		}
		else if (type === "number" && exp.type === "number" && (typeof exp.value) === "number") {
			return true;
		}
		else if (type === "text" && exp.type === "string" && (typeof exp.value) === "string") {
			return true;
		}
		else if (type === "boolean" && exp.type === "boolean" && (typeof exp.value) === "boolean") {
			return true;
		}
		else if (type === "symbol" && exp.type === "symbol") {
			return true;
		}
		else if (type === "room" && exp.type === "string" && (typeof exp.value) === "string" && exp.value in room) {
			return true;
		}
		else if (type === "item" && exp.type === "string" && (typeof exp.value) === "string" && exp.value in tile && tile[exp.value].type === "ITM") {
			return true; // todo : this is really long now...
		}
		else if (type === "transition" && exp.type === "string" && (typeof exp.value) === "string") {
			// todo : test it's valid string?
			return true;
		}
		else if (type === "direction" && exp.type === "string" && (typeof exp.value) === "string" && exp.value in directionTypes) {
			return true;
		}
		else if (type === "list" && exp.type === "list") {
			return true;
		}

		return false;
	}

	// edit parameter with the first matching type this parameter supports
	var curType = types[0];
	for (var i = 0; i < types.length; i++) {
		if (DoesEditorTypeMatchExpression(types[i], expression)) {
			curType = types[i];
			break;
		}
	}

	UpdateEditor(curType);

	this.GetElement = function() {
		return span;
	}

	this.GetExpressionList = function() {
		return [expression];
	}

	this.NotifyUpdate = function() {
		parentEditor.NotifyUpdate();
	}

	var isSelected = false;

	this.Select = function() {
		editor.Select();
		isSelected = true;
	}

	this.Deselect = function() {
		typeSelect.style.display = "none";
		editor.Deselect();
		isSelected = false;
	}

	var isTypeEditable = false;

	this.SetTypeEditable = function(isEditable) {
		isTypeEditable = isEditable;
		typeSelect.style.display = isTypeEditable ? "inline" : "none";
	}

	this.OpenExpressionBuilder = function(expressionString, onAcceptHandler) {
		if (options && options.openExpressionBuilderFunc) {
			options.openExpressionBuilderFunc(expressionString, onAcceptHandler);
		}
	}
}