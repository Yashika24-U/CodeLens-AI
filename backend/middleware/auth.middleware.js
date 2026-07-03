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

    const user = await User.findByPk(decoded.userId, {
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
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
