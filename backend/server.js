const express = require("express");
const db = require("./models");
const app = express();

app.get("/", (req, res) => res.send("Hello world!"));

db.sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    console.log("Database: " + process.env.DB_NAME);
    console.log("Host: " + process.env.DB_HOST);
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
app.listen(5000, () => console.log("Server running on port 5000"));
