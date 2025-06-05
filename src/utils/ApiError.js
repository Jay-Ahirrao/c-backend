class ApiError extends Error {
    constructor(
        statusCode,
        message = 'Something went wrong',
        errors = [],
        stack = ''
    ) {
        super(message);
        this.statusCode = statusCode; // Corrected typo
        this.data = null;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack; // Corrected parameter name
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };