"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { translate } from "../lib/i18n";
import { DEFAULT_SETTINGS } from "../lib/settings";

const LangContext = createContext({ lang: "en", setLang: () => {} });
const SettingsContext = createContext({ settings: DEFAULT_SETTINGS });

export function useLang() {
  return useContext(LangContext);
}

export function useT() {
  const { lang } = useContext(LangContext);
  return (key, vars) => translate(lang, key, vars);
}

// printer er error code ke translate kore
export function useErr() {
  const t = useT();
  return (e) => {
    const k = "err." + e.message;
    const v = t(k);
    return v === k ? e.message : v;
  };
}

export function useSettings() {
  return useContext(SettingsContext);
}

function applyColors(c) {
  const root = document.documentElement;
  root.style.setProperty("--brand-from", c.from);
  root.style.setProperty("--brand-via", c.via);
  root.style.setProperty("--brand-to", c.to);
}

export default function Providers({ children }) {
  const [lang, setLangState] = useState("en");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setLangState(saved);
    try {
      const cached = JSON.parse(localStorage.getItem("settingsCache"));
      if (cached) setSettings({ ...DEFAULT_SETTINGS, ...cached });
    } catch (e) {}
    reload();
  }, []);

  useEffect(() => {
    applyColors(settings.colors);
  }, [settings.colors]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function setLang(l) {
    setLangState(l);
    localStorage.setItem("lang", l);
  }

  async function reload() {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      const merged = { ...DEFAULT_SETTINGS, ...data };
      setSettings(merged);
      localStorage.setItem("settingsCache", JSON.stringify(merged));
    } catch (e) {}
  }

  async function save(next) {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error " + res.status);
    const merged = { ...DEFAULT_SETTINGS, ...data };
    setSettings(merged);
    localStorage.setItem("settingsCache", JSON.stringify(merged));
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <SettingsContext.Provider value={{ settings, setSettings, reload, save }}>
        {children}
      </SettingsContext.Provider>
    </LangContext.Provider>
  );
}
