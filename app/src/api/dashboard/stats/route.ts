export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/db";

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching dashboard stats...");
    console.log("Request URL:", request.url);
    console.log("Request Method:", request.method);
    console.log("Request Headers:", request.headers);
    console.log("Auth Options:", authOptions);

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        usageCount: true,
        usageLimit: true,
      },
    });

    // Get job statistics
    const [
      totalJobs,
      completedJobs,
      processingJobs,
      failedJobs,
      usageThisMonth,
      avgQualityScore,
      totalProcessingTime,
    ] = await Promise.all([
      prisma.job.count({
        where: { userId },
      }),
      prisma.job.count({
        where: { userId, status: "COMPLETED" },
      }),
      prisma.job.count({
        where: {
          userId,
          status: {
            in: [
              "QUEUED",
              "PROCESSING",
              "DOWNLOADING",
              "TRANSCRIBING",
              "TRANSLATING",
              "GENERATING",
            ],
          },
        },
      }),
      prisma.job.count({
        where: { userId, status: "FAILED" },
      }),
      prisma.job.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.jobAnalytics.aggregate({
        where: {
          job: { userId },
        },
        _avg: {
          qualityScore: true,
        },
      }),
      prisma.jobAnalytics.aggregate({
        where: {
          job: { userId },
        },
        _sum: {
          totalProcessingTime: true,
        },
      }),
    ]);

    const stats = {
      totalJobs,
      completedJobs,
      processingJobs,
      failedJobs,
      totalProcessingTime: totalProcessingTime._sum?.totalProcessingTime || 0,
      averageQualityScore: avgQualityScore._avg?.qualityScore || 0,
      usageThisMonth,
      remainingQuota: (user?.usageLimit || 0) - (user?.usageCount || 0),
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
