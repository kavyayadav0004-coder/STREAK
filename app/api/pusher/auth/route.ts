import { NextRequest, NextResponse } from "next/server";
import { pusher, CHANNEL } from "@/lib/realtime";
import { validDisplayKey } from "@/lib/security";
export async function POST(req: NextRequest) {
  const f = await req.formData();
  if (!validDisplayKey(f.get("key") as string) || f.get("channel_name") !== CHANNEL)
    return new NextResponse("forbidden", { status: 403 });
  return NextResponse.json(pusher.authorizeChannel(f.get("socket_id") as string, CHANNEL));
}
