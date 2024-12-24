import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
// import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, message } = body;

  // Validate input
  if (!name || !email || !message) {
    return NextResponse.json({ message: "All fields are required." }, { status: 400 });
  }

  try {
    // Insert into Supabase
    const { error } = await supabase.from("submissions").insert([{ name, email, message }]);
    if (error) throw new Error(error.message);

    // Send email
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASSWORD,
    //   },
    // });

    // await transporter.sendMail({
    //   from: `"Your Company" <${process.env.EMAIL_USER}>`,
    //   to: email,
    //   subject: "Thank you for contacting us",
    //   text: `Hi ${name},\n\nThank you for your message. We'll get back to you soon!\n\nMessage:\n${message}`,
    // });

    return NextResponse.json({ message: "Submission successful." }, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error handling form submission:", error.message);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
