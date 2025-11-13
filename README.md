# Nuxt 4 - MediaPipe Liveness Detection & Uniform Verification

A comprehensive Nuxt 4 application featuring real-time face detection, liveness verification, and AI-powered uniform detection using MediaPipe.

## Features

- 📹 **Real-time Face Detection** - Using MediaPipe Face Detection API
- 👁️ **Liveness Verification** - Blink detection, head movement tracking, and stability checks
- 🎯 **Smart Frame Guidance** - Visual overlay to ensure proper positioning (chest to head)
- 🔒 **Uniform Verification** - AI-powered backend analysis of captured images
- 🎨 **Modern UI** - Clean, dark-themed interface with TailwindCSS and Nuxt UI
- ♿ **Accessible** - Screen reader support and keyboard navigation
- 📱 **Responsive** - Optimized for desktop, tablet, and mobile devices

## Tech Stack

- **Framework:** Nuxt 4
- **UI:** Vue 3 (Composition API) + TypeScript
- **Styling:** TailwindCSS + Nuxt UI
- **Face Detection:** MediaPipe Face Detection
- **Camera Utils:** MediaPipe Camera Utils

## Prerequisites

- Node.js 18+ or Node.js 20+
- pnpm 8+ (or npm/yarn)
- Modern browser with camera support (Chrome, Firefox, Safari, Edge)
- HTTPS connection (required for camera access in production)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ad-appliaction
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open your browser at `http://localhost:3000`

> **Note:** You may need to allow camera permissions in your browser settings.

## Project Structure

```
app/
├── components/
│   └── LivenessCheck/
│       ├── LivenessCamera.vue      # Main camera component
│       ├── FaceOverlay.vue         # Frame guide overlay
│       └── LivenessInstructions.vue # User instruction panel
├── composables/
│   ├── useCamera.ts                # Camera stream management
│   ├── useMediaPipe.ts             # MediaPipe face detection
│   └── useLivenessDetection.ts    # Liveness check logic
├── types/
│   └── liveness.types.ts           # TypeScript definitions
├── utils/
│   ├── imageProcessing.ts          # Image capture & compression
│   └── apiClient.ts                # API integration
├── config/
│   └── liveness.config.ts          # Detection settings
├── pages/
│   └── index.vue                   # Main application page
└── server/
    └── api/
        ├── verify-uniform.post.ts  # Uniform verification endpoint
        └── health.get.ts           # Health check endpoint
```

## Configuration

Edit `app/config/liveness.config.ts` to customize detection settings:

```typescript
export const livenessConfig = {
  detection: {
    minDetectionConfidence: 0.7,    // Minimum confidence threshold
    modelSelection: 0,               // 0: short-range, 1: full-range
    fpsLimit: 15                     // Detection frame rate
  },
  capture: {
    imageQuality: 0.95,              // JPEG quality (0-1)
    format: 'image/jpeg',
    maxSizeKB: 2048                  // Max image size
  },
  liveness: {
    requiredBlinks: 2,               // Number of blinks required
    blinkDetectionTimeoutMs: 10000,  // Timeout for blink detection
    headMovementThreshold: 0.15,     // Head movement sensitivity
    stabilityDurationMs: 2000        // Hold-still duration
  },
  frame: {
    faceHeightPercentage: 35,        // Face size in frame (%)
    validFrameTolerance: 0.1         // Position tolerance
  }
}
```

## User Flow

1. **Camera Initialization** - Permission request and stream setup
2. **Face Detection** - Real-time face tracking with visual feedback
3. **Liveness Checks:**
   - ✅ Blink detection (2 blinks required)
   - ✅ Head movement left
   - ✅ Head movement right
   - ✅ Stability check (2 seconds)
4. **Image Capture** - Automatic capture after all checks pass
5. **Preview & Confirmation** - Review captured image
6. **Upload & Verification** - Backend AI analysis
7. **Results Display** - Uniform detection results

## API Integration

### Verify Uniform Endpoint

**POST** `/api/verify-uniform`

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` (File/Blob)

**Response:**
```json
{
  "success": true,
  "uniformDetected": true,
  "confidence": 0.92,
  "uniformType": "Security Guard Uniform",
  "message": "Valid uniform detected."
}
```

### Health Check Endpoint

**GET** `/api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T..."
}
```

## Environment Variables

Create a `.env` file in the project root:

```env
# API Configuration
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Optional: External AI Service
AI_VERIFICATION_API_KEY=your-api-key
AI_VERIFICATION_ENDPOINT=https://api.example.com/verify
```

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Full Support |
| Firefox | 88+     | ✅ Full Support |
| Safari  | 14+     | ✅ Full Support |
| Edge    | 90+     | ✅ Full Support |

## Production Deployment

1. Build the application:
```bash
pnpm build
```

2. Preview the production build:
```bash
pnpm preview
```

3. Deploy to your hosting provider (Vercel, Netlify, etc.)

> **Important:** HTTPS is required for camera access in production. Ensure your hosting provider supports SSL/TLS.

## Known Limitations

- Camera access requires user permission
- HTTPS required in production environments
- MediaPipe models loaded from CDN (requires internet)
- Optimal lighting conditions needed for accurate detection
- Single face detection only (multiple faces not supported)

## Troubleshooting

### Camera Not Working

1. Check browser permissions: `chrome://settings/content/camera`
2. Ensure HTTPS connection (required for camera access)
3. Try a different browser
4. Check if camera is being used by another application

### Face Detection Issues

1. Ensure adequate lighting
2. Position face within the guide frame
3. Remove glasses or face coverings if needed
4. Check internet connection (models loaded from CDN)

### Build Errors

1. Clear `.nuxt` directory: `rm -rf .nuxt`
2. Clear node_modules: `rm -rf node_modules && pnpm install`
3. Check Node.js version: `node --version` (requires 18+)

## Development

### Running Tests

```bash
pnpm test
```

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review browser console for errors

## Acknowledgments

- MediaPipe by Google
- Nuxt.js Team
- TailwindCSS
- Nuxt UI Components
