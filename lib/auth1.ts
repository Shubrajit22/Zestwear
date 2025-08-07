// lib/auth.ts or just /auth.ts depending on your structure
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function auth() {
  return await getServerSession(authOptions);
}
