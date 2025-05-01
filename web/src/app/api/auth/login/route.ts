import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { AuthApiResponse } from "@/types/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data: AuthApiResponse = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    (await cookies()).set("login_token", data.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    return NextResponse.json({
      message: data.message,
      data: {
        user: data.data.user,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
