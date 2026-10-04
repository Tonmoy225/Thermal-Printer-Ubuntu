"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer, LogOut, ShieldCheck } from "lucide-react";
import { authClient } from "../lib/auth-client";

export default function Header() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session ? session.user : null;

  async function logout() {
    await authClient.signOut();
    router.push("/");
  }

  return (
    <header className="bg-linear-to-r from-violet-800 via-purple-700 to-fuchsia-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href={user ? "/home" : "/"} className="flex items-center gap-2 font-bold text-xl">
          <span className="bg-white/20 p-2 rounded-lg"><Printer size={20} /></span>
          PrintHub
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {user && <Link href="/home" className="hidden md:block hover:underline">Home</Link>}
          <Link href="/guide" className="hidden md:block hover:underline">Setup Guide</Link>
          {user && user.role === "admin" && (
            <Link href="/admin" className="hidden md:flex items-center gap-1 hover:underline">
              <ShieldCheck size={16} /> Admin
            </Link>
          )}
          {user && (
            <>
              <span className="hidden sm:block text-white/80">{user.name}</span>
              <button onClick={logout} className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg">
                <LogOut size={16} /> Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
