"use server";

import { db } from "@/lib/db/client";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

export async function signUp(_prev: any, formData: FormData) {
  const email    = formData.get("email")    as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!email || !username || !password) {
    return { error: "All fields are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  try {
    const [existing] = await db.execute(
      "SELECT user_id FROM Users WHERE email = ?",
      [email]
    );

    if ((existing as any[]).length > 0) {
      return { error: "An account with this email already exists." };
    }

    const hash = await bcrypt.hash(password, 12);

    await db.execute(
      "INSERT INTO Users (email, username, password_hash) VALUES (?, ?, ?)",
      [email, username, hash]
    );
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return { error: "Email or username already taken." };
    }
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/signin");
}

export async function signInUser(_prev: any, formData: FormData) {
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/closet",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}
