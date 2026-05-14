const jwt = require("jsonwebtoken");

exports.checkIdentity = async (req, res, next) => {
  const token = req.cookies.token;
  console.log("token", token);
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied, No token provided!" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token is valid for user:", decoded.username);
    console.log(
      "Token received by server:",
      token
        ? "YES (first 10 chars: " + token.substring(0, 10) + ")"
        : "NO TOKEN",
    );
    req.user = decoded;
    next();
  } catch (error) {
    console.log("err", error.name);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
