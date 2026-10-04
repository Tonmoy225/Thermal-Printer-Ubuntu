import "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = {
    MONGODB_URI: !!process.env.MONGODB_URI,
    BETTER_AUTH_SECRET: !!process.env.BETTER_AUTH_SECRET,
    ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL || null,
  };
  try {
    const client = globalThis._mongoClient;
    await client.db().command({ ping: 1 });
    return Response.json({ ok: true, db: "connected", env });
  } catch (err) {
    let hint = "";
    const m = err.message || "";
    if (/ServerSelection|whitelist|timed out|ENOTFOUND/i.test(m + err.name)) {
      hint = "In Atlas > Network Access, allow 0.0.0.0/0";
    } else if (/bad auth|Authentication failed/i.test(m)) {
      hint = "The username or password in MONGODB_URI is wrong";
    }
    return Response.json({ ok: false, error: err.name + ": " + m, hint, env }, { status: 500 });
  }
}
