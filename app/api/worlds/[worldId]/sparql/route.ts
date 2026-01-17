import { NextRequest, NextResponse } from "next/server";
import * as authkit from "@workos-inc/authkit-nextjs";
import { sdk } from "@/lib/sdk";

export async function POST(
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

  const contentType = req.headers.get("content-type");
  const body = await req.text();

  try {
    if (contentType === "application/sparql-query") {
      const result = await sdk.worlds.sparqlQuery(worldId, body, {
        accountId,
      });
      return NextResponse.json(result);
    } else if (contentType === "application/sparql-update") {
      await sdk.worlds.sparqlUpdate(worldId, body, { accountId });
      return new NextResponse(null, { status: 204 });
    } else {
      return NextResponse.json(
        {
          error:
            "Invalid content type. Use application/sparql-query or application/sparql-update",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Failed to execute SPARQL:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to execute SPARQL",
      },
      { status: 500 },
    );
  }
}
