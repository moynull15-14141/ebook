// @ts-check
// সব প্রত্যাশিত ব্যর্থতার একটি Code ও HTTP Status। Transport স্তর শুধু
// এই তালিকা দেখে উত্তর দেয়; Domain HTTP-র কিছু জানে না।
export const STATUS = /** @type {const} */ ({
  VALIDATION: 400,
  BAD_JSON: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  EMAIL_TAKEN: 409,
  SOLD_OUT: 409,
  KEY_CONFLICT: 409,
  TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  TOO_MANY_ATTEMPTS: 429,
});

/** @typedef {keyof typeof STATUS} ErrorCode */

export class AppError extends Error {
  /**
   * @param {ErrorCode} code
   * @param {string} message
   * @param {string[]} [details]
   */
  constructor(code, message, details = []) {
    super(message);
    this.code = code;
    this.status = STATUS[code];
    this.details = details;
  }
}
