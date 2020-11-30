/* UTILS
miscellaneous utility functions for the editor
TODO: encapsulate in an object maybe? or is that overkill?
*/

function getPlayerId() {
	for (id in tile) {
		if (tile[id].type === TYPE_KEY.AVATAR) {
			return id;
		}
	}

	return null;
}

function makeCountLabel(id, objectRegistry, registrySize) {
	var label = "";

	if (registrySize != null) {
		var idList = sortedIdList(objectRegistry);
		var index = idList.indexOf(id);

		// if "0" isn't in the registry it still exists implicitly
		if (!(NULL_ID in objectRegistry)) {
			index++;
		}

		label += "(" + (index) + "/" + (registrySize - 1) + ")";
	}

	return label;
}

function debugFillAllTiles() {
	tile = {};

	for (var i = 1; i < DEFAULT_REGISTRY_SIZE; i++) {
		var id = toB256(i);

		var binaryString = i.toString(2).padStart(8, "0");
		var binaryArr = [];
		for (var j = 0; j < 8; j++) {
			binaryArr.push(parseInt(binaryString[j]));
		}

		// console.log(id + "\n" + binaryString);

		createTile(id, TYPE_KEY.TILE, {
			drawingData : [
				[
					binaryArr.slice(),
					binaryArr.slice(),
					binaryArr.slice(),
					binaryArr.slice(),
					binaryArr.slice(),
					binaryArr.slice(),
					binaryArr.slice(),
					binaryArr.slice(),
				]
			],
		});
	}

	refreshGameData();

	events.Raise("game_data_change");
}

function debugFillAllRooms() {
	room = {};

	for (var i = 1; i < DEFAULT_REGISTRY_SIZE; i++) {
		var id = toB256(i);
		room[id] = createRoom(id, "1");

		for (var y = 0; y < roomsize; y++) {
			for (var x = 0; x < roomsize; x++) {
				var tileIndex = (y * roomsize) + x;
				if (tileIndex <= i) {
					room[id].tilemap[y][x] = toB256(tileIndex);
				}
			}
		}
	}

	refreshGameData();

	events.Raise("game_data_change");
}

function debugFillAllMaps() {
	map = {}

	var roomIndex = 0;

	for (var i = 1; i < MAP_REGISTRY_SIZE; i++) {
		var id = toB256(i);
		map[id] = createMap(id);

		for (var y = 0; y < mapsize; y++) {
			for (var x = 0; x < mapsize; x++) {
				var roomId = toB256(roomIndex);
				roomIndex++;
				map[id].map[y][x] = roomId;
			}
		}
	}

	refreshGameData();

	events.Raise("game_data_change");
}

function debugPrintGrid(grid) {
	var gridStr = ""
	for (var i = 0; i < grid.length; i++) {
		for (var j = 0; j < grid[i].length; j++) {
			gridStr += grid[i][j];
		}
		gridStr += "\n";
	}

	console.log(gridStr);
}

function debugPrintActiveTilemap() {
	debugPrintGrid(tilemap);
}

function debugPrintActiveSpritemap() {
	var grid = createGrid(roomsize);

	for (var id in spriteInstances) {
		grid[spriteInstances[id].y][spriteInstances[id].x] = spriteInstances[id].id;
	}

	debugPrintGrid(grid);
}

function clamp(val, min, max) {
	return Math.max(Math.min(val, max), min);
}

// used to be in engine, but is still used by editor
function curPal() {
	return getRoomPal(curRoom);
}

function CreateDefaultName(defaultNamePrefix, objectStore, ignoreNumberIfFirstName) {
	if (ignoreNumberIfFirstName === undefined || ignoreNumberIfFirstName === null) {
		ignoreNumberIfFirstName = false;
	}

	var nameCount = ignoreNumberIfFirstName ? -1 : 0; // hacky :(
	for (id in objectStore) {
		if (objectStore[id].name) {
			if (objectStore[id].name.indexOf(defaultNamePrefix) === 0) {
				var nameCountStr = objectStore[id].name.slice(defaultNamePrefix.length);

				var nameCountInt = 0;
				if (nameCountStr.length > 0) {
					nameCountInt = parseInt(nameCountStr);
				}

				if (!isNaN(nameCountInt) && nameCountInt > nameCount) {
					nameCount = nameCountInt;
				}
			}
		}
	}

	if (ignoreNumberIfFirstName && nameCount < 0) {
		return defaultNamePrefix;
	}

	return defaultNamePrefix + " " + (nameCount + 1);
}

// TODO : put these loose functions in the color module
//hex-to-rgb method borrowed from stack overflow
function hexToRgb(hex) {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}
function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
	return "#" + componentToHex(Math.floor(r)) + componentToHex(Math.floor(g)) + componentToHex(Math.floor(b));
}

function hexToHsl(hex) {
	// console.log(hex);
	var rgb = hexToRgb(hex);
	return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

// source : http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
*/
function HSVtoRGB(h, s, v) {
	var r, g, b, i, f, p, q, t;
	if (arguments.length === 1) {
		s = h.s, v = h.v, h = h.h;
	}
	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	switch (i % 6) {
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}
	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255)
	};
}

/* accepts parameters
 * r  Object = {r:x, g:y, b:z}
 * OR 
 * r, g, b
*/
function RGBtoHSV(r, g, b) {
	if (arguments.length === 1) {
		g = r.g, b = r.b, r = r.r;
	}
	var max = Math.max(r, g, b), min = Math.min(r, g, b),
		d = max - min,
		h,
		s = (max === 0 ? 0 : d / max),
		v = max / 255;

	switch (max) {
		case min: h = 0; break;
		case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
		case g: h = (b - r) + d * 2; h /= 6 * d; break;
		case b: h = (r - g) + d * 4; h /= 6 * d; break;
	}

	return {
		h: h,
		s: s,
		v: v
	};
}

// source : https://gist.github.com/mjackson/5311256
/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
	r = g = b = l; // achromatic
  } else {
	function hue2rgb(p, q, t) {
	  if (t < 0) t += 1;
	  if (t > 1) t -= 1;
	  if (t < 1/6) return p + (q - p) * 6 * t;
	  if (t < 1/2) return q;
	  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
	  return p;
	}

	var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	var p = 2 * l - q;

	r = hue2rgb(p, q, h + 1/3);
	g = hue2rgb(p, q, h);
	b = hue2rgb(p, q, h - 1/3);
  }

  return [ Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255) ];
}

/**
 * From: http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 *
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   {number}  r       The red color value
 * @param   {number}  g       The green color value
 * @param   {number}  b       The blue color value
 * @return  {Array}           The HSL representation
 */
function rgbToHsl(r, g, b){
	r /= 255, g /= 255, b /= 255;
	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;

	if(max == min){
		h = s = 0; // achromatic
	}else{
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch(max){
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}

	return [h, s, l];
}

// precalculate rainbow colors
function precalcRbw() {
	// NOTE: I'm keeping this comment to illustrate how I calculated the rainbow colors!
	// for (var i = 0; i < colorCycleLen; i++) {
	// 	var h = Math.sin((Math.PI * (i / (colorCycleLen + 1))) / 2);
	// 	console.log("RAINBOW HUE " + i + " -- " + h);
	// 	var rbwColor = hslToRgb(h, 1, 0.5).concat([255]);
	// 	console.log("RAINBOW HUE [" + rbwColor[0] + "," + rbwColor[1] + "," + rbwColor[2] + "," + rbwColor[3] + "]");
	// 	palette.push(rbwColor);
	// }
}