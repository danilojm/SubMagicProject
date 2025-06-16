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
export function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var session, userId, now, startOfMonth, user, _a, totalJobs, completedJobs, processingJobs, failedJobs, usageThisMonth, avgQualityScore, totalProcessingTime, stats, error_1;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, getServerSession(authOptions)];
                case 1:
                    session = _e.sent();
                    if (!((_b = session === null || session === void 0 ? void 0 : session.user) === null || _b === void 0 ? void 0 : _b.id)) {
                        return [2 /*return*/, NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    userId = session.user.id;
                    now = new Date();
                    startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    return [4 /*yield*/, prisma.user.findUnique({
                            where: { id: userId },
                            select: {
                                usageCount: true,
                                usageLimit: true
                            }
                        })];
                case 2:
                    user = _e.sent();
                    return [4 /*yield*/, Promise.all([
                            prisma.job.count({
                                where: { userId: userId }
                            }),
                            prisma.job.count({
                                where: { userId: userId, status: 'COMPLETED' }
                            }),
                            prisma.job.count({
                                where: {
                                    userId: userId,
                                    status: {
                                        in: ['QUEUED', 'PROCESSING', 'DOWNLOADING', 'TRANSCRIBING', 'TRANSLATING', 'GENERATING']
                                    }
                                }
                            }),
                            prisma.job.count({
                                where: { userId: userId, status: 'FAILED' }
                            }),
                            prisma.job.count({
                                where: {
                                    userId: userId,
                                    createdAt: { gte: startOfMonth }
                                }
                            }),
                            prisma.jobAnalytics.aggregate({
                                where: {
                                    job: { userId: userId }
                                },
                                _avg: {
                                    qualityScore: true
                                }
                            }),
                            prisma.jobAnalytics.aggregate({
                                where: {
                                    job: { userId: userId }
                                },
                                _sum: {
                                    totalProcessingTime: true
                                }
                            })
                        ])];
                case 3:
                    _a = _e.sent(), totalJobs = _a[0], completedJobs = _a[1], processingJobs = _a[2], failedJobs = _a[3], usageThisMonth = _a[4], avgQualityScore = _a[5], totalProcessingTime = _a[6];
                    stats = {
                        totalJobs: totalJobs,
                        completedJobs: completedJobs,
                        processingJobs: processingJobs,
                        failedJobs: failedJobs,
                        totalProcessingTime: ((_c = totalProcessingTime._sum) === null || _c === void 0 ? void 0 : _c.totalProcessingTime) || 0,
                        averageQualityScore: ((_d = avgQualityScore._avg) === null || _d === void 0 ? void 0 : _d.qualityScore) || 0,
                        usageThisMonth: usageThisMonth,
                        remainingQuota: ((user === null || user === void 0 ? void 0 : user.usageLimit) || 0) - ((user === null || user === void 0 ? void 0 : user.usageCount) || 0)
                    };
                    return [2 /*return*/, NextResponse.json({
                            success: true,
                            data: stats
                        })];
                case 4:
                    error_1 = _e.sent();
                    console.error('Get dashboard stats error:', error_1);
                    return [2 /*return*/, NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=route.js.map