"use client";
import { useState, useEffect } from "react";
import { X, Printer } from "lucide-react";
import { FONTS, CASES, renderTextCanvas, printText } from "../lib/printer";
import { useT, useErr } from "./Providers";

export default function TextPanel({ feature, onClose }) {
  const t = useT();
  const errText = useErr();
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
    let s = text;
    if (feature.prefix) {
      s = s.split("\n").map((l) => (l.trim() === "" ? l : feature.prefix + l)).join("\n");
    }
    if (feature.dateHeader) {
      s = new Date().toLocaleString() + "\n--------------------\n" + s;
    }
    return s;
  }

  const opts = { font, size: Number(size), bold, italic, textCase, align, border };

  useEffect(() => {
    const s = buildText();
    if (s.trim() === "") {
      setPreview("");
      return;
    }
    setPreview(renderTextCanvas(s, opts).toDataURL());
  }, [text, font, size, bold, italic, textCase, align, border]);

  async function onPrint() {
    if (text.trim() === "") {
      alert(t("panel.enterText"));
      return;
    }
    setBusy(true);
    try {
      await printText(buildText(), opts);
    } catch (e) {
      alert(errText(e));
    }
    setBusy(false);
  }

  const label = "block text-sm font-medium text-gray-700 mb-1";
  const input = "w-full border rounded-lg p-2 bg-white";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-xl">
        <div className="bg-brand text-white p-4 rounded-t-2xl flex justify-between items-center">
          <div className="text-lg font-bold">{feature.title}</div>
          <button onClick={onClose}><X size={22} /></button>
        </div>

        <div className="p-5 grid md:grid-cols-2 gap-5">
          <div>
            <label className={label}>{t("panel.text")}</label>
            <textarea className={input} rows="5" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("panel.placeholder")} />

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className={label}>{t("panel.font")}</label>
                <select className={input} value={font} onChange={(e) => setFont(e.target.value)}>
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>{t("panel.size")}: {size}</label>
                <input type="range" min="16" max="96" value={size} onChange={(e) => setSize(e.target.value)} className="w-full" />
              </div>
            </div>

            <div className="mt-3">
              <label className={label}>{t("panel.letter")}</label>
              <select className={input} value={textCase} onChange={(e) => setTextCase(e.target.value)}>
                {CASES.map((c) => (
                  <option key={c.value} value={c.value}>{c.value === "none" ? t("case.none") : c.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className={label}>{t("panel.align")}</label>
                <select className={input} value={align} onChange={(e) => setAlign(e.target.value)}>
                  <option value="left">{t("panel.left")}</option>
                  <option value="center">{t("panel.center")}</option>
                  <option value="right">{t("panel.right")}</option>
                </select>
              </div>
              <div className="flex flex-col justify-end gap-1 text-sm">
                <label><input type="checkbox" checked={bold} onChange={(e) => setBold(e.target.checked)} /> {t("panel.bold")}</label>
                <label><input type="checkbox" checked={italic} onChange={(e) => setItalic(e.target.checked)} /> {t("panel.italic")}</label>
                <label><input type="checkbox" checked={border} onChange={(e) => setBorder(e.target.checked)} /> {t("panel.border")}</label>
              </div>
            </div>
          </div>

          <div>
            <div className={label}>{t("panel.preview")}</div>
            <div className="bg-brand-soft border border-brand-line rounded-lg p-3 flex justify-center min-h-40">
              {preview ? (
                <img src={preview} alt="" className="border bg-white" style={{ width: "100%", maxWidth: 384 }} />
              ) : (
                <span className="text-gray-400 self-center">{t("panel.previewEmpty")}</span>
              )}
            </div>
            <button onClick={onPrint} disabled={busy} className="w-full mt-4 bg-brand text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
              <Printer size={18} /> {busy ? t("panel.printing") : t("panel.print")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
