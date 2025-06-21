export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/db";
import { jobProcessor } from "@/src/lib/job-processor";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const job = await prisma.job.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "FAILED") {
      return NextResponse.json(
        { error: "Only failed jobs can be retried" },
        { status: 400 }
      );
    }

    // Retry the job
    await jobProcessor.retryJob(job.id);

    return NextResponse.json({
      success: true,
      message: "Job retry initiated",
    });
  } catch (error) {
    console.error("Retry job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
