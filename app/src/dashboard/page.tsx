"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import { Badge } from "@/src/components/ui/badge";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DashboardStats, Job } from "@/src/lib/types";
import { formatDuration, getStatusColor } from "@/src/lib/utils";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, jobsResponse] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/jobs?limit=5"),
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setRecentJobs(jobsData.data.jobs);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const statCards = [
    {
      title: "Total Jobs",
      value: stats?.totalJobs || 0,
      icon: FileText,
      description: "All-time subtitle jobs",
      color: "text-blue-600",
    },
    {
      title: "Completed",
      value: stats?.completedJobs || 0,
      icon: CheckCircle,
      description: "Successfully processed",
      color: "text-green-600",
    },
    {
      title: "Processing",
      value: stats?.processingJobs || 0,
      icon: Clock,
      description: "Currently in progress",
      color: "text-yellow-600",
    },
    {
      title: "Failed",
      value: stats?.failedJobs || 0,
      icon: XCircle,
      description: "Requires attention",
      color: "text-red-600",
    },
  ];

  const quickActions = [
    {
      title: "New YouTube Job",
      description: "Generate subtitles from YouTube URL",
      icon: Plus,
      href: "/jobs/new?type=youtube",
      color: "bg-red-500",
    },
    {
      title: "Upload File",
      description: "Process video or audio file",
      icon: Plus,
      href: "/jobs/new?type=file",
      color: "bg-blue-500",
    },
    {
      title: "Batch Processing",
      description: "Process multiple files at once",
      icon: Users,
      href: "/jobs/batch",
      color: "bg-purple-500",
    },
    {
      title: "View Analytics",
      description: "Detailed processing insights",
      icon: BarChart3,
      href: "/analytics",
      color: "bg-green-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {session?.user?.name || "User"}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's an overview of your subtitle generation activity
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/jobs/new">
              <Plus className="mr-2 h-5 w-5" />
              New Job
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Usage Progress */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Usage This Month
              </CardTitle>
              <CardDescription>
                Track your monthly quota and remaining credits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Jobs Used: {stats.usageThisMonth}</span>
                <span>Remaining: {stats.remainingQuota}</span>
              </div>
              <Progress
                value={
                  (stats.usageThisMonth /
                    (stats.usageThisMonth + stats.remainingQuota)) *
                  100
                }
                className="h-2"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {stats.averageQualityScore > 0 && (
                    <>
                      Average Quality:{" "}
                      {(stats.averageQualityScore * 100).toFixed(1)}%
                    </>
                  )}
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings/billing">Upgrade Plan</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Start a new subtitle generation job or explore features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link key={action.title} href={action.href}>
                    <div className="group p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-lg ${action.color} text-white`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium group-hover:text-primary transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Jobs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Recent Jobs
                </CardTitle>
                <CardDescription>
                  Your latest subtitle generation jobs
                </CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href="/jobs">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No jobs yet</h3>
                <p className="text-muted-foreground">
                  Create your first subtitle generation job to get started
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/jobs/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Job
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{job.title}</h4>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>{job.inputType.replace("_", " ")}</span>
                        <span>{job.targetLanguages.length} languages</span>
                        {job.duration && (
                          <span>{formatDuration(job.duration)}</span>
                        )}
                      </div>
                      {job.status !== "COMPLETED" &&
                        job.status !== "FAILED" && (
                          <Progress value={job.progress} className="mt-2 h-1" />
                        )}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/jobs/${job.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
