import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { User } from "@/lib/db/models";
import { initializeDatabase } from "@/lib/db/sequelize";

let dbInitialized = false;

async function ensureDbInitialized(): Promise<void> {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

export async function POST(): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await ensureDbInitialized();

    const user = await User.findByPk(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Increment token version to invalidate all existing sessions
    await user.incrementTokenVersion();

    return NextResponse.json({
      success: true,
      message: "All sessions have been invalidated. Please log in again.",
    });
  } catch (error) {
    console.error("Logout everywhere error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
