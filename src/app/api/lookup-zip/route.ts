import { NextRequest, NextResponse } from "next/server";
import { lookupByZip } from "../../../lib/zipLookup";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get("zip") || "";

  const result = await lookupByZip(zip);
  return NextResponse.json(result);
}
