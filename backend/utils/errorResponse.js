class ErrRes extends Error {
  constructor(message, statusCode, errorField = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.errorField = errorField;
  }
}

module.exports = ErrRes;
