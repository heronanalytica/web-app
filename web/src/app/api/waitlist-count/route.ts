import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { count, error } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true }); // Only returns the count, no rows

    if (error) {
      console.error("Error fetching waitlist count:", error);
      return NextResponse.json({ error: "Failed to fetch count." }, { status: 500 });
    }

    return NextResponse.json({ count: (count ?? 0) + 8 }, { status: 200 });
  } catch (error) {
    console.error("Error in waitlist-count API:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
