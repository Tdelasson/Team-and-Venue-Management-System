"use server";

import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function handleAuth(formData: FormData) {
  const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const isLogin = formData.get("isLogin") === "true";

  if (isLogin) {
    // LOGIN LOGIK
    const user = await prisma.user.findUnique({ where: { email: username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Forkert brugernavn eller adgangskode");
    }

    const cookieStore = await cookies();

    cookieStore.set("userId", user.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: THIRTY_DAYS_IN_SECONDS,
      path: "/",
    });
    cookieStore.set("userRole", user.role, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: THIRTY_DAYS_IN_SECONDS,
      path: "/",
    });
    cookieStore.set("username", user.name, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: THIRTY_DAYS_IN_SECONDS,
      path: "/",
    });
  } else {
    // OPRET BRUGER LOGIK
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: username,
        email: username,
        password: hashedPassword,
        role,
      },
    });

    // Auto-login efter oprettelse
    const cookieStore = await cookies();

    cookieStore.set("userId", newUser.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: THIRTY_DAYS_IN_SECONDS,
      path: "/",
    });
    cookieStore.set("userRole", newUser.role, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: THIRTY_DAYS_IN_SECONDS,
      path: "/",
    });
    cookieStore.set("username", newUser.name, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: THIRTY_DAYS_IN_SECONDS,
      path: "/",
    });
  }

  redirect("/");
}

export async function handleLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("userId");
  cookieStore.delete("userRole");
  cookieStore.delete("username");
  redirect("/login");
}
