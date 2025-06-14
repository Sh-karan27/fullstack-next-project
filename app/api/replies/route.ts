import { connectToDatabase } from "@/lib/db";
import Replies from "@/models/Replies";
import { useSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";

export async function post_reply(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = useSession();
    console.log(session);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const reply = await Replies.create({
      posted_by: session.data?.user?.id,
      reply_to: id,
    });
    console.log(reply);
    return NextResponse.json(reply, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create reply",
      },
      {
        status: 500,
      }
    );
  }
}
