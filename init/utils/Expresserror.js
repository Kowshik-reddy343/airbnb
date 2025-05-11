class Expresserror extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // This is an operational error, not a programming error
    
  }
}
module.exports = Expresserror;
