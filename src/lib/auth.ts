import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  appName: "pisure",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      enabled: Boolean(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
      ),
    },
  },
  plugins: [
    username(),
    admin({
      adminRoles: ["admin"],
    }),
    nextCookies(),
  ],
  databaseHooks: {
    user: {
      create: {
        // Reject duplicate usernames before the user row is created.
        before: async (user) => {
          const username = (user as { username?: string | null }).username;
          if (username) {
            const existing = await db.query.profiles.findFirst({
              where: (profiles, { eq }) =>
                eq(profiles.username, username.toLowerCase()),
            });
            if (existing) {
              throw new APIError(
                "That username is already taken. Please choose another one.",
              );
            }
          }
        },
        // Provision the public profile with the chosen username at signup.
        after: async (user) => {
          const u = user as {
            id: string;
            username?: string | null;
            name?: string | null;
          };
          await db
            .insert(schema.profiles)
            .values({
              id: u.id,
              username: u.username ?? `user_${u.id.slice(0, 8)}`,
              fullName: u.name ?? null,
            })
            .onConflictDoNothing();
        },
      },
    },
  },
});

// Status of the Google provider — used to hide the button when unconfigured.
export const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

// Local error helper (kept tiny to avoid importing server internals in hooks).
class APIError extends Error {}
