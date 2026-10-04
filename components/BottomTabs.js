"use client";
import Link from "next/link";
import { House, BookOpen, ShieldCheck } from "lucide-react";
import { authClient } from "../lib/auth-client";

export default function BottomTabs() {
  const { data: session } = authClient.useSession();
  const isAdmin = session && session.user.role === "admin";

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 text-xs text-purple-900">
      <Link href="/home" className="flex flex-col items-center gap-1"><House size={20} />Home</Link>
      <Link href="/guide" className="flex flex-col items-center gap-1"><BookOpen size={20} />Guide</Link>
      {isAdmin && (
        <Link href="/admin" className="flex flex-col items-center gap-1"><ShieldCheck size={20} />Admin</Link>
      )}
    </div>
  );
}
