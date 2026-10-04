import { headers } from "next/headers";
import { auth } from "../../../lib/auth";
import { DEFAULT_SETTINGS, CUSTOM_ICONS, CASE_VALUES } from "../../../lib/settings";

export const dynamic = "force-dynamic";

function col() {
  return globalThis._mongoClient.db().collection("settings");
}

export async function GET() {
  try {
    const doc = await col().findOne({ _id: "app" });
    if (!doc) return Response.json(DEFAULT_SETTINGS);
    const { _id, ...rest } = doc;
    return Response.json({ ...DEFAULT_SETTINGS, ...rest });
  } catch (e) {
    return Response.json(DEFAULT_SETTINGS);
  }
}

const hex = /^#[0-9a-fA-F]{6}$/;
const str = (v, max) => String(v || "").trim().slice(0, max);

function clean(body) {
  const c = (body && body.colors) || {};
  const colors = {
    from: hex.test(c.from) ? c.from : DEFAULT_SETTINGS.colors.from,
    via: hex.test(c.via) ? c.via : DEFAULT_SETTINGS.colors.via,
    to: hex.test(c.to) ? c.to : DEFAULT_SETTINGS.colors.to,
  };
  const hiddenTools = Array.isArray(body.hiddenTools) ? body.hiddenTools.slice(0, 50).map((x) => str(x, 30)) : [];
  const labels = {};
  if (body.labels && typeof body.labels === "object") {
    Object.keys(body.labels).slice(0, 50).forEach((k) => {
      const v = str(body.labels[k], 30);
      if (v) labels[str(k, 30)] = v;
    });
  }
  const customButtons = (Array.isArray(body.customButtons) ? body.customButtons : []).slice(0, 20).map((b) => ({
    id: str(b.id, 30) || "c_" + Date.now(),
    title: str(b.title, 30) || "Button",
    desc: str(b.desc, 120),
    icon: CUSTOM_ICONS.includes(b.icon) ? b.icon : "Type",
    size: Math.min(96, Math.max(16, Number(b.size) || 32)),
    textCase: CASE_VALUES.includes(b.textCase) ? b.textCase : "none",
    align: ["left", "center", "right"].includes(b.align) ? b.align : "center",
    bold: b.bold !== false,
    border: !!b.border,
  }));
  return { colors, hiddenTools, labels, customButtons };
}

export async function PUT(req) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const data = clean(await req.json());
    await col().updateOne({ _id: "app" }, { $set: data }, { upsert: true });
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
