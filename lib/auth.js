import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";

// dev mode e bar bar client na banaite global e rakhi
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/printhub";
const globalForMongo = globalThis;
if (!globalForMongo._mongoClient) {
  globalForMongo._mongoClient = new MongoClient(uri);
}
const client = globalForMongo._mongoClient;
const db = client.db();

// Vercel e thakle Vercel er nijer domain use kori, tai BETTER_AUTH_URL bhul thakleo kaj korbe
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
  },
  trustedOrigins: trusted,
  plugins: [admin(), nextCookies()],
  databaseHooks: {
    user: {
      create: {
        // ADMIN_EMAIL diye signup korle automatic admin hobe
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