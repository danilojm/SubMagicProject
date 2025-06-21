"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Trash2,
  Clock,
  Calendar,
  FileText,
  Languages,
  Settings,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  Edit,
} from "lucide-react";
import { Job } from "@/lib/types";
import {
  formatDate,
  formatDuration,
  getStatusColor,
  formatFileSize,
} from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Add these imports at the top
import { SubtitlePreviewModal } from "@/components/ui/subtitle-preview-modal";

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { id } = use(params);

  const [previewSubtitle, setPreviewSubtitle] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // useEffect(() => {
  //   if (status === 'unauthenticated') {
  //     router.push('/auth/signin');
  //     return;
  //   }

  //   if (status === 'authenticated') {
  //     fetchJob();

  //     // Set up polling for active jobs
  //     const interval = setInterval(() => {
  //       if (job && ['QUEUED', 'PROCESSING', 'DOWNLOADING', 'TRANSCRIBING', 'TRANSLATING', 'GENERATING'].includes(job.status)) {
  //         fetchJob();
  //       }
  //     }, 2000);

  //     return () => clearInterval(interval);
  //   }
  // }, [status, router, id]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchJob();
    }
  }, [status, router, id]); // Remove 'job' das dependências

  // Separar o polling em um useEffect dedicado
  useEffect(() => {
    if (!job) return;

    const isActiveJob = [
      "QUEUED",
      "PROCESSING",
      "DOWNLOADING",
      "TRANSCRIBING",
      "TRANSLATING",
      "GENERATING",
    ].includes(job.status);

    if (isActiveJob) {
      const interval = setInterval(() => {
        fetchJob();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [job?.status, job?.id]); // Apenas status e id como dependências

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data.data);
      } else if (response.status === 404) {
        toast.error("Job not found");
        router.push("/jobs");
      }
    } catch (error) {
      console.error("Failed to fetch job:", error);
      toast.error("Failed to load job details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!job) return;

    setIsRetrying(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}/retry`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Job retry initiated");
        fetchJob();
      } else {
        toast.error("Failed to retry job");
      }
    } catch (error) {
      toast.error("Failed to retry job");
    } finally {
      setIsRetrying(false);
    }
  };

  const handlePreviewSubtitle = (subtitle: any) => {
    setPreviewSubtitle(subtitle);
    setIsPreviewOpen(true);
  };

  const handleDelete = async () => {
    if (
      !job ||
      !confirm(
        "Are you sure you want to delete this job? This action cannot be undone."
      )
    )
      return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Job deleted successfully");
        router.push("/jobs");
      } else {
        toast.error("Failed to delete job");
      }
    } catch (error) {
      toast.error("Failed to delete job");
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated" || !job) {
    return null;
  }

  const isProcessing = [
    "QUEUED",
    "PROCESSING",
    "DOWNLOADING",
    "TRANSCRIBING",
    "TRANSLATING",
    "GENERATING",
  ].includes(job.status);
  const isCompleted = job.status === "COMPLETED";
  const isFailed = job.status === "FAILED";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <p className="text-muted-foreground">Job ID: {job.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isFailed && (
            <Button onClick={handleRetry} disabled={isRetrying}>
              {isRetrying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Retry
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete
          </Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    {isProcessing && (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    )}
                    {isCompleted && (
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    )}
                    {isFailed && (
                      <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                    )}
                    Job Status
                  </CardTitle>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} className="h-2" />
                  </div>
                )}

                {job.errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Error:</strong> {job.errorMessage}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Created: {formatDate(new Date(job.createdAt))}</span>
                  </div>
                  {job.processingStarted && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Started: {formatDate(new Date(job.processingStarted))}
                      </span>
                    </div>
                  )}
                  {job.processingEnded && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Completed: {formatDate(new Date(job.processingEnded))}
                      </span>
                    </div>
                  )}
                  {job.duration && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Duration: {formatDuration(job.duration)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Transcription */}
          {/* {job.transcriptionText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Transcription
                  </CardTitle>
                  <CardDescription>
                    Original transcribed text from the audio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {job.transcriptionText
                        .split("\n")
                        .slice(0, 20)
                        .join("\n")}
                      {job.transcriptionText.split("\n").length > 20 && (
                        <>
                          ...{""}
                          <Button variant="link" size="sm">
                            Show More
                          </Button>
                        </>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )} */}

          {/* Subtitles */}
          {job.subtitles && job.subtitles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Languages className="mr-2 h-5 w-5" />
                    Generated Subtitles
                  </CardTitle>
                  <CardDescription>
                    Download or preview your generated subtitle files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {job.subtitles.map((subtitle) => (
                      <div
                        key={subtitle.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium">
                              {subtitle.language.toUpperCase()} -{" "}
                              {subtitle.format}
                            </h4>
                            <Badge variant="outline">
                              {subtitle.downloadCount} downloads
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {subtitle.fileSize &&
                              formatFileSize(subtitle.fileSize)}{" "}
                            • Created {formatDate(new Date(subtitle.createdAt))}
                          </div>
                        </div>
                        {/* Condição para mostrar os botões */}
                        {job.status === "COMPLETED" && (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePreviewSubtitle(subtitle)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </Button>
                            <Button size="sm" asChild>
                              <Link
                                href={`/api/subtitles/${subtitle.id}/download`}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
        {/* Subtitle Preview Modal */}
        <SubtitlePreviewModal
          subtitle={previewSubtitle}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          jobTitle={job.title}
        />

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Input Type</Label>
                  <p className="text-sm text-muted-foreground">
                    {job.inputType.replace("_", " ")}
                  </p>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">Source</Label>
                  <p className="text-sm text-muted-foreground break-all">
                    {job.inputSource}
                  </p>
                </div>

                {job.description && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground">
                        {job.description}
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <Label className="text-sm font-medium">
                    Target Languages
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {job.targetLanguages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>

                {job.originalFileName && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium">
                        Original File
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {job.originalFileName}
                      </p>
                    </div>
                  </>
                )}

                {job.fileSize && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium">File Size</Label>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(job.fileSize)}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Job Settings */}
          {job.jobSettings && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Processing Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Whisper Model</span>
                    <span className="text-sm font-medium">
                      {job.jobSettings.whisperModel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Translation Provider</span>
                    <span className="text-sm font-medium">
                      {job.jobSettings.translationProvider}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Speaker Detection</span>
                    <span className="text-sm font-medium">
                      {job.jobSettings.enableSpeakerDetection
                        ? "Enabled"
                        : "Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Auto Sync</span>
                    <span className="text-sm font-medium">
                      {job.jobSettings.enableAutoSync ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Quality Threshold</span>
                    <span className="text-sm font-medium">
                      {(job.jobSettings.qualityThreshold * 100).toFixed(0)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Analytics */}
          {job.analytics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {job.analytics.transcriptionTime && (
                    <div className="flex justify-between">
                      <span className="text-sm">Transcription Time</span>
                      <span className="text-sm font-medium">
                        {(job.analytics.transcriptionTime / 1000).toFixed(1)}s
                      </span>
                    </div>
                  )}
                  {job.analytics.translationTime && (
                    <div className="flex justify-between">
                      <span className="text-sm">Translation Time</span>
                      <span className="text-sm font-medium">
                        {(job.analytics.translationTime / 1000).toFixed(1)}s
                      </span>
                    </div>
                  )}
                  {job.analytics.totalProcessingTime && (
                    <div className="flex justify-between">
                      <span className="text-sm">Total Processing</span>
                      <span className="text-sm font-medium">
                        {(job.analytics.totalProcessingTime / 1000).toFixed(1)}s
                      </span>
                    </div>
                  )}
                  {job.analytics.qualityScore && (
                    <div className="flex justify-between">
                      <span className="text-sm">Quality Score</span>
                      <span className="text-sm font-medium">
                        {(job.analytics.qualityScore * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {job.analytics.wordCount && (
                    <div className="flex justify-between">
                      <span className="text-sm">Word Count</span>
                      <span className="text-sm font-medium">
                        {job.analytics.wordCount}
                      </span>
                    </div>
                  )}
                  {job.analytics.segmentCount && (
                    <div className="flex justify-between">
                      <span className="text-sm">Segments</span>
                      <span className="text-sm font-medium">
                        {job.analytics.segmentCount}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <label className={className}>{children}</label>;
}
