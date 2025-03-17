import { validationResult } from 'express-validator'

const validateResponseFormat = (expectedFormat) => {
  return (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid response format',
        details: errors.array(),
        expectedFormat,
      })
    }

    // Validate response format
    const validateFormat = (data, format) => {
      if (typeof format === 'string') {
        return typeof data === format
      }

      if (Array.isArray(format)) {
        if (!Array.isArray(data)) return false
        return data.every((item) => validateFormat(item, format[0]))
      }

      if (typeof format === 'object') {
        return Object.keys(format).every((key) => {
          if (!Object.hasOwn(data, key)) return false
          return validateFormat(data[key], format[key])
        })
      }

      return false
    }

    res.validateResponse = (data) => {
      if (!validateFormat(data, expectedFormat)) {
        return res.status(500).json({
          success: false,
          error: 'Invalid response format',
          expectedFormat,
          received: data,
        })
      }
      return res.status(200).json({
        success: true,
        data,
      })
    }

    next()
  }
}

export const productsResponseValidator = validateResponseFormat({
  data: [
    {
      id: 'number',
      name: 'string',
      code: 'string',
      price: 'number',
      total_sold: 'number',
      total_revenue: 'number',
      category_name: 'string',
    },
  ],
})

export default validateResponseFormat
