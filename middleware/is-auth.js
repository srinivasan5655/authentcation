const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not Authorized");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  if (token === "null") {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  try {
    decodedToken = jwt.verify(token, "supersecretkeyfinditifyoucan");
  } catch (err) {
    err.statusCode = 500;
    err.message = "Please Logout and Login";
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};
