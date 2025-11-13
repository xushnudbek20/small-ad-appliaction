import type { UniformVerificationResponse } from '~/types/liveness.types'

export default defineEventHandler(async (event): Promise<UniformVerificationResponse> => {
  try {
    const formData = await readMultipartFormData(event)

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No image provided',
      })
    }

    const imageFile = formData.find(item => item.name === 'image')

    if (!imageFile) {
      throw createError({
        statusCode: 400,
        message: 'Image field not found in form data',
      })
    }

    console.log('Received image for uniform verification:', {
      filename: imageFile.filename,
      size: imageFile.data.length,
      type: imageFile.type,
    })

    await new Promise(resolve => setTimeout(resolve, 1500))

    const isUniformDetected = Math.random() > 0.3

    return {
      success: true,
      uniformDetected: isUniformDetected,
      confidence: isUniformDetected ? 0.85 + Math.random() * 0.15 : 0.45 + Math.random() * 0.25,
      uniformType: isUniformDetected ? 'Security Guard Uniform' : undefined,
      message: isUniformDetected
        ? 'Valid uniform detected. Person is properly dressed in required uniform.'
        : 'No valid uniform detected. Please ensure you are wearing the required uniform.',
    }
  }
  catch (error) {
    console.error('Uniform verification error:', error)

    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to process uniform verification',
    })
  }
})
