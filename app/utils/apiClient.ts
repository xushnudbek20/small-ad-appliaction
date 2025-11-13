import type { UniformVerificationResponse } from '~/types/liveness.types'

export async function uploadForUniformCheck(imageBlob: Blob): Promise<UniformVerificationResponse> {
  try {
    const formData = new FormData()
    formData.append('image', imageBlob, 'capture.jpg')

    const response = await fetch('/api/verify-uniform', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    return data as UniformVerificationResponse
  }
  catch (error) {
    console.error('Uniform verification API error:', error)
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to verify uniform. Please try again.',
    )
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
    })
    return response.ok
  }
  catch {
    return false
  }
}
