require("dotenv").config();

const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const contactsRouter = require("./routes/api/contacts");
const usersRouter = require("./routes/api/users");
const contactsFavoriteRouter = require("./routes/api/contacts");

const mongoose = require("mongoose");

const app = express();
const formatsLogger = app.get("env") === "development" ? "dev" : "short";

const dbURI = process.env.DB_URI;

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Database connection successful");
});

mongoose.connection.on("error", (err) => {
  console.error("Error connecting to MongoDB:", err.message);
  process.exit(1);
});

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

const authMiddleware = require("./validations/authMiddleware");

app.use("/api/contacts", authMiddleware, contactsRouter);
app.use("/api/contacts", authMiddleware, contactsFavoriteRouter);
app.use("/api/users", usersRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: err.message });
});

module.exports = app;
