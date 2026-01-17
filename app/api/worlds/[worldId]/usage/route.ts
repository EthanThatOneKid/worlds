import { NextRequest, NextResponse } from "next/server";
import * as authkit from "@workos-inc/authkit-nextjs";
import { sdk } from "@/lib/sdk";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ worldId: string }> },
) {
  const { worldId } = await params;
  const { user } = await authkit.withAuth();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accountId = req.nextUrl.searchParams.get("account");
  if (!accountId) {
    return NextResponse.json({ error: "Account ID required" }, { status: 400 });
  }

  try {
    const usage = await sdk.worlds.getUsage(worldId, { accountId });
    return NextResponse.json(usage);
  } catch (error) {
    console.error("Failed to fetch usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage" },
      { status: 500 },
    );
  }
}
