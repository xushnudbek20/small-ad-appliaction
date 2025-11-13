import { captureConfig } from '~/config/liveness.config'

export async function captureImageFromVideo(videoElement: HTMLVideoElement): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = videoElement.videoWidth
  canvas.height = videoElement.videoHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        }
        else {
          reject(new Error('Failed to create blob from canvas'))
        }
      },
      captureConfig.format,
      captureConfig.imageQuality,
    )
  })
}

export async function compressImage(blob: Blob, maxSizeKB: number = captureConfig.maxSizeKB): Promise<Blob> {
  if (blob.size / 1024 <= maxSizeKB) {
    return blob
  }

  const img = await createImageBitmap(blob)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  ctx.drawImage(img, 0, 0)

  let quality = captureConfig.imageQuality
  let compressedBlob: Blob | null = null

  while (quality > 0.1) {
    compressedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob)
        },
        captureConfig.format,
        quality,
      )
    })

    if (compressedBlob && compressedBlob.size / 1024 <= maxSizeKB) {
      return compressedBlob
    }

    quality -= 0.1
  }

  return compressedBlob || blob
}

export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      }
      else {
        reject(new Error('Failed to convert blob to data URL'))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new Blob([u8arr], { type: mime })
}

export async function validateImageQuality(blob: Blob): Promise<{ valid: boolean, issues: string[] }> {
  const issues: string[] = []

  if (blob.size === 0) {
    issues.push('Image is empty')
    return { valid: false, issues }
  }

  if (blob.size / 1024 > captureConfig.maxSizeKB * 1.5) {
    issues.push(`Image size (${Math.round(blob.size / 1024)}KB) exceeds maximum`)
  }

  try {
    const img = await createImageBitmap(blob)

    if (img.width < 640 || img.height < 480) {
      issues.push('Image resolution is too low')
    }

    if (img.width / img.height < 0.5 || img.width / img.height > 2) {
      issues.push('Image aspect ratio is unusual')
    }
  }
  catch {
    issues.push('Unable to decode image')
    return { valid: false, issues }
  }

  return { valid: issues.length === 0, issues }
}
