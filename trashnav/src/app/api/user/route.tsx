// app/api/user/route.tsx
import { getServerSession } from "next-auth/next";
import { options } from "../auth/[...nextauth]/options";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(options);

  if (session) {
    return NextResponse.json({
      user: {
        email: session.user?.email,
        name: session.user?.name,
      },
    });
  } else {
    return NextResponse.json({ user: null });
  }
}