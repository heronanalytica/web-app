import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
// import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, message, subject } = body;

  // Validate input
  if (!name || !email || !message || !subject) {
    return NextResponse.json(
      { message: "All fields are required." },
      { status: 400 }
    );
  }

  try {
    // Insert into Supabase
    const { error } = await supabase
      .from("submissions")
      .insert([{ name, email, message, subject }]); // Insert subject as well
    if (error) throw new Error(error.message);

    return NextResponse.json(
      { message: "Submission successful." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error handling form submission:", error.message);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
