import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

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

    return NextResponse.json(
      { message: "Successfully joined the waitlist!", data },
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
