const express = require("express");
const db = require("./models");
const app = express();
const authRoutes = require("./routes/authRoutes");

app.get("/", (req, res) => res.send("Hello world!"));

// Auth Routes
app.use("/api/auth", authRoutes);
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log(" Database connected successfully.");

    // 2. Sync models (Optional, but good for dev)
    await db.sequelize.sync({ alter: true });
    console.log("✅ Database models synchronized (Tables created).");

    // 3. NOW start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(" Unable to connect to the database:", err);
    process.exit(1); // Stop the app entirely if DB fails
  }
};

startServer();
