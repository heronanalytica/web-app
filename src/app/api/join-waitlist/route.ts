import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, receiveUpdatesOnly } = body;

    // Validate the input
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    if (typeof receiveUpdatesOnly !== "boolean") {
      return NextResponse.json(
        { error: "Invalid value for receiveUpdatesOnly." },
        { status: 400 }
      );
    }

    // Insert into Supabase table
    const { data, error } = await supabase.from("waitlist").insert([
      { email, receive_updates_only: receiveUpdatesOnly }, // Column names should match your table's schema
    ]);

    if (error) {
      // Check for unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This email is already registered on the waitlist." },
          { status: 409 } // 409 Conflict
        );
      }

      console.error("Error inserting into waitlist:", error);
      return NextResponse.json(
        { error: "Failed to add to waitlist." },
        { status: 500 }
      );
    }

    // Check for email configuration
    if (
      !process.env.EMAIL_SERVICE_USER ||
      !process.env.EMAIL_SERVICE_PASSWORD
    ) {
      console.error("Missing email configuration in environment variables.");
      return NextResponse.json(
        {
          message: "Successfully joined the waitlist, but no email was sent.",
          data,
        },
        { status: 200 }
      );
    }

    // Send confirmation email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_SERVICE_USER,
        pass: process.env.EMAIL_SERVICE_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_SERVICE_USER,
      to: email,
      subject: "Welcome to the Waitlist!",
      text: `Hi there!

        Thank you for joining the waitlist. We'll keep you updated with the latest news and developments.

        Best regards,
        The Heronanalytica Team`,
      html: `<p>Hi there!</p>
        <p>Thank you for joining the waitlist. We'll keep you updated with the latest news and developments.</p>
        <p>Best regards,<br>The <strong>Heronanalytica Team</strong></p>`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Confirmation email sent to ${email}`);
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      return NextResponse.json(
        { error: "Failed to send confirmation email." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Successfully joined the waitlist and email sent!", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in join-waitlist API:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
