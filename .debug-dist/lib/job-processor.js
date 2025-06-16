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
import { prisma } from "./db";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { translate } from "google-translate-api-x";
var JobProcessor = /** @class */ (function () {
    function JobProcessor() {
        this.processingJobs = new Map();
    }
    JobProcessor.getInstance = function () {
        if (!JobProcessor.instance) {
            JobProcessor.instance = new JobProcessor();
        }
        return JobProcessor.instance;
    };
    JobProcessor.prototype.processJob = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var job, tempDir, audioPath, srt, translatedSrt, srtPath, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 10, , 12]);
                        return [4 /*yield*/, prisma.job.findUnique({
                                where: { id: jobId },
                                include: { jobSettings: true },
                            })];
                    case 1:
                        job = _a.sent();
                        if (!job)
                            throw new Error("Job not found");
                        return [4 /*yield*/, this.updateJobStatus(jobId, "PROCESSING", 0)];
                    case 2:
                        _a.sent();
                        tempDir = path.join(__dirname, "../temp", jobId);
                        return [4 /*yield*/, fs.mkdir(tempDir, { recursive: true })];
                    case 3:
                        _a.sent();
                        if (!job) {
                            throw new Error("Job not found");
                        }
                        if (!job.inputSource) {
                            throw new Error("Invalid job input source or settings");
                        }
                        return [4 /*yield*/, this.downloadAudio(job.inputSource, tempDir, jobId)];
                    case 4:
                        audioPath = _a.sent();
                        return [4 /*yield*/, this.transcribeAudio(audioPath, tempDir, jobId)];
                    case 5:
                        srt = _a.sent();
                        return [4 /*yield*/, this.translateSrt(srt, job.targetLanguages[0])];
                    case 6:
                        translatedSrt = _a.sent();
                        srtPath = path.join(__dirname, "../downloads", "subtitles_".concat(jobId, ".srt"));
                        return [4 /*yield*/, fs.writeFile(srtPath, translatedSrt, "utf-8")];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this.updateJobStatus(jobId, "COMPLETED", 100)];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, this.updateJobEndTime(jobId)];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 10:
                        error_1 = _a.sent();
                        console.error("Job processing error:", error_1);
                        return [4 /*yield*/, this.updateJobStatus(jobId, "FAILED", 0, error_1 instanceof Error ? error_1.message : "Unknown error")];
                    case 11:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    JobProcessor.prototype.downloadAudio = function (videoUrl, outputDir, jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var audioPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.updateJobStatus(jobId, "DOWNLOADING", 10, "Downloading audio...")];
                    case 1:
                        _a.sent();
                        audioPath = path.join(outputDir, "audio.wav");
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var cmd = "yt-dlp -x --audio-format wav -o \"".concat(audioPath, "\" \"").concat(videoUrl, "\"");
                                exec(cmd, function (error) {
                                    if (error) {
                                        return reject("Download failed: ".concat(error.message));
                                    }
                                    resolve(audioPath);
                                });
                            })];
                }
            });
        });
    };
    JobProcessor.prototype.transcribeAudio = function (audioPath, outputDir, jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var srtPath;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.updateJobStatus(jobId, "TRANSCRIBING", 40, "Transcribing audio...")];
                    case 1:
                        _a.sent();
                        srtPath = path.join(outputDir, "output.srt");
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var cmd = "whisper \"".concat(audioPath, "\" --model base --output_format srt --output_dir \"").concat(outputDir, "\"");
                                exec(cmd, function (error) { return __awaiter(_this, void 0, void 0, function () {
                                    var srt, readErr_1;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (error)
                                                    return [2 /*return*/, reject("Transcription failed: ".concat(error.message))];
                                                _a.label = 1;
                                            case 1:
                                                _a.trys.push([1, 3, , 4]);
                                                return [4 /*yield*/, fs.readFile(srtPath, "utf-8")];
                                            case 2:
                                                srt = _a.sent();
                                                return [2 /*return*/, resolve(srt)];
                                            case 3:
                                                readErr_1 = _a.sent();
                                                reject("Reading SRT failed: ".concat(readErr_1.message));
                                                return [3 /*break*/, 4];
                                            case 4: return [2 /*return*/];
                                        }
                                    });
                                }); });
                            })];
                }
            });
        });
    };
    JobProcessor.prototype.translateSrt = function (srtContent, targetLang) {
        return __awaiter(this, void 0, void 0, function () {
            var blocks, translated, _i, blocks_1, block, lines, index, timecode, textLines, original, res, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        blocks = srtContent.trim().split(/\n\s*\n/);
                        translated = [];
                        _i = 0, blocks_1 = blocks;
                        _a.label = 1;
                    case 1:
                        if (!(_i < blocks_1.length)) return [3 /*break*/, 8];
                        block = blocks_1[_i];
                        lines = block.split("\n");
                        if (!(lines.length >= 3)) return [3 /*break*/, 6];
                        index = lines[0], timecode = lines[1], textLines = lines.slice(2);
                        original = textLines.join(" ");
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, translate(original, { to: targetLang })];
                    case 3:
                        res = _a.sent();
                        translated.push("".concat(index, "\n").concat(timecode, "\n").concat(res.text));
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        console.warn("[WARN] Translation failed for block. Keeping original.", err_1);
                        translated.push(block); // fallback to original block
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        translated.push(block);
                        _a.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/, translated.join("\n\n")];
                }
            });
        });
    };
    JobProcessor.prototype.updateJobStatus = function (jobId, status, progress, errorMessage) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.job.update({
                            where: { id: jobId },
                            data: __assign({ status: status, progress: progress, errorMessage: errorMessage }, (status === "PROCESSING" && progress === 0
                                ? { processingStarted: new Date() }
                                : {})),
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    JobProcessor.prototype.updateJobEndTime = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.job.update({
                            where: { id: jobId },
                            data: { processingEnded: new Date() },
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    JobProcessor.prototype.cancelJob = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var timeout;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        timeout = this.processingJobs.get(jobId);
                        if (timeout) {
                            clearTimeout(timeout);
                            this.processingJobs.delete(jobId);
                        }
                        return [4 /*yield*/, this.updateJobStatus(jobId, "CANCELLED", 0)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    JobProcessor.prototype.retryJob = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.job.update({
                            where: { id: jobId },
                            data: {
                                status: "QUEUED",
                                progress: 0,
                                errorMessage: null,
                                processingStarted: null,
                                processingEnded: null,
                            },
                        })];
                    case 1:
                        _a.sent();
                        setTimeout(function () { return _this.processJob(jobId); }, 1000);
                        return [2 /*return*/];
                }
            });
        });
    };
    return JobProcessor;
}());
export { JobProcessor };
export var jobProcessor = JobProcessor.getInstance();
//# sourceMappingURL=job-processor.js.map