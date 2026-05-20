const bcrypt = require("bcryptjs");
const { User } = require("../../models");
const jwt = require("jsonwebtoken");

const sendTokenResponse = (user, statusCode, res) => {
  // Generate JWT token containing the user ID as its payload
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token valid for 7 days
  });

  // Configure cookie production vs development environmental flags
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in milliseconds
    httpOnly: true, // CRITICAL: Prevents frontend JavaScript from reading the cookie (Stops XSS)
    secure: process.env.NODE_ENV === "development", // Transmit only over HTTPS in production
    sameSite: "lax", // Protects against CSRF attacks while allowing cross-site layout rendering
  };

  // Strip password field out of the server response object for security
  const { password, ...userWithoutPassword } = user.toJSON();

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions) // Attach cookie to outbound headers
    .json({ success: true, user: userWithoutPassword });
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    sendTokenResponse(newUser, 201, res);
  } catch (error) {
    console.error("Registration Error: ", error);
    res.status(500).json({ message: "Internal server registration error." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide both email and password." });
    }

    // 2. Find user in database
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid email or password credentials." });
    }

    // 3. Compare raw input password with the hashed variant stored in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid email or password credentials." });
    }

    // 4. Verification successful, hand back browser session tokens
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Login Error: ", error);
    res.status(500).json({ message: "Internal server authentication error." });
  }
};



exports.logout = async (req, res) => {
  try {
    // Overwrite the 'token' cookie with a value of none, expiring immediately
    res.cookie("token", "none", {
      httpOnly: true,
      expires: new Date(Date.now()), // Expire right this millisecond
    });

    res
      .status(200)
      .json({ success: true, message: "User logged out successfully." });
  } catch (error) {
    console.error("Logout Error: ", error);
    res.status(500).json({ message: "Internal server logout error." });
  }
};
