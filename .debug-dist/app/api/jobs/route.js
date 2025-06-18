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
export var dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { jobProcessor } from '@/lib/job-processor';
import { publishToExchange } from '@/lib/rabbitmq-client'; // Assuming rabbitmq-client.js is in lib
import { z } from 'zod';
import { generateJobTitle } from '@/lib/utils';
var createJobSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    inputType: z.enum(['YOUTUBE_URL', 'VIDEO_FILE', 'AUDIO_FILE', 'OTHER_URL']),
    inputSource: z.string().min(1, 'Input source is required'),
    targetLanguages: z.array(z.string()).min(1, 'At least one target language is required'),
    projectId: z.string().optional(),
    settings: z.object({
        whisperModel: z.enum(['tiny', 'base', 'small', 'medium', 'large']).optional(),
        enableSpeakerDetection: z.boolean().optional(),
        customVocabulary: z.string().optional(),
        translationProvider: z.enum(['google', 'deepl', 'azure']).optional(),
        enableAutoSync: z.boolean().optional(),
        qualityThreshold: z.number().min(0).max(1).optional(),
        maxSegmentLength: z.number().min(1).max(300).optional()
    }).optional()
});
export function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var session, body, data, user, title, job_1, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, getServerSession(authOptions)];
                case 1:
                    session = _b.sent();
                    if (!((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.id)) {
                        return [2 /*return*/, NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 2:
                    body = _b.sent();
                    data = createJobSchema.parse(body);
                    return [4 /*yield*/, prisma.user.findUnique({
                            where: { id: session.user.id }
                        })];
                case 3:
                    user = _b.sent();
                    if (!user) {
                        return [2 /*return*/, NextResponse.json({ error: 'User not found' }, { status: 404 })];
                    }
                    if (user.usageCount >= user.usageLimit) {
                        return [2 /*return*/, NextResponse.json({ error: 'Usage limit exceeded. Please upgrade your plan.' }, { status: 403 })];
                    }
                    title = data.title || generateJobTitle(data.inputSource, data.inputType);
                    return [4 /*yield*/, prisma.job.create({
                            data: {
                                userId: session.user.id,
                                title: title,
                                description: data.description,
                                inputType: data.inputType,
                                inputSource: data.inputSource,
                                targetLanguages: data.targetLanguages,
                                projectId: data.projectId,
                                jobSettings: data.settings ? {
                                    create: {
                                        whisperModel: data.settings.whisperModel || 'base',
                                        enableSpeakerDetection: data.settings.enableSpeakerDetection || false,
                                        customVocabulary: data.settings.customVocabulary,
                                        translationProvider: data.settings.translationProvider || 'google',
                                        enableAutoSync: data.settings.enableAutoSync !== false,
                                        qualityThreshold: data.settings.qualityThreshold || 0.8,
                                        maxSegmentLength: data.settings.maxSegmentLength || 30
                                    }
                                } : undefined
                            },
                            include: {
                                jobSettings: true,
                                subtitles: true
                            }
                        })];
                case 4:
                    job_1 = _b.sent();
                    // Update user usage count
                    return [4 /*yield*/, prisma.user.update({
                            where: { id: session.user.id },
                            data: { usageCount: { increment: 1 } }
                        })];
                case 5:
                    // Update user usage count
                    _b.sent();
                    // Publish job to RabbitMQ
                    try {
                        await publishToExchange('jobs_exchange', 'subtitle.new', { jobId: job_1.id });
                    }
                    catch (mqError) {
                        console.error("Failed to publish job to RabbitMQ:", mqError);
                        // Potentially mark job as needing attention or return an error
                    }
                    return [2 /*return*/, NextResponse.json({
                            success: true,
                            data: job_1
                        })];
                case 6:
                    error_1 = _b.sent();
                    console.error('Create job error:', error_1);
                    if (error_1 instanceof z.ZodError) {
                        return [2 /*return*/, NextResponse.json({ error: error_1.errors[0].message }, { status: 400 })];
                    }
                    return [2 /*return*/, NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
export function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var session, searchParams, page, limit, status_1, projectId, where, _a, jobs, total, error_2;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getServerSession(authOptions)];
                case 1:
                    session = _c.sent();
                    if (!((_b = session === null || session === void 0 ? void 0 : session.user) === null || _b === void 0 ? void 0 : _b.id)) {
                        return [2 /*return*/, NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    searchParams = new URL(request.url).searchParams;
                    page = parseInt(searchParams.get('page') || '1');
                    limit = parseInt(searchParams.get('limit') || '10');
                    status_1 = searchParams.get('status');
                    projectId = searchParams.get('projectId');
                    where = {
                        userId: session.user.id
                    };
                    if (status_1) {
                        where.status = status_1;
                    }
                    if (projectId) {
                        where.projectId = projectId;
                    }
                    return [4 /*yield*/, Promise.all([
                            prisma.job.findMany({
                                where: where,
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
                                },
                                orderBy: { createdAt: 'desc' },
                                skip: (page - 1) * limit,
                                take: limit
                            }),
                            prisma.job.count({ where: where })
                        ])];
                case 2:
                    _a = _c.sent(), jobs = _a[0], total = _a[1];
                    return [2 /*return*/, NextResponse.json({
                            success: true,
                            data: {
                                jobs: jobs,
                                pagination: {
                                    page: page,
                                    limit: limit,
                                    total: total,
                                    pages: Math.ceil(total / limit)
                                }
                            }
                        })];
                case 3:
                    error_2 = _c.sent();
                    console.error('Get jobs error:', error_2);
                    return [2 /*return*/, NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=route.js.map