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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Youtube, Upload, Link as LinkIcon, Settings, Loader2, CheckCircle, AlertCircle, Languages, Mic, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, WHISPER_MODELS, TRANSLATION_PROVIDERS } from '@/lib/types';
import { isValidYouTubeUrl, isValidUrl } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
var jobSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
    description: z.string().optional(),
    inputType: z.enum(['YOUTUBE_URL', 'VIDEO_FILE', 'AUDIO_FILE', 'OTHER_URL']),
    inputSource: z.string().min(1, 'Input source is required'),
    targetLanguages: z.array(z.string()).min(1, 'At least one target language is required'),
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
function NewJobForm() {
    var _this = this;
    var _a = useSession(), session = _a.data, status = _a.status;
    var router = useRouter();
    var searchParams = useSearchParams();
    var _b = useState(false), isSubmitting = _b[0], setIsSubmitting = _b[1];
    var _c = useState(false), showAdvanced = _c[0], setShowAdvanced = _c[1];
    var _d = useState(['en']), selectedLanguages = _d[0], setSelectedLanguages = _d[1];
    var defaultType = searchParams.get('type');
    var form = useForm({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            title: '',
            description: '',
            inputType: defaultType === 'youtube' ? 'YOUTUBE_URL' :
                defaultType === 'file' ? 'VIDEO_FILE' : 'YOUTUBE_URL',
            inputSource: '',
            targetLanguages: ['en'],
            settings: {
                whisperModel: 'base',
                enableSpeakerDetection: false,
                translationProvider: 'google',
                enableAutoSync: true,
                qualityThreshold: 0.8,
                maxSegmentLength: 30
            }
        }
    });
    useEffect(function () {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);
    var inputType = form.watch('inputType');
    var inputSource = form.watch('inputSource');
    var validateInput = function (type, source) {
        if (!source)
            return null;
        switch (type) {
            case 'YOUTUBE_URL':
                return isValidYouTubeUrl(source) ? 'valid' : 'invalid';
            case 'OTHER_URL':
                return isValidUrl(source) ? 'valid' : 'invalid';
            default:
                return 'valid';
        }
    };
    var inputValidation = validateInput(inputType, inputSource);
    var onSubmit = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/jobs', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(__assign(__assign({}, data), { targetLanguages: selectedLanguages })),
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    if (response.ok) {
                        toast.success('Job created successfully!');
                        router.push("/jobs/".concat(result.data.id));
                    }
                    else {
                        toast.error(result.error || 'Failed to create job');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    toast.error('An error occurred while creating the job');
                    return [3 /*break*/, 6];
                case 5:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var inputTypes = [
        {
            value: 'YOUTUBE_URL',
            label: 'YouTube URL',
            icon: Youtube,
            description: 'Generate subtitles from YouTube videos',
            placeholder: 'https://www.youtube.com/watch?v=...'
        },
        {
            value: 'VIDEO_FILE',
            label: 'Video File',
            icon: Upload,
            description: 'Upload video files (MP4, AVI, MOV, etc.)',
            placeholder: 'Select or drag video file'
        },
        {
            value: 'AUDIO_FILE',
            label: 'Audio File',
            icon: Mic,
            description: 'Upload audio files (MP3, WAV, M4A, etc.)',
            placeholder: 'Select or drag audio file'
        },
        {
            value: 'OTHER_URL',
            label: 'Other URL',
            icon: LinkIcon,
            description: 'Direct links to video/audio files',
            placeholder: 'https://example.com/video.mp4'
        }
    ];
    if (status === 'loading') {
        return (<div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>);
    }
    if (status === 'unauthenticated') {
        return null;
    }
    return (<div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-3xl font-bold">Create New Subtitle Job</h1>
        <p className="text-muted-foreground mt-2">
          Generate professional subtitles with AI-powered transcription and translation
        </p>
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Input Type Selection */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle>Input Source</CardTitle>
                <CardDescription>
                  Choose how you want to provide your video or audio content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField control={form.control} name="inputType" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormControl>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {inputTypes.map(function (type) {
                    var Icon = type.icon;
                    return (<div key={type.value} className={"p-4 border rounded-lg cursor-pointer transition-all ".concat(field.value === type.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50')} onClick={function () { return field.onChange(type.value); }}>
                                <div className="flex items-start space-x-3">
                                  <Icon className="h-6 w-6 text-primary mt-1"/>
                                  <div className="flex-1">
                                    <h3 className="font-medium">{type.label}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {type.description}
                                    </p>
                                  </div>
                                  {field.value === type.value && (<CheckCircle className="h-5 w-5 text-primary"/>)}
                                </div>
                              </div>);
                })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
              </CardContent>
            </Card>
          </motion.div>

          {/* Input Source */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle>Source Details</CardTitle>
                <CardDescription>
                  Provide the source for your content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="inputSource" render={function (_a) {
            var _b, _c;
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>
                        {(_b = inputTypes.find(function (t) { return t.value === inputType; })) === null || _b === void 0 ? void 0 : _b.label} Source
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input {...field} placeholder={(_c = inputTypes.find(function (t) { return t.value === inputType; })) === null || _c === void 0 ? void 0 : _c.placeholder} className={inputValidation === 'invalid' ? 'border-red-500' : ''}/>
                          {inputValidation === 'valid' && (<CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500"/>)}
                          {inputValidation === 'invalid' && (<AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500"/>)}
                        </div>
                      </FormControl>
                      {inputValidation === 'invalid' && (<FormDescription className="text-red-600">
                          Please enter a valid {inputType === 'YOUTUBE_URL' ? 'YouTube URL' : 'URL'}
                        </FormDescription>)}
                      <FormMessage />
                    </FormItem>);
        }}/>

                <FormField control={form.control} name="title" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter a descriptive title for this job"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>

                <FormField control={form.control} name="description" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Add any additional notes or context for this job" rows={3}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
              </CardContent>
            </Card>
          </motion.div>

          {/* Target Languages */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Languages className="mr-2 h-5 w-5"/>
                  Target Languages
                </CardTitle>
                <CardDescription>
                  Select the languages you want subtitles generated for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Object.entries(SUPPORTED_LANGUAGES).map(function (_a) {
            var code = _a[0], name = _a[1];
            return (<div key={code} className={"p-2 border rounded cursor-pointer transition-all text-sm ".concat(selectedLanguages.includes(code)
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50')} onClick={function () {
                    if (selectedLanguages.includes(code)) {
                        setSelectedLanguages(selectedLanguages.filter(function (l) { return l !== code; }));
                    }
                    else {
                        setSelectedLanguages(__spreadArray(__spreadArray([], selectedLanguages, true), [code], false));
                    }
                }}>
                        <div className="flex items-center justify-between">
                          <span>{name}</span>
                          {selectedLanguages.includes(code) && (<CheckCircle className="h-3 w-3"/>)}
                        </div>
                      </div>);
        })}
                  </div>
                  
                  {selectedLanguages.length > 0 && (<div className="flex flex-wrap gap-2">
                      <span className="text-sm text-muted-foreground">Selected:</span>
                      {selectedLanguages.map(function (code) { return (<Badge key={code} variant="secondary">
                          {SUPPORTED_LANGUAGES[code]}
                        </Badge>); })}
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Advanced Settings */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Settings className="mr-2 h-5 w-5"/>
                      Advanced Settings
                    </CardTitle>
                    <CardDescription>
                      Fine-tune the processing parameters
                    </CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={function () { return setShowAdvanced(!showAdvanced); }}>
                    {showAdvanced ? 'Hide' : 'Show'} Advanced
                  </Button>
                </div>
              </CardHeader>
              {showAdvanced && (<CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="settings.whisperModel" render={function (_a) {
                var field = _a.field;
                return (<FormItem>
                          <FormLabel>Whisper Model</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select model"/>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(WHISPER_MODELS).map(function (_a) {
                        var key = _a[0], model = _a[1];
                        return (<SelectItem key={key} value={key}>
                                  {model.name} - {model.size} ({model.accuracy})
                                </SelectItem>);
                    })}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Larger models provide better accuracy but take longer to process
                          </FormDescription>
                          <FormMessage />
                        </FormItem>);
            }}/>

                    <FormField control={form.control} name="settings.translationProvider" render={function (_a) {
                var field = _a.field;
                return (<FormItem>
                          <FormLabel>Translation Provider</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select provider"/>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(TRANSLATION_PROVIDERS).map(function (_a) {
                        var key = _a[0], provider = _a[1];
                        return (<SelectItem key={key} value={key}>
                                  {provider.name} ({provider.quality})
                                </SelectItem>);
                    })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>);
            }}/>
                  </div>

                  <FormField control={form.control} name="settings.customVocabulary" render={function (_a) {
                var field = _a.field;
                return (<FormItem>
                        <FormLabel>Custom Vocabulary (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter custom words or phrases (one per line) to improve recognition accuracy" rows={3}/>
                        </FormControl>
                        <FormDescription>
                          Add technical terms, names, or specific vocabulary that might appear in your content
                        </FormDescription>
                        <FormMessage />
                      </FormItem>);
            }}/>
                </CardContent>)}
            </Card>
          </motion.div>

          {/* Submit */}
          <motion.div className="flex justify-end space-x-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
            <Button type="button" variant="outline" onClick={function () { return router.back(); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || selectedLanguages.length === 0} size="lg">
              {isSubmitting ? (<>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  Creating Job...
                </>) : (<>
                  <Globe className="mr-2 h-4 w-4"/>
                  Create Subtitle Job
                </>)}
            </Button>
          </motion.div>
        </form>
      </Form>
    </div>);
}
export default function NewJobPage() {
    return (<Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>}>
      <NewJobForm />
    </Suspense>);
}
//# sourceMappingURL=page.jsx.map