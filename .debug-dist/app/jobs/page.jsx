'use client';
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Search, Filter, MoreHorizontal, Eye, Download, Trash2, RefreshCw, Calendar, Clock, FileText } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { formatDate, formatDuration, getStatusColor } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
export default function JobsPage() {
    var _this = this;
    var _a = useSession(), session = _a.data, status = _a.status;
    var router = useRouter();
    var _b = useState([]), jobs = _b[0], setJobs = _b[1];
    var _c = useState(true), isLoading = _c[0], setIsLoading = _c[1];
    var _d = useState(''), searchTerm = _d[0], setSearchTerm = _d[1];
    var _e = useState('all'), statusFilter = _e[0], setStatusFilter = _e[1];
    var _f = useState(1), page = _f[0], setPage = _f[1];
    var _g = useState(1), totalPages = _g[0], setTotalPages = _g[1];
    useEffect(function () {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }
        if (status === 'authenticated') {
            fetchJobs();
        }
    }, [status, router, page, statusFilter]);
    var fetchJobs = function () { return __awaiter(_this, void 0, void 0, function () {
        var params, response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, 5, 6]);
                    params = new URLSearchParams(__assign({ page: page.toString(), limit: '10' }, (statusFilter !== 'all' && { status: statusFilter })));
                    return [4 /*yield*/, fetch("/api/jobs?".concat(params))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setJobs(data.data.jobs);
                    setTotalPages(data.data.pagination.pages);
                    _a.label = 3;
                case 3: return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error('Failed to fetch jobs:', error_1);
                    toast.error('Failed to load jobs');
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteJob = function (jobId) { return __awaiter(_this, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Are you sure you want to delete this job?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetch("/api/jobs/".concat(jobId), {
                            method: 'DELETE'
                        })];
                case 2:
                    response = _a.sent();
                    if (response.ok) {
                        toast.success('Job deleted successfully');
                        fetchJobs();
                    }
                    else {
                        toast.error('Failed to delete job');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    toast.error('Failed to delete job');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleRetryJob = function (jobId) { return __awaiter(_this, void 0, void 0, function () {
        var response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("/api/jobs/".concat(jobId, "/retry"), {
                            method: 'POST'
                        })];
                case 1:
                    response = _a.sent();
                    if (response.ok) {
                        toast.success('Job retry initiated');
                        fetchJobs();
                    }
                    else {
                        toast.error('Failed to retry job');
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    toast.error('Failed to retry job');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var filteredJobs = jobs.filter(function (job) {
        return job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.inputSource.toLowerCase().includes(searchTerm.toLowerCase());
    });
    if (status === 'loading' || isLoading) {
        return (<div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>);
    }
    if (status === 'unauthenticated') {
        return null;
    }
    return (<div className="space-y-6">
      {/* Header */}
      <motion.div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div>
          <h1 className="text-3xl font-bold">Subtitle Jobs</h1>
          <p className="text-muted-foreground">
            Manage and monitor your subtitle generation jobs
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/jobs/new">
            <Plus className="mr-2 h-5 w-5"/>
            New Job
          </Link>
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div className="flex flex-col md:flex-row gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <Input placeholder="Search jobs..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-10"/>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4"/>
              Status: {statusFilter === 'all' ? 'All' : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={function () { return setStatusFilter('all'); }}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={function () { return setStatusFilter('COMPLETED'); }}>
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={function () { return setStatusFilter('PROCESSING'); }}>
              Processing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={function () { return setStatusFilter('FAILED'); }}>
              Failed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={function () { return setStatusFilter('QUEUED'); }}>
              Queued
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Jobs List */}
      <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
        {filteredJobs.length === 0 ? (<Card>
            <CardContent className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground"/>
              <h3 className="mt-4 text-lg font-medium">No jobs found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first subtitle generation job'}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/jobs/new">
                  <Plus className="mr-2 h-4 w-4"/>
                  Create Job
                </Link>
              </Button>
            </CardContent>
          </Card>) : (filteredJobs.map(function (job, index) { return (<motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}>
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
                          <Calendar className="mr-1 h-3 w-3"/>
                          {formatDate(new Date(job.createdAt))}
                        </span>
                        <span>{job.inputType.replace('_', ' ')}</span>
                        <span>{job.targetLanguages.length} languages</span>
                        {job.duration && (<span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3"/>
                            {formatDuration(job.duration)}
                          </span>)}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={"/jobs/".concat(job.id)}>
                            <Eye className="mr-2 h-4 w-4"/>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {job.status === 'COMPLETED' && job.subtitles && job.subtitles.length > 0 && (<DropdownMenuItem asChild>
                            <Link href={"/api/subtitles/".concat(job.subtitles[0].id, "/download")}>
                              <Download className="mr-2 h-4 w-4"/>
                              Download
                            </Link>
                          </DropdownMenuItem>)}
                        {job.status === 'FAILED' && (<DropdownMenuItem onClick={function () { return handleRetryJob(job.id); }}>
                            <RefreshCw className="mr-2 h-4 w-4"/>
                            Retry
                          </DropdownMenuItem>)}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={function () { return handleDeleteJob(job.id); }} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4"/>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Source:</span> {job.inputSource}
                    </div>
                    {job.description && (<div className="text-sm text-muted-foreground">
                        <span className="font-medium">Description:</span> {job.description}
                      </div>)}
                    {job.status !== 'COMPLETED' && job.status !== 'FAILED' && job.status !== 'CANCELLED' && (<div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2"/>
                      </div>)}
                    {job.errorMessage && (<div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        <span className="font-medium">Error:</span> {job.errorMessage}
                      </div>)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>); }))}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (<motion.div className="flex justify-center space-x-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <Button variant="outline" onClick={function () { return setPage(page - 1); }} disabled={page === 1}>
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" onClick={function () { return setPage(page + 1); }} disabled={page === totalPages}>
            Next
          </Button>
        </motion.div>)}
    </div>);
}
//# sourceMappingURL=page.jsx.map