"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer, LogOut, ShieldCheck, Globe } from "lucide-react";
import { authClient } from "../lib/auth-client";
import { LANGS } from "../lib/i18n";
import { useT, useLang } from "./Providers";

export default function Header() {
  const router = useRouter();
  const t = useT();
  const { lang, setLang } = useLang();
  const { data: session } = authClient.useSession();
  const user = session ? session.user : null;

  async function logout() {
    await authClient.signOut();
    router.push("/");
  }

  return (
    <header className="bg-brand text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href={user ? "/home" : "/"} className="flex items-center gap-2 font-bold text-xl">
          <span className="bg-white/20 p-2 rounded-lg"><Printer size={20} /></span>
          PrintHub
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {user && <Link href="/home" className="hidden md:block hover:underline">{t("nav.home")}</Link>}
          <Link href="/guide" className="hidden md:block hover:underline">{t("nav.guide")}</Link>
          {user && user.role === "admin" && (
            <Link href="/admin" className="hidden md:flex items-center gap-1 hover:underline">
              <ShieldCheck size={16} /> {t("nav.admin")}
            </Link>
          )}
          <span className="flex items-center gap-1 bg-white/20 rounded-lg px-2 py-1.5">
            <Globe size={16} />
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent">
              {LANGS.map((l) => (
                <option key={l.code} value={l.code} className="text-black">{l.label}</option>
              ))}
            </select>
          </span>
          {user && (
            <>
              <span className="hidden sm:block text-white/80">{user.name}</span>
              <button onClick={logout} className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg">
                <LogOut size={16} /> <span className="hidden sm:inline">{t("nav.logout")}</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
