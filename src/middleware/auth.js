import jwt from "jsonwebtoken";

const statusCodes = {
  forbidden: 403,
  unauthorized: 401,
};

const messages = {
  required: "Token is required",
  invalid_format: "Invalid token format",
};
const secret = "abc";

export const verifyJWT = (req, res, next) => {
  try {
    let token = req.headers["authorization"]?.split(" ")[1]?.replace(/^"|"$/g, "").trim();
    if (!token) {
      return res.status(statusCodes.forbidden).json({
        message: messages.required,
        code: "TOKEN_MISSING"
      });
    }

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(statusCodes.unauthorized).json({
            message: 'Token has expired',
            code: 'TOKEN_EXPIRED' 
          });
        }

        return res.status(statusCodes.unauthorized).json({
          message: messages.invalid_format,
          code: 'TOKEN_INVALID'
        });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(statusCodes.unauthorized).json({
      message: "Unauthorized",
      code: "AUTH_ERROR",
      error: error.message
    });
  }
};
