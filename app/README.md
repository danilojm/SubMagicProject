# Professional Subtitle Generator

A comprehensive, AI-powered subtitle generation platform built with Next.js 14, featuring advanced transcription, multi-language translation, and professional editing tools.

## 🚀 Features

### Core Functionality

- **Multi-Source Input Support**: YouTube URLs, direct file uploads, other video URLs
- **AI-Powered Transcription**: OpenAI Whisper integration with multiple model options
- **Multi-Language Translation**: Support for 40+ languages with multiple providers
- **Real-Time Processing**: Live progress tracking with WebSocket updates
- **Professional Export**: Multiple subtitle formats (SRT, VTT, ASS, SSA, TTML)

### Advanced Features

- **User Authentication**: Secure login/registration with NextAuth.js
- **Job Management**: Complete job lifecycle with history and analytics
- **Project Organization**: Group related jobs into projects
- **Advanced Settings**: Custom vocabulary, speaker detection, quality thresholds
- **Analytics Dashboard**: Processing metrics and quality scoring
- **Responsive Design**: Modern UI with dark/light theme support

### Professional Tools

- **Batch Processing**: Handle multiple files simultaneously
- **Collaborative Editing**: Team-based subtitle editing (planned)
- **API Access**: RESTful API for integration
- **Usage Tracking**: Quota management and billing integration
- **Quality Control**: Automated quality scoring and validation

## 🛠 Technology Stack

### Frontend

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations and transitions
- **Radix UI**: Accessible component primitives
- **React Hook Form**: Form management with validation

### Backend

- **Next.js API Routes**: Serverless API endpoints
- **NextAuth.js**: Authentication and session management
- **Prisma**: Type-safe database ORM
- **PostgreSQL**: Robust relational database
- **bcryptjs**: Password hashing and security

### AI/ML Integration (Mocked)

- **OpenAI Whisper**: Speech-to-text transcription
- **Google Translate**: Multi-language translation
- **DeepL**: Premium translation service
- **Azure Translator**: Enterprise translation

## 📋 Database Schema

The application uses a comprehensive PostgreSQL schema with the following key models:

- **User**: Authentication and profile management
- **Job**: Subtitle generation jobs with status tracking
- **JobSettings**: Advanced processing configurations
- **JobAnalytics**: Performance metrics and quality scores
- **Subtitle**: Generated subtitle files with metadata
- **Project**: Organization and collaboration features

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd professional-subtitle-generator
   ```

2. **Install dependencies**

   ```bash
   cd app
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Configure your database URL and other settings
   ```

4. **Initialize the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Create demo user** (optional)

   ```bash
   node scripts/create-demo-user.js
   ```

6. **Start development server**
   ```bash
   yarn dev
   ```

### Demo Account

- **Email**: demo@submagic.com
- **Password**: demo123

## 📁 Project Structure

```
professional-subtitle-generator/
├── app/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── jobs/              # Job management pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   │   ├── ui/               # UI component library
│   │   ├── header.tsx        # Navigation header
│   │   └── theme-provider.tsx # Theme management
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts           # Authentication config
│   │   ├── db.ts             # Database connection
│   │   ├── types.ts          # TypeScript definitions
│   │   ├── utils.ts          # Helper functions
│   │   └── job-processor.ts  # Job processing logic
│   ├── prisma/               # Database schema
│   │   └── schema.prisma     # Prisma schema
│   └── package.json          # Dependencies
└── README.md                 # This file
```

## 🔧 Configuration

### Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Prisma Configuration

The database schema supports:

- User authentication and authorization
- Job processing with real-time status updates
- Multi-language subtitle generation
- Analytics and usage tracking
- Project organization and collaboration

## 🎯 Usage

### Creating a Subtitle Job

1. **Sign in** to your account or use the demo credentials
2. **Navigate** to "New Job" from the dashboard
3. **Select input type**: YouTube URL, file upload, or direct URL
4. **Configure settings**: Choose Whisper model, translation provider, target languages
5. **Submit job** and monitor progress in real-time
6. **Download** generated subtitles in your preferred format

### Managing Jobs

- **Dashboard**: Overview of all jobs with status and analytics
- **Job Details**: Comprehensive view with transcription, settings, and download options
- **Job History**: Track all processing activities and results
- **Retry Failed Jobs**: Automatic retry mechanism for failed processing

### Advanced Features

- **Custom Vocabulary**: Improve accuracy with domain-specific terms
- **Speaker Detection**: Identify different speakers in audio
- **Quality Thresholds**: Set minimum quality requirements
- **Batch Processing**: Process multiple files simultaneously

## 🔌 API Documentation

### Authentication

```bash
POST /api/auth/register
POST /api/auth/signin
```

### Job Management

```bash
GET /api/jobs                    # List jobs
POST /api/jobs                   # Create job
GET /api/jobs/[id]              # Get job details
DELETE /api/jobs/[id]           # Delete job
POST /api/jobs/[id]/retry       # Retry failed job
```

### Subtitles

```bash
GET /api/subtitles/[id]/download # Download subtitle file
```

### Analytics

```bash
GET /api/dashboard/stats         # Dashboard statistics
```

## 🎨 UI/UX Features

### Design System

- **Modern Interface**: Clean, professional design with consistent spacing
- **Responsive Layout**: Mobile-first approach with breakpoints
- **Dark/Light Theme**: Automatic theme switching with user preference
- **Smooth Animations**: Framer Motion for enhanced user experience
- **Accessibility**: WCAG compliant with keyboard navigation

### User Experience

- **Real-Time Updates**: Live progress tracking and status updates
- **Intuitive Navigation**: Clear information architecture
- **Error Handling**: Comprehensive error messages and recovery options
- **Loading States**: Skeleton screens and progress indicators
- **Toast Notifications**: Non-intrusive feedback system

## 🔒 Security

### Authentication & Authorization

- **Secure Password Hashing**: bcryptjs with salt rounds
- **Session Management**: NextAuth.js with JWT tokens
- **Role-Based Access**: User, Admin, and Moderator roles
- **API Protection**: Authenticated endpoints with proper validation

### Data Protection

- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: React's built-in XSS prevention
- **CSRF Protection**: NextAuth.js CSRF tokens

## 📊 Performance

### Optimization

- **Static Generation**: Pre-rendered pages for better performance
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component with lazy loading
- **Database Indexing**: Optimized database queries with proper indexes

### Monitoring

- **Job Analytics**: Processing time and quality metrics
- **Usage Tracking**: User activity and quota monitoring
- **Error Logging**: Comprehensive error tracking and reporting

## 🚀 Deployment

### Production Build

```bash
yarn build
yarn start
```

### Environment Setup

- Configure production database
- Set up environment variables
- Enable SSL/TLS encryption
- Configure CDN for static assets

### AWS Deployment (Recommended)

- **Compute**: AWS Lambda or EC2
- **Database**: AWS RDS PostgreSQL
- **Storage**: AWS S3 for file uploads
- **CDN**: AWS CloudFront
- **Monitoring**: AWS CloudWatch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **OpenAI Whisper**: Advanced speech recognition
- **Next.js Team**: Excellent React framework
- **Vercel**: Deployment and hosting platform
- **Prisma**: Type-safe database toolkit
- **Radix UI**: Accessible component library

## 📞 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Contact the development team

---

**Professional Subtitle Generator** - Transforming video content with AI-powered subtitle generation.
