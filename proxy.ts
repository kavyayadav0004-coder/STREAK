import { NextRequest, NextResponse } from "next/server";
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
export function proxy(req: NextRequest) {
  const h = req.headers.get("authorization");
  if (h?.startsWith("Basic ") && process.env.ADMIN_PASSWORD) {
    const [u, ...p] = atob(h.slice(6)).split(":");
    if (u === "admin" && p.join(":") === process.env.ADMIN_PASSWORD) return NextResponse.next();
  }
  return new NextResponse("Auth required", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="STRK"' } });
}
