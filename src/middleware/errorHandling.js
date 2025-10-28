export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  //default error
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let details = err.details || null;

  // handle specific error types
  if (err.code === "ER_DUP_ENTRY") {
    statusCode = 400;
    message = "Duplicate entry";
    details = "A country with this name already exists";
  }

  const response = {
    error: message,
  };

  if (details) {
    response.details = details;
  }

  res.status(statusCode).json(response);
};

export class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}
