// MX10 printing over Web Bluetooth. Protocol thermy.py (cat-printer) er moto.
var printerChar = null;
var printerDevice = null;
var PRINT_WIDTH = 384; // 48 bytes per line
var SPEED = 35;
var ENERGY = 8000;
var EXTRA_FEED = 50;

var CRC_TABLE = [];
(function () {
  for (var i = 0; i < 256; i++) {
    var c = i;
    for (var b = 0; b < 8; b++) {
      c = c & 0x80 ? ((c << 1) ^ 0x07) & 0xff : (c << 1) & 0xff;
    }
    CRC_TABLE.push(c);
  }
})();

function crc8(data) {
  var crc = 0;
  for (var i = 0; i < data.length; i++) crc = CRC_TABLE[(crc ^ data[i]) & 0xff];
  return crc;
}

function make(cmd, payload) {
  var len = payload.length;
  var p = [0x51, 0x78, cmd, 0x00, len & 0xff, len >> 8];
  for (var i = 0; i < payload.length; i++) p.push(payload[i]);
  p.push(crc8(payload));
  p.push(0xff);
  return p;
}

async function write(bytes) {
  var data = new Uint8Array(bytes);
  var chunk = 100;
  for (var i = 0; i < data.length; i += chunk) {
    var part = data.slice(i, i + chunk);
    if (printerChar.properties.write) {
      await printerChar.writeValueWithResponse(part);
    } else {
      await printerChar.writeValueWithoutResponse(part);
    }
    await new Promise(function (r) { setTimeout(r, 20); });
  }
}

// ---------- Bluetooth status ----------
export async function checkBluetooth() {
  if (typeof navigator === "undefined" || !navigator.bluetooth) return "unsupported";
  try {
    var ok = await navigator.bluetooth.getAvailability();
    return ok ? "on" : "off";
  } catch (e) {
    return "on";
  }
}

export function isConnected() {
  return printerDevice !== null && printerDevice.gatt.connected && printerChar !== null;
}

export async function connectPrinter(name, onDisconnect) {
  if (!navigator.bluetooth) {
    throw new Error("Ai browser e Bluetooth support nai. Chrome use koro.");
  }
  var device = await navigator.bluetooth.requestDevice({
    filters: [{ namePrefix: name }],
    optionalServices: [0xae30],
  });
  device.addEventListener("gattserverdisconnected", function () {
    printerChar = null;
    if (onDisconnect) onDisconnect();
  });
  var server = await device.gatt.connect();
  var service = await server.getPrimaryService(0xae30);
  printerChar = await service.getCharacteristic(0xae01);
  printerDevice = device;
  return device.name;
}

// ---------- bitmap ----------
function canvasToRows(canvas) {
  var ctx = canvas.getContext("2d");
  var img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  var rows = [];
  for (var y = 0; y < canvas.height; y++) {
    var row = [];
    for (var bx = 0; bx < PRINT_WIDTH / 8; bx++) {
      var byte = 0;
      for (var d = 0; d < 8; d++) {
        var x = bx * 8 + d;
        var i = (y * canvas.width + x) * 4;
        if (img[i] < 128) byte |= 1 << d; // dark pixel = print
      }
      row.push(byte);
    }
    rows.push(row);
  }
  return rows;
}

async function printCanvas(canvas) {
  if (!isConnected()) throw new Error("Printer connected nai. Age + Connect koro.");
  var rows = canvasToRows(canvas);

  // prepare
  await write(make(0xa3, [0x00]));                       // get state
  await write([0x51, 0x78, 0xbc, 0x00, 0x01, 0x02, 0x01, 0x2d, 0xff]); // prepare camera
  await write(make(0xa4, [50]));                         // dpi
  await write(make(0xbd, [SPEED]));                      // speed
  await write(make(0xaf, [ENERGY & 0xff, ENERGY >> 8])); // energy
  await write(make(0xbe, [0x01]));                       // apply energy
  await write(make(0xa9, [0x00]));                       // update device
  await write(make(0xa6, [0xaa, 0x55, 0x17, 0x38, 0x44, 0x5f, 0x5f, 0x5f, 0x44, 0x38, 0x2c])); // start lattice

  // lines (kichu line ek sathe pathai)
  var buf = [];
  for (var i = 0; i < rows.length; i++) {
    buf = buf.concat(make(0xa2, rows[i]));
    if (buf.length >= 200) {
      await write(buf);
      buf = [];
    }
  }
  if (buf.length > 0) await write(buf);

  // finish
  await write(make(0xa6, [0xaa, 0x55, 0x17, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x17])); // end lattice
  await write(make(0xbd, [8]));
  await write(make(0xa1, [EXTRA_FEED & 0xff, EXTRA_FEED >> 8]));
  await write(make(0xa3, [0x00]));
}

// ---------- text options ----------
export const FONTS = ["Arial", "Georgia", "Times New Roman", "Courier New", "Verdana", "Trebuchet MS", "Impact", "Comic Sans MS"];

export const CASES = [
  { value: "none", label: "As typed (Big + small mix)" },
  { value: "upper", label: "UPPERCASE" },
  { value: "lower", label: "lowercase" },
  { value: "title", label: "Title Case" },
  { value: "sentence", label: "Sentence case" },
  { value: "alternate", label: "aLtErNaTe" },
];

export function applyCase(text, mode) {
  if (mode === "upper") return text.toUpperCase();
  if (mode === "lower") return text.toLowerCase();
  if (mode === "title") return text.toLowerCase().replace(/(^|\s)(\S)/g, function (m, a, c) { return a + c.toUpperCase(); });
  if (mode === "sentence") return text.toLowerCase().replace(/(^\s*|[.!?]\s+|\n\s*)(\S)/g, function (m, a, c) { return a + c.toUpperCase(); });
  if (mode === "alternate") {
    var n = 0;
    return text.replace(/[a-zA-Z]/g, function (c) { n++; return n % 2 ? c.toLowerCase() : c.toUpperCase(); });
  }
  return text;
}

function wrapLines(ctx, text, maxWidth) {
  var out = [];
  var paragraphs = text.split("\n");
  for (var p = 0; p < paragraphs.length; p++) {
    var words = paragraphs[p].split(" ");
    var line = "";
    for (var w = 0; w < words.length; w++) {
      var test = line === "" ? words[w] : line + " " + words[w];
      if (ctx.measureText(test).width <= maxWidth) {
        line = test;
      } else {
        if (line !== "") out.push(line);
        line = words[w];
        // lomba word hole akkhor dhore bhenge felo
        while (ctx.measureText(line).width > maxWidth && line.length > 1) {
          var cut = line.length - 1;
          while (cut > 1 && ctx.measureText(line.slice(0, cut)).width > maxWidth) cut--;
          out.push(line.slice(0, cut));
          line = line.slice(cut);
        }
      }
    }
    out.push(line);
  }
  return out;
}

// opts: font, size, bold, italic, textCase, align, border
export function renderTextCanvas(text, opts) {
  var o = Object.assign({ font: "Arial", size: 32, bold: true, italic: false, textCase: "none", align: "center", border: false }, opts || {});
  var pad = o.border ? 24 : 10;
  var fontStr = (o.italic ? "italic " : "") + (o.bold ? "bold " : "") + o.size + 'px "' + o.font + '", sans-serif';
  var finalText = applyCase(text, o.textCase);

  var measure = document.createElement("canvas").getContext("2d");
  measure.font = fontStr;
  var lines = wrapLines(measure, finalText, PRINT_WIDTH - pad * 2);
  var lineH = Math.round(o.size * 1.3);

  var canvas = document.createElement("canvas");
  canvas.width = PRINT_WIDTH;
  canvas.height = lines.length * lineH + pad * 2;
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.font = fontStr;
  ctx.textBaseline = "top";
  ctx.textAlign = o.align;
  var x = o.align === "left" ? pad : o.align === "right" ? PRINT_WIDTH - pad : PRINT_WIDTH / 2;
  for (var i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, pad + i * lineH);
  }
  if (o.border) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = "black";
    ctx.strokeRect(6, 6, PRINT_WIDTH - 12, canvas.height - 12);
  }
  return canvas;
}

export async function printText(text, opts) {
  await printCanvas(renderTextCanvas(text, opts));
}

export function printImageFile(file) {
  return new Promise(function (resolve, reject) {
    var img = new Image();
    img.onload = async function () {
      try {
        var h = Math.round((img.height * PRINT_WIDTH) / img.width);
        var canvas = document.createElement("canvas");
        canvas.width = PRINT_WIDTH;
        canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, PRINT_WIDTH, h);
        ctx.drawImage(img, 0, 0, PRINT_WIDTH, h);
        // simple threshold: gray -> black/white
        var id = ctx.getImageData(0, 0, PRINT_WIDTH, h);
        for (var i = 0; i < id.data.length; i += 4) {
          var g = (id.data[i] + id.data[i + 1] + id.data[i + 2]) / 3;
          var v = g < 128 ? 0 : 255;
          id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
        }
        ctx.putImageData(id, 0, 0);
        await printCanvas(canvas);
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    img.src = URL.createObjectURL(file);
  });
}
