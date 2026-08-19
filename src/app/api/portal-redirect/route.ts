import { NextRequest, NextResponse } from "next/server";
import { resolveWorkingPortalUrl } from "@/lib/portalPredictor";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url") || searchParams.get("slug") || "";

    if (!targetUrl) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const workingUrl = await resolveWorkingPortalUrl(targetUrl);

    if (!workingUrl) {
      return NextResponse.redirect(new URL("/#directory-search-section", request.url));
    }

    return NextResponse.redirect(workingUrl, {
      status: 307,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
