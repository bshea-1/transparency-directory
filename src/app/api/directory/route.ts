import { NextResponse } from "next/server";
import { getDirectoryData } from "@/lib/dataSource";

export const revalidate = 3600;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state") || undefined;
    const query = searchParams.get("q") || undefined;

    const data = await getDirectoryData();

    let filtered = data.entries;
    if (state && state !== "ALL") {
      filtered = filtered.filter((e) => e.stateCode.toUpperCase() === state.toUpperCase());
    }
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.jurisdiction.toLowerCase().includes(q) ||
          (e.portalSlug && e.portalSlug.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      stats: data.stats,
      total: filtered.length,
      entries: filtered,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to load directory data", details: errorMessage },
      { status: 500 }
    );
  }
}
