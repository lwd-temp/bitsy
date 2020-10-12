function TableEditor(expression, parentEditor, isInline) {
	var self = this;

	var div = document.createElement("div");
	div.classList.add("actionEditor");

	if (!isInline) {
		var orderControls = new OrderControls(this, parentEditor);
		div.appendChild(orderControls.GetElement());
	}

	var titleDiv = document.createElement("div");
	titleDiv.classList.add("actionTitle");
	titleDiv.innerText = "table"; // todo : localize
	div.appendChild(titleDiv);

	var inputDescription = document.createElement("div");
	inputDescription.innerText = "make table containing entries:";
	div.appendChild(inputDescription);

	var entryRoot = document.createElement("div");
	div.appendChild(entryRoot);
	var entryEditors = [];

	// todo : validate that input is correct?
	for (var i = 1; i < expression.list.length; i += 2) {
		var editor = new TableEntryEditor(expression.list[i], expression.list[i + 1], this);
		entryEditors.push(editor);
		entryRoot.appendChild(editor.GetElement());
	}

	var addEntryRootDiv = document.createElement("div");
	addEntryRootDiv.classList.add("addOption");
	div.appendChild(addEntryRootDiv);

	var addEntryButton = document.createElement("button");
	// todo localize!
	addEntryButton.innerHTML = iconUtils.CreateIcon("add").outerHTML + " add entry";
	addEntryButton.onclick = function() {
		var nameExpression = { type: "symbol", value: ":X" }; // add default creator?
		var valueExpression = CreateDefaultExpression("number");

		expression.list.push(nameExpression);
		expression.list.push(valueExpression);

		var editor = new TableEntryEditor(nameExpression, valueExpression, self);
		editor.Select();
		entryEditors.push(editor);
		entryRoot.appendChild(editor.GetElement());

		parentEditor.NotifyUpdate();
	}
	addEntryRootDiv.appendChild(addEntryButton);

	this.GetElement = function() {
		return div;
	}

	this.GetExpressionList = function() {
		return [expression];
	}

	this.NotifyUpdate = function() {
		expression.list = [expression.list[0]];

		for (var i = 0; i < entryEditors.length; i++) {
			expression.list = expression.list.concat(entryEditors[i].GetExpressionList());
		}

		parentEditor.NotifyUpdate();
	}

	AddSelectionBehavior(
		this,
		function() {
			for (var i = 0; i < entryEditors.length; i++) {
				entryEditors[i].Select();
			}
		},
		function() {
			for (var i = 0; i < entryEditors.length; i++) {
				entryEditors[i].Deselect();
			}
		});
}

// todo : needs style so it's ok to have inline math expressions inside these
function TableEntryEditor(nameExpression, valueExpression, parentEditor) {
	var div = document.createElement("div");
	div.classList.add("tableEntryEditor");

	var editValueType = false;
	var toggleEditTypeButton = document.createElement("button");
	toggleEditTypeButton.title = "toggle editing entry type";
	toggleEditTypeButton.style.display = "none";
	toggleEditTypeButton.appendChild(iconUtils.CreateIcon("settings"));
	toggleEditTypeButton.onclick = function() {
		editValueType = !editValueType;
		valueEditor.SetTypeEditable(editValueType);
	}
	div.appendChild(toggleEditTypeButton);

	var nameEditor = createExpressionEditor(nameExpression, this, true, "entry");
	div.appendChild(nameEditor.GetElement());

	var seperatorSpan = document.createElement("span");
	seperatorSpan.innerText = " : ";
	div.appendChild(seperatorSpan);

	// todo : add expression builder handler?
	var valueEditor = new ExpressionTypePicker(
		valueExpression,
		this, // or should this be parent editor?
		["number", "text", "boolean", "symbol", "list"]);

	div.appendChild(valueEditor.GetElement());

	this.GetElement = function() {
		return div;
	}

	this.GetExpressionList = function() {
		return [nameExpression, valueExpression];
	}

	this.NotifyUpdate = function() {
		parentEditor.NotifyUpdate();
	}

	this.Select = function() {
		nameEditor.Select();
		valueEditor.Select();
		toggleEditTypeButton.style.display = "inline";
	}

	this.Deselect = function() {
		nameEditor.Deselect();
		valueEditor.Deselect();
		toggleEditTypeButton.style.display = "none";
	}
}