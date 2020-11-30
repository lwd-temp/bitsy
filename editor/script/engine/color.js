var PALETTE_ID = {
	ROOM : 0,
	PREV : 1,
	FADE : 2,
};

function Color() {
	// active palette colors
	var activePalettes = {};

	var colorCycleOffset = 0;
	var colorCycleMin = 2;
	var colorCycleLen = 10;

	function CreateDefaultPalette() {
		var palette = [];

		// text box colors
		palette.push([0,0,0,255]);
		palette.push([255,255,255,255]);

		// precalculated rainbow colors
		palette.push([255,0,0,255]);
		palette.push([255,217,0,255]);
		palette.push([78,255,0,255]);
		palette.push([0,255,125,255]);
		palette.push([0,192,255,255]);
		palette.push([0,18,255,255]);
		palette.push([136,0,255,255]);
		palette.push([255,0,242,255]);
		palette.push([255,0,138,255]);
		palette.push([255,0,61,255]);

		// transparent
		palette.push([0,0,0,0]);

		// default tile colors
		palette.push([0,0,0,255]);
		palette.push([255,255,255,255]);
		palette.push([255,255,255,255]);

		return palette;
	}

	// set palette to default colors
	function ResetRoomPalette() {
		activePalettes[PALETTE_ID.ROOM] = CreateDefaultPalette();
	}

	// todo : name?
	function ShiftedColorIndex(palId, index) {
		var offset = (palId in palette) ? palette[palId].indexOffset : COLOR_INDEX.BACKGROUND;
		var shiftedIndex = index + offset;

		if (PALETTE_SIZE) {
			shiftedIndex = shiftedIndex % PALETTE_SIZE;
		}

		return shiftedIndex;
	}
	this.ShiftedColorIndex = ShiftedColorIndex;

	this.LoadRoomPalette = function(pal) {
		ResetRoomPalette();

		var palette = activePalettes[PALETTE_ID.ROOM];

		if (pal != undefined && pal != null) {
			for (var i = 0; i < pal.colors.length; i++) {
				var index = ShiftedColorIndex(pal.id, i);
				var alpha = (index === COLOR_INDEX.TRANSPARENT) ? 0 : 255;

				if (index < palette.length) {
					palette[index] = pal.colors[i].concat([alpha]);
				}
				else {
					palette.push(pal.colors[i].concat([alpha]));
				}
			}
		}
	};

	this.RoomPaletteSize = function() {
		return activePalettes[PALETTE_ID.ROOM] ? activePalettes[PALETTE_ID.ROOM].length : 0;
	};

	this.StoreRoomPalette = function() {
		activePalettes[PALETTE_ID.PREV] = activePalettes[PALETTE_ID.ROOM];
	};

	this.CreateFadePalette = function(clearIndex) {
		activePalettes[PALETTE_ID.FADE] = [];

		for (var i = 0; i < activePalettes[PALETTE_ID.ROOM].length; i++) {
			activePalettes[PALETTE_ID.FADE].push(activePalettes[PALETTE_ID.PREV][clearIndex]);
		}
	};

	function UpdateSystemPalette(paletteIdA, paletteIdB, delta) {
		if (paletteIdA === undefined || paletteIdA === null) {
			paletteIdA = PALETTE_ID.ROOM;
		}

		bitsyPaletteRequestSize(activePalettes[paletteIdA].length); // todo : do this on every update?

		if (paletteIdB != undefined && paletteIdB != null && delta != undefined && delta != null) {
			for (var i = 0; i < activePalettes[paletteIdA].length; i++) {
				var colorA = activePalettes[paletteIdA][i];

				var colorB = (i < activePalettes[paletteIdB].length) ?
					activePalettes[paletteIdB][i] : activePalettes[paletteIdB][COLOR_INDEX.BACKGROUND];

				var deltaColor = LerpColor(colorA, colorB, delta);

				bitsyPaletteSetColor(i, deltaColor[0], deltaColor[1], deltaColor[2], deltaColor[3]);
			}
		}
		else {
			for (var i = 0; i < activePalettes[paletteIdA].length; i++) {
				var color = activePalettes[paletteIdA][i];
				bitsyPaletteSetColor(i, color[0], color[1], color[2], color[3]);
			}
		}
	}
	this.UpdateSystemPalette = UpdateSystemPalette;

	function LerpColor(colorA, colorB, delta) {
		return [colorA[0] + ((colorB[0] - colorA[0]) * delta),
			colorA[1] + ((colorB[1] - colorA[1]) * delta),
			colorA[2] + ((colorB[2] - colorA[2]) * delta),
			colorA[3] + ((colorB[3] - colorA[3]) * delta)];
	}

	function GetColorIndex(index) {
		// todo : handle index out of bounds?

		if (index >= colorCycleMin && index < (colorCycleMin + colorCycleLen)) {
			index -= colorCycleMin;
			index = (index + colorCycleOffset) % colorCycleLen;
			index += colorCycleMin;
		}

		return index;
	}
	this.GetColorIndex = GetColorIndex;

	function GetColor(index, id) {
		var palette = activePalettes[id ? id : PALETTE_ID.ROOM];

		var i = GetColorIndex(index);

		if (i < 0 || index >= palette.length) {
			i = COLOR_INDEX.BACKGROUND;
		}

		return palette[i];
	};
	this.GetColor = GetColor;

	this.Cycle = function() {
		colorCycleOffset--;

		if (colorCycleOffset < 0) {
			colorCycleOffset = colorCycleLen - 1;
		}
	}

	this.GetDefaultColor = function(index) {
		var defaultPalette = CreateDefaultPalette();

		return index >= defaultPalette.length ? [0,0,0,0] : CreateDefaultPalette()[index];
	}

	this.GetDefaultPalette = function() {
		return CreateDefaultPalette();
	}

	ResetRoomPalette();
	UpdateSystemPalette();
}

function fromHex(hexStr) {
	var r = parseInt(hexStr.substring(0, 2), 16);
	var g = parseInt(hexStr.substring(2, 4), 16);
	var b = parseInt(hexStr.substring(4, 6), 16);
	return [r, g, b];
}

function toHex(rgbArr) {
	var r = rgbArr[0].toString(16).toUpperCase().padStart(2, '0');
	var g = rgbArr[1].toString(16).toUpperCase().padStart(2, '0');
	var b = rgbArr[2].toString(16).toUpperCase().padStart(2, '0');
	return r + "" + g + "" + b;
}

// really just a vector distance
function colorDistance(a1, b1, c1, a2, b2, c2) {
	return Math.sqrt( Math.pow(a1 - a2, 2) + Math.pow(b1 - b2, 2) + Math.pow(c1 - c2, 2) );
}