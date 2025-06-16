'use client';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Clock, CheckCircle, XCircle, TrendingUp, Users, Zap, BarChart3, Activity } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDuration, getStatusColor } from '@/lib/utils';
export default function DashboardPage() {
    var _this = this;
    var _a;
    var _b = useSession(), session = _b.data, status = _b.status;
    var router = useRouter();
    var _c = useState(null), stats = _c[0], setStats = _c[1];
    var _d = useState([]), recentJobs = _d[0], setRecentJobs = _d[1];
    var _e = useState(true), isLoading = _e[0], setIsLoading = _e[1];
    useEffect(function () {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }
        if (status === 'authenticated') {
            fetchDashboardData();
        }
    }, [status, router]);
    var fetchDashboardData = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, statsResponse, jobsResponse, statsData, jobsData, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, 7, 8]);
                    return [4 /*yield*/, Promise.all([
                            fetch('/api/dashboard/stats'),
                            fetch('/api/jobs?limit=5')
                        ])];
                case 1:
                    _a = _b.sent(), statsResponse = _a[0], jobsResponse = _a[1];
                    if (!statsResponse.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, statsResponse.json()];
                case 2:
                    statsData = _b.sent();
                    setStats(statsData.data);
                    _b.label = 3;
                case 3:
                    if (!jobsResponse.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, jobsResponse.json()];
                case 4:
                    jobsData = _b.sent();
                    setRecentJobs(jobsData.data.jobs);
                    _b.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    error_1 = _b.sent();
                    console.error('Failed to fetch dashboard data:', error_1);
                    return [3 /*break*/, 8];
                case 7:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    if (status === 'loading' || isLoading) {
        return (<div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>);
    }
    if (status === 'unauthenticated') {
        return null;
    }
    var statCards = [
        {
            title: 'Total Jobs',
            value: (stats === null || stats === void 0 ? void 0 : stats.totalJobs) || 0,
            icon: FileText,
            description: 'All-time subtitle jobs',
            color: 'text-blue-600'
        },
        {
            title: 'Completed',
            value: (stats === null || stats === void 0 ? void 0 : stats.completedJobs) || 0,
            icon: CheckCircle,
            description: 'Successfully processed',
            color: 'text-green-600'
        },
        {
            title: 'Processing',
            value: (stats === null || stats === void 0 ? void 0 : stats.processingJobs) || 0,
            icon: Clock,
            description: 'Currently in progress',
            color: 'text-yellow-600'
        },
        {
            title: 'Failed',
            value: (stats === null || stats === void 0 ? void 0 : stats.failedJobs) || 0,
            icon: XCircle,
            description: 'Requires attention',
            color: 'text-red-600'
        }
    ];
    var quickActions = [
        {
            title: 'New YouTube Job',
            description: 'Generate subtitles from YouTube URL',
            icon: Plus,
            href: '/jobs/new?type=youtube',
            color: 'bg-red-500'
        },
        {
            title: 'Upload File',
            description: 'Process video or audio file',
            icon: Plus,
            href: '/jobs/new?type=file',
            color: 'bg-blue-500'
        },
        {
            title: 'Batch Processing',
            description: 'Process multiple files at once',
            icon: Users,
            href: '/jobs/batch',
            color: 'bg-purple-500'
        },
        {
            title: 'View Analytics',
            description: 'Detailed processing insights',
            icon: BarChart3,
            href: '/analytics',
            color: 'bg-green-500'
        }
    ];
    return (<div className="space-y-8">
      {/* Welcome Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.name) || 'User'}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's an overview of your subtitle generation activity
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/jobs/new">
              <Plus className="mr-2 h-5 w-5"/>
              New Job
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
        {statCards.map(function (stat, index) {
            var Icon = stat.icon;
            return (<Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={"h-4 w-4 ".concat(stat.color)}/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>);
        })}
      </motion.div>

      {/* Usage Progress */}
      {stats && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5"/>
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
              <Progress value={(stats.usageThisMonth / (stats.usageThisMonth + stats.remainingQuota)) * 100} className="h-2"/>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {stats.averageQualityScore > 0 && (<>Average Quality: {(stats.averageQualityScore * 100).toFixed(1)}%</>)}
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings/billing">Upgrade Plan</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>)}

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5"/>
              Quick Actions
            </CardTitle>
            <CardDescription>
              Start a new subtitle generation job or explore features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map(function (action, index) {
            var Icon = action.icon;
            return (<Link key={action.title} href={action.href}>
                    <div className="group p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className={"p-2 rounded-lg ".concat(action.color, " text-white")}>
                          <Icon className="h-4 w-4"/>
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
                  </Link>);
        })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Jobs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5"/>
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
            {recentJobs.length === 0 ? (<div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground"/>
                <h3 className="mt-4 text-lg font-medium">No jobs yet</h3>
                <p className="text-muted-foreground">
                  Create your first subtitle generation job to get started
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/jobs/new">
                    <Plus className="mr-2 h-4 w-4"/>
                    Create Job
                  </Link>
                </Button>
              </div>) : (<div className="space-y-4">
                {recentJobs.map(function (job) { return (<div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{job.title}</h4>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>{job.inputType.replace('_', ' ')}</span>
                        <span>{job.targetLanguages.length} languages</span>
                        {job.duration && (<span>{formatDuration(job.duration)}</span>)}
                      </div>
                      {job.status !== 'COMPLETED' && job.status !== 'FAILED' && (<Progress value={job.progress} className="mt-2 h-1"/>)}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={"/jobs/".concat(job.id)}>View</Link>
                    </Button>
                  </div>); })}
              </div>)}
          </CardContent>
        </Card>
      </motion.div>
    </div>);
}
//# sourceMappingURL=page.jsx.map