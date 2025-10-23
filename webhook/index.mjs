import crypto from "crypto";
import pkg from "pg";
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const handler = async (event) => {
  const user = event.request.userAttributes;
  const username = event.userName;

  if (!user.email_verified) throw new Error("Email not verified");

  const email = user.email;
  const id = crypto
    .createHash("sha256")
    .update(email)
    .digest("hex")
    .slice(0, 16);

  try {
    const client = await pool.connect();
    await client.query(
      `INSERT INTO "User" (id, email, username) VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING;`,
      [id, email, username],
    );
    client.release();
    console.log("User inserted successfully:", email);
  } catch (err) {
    console.error("Database error:", err);
    throw new Error("Error inserting user: " + err.message);
  }

  return event;
};
