class AppError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  DATABASE_ERROR: 'DATABASE_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INVALID_OPERATION: 'INVALID_OPERATION',
  CAPACITY_EXCEEDED: 'CAPACITY_EXCEEDED',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  INVALID_STATUS: 'INVALID_STATUS'
};

const ErrorMessages = {
  [ErrorCodes.VALIDATION_ERROR]: 'Invalid input data',
  [ErrorCodes.NOT_FOUND]: 'Resource not found',
  [ErrorCodes.UNAUTHORIZED]: 'Unauthorized access',
  [ErrorCodes.FORBIDDEN]: 'Operation not allowed',
  [ErrorCodes.DATABASE_ERROR]: 'Database operation failed',
  [ErrorCodes.DUPLICATE_ENTRY]: 'Resource already exists',
  [ErrorCodes.INVALID_OPERATION]: 'Invalid operation',
  [ErrorCodes.CAPACITY_EXCEEDED]: 'Vehicle capacity exceeded',
  [ErrorCodes.ALREADY_EXISTS]: 'Resource already exists',
  [ErrorCodes.INVALID_STATUS]: 'Invalid status'
};

const createError = (code, customMessage = null) => {
  return new AppError(code, customMessage || ErrorMessages[code]);
};

const handleFirebaseError = (error) => {
  // Map Firebase error codes to our custom error codes
  switch (error.code) {
    case 'auth/user-not-found':
      return createError(ErrorCodes.NOT_FOUND, 'User not found');
    case 'auth/email-already-in-use':
      return createError(ErrorCodes.DUPLICATE_ENTRY, 'Email already in use');
    case 'auth/invalid-email':
      return createError(ErrorCodes.VALIDATION_ERROR, 'Invalid email format');
    case 'auth/wrong-password':
      return createError(ErrorCodes.UNAUTHORIZED, 'Invalid credentials');
    case 'auth/weak-password':
      return createError(ErrorCodes.VALIDATION_ERROR, 'Password is too weak');
    case 'permission-denied':
      return createError(ErrorCodes.FORBIDDEN, 'Permission denied');
    default:
      return createError(ErrorCodes.DATABASE_ERROR, error.message);
  }
};

const isOperational = (error) => {
  return error instanceof AppError;
};

module.exports = {
  AppError,
  ErrorCodes,
  ErrorMessages,
  createError,
  handleFirebaseError,
  isOperational
}; 