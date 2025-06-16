export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jobProcessor } from "@/lib/job-processor";
import { z } from "zod";
import { generateJobTitle } from "@/lib/utils";

const createJobSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  inputType: z.enum(["YOUTUBE_URL", "VIDEO_FILE", "AUDIO_FILE", "OTHER_URL"]),
  inputSource: z.string().min(1, "Input source is required"),
  targetLanguages: z
    .array(z.string())
    .min(1, "At least one target language is required"),
  projectId: z.string().optional(),
  settings: z
    .object({
      whisperModel: z
        .enum(["tiny", "base", "small", "medium", "large"])
        .optional(),
      enableSpeakerDetection: z.boolean().optional(),
      customVocabulary: z.string().optional(),
      translationProvider: z.enum(["google", "deepl", "azure"]).optional(),
      enableAutoSync: z.boolean().optional(),
      qualityThreshold: z.number().min(0).max(1).optional(),
      maxSegmentLength: z.number().min(1).max(300).optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createJobSchema.parse(body);

    // Check user's usage limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.usageCount >= user.usageLimit) {
      return NextResponse.json(
        { error: "Usage limit exceeded. Please upgrade your plan." },
        { status: 403 }
      );
    }

    // Generate title if not provided
    const title =
      data.title || generateJobTitle(data.inputSource, data.inputType);

    // Create job
    const job = await prisma.job.create({
      data: {
        userId: session.user.id,
        title,
        description: data.description,
        inputType: data.inputType,
        inputSource: data.inputSource,
        targetLanguages: data.targetLanguages,
        projectId: data.projectId,
        jobSettings: data.settings
          ? {
              create: {
                whisperModel: data.settings.whisperModel || "base",
                enableSpeakerDetection:
                  data.settings.enableSpeakerDetection || false,
                customVocabulary: data.settings.customVocabulary,
                translationProvider:
                  data.settings.translationProvider || "google",
                enableAutoSync: data.settings.enableAutoSync !== false,
                qualityThreshold: data.settings.qualityThreshold || 0.8,
                maxSegmentLength: data.settings.maxSegmentLength || 30,
              },
            }
          : undefined,
      },
      include: {
        jobSettings: true,
        subtitles: true,
      },
    });

    // Update user usage count
    await prisma.user.update({
      where: { id: session.user.id },
      data: { usageCount: { increment: 1 } },
    });

    // Start job processing asynchronously
    setTimeout(() => jobProcessor.processJob(job.id), 1000);

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Create job error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const projectId = searchParams.get("projectId");

    const where: any = {
      userId: session.user.id,
    };

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          subtitles: true,
          jobSettings: true,
          analytics: true,
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user || !session.user.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const job = await prisma.job.findUnique({
//       where: {
//         id: params.id,
//         userId: session.user.id, // Only allow access to own jobs
//       },
//       include: {
//         subtitles: true,
//         jobSettings: true,
//         analytics: true,
//         project: true,
//       },
//     });

//     if (!job) {
//       return NextResponse.json({ error: "Job not found" }, { status: 404 });
//     }

//     return NextResponse.json({
//       success: true,
//       data: job,
//     });
//   } catch (error) {
//     console.error("Get job by id error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
