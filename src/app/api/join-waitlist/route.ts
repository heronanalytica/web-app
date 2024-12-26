import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, receiveUpdatesOnly } = body;

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

    // Example: Save the data to your database
    console.log("User details saved:", { email, receiveUpdatesOnly });

    return NextResponse.json(
      { message: "Successfully joined the waitlist!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error joining waitlist:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
