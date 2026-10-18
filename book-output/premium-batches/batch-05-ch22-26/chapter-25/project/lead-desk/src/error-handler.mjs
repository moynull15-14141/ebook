import { AppError, notFound } from './errors.mjs';

export const notFoundHandler = (req, res, next) => next(notFound('পথ'));

// Express চারটি Parameter-এর Middleware-কে Error Handler হিসেবে চেনে।
// সব Error একই আকারে: { error: { code, message, details?, requestId } }।
export const errorHandler = (log) => (err, req, res, next) => {
  let error = err;
  if (err.type === 'entity.parse.failed') {
    error = new AppError(400, 'INVALID_JSON', 'JSON পড়া যায়নি');
  } else if (err.type === 'entity.too.large') {
    error = new AppError(413, 'PAYLOAD_TOO_LARGE', 'অনুরোধ খুব বড়');
  } else if (!(err instanceof AppError)) {
    // অপ্রত্যাশিত: বিস্তারিত শুধু Server Log-এ, ব্যবহারকারী পান সাধারণ বার্তা।
    log({ requestId: req.id, level: 'error', message: err.message });
    error = new AppError(500, 'INTERNAL_ERROR', 'Server-এ সমস্যা হয়েছে');
  }
  if (res.headersSent) {
    next(err);
    return;
  }
  const { status, code, message, details } = error;
  const body = { code, message, details, requestId: req.id };
  res.status(status).json({ error: body });
};
