export function successResponse(res, data = null, meta = {}, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, meta });
}

export function errorResponse(
  res,
  message,
  code = "INTERNAL_ERROR",
  statusCode = 500
) {
  return res.status(statusCode).json({ success: false, error: { message, code } });
}
