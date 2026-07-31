export class ApiResponse {
  constructor(res, statusCode = 200) {
    this.res = res
    this.statusCode = statusCode
  }

  send(data = null, message = 'Success', meta = undefined) {
    return this.res.status(this.statusCode).json({
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
    })
  }
}

export function ok(res, data, message = 'Success', meta) {
  return new ApiResponse(res, 200).send(data, message, meta)
}

export function created(res, data, message = 'Created successfully') {
  return new ApiResponse(res, 201).send(data, message)
}

export function noContent(res, message = 'Deleted successfully') {
  return res.status(200).json({ success: true, message, data: null })
}
