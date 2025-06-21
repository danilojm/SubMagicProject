"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  Calendar,
  Clock,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Job } from "@/src/lib/types";
import { formatDate, formatDuration, getStatusColor } from "@/src/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function JobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchJobs();
    }
  }, [status, router, page, statusFilter]);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`/api/jobs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.data.jobs);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Job deleted successfully");
        fetchJobs();
      } else {
        toast.error("Failed to delete job");
      }
    } catch (error) {
      toast.error("Failed to delete job");
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/retry`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Job retry initiated");
        fetchJobs();
      } else {
        toast.error("Failed to retry job");
      }
    } catch (error) {
      toast.error("Failed to retry job");
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.inputSource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-3xl font-bold">Subtitle Jobs</h1>
          <p className="text-muted-foreground">
            Manage and monitor your subtitle generation jobs
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/jobs/new">
            <Plus className="mr-2 h-5 w-5" />
            New Job
          </Link>
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-col md:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Status: {statusFilter === "all" ? "All" : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setStatusFilter("COMPLETED")}>
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("PROCESSING")}>
              Processing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("FAILED")}>
              Failed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("QUEUED")}>
              Queued
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Jobs List */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No jobs found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Create your first subtitle generation job"}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/jobs/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Job
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(new Date(job.createdAt))}
                        </span>
                        <span>{job.inputType.replace("_", " ")}</span>
                        <span>{job.targetLanguages.length} languages</span>
                        {job.duration && (
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDuration(job.duration)}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/jobs/${job.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {job.status === "COMPLETED" &&
                          job.subtitles &&
                          job.subtitles.length > 0 && (
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/api/subtitles/${job.subtitles[0].id}/download`}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </Link>
                            </DropdownMenuItem>
                          )}
                        {job.status === "FAILED" && (
                          <DropdownMenuItem
                            onClick={() => handleRetryJob(job.id)}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Source:</span>{" "}
                      {job.inputSource}
                    </div>
                    {job.description && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Description:</span>{" "}
                        {job.description}
                      </div>
                    )}
                    {job.status !== "COMPLETED" &&
                      job.status !== "FAILED" &&
                      job.status !== "CANCELLED" && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{job.progress}%</span>
                          </div>
                          <Progress value={job.progress} className="h-2" />
                        </div>
                      )}
                    {job.errorMessage && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        <span className="font-medium">Error:</span>{" "}
                        {job.errorMessage}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          className="flex justify-center space-x-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </motion.div>
      )}
    </div>
  );
}
