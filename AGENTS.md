# AGENTS.md - Developer Guide

## Project Overview

This is a Nuxt 4 application featuring real-time face detection, liveness verification, and uniform verification using MediaPipe.

## Commands

### Development
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm generate     # Generate static site
```

### Code Quality
```bash
# Type checking (not yet configured - add if needed)
# pnpm typecheck

# Linting (not yet configured - add if needed)
# pnpm lint
```

## Project Structure

```
app/
├── components/LivenessCheck/   # Liveness detection components
├── composables/                # Vue composables for reusable logic
├── config/                     # Configuration files
├── pages/                      # Application pages
├── server/api/                 # API endpoints
├── types/                      # TypeScript type definitions
└── utils/                      # Utility functions
```

## Tech Stack

- **Framework:** Nuxt 4
- **UI Library:** Nuxt UI (based on TailwindCSS)
- **Face Detection:** MediaPipe Face Detection
- **Language:** TypeScript
- **Package Manager:** pnpm

## Key Features

### 1. Camera Management (`useCamera`)
- Handles camera permissions
- Manages video stream lifecycle
- Error handling for camera issues

### 2. Face Detection (`useMediaPipe`)
- Integrates MediaPipe Face Detection
- Throttles detection to 15 FPS
- Provides face bounding box data

### 3. Liveness Detection (`useLivenessDetection`)
- Blink detection (2 blinks required)
- Head movement tracking (left/right)
- Stability check (2 seconds hold-still)
- Frame validation (chest to head visible)

### 4. Image Processing (`utils/imageProcessing`)
- Captures images from video stream
- Compresses images to max 2MB
- Validates image quality

### 5. API Integration (`utils/apiClient`)
- Uploads images for uniform verification
- Returns AI analysis results

## Configuration

Main configuration file: `app/config/liveness.config.ts`

```typescript
{
  detection: {
    minDetectionConfidence: 0.7,
    modelSelection: 0,
    fpsLimit: 15
  },
  liveness: {
    requiredBlinks: 2,
    headMovementThreshold: 0.15,
    stabilityDurationMs: 2000
  }
}
```

## API Endpoints

### POST /api/verify-uniform
Accepts an image and returns uniform detection results.

**Request:**
- Content-Type: multipart/form-data
- Body: image file

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

### GET /api/health
Health check endpoint.

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Note:** HTTPS required for camera access in production.

## Development Tips

1. **Camera Testing:** Use HTTPS in production (`localhost` works in dev)
2. **MediaPipe Models:** Loaded from CDN, requires internet connection
3. **Face Detection:** Works best with good lighting
4. **Frame Positioning:** User should be centered, chest to head visible

## Common Issues

### Camera Not Working
- Check browser permissions
- Ensure HTTPS (required in production)
- Verify camera is not in use by another app

### Face Detection Fails
- Improve lighting conditions
- Ensure face is centered in frame
- Check internet connection (models load from CDN)

### Build Errors
```bash
rm -rf .nuxt node_modules
pnpm install
pnpm build
```

## Code Style

- Use TypeScript for type safety
- Follow Vue 3 Composition API patterns
- Use Nuxt auto-imports (no need to import ref, computed, etc.)
- Keep components focused and reusable

## Future Enhancements

- [ ] Add unit tests
- [ ] Add E2E tests with Playwright
- [ ] Implement actual AI uniform verification
- [ ] Add support for multiple uniform types
- [ ] Improve blink detection algorithm
- [ ] Add face mask detection
- [ ] Support for multiple faces
- [ ] Add analytics tracking

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly (camera, detection, API)
4. Submit a pull request

## Support

For issues, check:
1. Browser console for errors
2. Network tab for API failures
3. Camera permissions in browser settings
4. This documentation
