"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from 'next/cache';
import { hash, verify } from "@node-rs/argon2";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSession, deleteSession } from "@/lib/session";

// ── Shared result type ────────────────────────────────────
type ActionResult =
  | { success: true }
  | { success: false; error: string };

// ── Register ──────────────────────────────────────────────
export async function registerAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  // Validate
  if (!name || name.length < 2) {
    redirect("/");
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/");
  }
  if (!password || password.length < 8) {
    redirect("/");
  }

  // Check existing
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    redirect("/");
  }

  // Hash & insert
  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning({ id: users.id });

  if (!user) {
    redirect("/");
  }

  await createSession(user.id);
  
  // Clears cache and updates layout components
  revalidatePath('/dashboard');

  return { success: true };
}

// ── Login ─────────────────────────────────────────────────
export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/");
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = result[0];

  // Always verify to prevent timing attacks
  const validPassword =
    user != null &&
    (await verify(user.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    }));

  if (!user || !validPassword) {
    redirect("/");
  }

  await createSession(user.id);
  
  revalidatePath('/dashboard');

  return { success: true };
}

// ── Logout ────────────────────────────────────────────────
export async function logoutAction(): Promise<void> {
  await deleteSession();
  revalidatePath('/dashboard');
}
