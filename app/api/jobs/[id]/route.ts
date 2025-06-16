
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { jobProcessor } from '@/lib/job-processor';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const job = await prisma.job.findFirst({
      where: {
        id: id,
        userId: session.user.id
      },
      include: {
        subtitles: true,
        jobSettings: true,
        analytics: true,
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: job
    });

  } catch (error) {
    console.error('Get job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const job = await prisma.job.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Cancel job if it's still processing
    if (['QUEUED', 'PROCESSING', 'DOWNLOADING', 'TRANSCRIBING', 'TRANSLATING', 'GENERATING'].includes(job.status)) {
      await jobProcessor.cancelJob(job.id);
    }

    // Delete job and related data
    await prisma.job.delete({
      where: { id: id }
    });

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Delete job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
