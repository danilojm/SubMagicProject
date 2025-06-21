export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subtitle = await prisma.subtitle.findFirst({
      where: {
        id: id,
        job: {
          userId: session.user.id,
        },
      },
      include: {
        job: {
          select: {
            title: true,
            userId: true,
          },
        },
      },
    });

    if (!subtitle) {
      return NextResponse.json(
        { error: "Subtitle not found" },
        { status: 404 }
      );
    }

    // Update download count
    await prisma.subtitle.update({
      where: { id: id },
      data: { downloadCount: { increment: 1 } },
    });

    // Generate filename
    const sanitizedTitle = subtitle.job.title.replace(/[^a-zA-Z0-9-_]/g, "_");
    const filename = `${sanitizedTitle}_${
      subtitle.language
    }.${subtitle.format.toLowerCase()}`;

    // Return file content
    return new NextResponse(subtitle.content, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": subtitle.content.length.toString(),
      },
    });
  } catch (error) {
    console.error("Download subtitle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
