const express = require("express");
const session = require("express-session");
const db = require("./models");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const authRoutes = require("./routes/authRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const promptRoutes = require("./routes/promptRoutes");

const checkIdentity = require("./middleware/auth.middleware");
const { protect } = require("./middleware/auth.middleware");
const { seedSystem } = require("./seeders/seedRouter");
require("./workers/reviewWorker");

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(
  session({
    secret: "your_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      // FIX 1: If this is true, cookies ONLY work on HTTPS.
      // On localhost, this MUST be false.
      secure: false,

      // FIX 2: This must be 'lax' so it survives the GitHub redirect.
      sameSite: "lax",

      // FIX 3: Ensure the path is root so it's available everywhere.
      path: "/",

      httpOnly: true,
    },
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/github", webhookRoutes);
app.use("/api/prompt", promptRoutes);
// app.use("/api/v1", checkIdentity.checkIdentity, promptRoutes);

// Protected Routes
app.get("/auth/me", protect, (req, res) => {
  res.status(200).json({ user: req.user });
});

app.get("/", (req, res) => res.send("Hello world!"));

app.post("/api/routerdata/init", async (req, res) => {
  try {
    seedSystem();
    return res.status(200).json({
      success: true,
      message: "System initialized and seeded successfully.",
    });
  } catch (error) {
    console.log("%c⧭Error in seedData", "color: #7f7700", error);
  }
});

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log(" Database connected successfully.");

    // 2. Sync models (Optional, but good for dev)
    // await db.sequelize.sync({ alter: true });
    console.log("✅ Database models synchronized (Tables created).");

    // 3. NOW start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log("BullMQ Worker is now listening for jobs...");
    });
  } catch (err) {
    console.error(" Unable to connect to the database:", err);
    process.exit(1); // Stop the app entirely if DB fails
  }
};

startServer();
