
'use client';

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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Youtube, 
  Upload, 
  Link as LinkIcon, 
  Settings, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Languages,
  Mic,
  Globe
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, WHISPER_MODELS, TRANSLATION_PROVIDERS } from '@/lib/types';
import { isValidYouTubeUrl, isValidUrl } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const jobSchema = z.object({
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

type JobFormData = z.infer<typeof jobSchema>;

function NewJobForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);

  const defaultType = searchParams.get('type');

  const form = useForm<JobFormData>({
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const inputType = form.watch('inputType');
  const inputSource = form.watch('inputSource');

  const validateInput = (type: string, source: string) => {
    if (!source) return null;
    
    switch (type) {
      case 'YOUTUBE_URL':
        return isValidYouTubeUrl(source) ? 'valid' : 'invalid';
      case 'OTHER_URL':
        return isValidUrl(source) ? 'valid' : 'invalid';
      default:
        return 'valid';
    }
  };

  const inputValidation = validateInput(inputType, inputSource);

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          targetLanguages: selectedLanguages
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Job created successfully!');
        router.push(`/jobs/${result.data.id}`);
      } else {
        toast.error(result.error || 'Failed to create job');
      }
    } catch (error) {
      toast.error('An error occurred while creating the job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputTypes = [
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold">Create New Subtitle Job</h1>
        <p className="text-muted-foreground mt-2">
          Generate professional subtitles with AI-powered transcription and translation
        </p>
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Input Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Input Source</CardTitle>
                <CardDescription>
                  Choose how you want to provide your video or audio content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="inputType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {inputTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                              <div
                                key={type.value}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                  field.value === type.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                                onClick={() => field.onChange(type.value)}
                              >
                                <div className="flex items-start space-x-3">
                                  <Icon className="h-6 w-6 text-primary mt-1" />
                                  <div className="flex-1">
                                    <h3 className="font-medium">{type.label}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {type.description}
                                    </p>
                                  </div>
                                  {field.value === type.value && (
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Input Source */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Source Details</CardTitle>
                <CardDescription>
                  Provide the source for your content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="inputSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {inputTypes.find(t => t.value === inputType)?.label} Source
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder={inputTypes.find(t => t.value === inputType)?.placeholder}
                            className={inputValidation === 'invalid' ? 'border-red-500' : ''}
                          />
                          {inputValidation === 'valid' && (
                            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                          )}
                          {inputValidation === 'invalid' && (
                            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </FormControl>
                      {inputValidation === 'invalid' && (
                        <FormDescription className="text-red-600">
                          Please enter a valid {inputType === 'YOUTUBE_URL' ? 'YouTube URL' : 'URL'}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter a descriptive title for this job" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Add any additional notes or context for this job"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Target Languages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Languages className="mr-2 h-5 w-5" />
                  Target Languages
                </CardTitle>
                <CardDescription>
                  Select the languages you want subtitles generated for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                      <div
                        key={code}
                        className={`p-2 border rounded cursor-pointer transition-all text-sm ${
                          selectedLanguages.includes(code)
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => {
                          if (selectedLanguages.includes(code)) {
                            setSelectedLanguages(selectedLanguages.filter(l => l !== code));
                          } else {
                            setSelectedLanguages([...selectedLanguages, code]);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{name}</span>
                          {selectedLanguages.includes(code) && (
                            <CheckCircle className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-muted-foreground">Selected:</span>
                      {selectedLanguages.map(code => (
                        <Badge key={code} variant="secondary">
                          {SUPPORTED_LANGUAGES[code as keyof typeof SUPPORTED_LANGUAGES]}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Advanced Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Settings className="mr-2 h-5 w-5" />
                      Advanced Settings
                    </CardTitle>
                    <CardDescription>
                      Fine-tune the processing parameters
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? 'Hide' : 'Show'} Advanced
                  </Button>
                </div>
              </CardHeader>
              {showAdvanced && (
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="settings.whisperModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Whisper Model</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(WHISPER_MODELS).map(([key, model]) => (
                                <SelectItem key={key} value={key}>
                                  {model.name} - {model.size} ({model.accuracy})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Larger models provide better accuracy but take longer to process
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="settings.translationProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Translation Provider</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(TRANSLATION_PROVIDERS).map(([key, provider]) => (
                                <SelectItem key={key} value={key}>
                                  {provider.name} ({provider.quality})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="settings.customVocabulary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Vocabulary (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Enter custom words or phrases (one per line) to improve recognition accuracy"
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Add technical terms, names, or specific vocabulary that might appear in your content
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Submit */}
          <motion.div
            className="flex justify-end space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || selectedLanguages.length === 0}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Job...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Create Subtitle Job
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </Form>
    </div>
  );
}

export default function NewJobPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <NewJobForm />
    </Suspense>
  );
}
