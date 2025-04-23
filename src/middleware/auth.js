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
      return res.status(statusCodes.forbidden).json({ message: messages.required });
    }

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(statusCodes.unauthorized).json({
          message: err.name === 'TokenExpiredError' ? 'Token has expired' : messages.invalid_format
        });
      }
      req.user = decoded; 
      next();
    });
  } catch (error) {
    return res.status(statusCodes.unauthorized).json({ message: "Unauthorized", error: error.message });
  }
};
