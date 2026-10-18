// সব প্রত্যাশিত ব্যর্থতা একটি Class-এ: HTTP Status, যন্ত্রে-পড়ার code, মানুষের বার্তা।
export class AppError extends Error {
  constructor(status, code, message, details = undefined) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message, details) =>
  new AppError(400, 'VALIDATION_FAILED', message, details);
export const unauthorized = () =>
  new AppError(401, 'UNAUTHENTICATED', 'বৈধ Bearer Token প্রয়োজন');
export const forbidden = () =>
  new AppError(403, 'FORBIDDEN', 'এই কাজের অনুমতি নেই');
export const notFound = (what = 'Resource') =>
  new AppError(404, 'NOT_FOUND', `${what} পাওয়া যায়নি`);
export const conflict = (code, message) => new AppError(409, code, message);
export const preconditionFailed = () =>
  new AppError(412, 'VERSION_MISMATCH', 'অন্য কেউ আগে বদলেছে; আবার পড়ে নিন');
