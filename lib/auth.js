import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";
import { sendMail } from "./mail";

// keep one client in a global so dev hot reload does not create many
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/printhub";
const globalForMongo = globalThis;
if (!globalForMongo._mongoClient) {
  globalForMongo._mongoClient = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000, // fail fast, before the Vercel function timeout
    maxPoolSize: 5,
  });
}
const client = globalForMongo._mongoClient;
const db = client.db();

// On Vercel, use Vercel's own domain so a wrong BETTER_AUTH_URL cannot break login
const onVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL
  : undefined;

const trusted = [];
if (process.env.TRUSTED_ORIGINS) trusted.push(...process.env.TRUSTED_ORIGINS.split(","));
if (process.env.VERCEL_URL) trusted.push("https://" + process.env.VERCEL_URL);
if (process.env.VERCEL_BRANCH_URL) trusted.push("https://" + process.env.VERCEL_BRANCH_URL);
if (onVercel) trusted.push(onVercel);

export const auth = betterAuth({
  baseURL: onVercel || process.env.BETTER_AUTH_URL,
  database: mongodbAdapter(db, { client }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    resetPasswordTokenExpiresIn: 3600,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Reset your PrintHub password",
        text: "Hi " + user.name + ", open this link to reset your PrintHub password: " + url + " (valid for 1 hour). If you did not ask for this, ignore this email.",
        html:
          "<p>Hi " + user.name + ",</p><p>Click the button below to reset your PrintHub password. The link is valid for 1 hour.</p>" +
          '<p><a href="' + url + '" style="background:#6d28d9;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Reset password</a></p>' +
          "<p>If you did not ask for this, you can ignore this email.</p>",
      });
    },
  },
  trustedOrigins: trusted,
  plugins: [admin(), nextCookies()],
  databaseHooks: {
    session: {
      create: {
        // Every login makes sure the ADMIN_EMAIL account has the admin role
        before: async () => {
          try {
            if (process.env.ADMIN_EMAIL) {
              await db
                .collection("user")
                .updateOne({ email: process.env.ADMIN_EMAIL.toLowerCase() }, { $set: { role: "admin" } });
            }
          } catch (e) {}
        },
      },
    },
    user: {
      create: {
        // signing up with ADMIN_EMAIL makes that user an admin
        before: async (user) => {
          const isAdmin =
            process.env.ADMIN_EMAIL &&
            user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
          return { data: { ...user, role: isAdmin ? "admin" : "user" } };
        },
      },
    },
  },
});