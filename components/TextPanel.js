"use client";
import { useState, useEffect } from "react";
import { X, Printer } from "lucide-react";
import { FONTS, CASES, renderTextCanvas, printText } from "../lib/printer";

export default function TextPanel({ feature, onClose }) {
  const preset = feature.preset || {};
  const [text, setText] = useState("");
  const [font, setFont] = useState(preset.font || "Arial");
  const [size, setSize] = useState(preset.size || 32);
  const [bold, setBold] = useState(preset.bold !== false);
  const [italic, setItalic] = useState(false);
  const [textCase, setTextCase] = useState(preset.textCase || "none");
  const [align, setAlign] = useState(preset.align || "center");
  const [border, setBorder] = useState(!!preset.border);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);

  function buildText() {
    let t = text;
    if (feature.prefix) {
      t = t.split("\n").map((l) => (l.trim() === "" ? l : feature.prefix + l)).join("\n");
    }
    if (feature.dateHeader) {
      t = new Date().toLocaleString() + "\n--------------------\n" + t;
    }
    return t;
  }

  const opts = { font, size: Number(size), bold, italic, textCase, align, border };

  useEffect(() => {
    const t = buildText();
    if (t.trim() === "") {
      setPreview("");
      return;
    }
    setPreview(renderTextCanvas(t, opts).toDataURL());
  }, [text, font, size, bold, italic, textCase, align, border]);

  async function onPrint() {
    if (text.trim() === "") {
      alert("Age kichu likho");
      return;
    }
    setBusy(true);
    try {
      await printText(buildText(), opts);
    } catch (e) {
      alert(e.message);
    }
    setBusy(false);
  }

  const label = "block text-sm font-medium text-gray-700 mb-1";
  const input = "w-full border rounded-lg p-2 bg-white";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-xl">
        <div className="bg-linear-to-r from-violet-700 to-fuchsia-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
          <div className="text-lg font-bold">{feature.title}</div>
          <button onClick={onClose}><X size={22} /></button>
        </div>

        <div className="p-5 grid md:grid-cols-2 gap-5">
          <div>
            <label className={label}>Lekha</label>
            <textarea className={input} rows="5" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ekhane likho..." />

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className={label}>Font style</label>
                <select className={input} value={font} onChange={(e) => setFont(e.target.value)}>
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Size: {size}</label>
                <input type="range" min="16" max="96" value={size} onChange={(e) => setSize(e.target.value)} className="w-full" />
              </div>
            </div>

            <div className="mt-3">
              <label className={label}>Letter style (Capital / Small / Mix)</label>
              <select className={input} value={textCase} onChange={(e) => setTextCase(e.target.value)}>
                {CASES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className={label}>Align</label>
                <select className={input} value={align} onChange={(e) => setAlign(e.target.value)}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div className="flex flex-col justify-end gap-1 text-sm">
                <label><input type="checkbox" checked={bold} onChange={(e) => setBold(e.target.checked)} /> Bold</label>
                <label><input type="checkbox" checked={italic} onChange={(e) => setItalic(e.target.checked)} /> Italic</label>
                <label><input type="checkbox" checked={border} onChange={(e) => setBorder(e.target.checked)} /> Border</label>
              </div>
            </div>
          </div>

          <div>
            <div className={label}>Preview</div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex justify-center min-h-40">
              {preview ? (
                <img src={preview} alt="" className="border bg-white" style={{ width: "100%", maxWidth: 384 }} />
              ) : (
                <span className="text-gray-400 self-center">Lekha likhle ekhane preview dekhabe</span>
              )}
            </div>
            <button onClick={onPrint} disabled={busy} className="w-full mt-4 bg-linear-to-r from-violet-700 to-fuchsia-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
              <Printer size={18} /> {busy ? "Printing..." : "Print"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
