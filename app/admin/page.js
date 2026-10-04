"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, ShieldCheck, Ban, Trash2, KeyRound, Palette, LayoutGrid } from "lucide-react";
import Header from "../../components/Header";
import BottomTabs from "../../components/BottomTabs";
import { useT, useSettings } from "../../components/Providers";
import { authClient } from "../../lib/auth-client";
import { FEATURES, ICON_MAP } from "../../lib/features";
import { CASES } from "../../lib/printer";
import { DEFAULT_SETTINGS, PRESETS, CUSTOM_ICONS } from "../../lib/settings";

const btn = "p-2 rounded-lg bg-brand-soft text-brand-dark hover-bg-brand-soft2";
const field = "w-full border rounded-lg p-2 bg-white";

function UsersTab({ session }) {
  const t = useT();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await authClient.admin.listUsers({ query: { limit: 200, sortBy: "createdAt", sortDirection: "desc" } });
    if (res.error) setError(res.error.message || t("admin.loadFail"));
    else setUsers(res.data.users);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function run(promise) {
    const res = await promise;
    if (res.error) alert(res.error.message || t("admin.actionFail"));
    else load();
  }
  function toggleRole(u) {
    const role = u.role === "admin" ? "user" : "admin";
    if (confirm(t("admin.confirmRole", { email: u.email, role }))) run(authClient.admin.setRole({ userId: u.id, role }));
  }
  function toggleBan(u) {
    if (u.banned) run(authClient.admin.unbanUser({ userId: u.id }));
    else if (confirm(t("admin.confirmBan", { email: u.email }))) run(authClient.admin.banUser({ userId: u.id }));
  }
  function resetPass(u) {
    const p = prompt(t("admin.promptPass", { email: u.email }));
    if (!p) return;
    if (p.length < 8) return alert(t("admin.shortPass"));
    run(authClient.admin.setUserPassword({ userId: u.id, newPassword: p }));
  }
  function remove(u) {
    if (confirm(t("admin.confirmDelete", { email: u.email }))) run(authClient.admin.removeUser({ userId: u.id }));
  }

  const admins = users.filter((u) => u.role === "admin").length;
  const banned = users.filter((u) => u.banned).length;
  const stat = "bg-white rounded-2xl shadow-md p-4 flex items-center gap-3";

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className={stat}><Users className="text-brand-dark" /><div><div className="text-2xl font-bold">{users.length}</div><div className="text-sm text-gray-600">{t("admin.total")}</div></div></div>
        <div className={stat}><ShieldCheck className="text-brand-dark" /><div><div className="text-2xl font-bold">{admins}</div><div className="text-sm text-gray-600">{t("admin.admins")}</div></div></div>
        <div className={stat}><Ban className="text-brand-dark" /><div><div className="text-2xl font-bold">{banned}</div><div className="text-sm text-gray-600">{t("admin.banned")}</div></div></div>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

      <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-brand-soft text-brand-dark">
            <tr>
              <th className="p-3">{t("admin.name")}</th>
              <th className="p-3">{t("admin.email")}</th>
              <th className="p-3">{t("admin.userId")}</th>
              <th className="p-3">{t("admin.password")}</th>
              <th className="p-3">{t("admin.role")}</th>
              <th className="p-3">{t("admin.joined")}</th>
              <th className="p-3">{t("admin.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="p-4" colSpan="7">{t("nav.loading")}</td></tr>}
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3 whitespace-nowrap">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 font-mono text-xs">{u.id}</td>
                <td className="p-3 text-gray-500 whitespace-nowrap">{t("admin.hidden")}</td>
                <td className="p-3">
                  <span className={"px-2 py-1 rounded-full text-xs " + (u.role === "admin" ? "bg-brand-soft text-brand-dark" : "bg-gray-100 text-gray-700")}>{u.role}</span>
                  {u.banned && <span className="ml-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">{t("admin.bannedTag")}</span>}
                </td>
                <td className="p-3 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  {u.id !== session.user.id ? (
                    <div className="flex gap-2">
                      <button className={btn} title={t("admin.tipRole")} onClick={() => toggleRole(u)}><ShieldCheck size={16} /></button>
                      <button className={btn} title={t("admin.tipReset")} onClick={() => resetPass(u)}><KeyRound size={16} /></button>
                      <button className={btn} title={t("admin.tipBan")} onClick={() => toggleBan(u)}><Ban size={16} /></button>
                      <button className={btn} title={t("admin.tipDelete")} onClick={() => remove(u)}><Trash2 size={16} /></button>
                    </div>
                  ) : (
                    <span className="text-gray-400">{t("admin.you")}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Appearance and Buttons tabs share one Save
function CustomizeTab({ which }) {
  const t = useT();
  const { settings, setSettings, save, reload } = useSettings();
  const [msg, setMsg] = useState("");
  const [newBtn, setNewBtn] = useState({ title: "", desc: "", icon: "Type", size: 32, textCase: "none", align: "center", bold: true, border: false });

  function update(patch) {
    setMsg("");
    setSettings({ ...settings, ...patch });
  }
  function setColor(k, v) {
    update({ colors: { ...settings.colors, [k]: v } });
  }
  function toggleVisible(id) {
    const h = settings.hiddenTools || [];
    update({ hiddenTools: h.includes(id) ? h.filter((x) => x !== id) : [...h, id] });
  }
  function setLabel(id, v) {
    update({ labels: { ...settings.labels, [id]: v } });
  }
  function addButton() {
    if (newBtn.title.trim() === "") return alert(t("admin.titleReq"));
    update({ customButtons: [...settings.customButtons, { ...newBtn, id: "c_" + Date.now() }] });
    setNewBtn({ ...newBtn, title: "", desc: "" });
  }
  function removeCustom(id) {
    update({ customButtons: settings.customButtons.filter((b) => b.id !== id) });
  }
  async function onSave() {
    try {
      await save(settings);
      setMsg(t("admin.saved"));
    } catch (e) {
      setMsg(t("admin.saveFail", { msg: e.message }));
    }
  }

  const box = "bg-white rounded-2xl shadow-md p-5 mb-5";
  const lab = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div>
      {which === "appearance" && (
        <div className={box}>
          <h2 className="font-bold text-brand-dark mb-3">{t("admin.themeTitle")}</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            {[["from", "admin.c1"], ["via", "admin.c2"], ["to", "admin.c3"]].map(([k, key]) => (
              <div key={k}>
                <label className={lab}>{t(key)}</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={settings.colors[k]} onChange={(e) => setColor(k, e.target.value)} className="h-10 w-14 border rounded" />
                  <span className="font-mono text-sm">{settings.colors[k]}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={lab}>{t("admin.presets")}</div>
          <div className="flex flex-wrap gap-3">
            {PRESETS.map((p) => (
              <button key={p.name} onClick={() => update({ colors: { from: p.from, via: p.via, to: p.to } })} className="border rounded-xl p-2 text-sm">
                <div className="h-6 w-24 rounded-md mb-1" style={{ backgroundImage: "linear-gradient(to right," + p.from + "," + p.via + "," + p.to + ")" }} />
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {which === "buttons" && (
        <>
          <div className={box}>
            <h2 className="font-bold text-brand-dark mb-3">{t("admin.builtin")}</h2>
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.id} className="flex items-center gap-3 py-2 border-t first:border-t-0">
                  <span className="bg-brand text-white p-2 rounded-lg"><Icon size={18} /></span>
                  <input className={field + " flex-1"} placeholder={t("f." + f.id + ".title")} value={(settings.labels && settings.labels[f.id]) || ""} onChange={(e) => setLabel(f.id, e.target.value)} />
                  <label className="text-sm whitespace-nowrap">
                    <input type="checkbox" checked={!(settings.hiddenTools || []).includes(f.id)} onChange={() => toggleVisible(f.id)} /> {t("admin.visible")}
                  </label>
                </div>
              );
            })}
          </div>

          <div className={box}>
            <h2 className="font-bold text-brand-dark mb-3">{t("admin.custom")}</h2>
            {settings.customButtons.length === 0 && <p className="text-gray-500 text-sm mb-3">{t("admin.noCustom")}</p>}
            {settings.customButtons.map((b) => {
              const Icon = ICON_MAP[b.icon] || ICON_MAP.Type;
              return (
                <div key={b.id} className="flex items-center gap-3 py-2 border-t first:border-t-0">
                  <span className="bg-brand text-white p-2 rounded-lg"><Icon size={18} /></span>
                  <input className={field + " flex-1"} value={(settings.labels && settings.labels[b.id]) || b.title} onChange={(e) => setLabel(b.id, e.target.value)} />
                  <label className="text-sm whitespace-nowrap">
                    <input type="checkbox" checked={!(settings.hiddenTools || []).includes(b.id)} onChange={() => toggleVisible(b.id)} /> {t("admin.visible")}
                  </label>
                  <button className={btn} onClick={() => removeCustom(b.id)} title={t("admin.tipDelete")}><Trash2 size={16} /></button>
                </div>
              );
            })}

            <h3 className="font-semibold mt-5 mb-3">{t("admin.add")}</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className={lab}>{t("admin.btnTitle")}</label><input className={field} maxLength="30" value={newBtn.title} onChange={(e) => setNewBtn({ ...newBtn, title: e.target.value })} /></div>
              <div><label className={lab}>{t("admin.btnDesc")}</label><input className={field} maxLength="120" value={newBtn.desc} onChange={(e) => setNewBtn({ ...newBtn, desc: e.target.value })} /></div>
              <div><label className={lab}>{t("admin.btnIcon")}</label>
                <select className={field} value={newBtn.icon} onChange={(e) => setNewBtn({ ...newBtn, icon: e.target.value })}>
                  {CUSTOM_ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
                </select></div>
              <div><label className={lab}>{t("admin.btnSize")}: {newBtn.size}</label><input type="range" min="16" max="96" value={newBtn.size} onChange={(e) => setNewBtn({ ...newBtn, size: Number(e.target.value) })} className="w-full" /></div>
              <div><label className={lab}>{t("admin.btnCase")}</label>
                <select className={field} value={newBtn.textCase} onChange={(e) => setNewBtn({ ...newBtn, textCase: e.target.value })}>
                  {CASES.map((c) => <option key={c.value} value={c.value}>{c.value === "none" ? t("case.none") : c.label}</option>)}
                </select></div>
              <div><label className={lab}>{t("admin.btnAlign")}</label>
                <select className={field} value={newBtn.align} onChange={(e) => setNewBtn({ ...newBtn, align: e.target.value })}>
                  <option value="left">{t("panel.left")}</option><option value="center">{t("panel.center")}</option><option value="right">{t("panel.right")}</option>
                </select></div>
              <label className="text-sm"><input type="checkbox" checked={newBtn.bold} onChange={(e) => setNewBtn({ ...newBtn, bold: e.target.checked })} /> {t("admin.btnBold")}</label>
              <label className="text-sm"><input type="checkbox" checked={newBtn.border} onChange={(e) => setNewBtn({ ...newBtn, border: e.target.checked })} /> {t("admin.btnBorder")}</label>
            </div>
            <button onClick={addButton} className="mt-4 bg-brand text-white px-5 py-2.5 rounded-lg font-semibold">{t("admin.addBtn")}</button>
          </div>
        </>
      )}

      {msg && <div className="bg-brand-soft text-brand-dark p-3 rounded-lg mb-4">{msg}</div>}
      <div className="flex flex-wrap gap-3">
        <button onClick={onSave} className="bg-brand text-white px-6 py-3 rounded-lg font-semibold">{t("admin.save")}</button>
        <button onClick={() => { reload(); setMsg(""); }} className="border border-brand-line text-brand-dark px-6 py-3 rounded-lg">{t("admin.discard")}</button>
        <button onClick={() => update({ colors: DEFAULT_SETTINGS.colors })} className="border border-brand-line text-brand-dark px-6 py-3 rounded-lg">{t("admin.defaults")}</button>
      </div>
    </div>
  );
}

export default function Admin() {
  const router = useRouter();
  const t = useT();
  const { data: session, isPending } = authClient.useSession();
  const [tab, setTab] = useState("users");
  const isAdmin = session && session.user.role === "admin";

  useEffect(() => {
    if (!isPending && !session) router.push("/");
  }, [isPending, session]);

  if (isPending || !session) return <div className="p-10 text-center text-brand-dark">{t("nav.loading")}</div>;

  if (!isAdmin) {
    return (
      <div>
        <Header />
        <div className="max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-md p-6 text-center">
          <div className="text-xl font-bold text-brand-dark mb-2">{t("admin.only")}</div>
          <p className="text-gray-600">{t("admin.onlyDesc")}</p>
        </div>
        <BottomTabs />
      </div>
    );
  }

  const tabs = [["users", "admin.users", Users], ["appearance", "admin.appearance", Palette], ["buttons", "admin.buttons", LayoutGrid]];

  return (
    <div className="pb-20 md:pb-10">
      <Header />
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-4">{t("admin.title")}</h1>
        <div className="flex gap-2 mb-5 overflow-x-auto">
          {tabs.map(([id, key, Icon]) => (
            <button key={id} onClick={() => setTab(id)} className={"flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap " + (tab === id ? "bg-brand text-white" : "bg-white text-brand-dark")}>
              <Icon size={16} /> {t(key)}
            </button>
          ))}
        </div>
        {tab === "users" ? <UsersTab session={session} /> : <CustomizeTab key={tab} which={tab} />}
      </div>
      <BottomTabs />
    </div>
  );
}
