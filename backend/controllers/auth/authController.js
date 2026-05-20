const bcrypt = require("bcryptjs");
const { User } = require("../../models");
const jwt = require("jsonwebtoken");
require("dotenv").config();
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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email address is required." });
    }

    const user = User.findOne({ email: email.toLowerCase().trim() });

    console.log("%c⧭user in forgotpaswd", "color: #40fff2", user);

    // 2. Security Privacy Guard: If user doesn't exist, don't tell the client!
    // Returning a generic success stops hackers from enumerating active accounts.
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If a matching account exists, a secure password reset link has been sent to your inbox.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const tokenLifespanMs = 15 * 60 * 100;
    const resetTokenExpires = new Date(Date.now() + tokenLifespanMs);

    // Save the credentials straight onto the user's database record row

    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpires = resetTokenExpires;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const emailOptions = {
      from: `"Platform Security" <no-reply@yourdomain.com>`,
      to: user.email,
      subject: "Password Reset Security Request",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Password Reset Request Received</h2>
          <p>You requested a link to reset your password. Click the button below to update your login credentials:</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset My Password
            </a>
          </div>
          <p style="color: #666; font-size: 13px;">This security link is valid for exactly 15 minutes. If you did not make this request, please disregard this email safely.</p>
        </div>
      `,
    };

    await transporter.sendMail(emailOptions);

    return res.status(200).json({
      success: true,
      message:
        "If a matching account exists, a secure password reset link has been sent to your inbox.",
    });
  } catch (error) {
    console.error("Forgot password system malfunction:", error);
    return res.status(500).json({
      success: false,
      message:
        "An internal server error occurred while processing your request. Please try again later.",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Security token and new password are both required.",
      });
    }

    // 1. Find the user who owns this exact token AND check if the token hasn't expired
    // Op.gt means "Greater Than". We check if passwordResetExpires is still in the future.
    const { Op } = require("sequelize");
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [Op.gt]: new Date(), // Must be greater than the exact current time right now
        },
      },
    });

    // 2. If token is invalid or expired, reject the request immediately
    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "The password reset link is invalid or has expired. Please request a new one.",
      });
    }

    // 3. Security Masterstroke: Encrypt the brand new password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 4. Update the user row in PostgreSQL
    user.password = hashedPassword;

    // 5. CRITICAL STEP: Clear out the token fields back to NULL!
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Your password has been successfully updated. You can now log in with your new credentials.",
    });
  } catch (error) {
    console.error("Reset password terminal malfunction:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while processing your new password.",
    });
  }
};
