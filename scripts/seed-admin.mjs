/**
 * Promote a user to admin, or create a fresh admin account.
 *
 * Usage:
 *   node scripts/seed-admin.mjs admin@example.com [password]
 *
 * - If the user exists: sets role = 'admin'.
 * - If not: creates the account (email/password) and the profile.
 */
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const [email, password] = process.argv.slice(2);
if (!email) {
  console.error("Usage: node scripts/seed-admin.mjs <email> [password]");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
if (!process.env.BETTER_AUTH_SECRET) {
  console.error("BETTER_AUTH_SECRET is not set (required to hash a new password).");
  process.exit(1);
}

const { hashPassword } = await import("better-auth/crypto");
const sql = postgres(process.env.DATABASE_URL, { prepare: false });

const existing = await sql`
  SELECT id FROM "user" WHERE email = ${email} LIMIT 1
`;

if (existing.length > 0) {
  await sql`UPDATE "user" SET role = 'admin' WHERE id = ${existing[0].id}`;
  console.log(`✅ ${email} is now an admin.`);
} else {
  if (!password) {
    console.error("User does not exist — pass a password to create the account.");
    process.exit(1);
  }
  const hashed = await hashPassword(password);
  const username = email.split("@")[0].replace(/[^a-z0-9_]/gi, "").toLowerCase() || "admin";
  const [user] = await sql`
    INSERT INTO "user" (id, name, email, email_verified, role, created_at, updated_at)
    VALUES (gen_random_uuid()::text, ${"Admin"}, ${email}, true, 'admin', now(), now())
    RETURNING id
  `;
  await sql`
    INSERT INTO account (id, user_id, account_id, provider_id, password, created_at, updated_at)
    VALUES (gen_random_uuid()::text, ${user.id}, ${user.id}, 'credential', ${hashed}, now(), now())
  `;
  await sql`
    INSERT INTO profiles (id, username, full_name, created_at)
    VALUES (${user.id}, ${username}, ${"Admin"}, now())
    ON CONFLICT DO NOTHING
  `;
  console.log(`✅ Created admin account for ${email} (username: ${username}).`);
}

await sql.end();
