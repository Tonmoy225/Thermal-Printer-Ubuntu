"use client";
import { useState } from "react";
import { X, Printer } from "lucide-react";
import { printImageFile } from "../lib/printer";

export default function PicturePanel({ feature, onClose }) {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  function onPick(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setUrl(URL.createObjectURL(f));
  }

  async function onPrint() {
    if (!file) {
      alert("Age chobi select koro");
      return;
    }
    setBusy(true);
    try {
      await printImageFile(file);
    } catch (e) {
      alert(e.message);
    }
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-xl">
        <div className="bg-linear-to-r from-violet-700 to-fuchsia-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
          <div className="text-lg font-bold">{feature.title}</div>
          <button onClick={onClose}><X size={22} /></button>
        </div>
        <div className="p-5">
          <input type="file" accept="image/*" onChange={onPick} className="w-full border rounded-lg p-2 mb-4" />
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex justify-center min-h-40">
            {url ? (
              <img src={url} alt="" className="max-w-full max-h-72" />
            ) : (
              <span className="text-gray-400 self-center">Chobi select korle preview dekhabe</span>
            )}
          </div>
          <button onClick={onPrint} disabled={busy} className="w-full mt-4 bg-linear-to-r from-violet-700 to-fuchsia-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
            <Printer size={18} /> {busy ? "Printing..." : "Print"}
          </button>
        </div>
      </div>
    </div>
  );
}
