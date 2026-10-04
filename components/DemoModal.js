"use client";
import { useState } from "react";
import { X } from "lucide-react";

export default function DemoModal({ feature, onClose, onContinue }) {
  const [skip, setSkip] = useState(false);
  const Icon = feature.icon;
  const soon = feature.kind === "soon";

  function go() {
    if (skip) localStorage.setItem("skipDemo:" + feature.id, "1");
    onContinue();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="bg-linear-to-r from-violet-700 to-fuchsia-600 text-white p-5 rounded-t-2xl flex justify-between items-start">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 p-3 rounded-xl"><Icon size={26} /></span>
            <div>
              <div className="text-xs text-white/80">Demo</div>
              <div className="text-xl font-bold">{feature.title}</div>
            </div>
          </div>
          <button onClick={onClose}><X size={22} /></button>
        </div>

        <div className="p-5">
          <p className="text-gray-700 mb-4">{feature.desc}</p>

          {feature.steps.length > 0 && (
            <ol className="mb-4 space-y-2">
              {feature.steps.map((s, i) => (
                <li key={i} className="flex gap-3 items-center">
                  <span className="bg-purple-100 text-purple-800 font-bold w-7 h-7 rounded-full flex items-center justify-center text-sm">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          )}

          {!soon && (
            <label className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <input type="checkbox" checked={skip} onChange={(e) => setSkip(e.target.checked)} />
              Ar dekhabe na
            </label>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 border border-purple-300 text-purple-800 py-2.5 rounded-lg">
              {soon ? "Close" : "Cancel"}
            </button>
            {!soon && (
              <button onClick={go} className="flex-1 bg-linear-to-r from-violet-700 to-fuchsia-600 text-white py-2.5 rounded-lg font-semibold">
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
