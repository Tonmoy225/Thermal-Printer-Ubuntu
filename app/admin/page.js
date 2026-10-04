"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, ShieldCheck, Ban, Trash2, KeyRound } from "lucide-react";
import Header from "../../components/Header";
import BottomTabs from "../../components/BottomTabs";
import { authClient } from "../../lib/auth-client";

export default function Admin() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = session && session.user.role === "admin";

  async function load() {
    setLoading(true);
    const res = await authClient.admin.listUsers({
      query: { limit: 200, sortBy: "createdAt", sortDirection: "desc" },
    });
    if (res.error) setError(res.error.message || "Users load hoy nai");
    else setUsers(res.data.users);
    setLoading(false);
  }

  useEffect(() => {
    if (!isPending && !session) router.push("/");
    if (isAdmin) load();
  }, [isPending, session, isAdmin]);

  async function run(promise) {
    const res = await promise;
    if (res.error) alert(res.error.message || "Kaj hoy nai");
    else load();
  }

  function toggleRole(u) {
    const role = u.role === "admin" ? "user" : "admin";
    if (confirm(u.email + " ke " + role + " banabe?")) run(authClient.admin.setRole({ userId: u.id, role }));
  }
  function toggleBan(u) {
    if (u.banned) run(authClient.admin.unbanUser({ userId: u.id }));
    else if (confirm(u.email + " ke ban korbe?")) run(authClient.admin.banUser({ userId: u.id }));
  }
  function resetPass(u) {
    const p = prompt(u.email + " er jonno notun password (kom pokkhe 8 akkhor):");
    if (!p) return;
    if (p.length < 8) return alert("Password choto");
    run(authClient.admin.setUserPassword({ userId: u.id, newPassword: p }));
  }
  function remove(u) {
    if (confirm(u.email + " ke permanently delete korbe?")) run(authClient.admin.removeUser({ userId: u.id }));
  }

  if (isPending || !session) return <div className="p-10 text-center text-purple-800">Loading...</div>;

  if (!isAdmin) {
    return (
      <div>
        <Header />
        <div className="max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-md p-6 text-center">
          <div className="text-xl font-bold text-purple-900 mb-2">Admin only</div>
          <p className="text-gray-600">Ai page shudhu admin dekhte pare.</p>
        </div>
        <BottomTabs />
      </div>
    );
  }

  const admins = users.filter((u) => u.role === "admin").length;
  const banned = users.filter((u) => u.banned).length;
  const stat = "bg-white rounded-2xl shadow-md p-4 flex items-center gap-3";
  const btn = "p-2 rounded-lg bg-purple-100 text-purple-800 hover:bg-purple-200";

  return (
    <div className="pb-20 md:pb-10">
      <Header />
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <h1 className="text-2xl font-bold text-purple-900 mb-4">Admin Panel</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className={stat}><Users className="text-purple-700" /><div><div className="text-2xl font-bold">{users.length}</div><div className="text-sm text-gray-600">Total users</div></div></div>
          <div className={stat}><ShieldCheck className="text-purple-700" /><div><div className="text-2xl font-bold">{admins}</div><div className="text-sm text-gray-600">Admins</div></div></div>
          <div className={stat}><Ban className="text-purple-700" /><div><div className="text-2xl font-bold">{banned}</div><div className="text-sm text-gray-600">Banned</div></div></div>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

        <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-purple-50 text-purple-900">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email (Login ID)</th>
                <th className="p-3">User ID</th>
                <th className="p-3">Password</th>
                <th className="p-3">Role</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td className="p-4" colSpan="7">Loading...</td></tr>}
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3 whitespace-nowrap">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 font-mono text-xs">{u.id}</td>
                  <td className="p-3 text-gray-500 whitespace-nowrap">Hidden (encrypted)</td>
                  <td className="p-3">
                    <span className={"px-2 py-1 rounded-full text-xs " + (u.role === "admin" ? "bg-fuchsia-100 text-fuchsia-800" : "bg-gray-100 text-gray-700")}>
                      {u.role}
                    </span>
                    {u.banned && <span className="ml-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">banned</span>}
                  </td>
                  <td className="p-3 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    {u.id !== session.user.id ? (
                      <div className="flex gap-2">
                        <button className={btn} title="Admin/User" onClick={() => toggleRole(u)}><ShieldCheck size={16} /></button>
                        <button className={btn} title="Reset password" onClick={() => resetPass(u)}><KeyRound size={16} /></button>
                        <button className={btn} title="Ban/Unban" onClick={() => toggleBan(u)}><Ban size={16} /></button>
                        <button className={btn} title="Delete" onClick={() => remove(u)}><Trash2 size={16} /></button>
                      </div>
                    ) : (
                      <span className="text-gray-400">You</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <BottomTabs />
    </div>
  );
}
