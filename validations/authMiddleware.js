const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    console.log("Token not found");
    return res.status(401).json({ message: "Not authorized" });
  }

  const tokenWithoutBearer = token.replace("Bearer ", "");

  console.log("Received token:", tokenWithoutBearer);

  try {
    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    if (req.params.contactId) {
      if (decoded.userId !== req.params.contactId) {
        console.log("User is not authorized for this contact");
        return res.status(401).json({ message: "Not authorized" });
      }
    }

    req.user = decoded;
    req.user._id = decoded.userId;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = authMiddleware;
