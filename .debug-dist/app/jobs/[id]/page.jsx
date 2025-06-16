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
import { useEffect, useState, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, RefreshCw, Trash2, Clock, Calendar, FileText, Languages, Settings, BarChart3, AlertCircle, CheckCircle, Loader2, Eye } from 'lucide-react';
import { formatDate, formatDuration, getStatusColor, formatFileSize } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
export default function JobDetailPage(_a) {
    var _this = this;
    var params = _a.params;
    var _b = useSession(), session = _b.data, status = _b.status;
    var router = useRouter();
    var _c = useState(null), job = _c[0], setJob = _c[1];
    var _d = useState(true), isLoading = _d[0], setIsLoading = _d[1];
    var _e = useState(false), isRetrying = _e[0], setIsRetrying = _e[1];
    var _f = useState(false), isDeleting = _f[0], setIsDeleting = _f[1];
    var id = use(params).id;
    useEffect(function () {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }
        if (status === 'authenticated') {
            fetchJob();
            // Set up polling for active jobs
            var interval_1 = setInterval(function () {
                if (job && ['QUEUED', 'PROCESSING', 'DOWNLOADING', 'TRANSCRIBING', 'TRANSLATING', 'GENERATING'].includes(job.status)) {
                    fetchJob();
                }
            }, 2000);
            return function () { return clearInterval(interval_1); };
        }
    }, [status, router, id]);
    var fetchJob = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, 6, 7]);
                    return [4 /*yield*/, fetch("/api/jobs/".concat(id))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setJob(data.data);
                    return [3 /*break*/, 4];
                case 3:
                    if (response.status === 404) {
                        toast.error('Job not found');
                        router.push('/jobs');
                    }
                    _a.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    console.error('Failed to fetch job:', error_1);
                    toast.error('Failed to load job details');
                    return [3 /*break*/, 7];
                case 6:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleRetry = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!job)
                        return [2 /*return*/];
                    setIsRetrying(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, fetch("/api/jobs/".concat(job.id, "/retry"), {
                            method: 'POST'
                        })];
                case 2:
                    response = _a.sent();
                    if (response.ok) {
                        toast.success('Job retry initiated');
                        fetchJob();
                    }
                    else {
                        toast.error('Failed to retry job');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    toast.error('Failed to retry job');
                    return [3 /*break*/, 5];
                case 4:
                    setIsRetrying(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!job || !confirm('Are you sure you want to delete this job? This action cannot be undone.'))
                        return [2 /*return*/];
                    setIsDeleting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, fetch("/api/jobs/".concat(job.id), {
                            method: 'DELETE'
                        })];
                case 2:
                    response = _a.sent();
                    if (response.ok) {
                        toast.success('Job deleted successfully');
                        router.push('/jobs');
                    }
                    else {
                        toast.error('Failed to delete job');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
                    toast.error('Failed to delete job');
                    return [3 /*break*/, 5];
                case 4:
                    setIsDeleting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (status === 'loading' || isLoading) {
        return (<div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>);
    }
    if (status === 'unauthenticated' || !job) {
        return null;
    }
    var isProcessing = ['QUEUED', 'PROCESSING', 'DOWNLOADING', 'TRANSCRIBING', 'TRANSLATING', 'GENERATING'].includes(job.status);
    var isCompleted = job.status === 'COMPLETED';
    var isFailed = job.status === 'FAILED';
    return (<div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div className="flex items-center justify-between" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4"/>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <p className="text-muted-foreground">Job ID: {job.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isFailed && (<Button onClick={handleRetry} disabled={isRetrying}>
              {isRetrying ? (<Loader2 className="mr-2 h-4 w-4 animate-spin"/>) : (<RefreshCw className="mr-2 h-4 w-4"/>)}
              Retry
            </Button>)}
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (<Loader2 className="mr-2 h-4 w-4 animate-spin"/>) : (<Trash2 className="mr-2 h-4 w-4"/>)}
            Delete
          </Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin"/>}
                    {isCompleted && <CheckCircle className="mr-2 h-5 w-5 text-green-500"/>}
                    {isFailed && <AlertCircle className="mr-2 h-5 w-5 text-red-500"/>}
                    Job Status
                  </CardTitle>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isProcessing && (<div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} className="h-2"/>
                  </div>)}
                
                {job.errorMessage && (<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Error:</strong> {job.errorMessage}
                    </p>
                  </div>)}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground"/>
                    <span>Created: {formatDate(new Date(job.createdAt))}</span>
                  </div>
                  {job.processingStarted && (<div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground"/>
                      <span>Started: {formatDate(new Date(job.processingStarted))}</span>
                    </div>)}
                  {job.processingEnded && (<div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground"/>
                      <span>Completed: {formatDate(new Date(job.processingEnded))}</span>
                    </div>)}
                  {job.duration && (<div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground"/>
                      <span>Duration: {formatDuration(job.duration)}</span>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Transcription */}
          {job.transcriptionText && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5"/>
                    Transcription
                  </CardTitle>
                  <CardDescription>
                    Original transcribed text from the audio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{job.transcriptionText}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>)}

          {/* Subtitles */}
          {job.subtitles && job.subtitles.length > 0 && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Languages className="mr-2 h-5 w-5"/>
                    Generated Subtitles
                  </CardTitle>
                  <CardDescription>
                    Download or preview your generated subtitle files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {job.subtitles.map(function (subtitle) { return (<div key={subtitle.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium">
                              {subtitle.language.toUpperCase()} - {subtitle.format}
                            </h4>
                            <Badge variant="outline">
                              {subtitle.downloadCount} downloads
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {subtitle.fileSize && formatFileSize(subtitle.fileSize)} • 
                            Created {formatDate(new Date(subtitle.createdAt))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4"/>
                            Preview
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={"/api/subtitles/".concat(subtitle.id, "/download")}>
                              <Download className="mr-2 h-4 w-4"/>
                              Download
                            </Link>
                          </Button>
                        </div>
                      </div>); })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>)}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Input Type</Label>
                  <p className="text-sm text-muted-foreground">{job.inputType.replace('_', ' ')}</p>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium">Source</Label>
                  <p className="text-sm text-muted-foreground break-all">{job.inputSource}</p>
                </div>
                
                {job.description && (<>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground">{job.description}</p>
                    </div>
                  </>)}
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium">Target Languages</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {job.targetLanguages.map(function (lang) { return (<Badge key={lang} variant="secondary" className="text-xs">
                        {lang.toUpperCase()}
                      </Badge>); })}
                  </div>
                </div>
                
                {job.originalFileName && (<>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium">Original File</Label>
                      <p className="text-sm text-muted-foreground">{job.originalFileName}</p>
                    </div>
                  </>)}
                
                {job.fileSize && (<>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium">File Size</Label>
                      <p className="text-sm text-muted-foreground">{formatFileSize(job.fileSize)}</p>
                    </div>
                  </>)}
              </CardContent>
            </Card>
          </motion.div>

          {/* Job Settings */}
          {job.jobSettings && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-4 w-4"/>
                    Processing Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Whisper Model</span>
                    <span className="text-sm font-medium">{job.jobSettings.whisperModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Translation Provider</span>
                    <span className="text-sm font-medium">{job.jobSettings.translationProvider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Speaker Detection</span>
                    <span className="text-sm font-medium">
                      {job.jobSettings.enableSpeakerDetection ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Auto Sync</span>
                    <span className="text-sm font-medium">
                      {job.jobSettings.enableAutoSync ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Quality Threshold</span>
                    <span className="text-sm font-medium">{(job.jobSettings.qualityThreshold * 100).toFixed(0)}%</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>)}

          {/* Analytics */}
          {job.analytics && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4"/>
                    Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {job.analytics.transcriptionTime && (<div className="flex justify-between">
                      <span className="text-sm">Transcription Time</span>
                      <span className="text-sm font-medium">
                        {(job.analytics.transcriptionTime / 1000).toFixed(1)}s
                      </span>
                    </div>)}
                  {job.analytics.translationTime && (<div className="flex justify-between">
                      <span className="text-sm">Translation Time</span>
                      <span className="text-sm font-medium">
                        {(job.analytics.translationTime / 1000).toFixed(1)}s
                      </span>
                    </div>)}
                  {job.analytics.totalProcessingTime && (<div className="flex justify-between">
                      <span className="text-sm">Total Processing</span>
                      <span className="text-sm font-medium">
                        {(job.analytics.totalProcessingTime / 1000).toFixed(1)}s
                      </span>
                    </div>)}
                  {job.analytics.qualityScore && (<div className="flex justify-between">
                      <span className="text-sm">Quality Score</span>
                      <span className="text-sm font-medium">
                        {(job.analytics.qualityScore * 100).toFixed(1)}%
                      </span>
                    </div>)}
                  {job.analytics.wordCount && (<div className="flex justify-between">
                      <span className="text-sm">Word Count</span>
                      <span className="text-sm font-medium">{job.analytics.wordCount}</span>
                    </div>)}
                  {job.analytics.segmentCount && (<div className="flex justify-between">
                      <span className="text-sm">Segments</span>
                      <span className="text-sm font-medium">{job.analytics.segmentCount}</span>
                    </div>)}
                </CardContent>
              </Card>
            </motion.div>)}
        </div>
      </div>
    </div>);
}
function Label(_a) {
    var children = _a.children, className = _a.className;
    return <label className={className}>{children}</label>;
}
//# sourceMappingURL=page.jsx.map