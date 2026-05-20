const jwt = require("jsonwebtoken");
const { User } = require("../models");
exports.protect = async (req, res, next) => {
  try {
    // 1. Grab the token from the cookies
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized, no token found" });
    }

    // 2. Verify the cryptographic token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Use Sequelize to find the user in PostgreSQL by Primary Key (id)
    // We use attributes: { exclude: ['password'] } so we don't accidentally leak the hashed password

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // 4. Attach the Sequelize user instance directly to the request object!
    req.user = user;

    // 5. Pass control to the next function (the actual controller)
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};





// const jwt = require("jsonwebtoken");

// exports.checkIdentity = async (req, res, next) => {
//   const token = req.cookies.token;
//   console.log("token", token);
//   if (!token) {
//     return res
//       .status(401)
//       .json({ message: "Access denied, No token provided!" });
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log("Token is valid for user:", decoded.username);
//     console.log(
//       "Token received by server:",
//       token
//         ? "YES (first 10 chars: " + token.substring(0, 10) + ")"
//         : "NO TOKEN",
//     );
//     req.user = decoded;
//     next();
//   } catch (error) {
//     console.log("err", error.name);
//     res.status(401).json({ message: "Invalid or expired token" });
//   }
// };
