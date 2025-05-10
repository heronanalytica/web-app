import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import nodemailer from "nodemailer";

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

    // Check if email configuration is available
    if (
      !process.env.NEXT_PUBLIC_EMAIL_SERVICE_USER ||
      !process.env.NEXT_PUBLIC_EMAIL_SERVICE_PASSWORD
    ) {
      console.error("Email configuration is missing.");
      return NextResponse.json(
        {
          message:
            "Submission successful, but no confirmation email was sent due to missing configuration.",
        },
        { status: 200 }
      );
    }

    // Send confirmation email using Nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.NEXT_PUBLIC_EMAIL_SERVICE_USER,
        pass: process.env.NEXT_PUBLIC_EMAIL_SERVICE_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.NEXT_PUBLIC_EMAIL_SERVICE_USER,
      to: process.env.NEXT_PUBLIC_EMAIL_SERVICE_USER, // Your email to receive inquiries
      subject: `New Contact Inquiry: ${subject}`,
      text: `You have received a new inquiry from your contact form:
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        Message:
        ${message}`,
      html: `<p>You have received a new inquiry from your contact form:</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(
        `Contact inquiry email sent successfully to ${process.env.NEXT_PUBLIC_EMAIL_SERVICE_USER}`
      );
    } catch (emailError) {
      console.error("Error sending inquiry email:", emailError);
      return NextResponse.json(
        {
          message: "Submission successful, but the email notification failed.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Submission successful and email sent." },
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
