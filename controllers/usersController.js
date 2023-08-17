const nodemailer = require("nodemailer");
require("dotenv").config();

const { User, findUserByEmail, findUserById } = require("../models/userModel");
const bcrypt = require("bcryptjs");
const fs = require("fs/promises");
const jwt = require("jsonwebtoken");
const jimp = require("jimp");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: "ezlbvigdxjmxawzf",
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: "TLSv1.2",
  },
});

const usersController = {
  register: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Email in use" });
      }

      const verificationToken = uuidv4();

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log("Hashed password:", hashedPassword);

      const newUser = await User.create({ email, password, verificationToken });

      const verificationLink = `http://localhost:${process.env.PORT}/users/verify/${verificationToken}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: newUser.email,
        subject: "Email Verification",
        text: `Click the following link to verify your email: ${verificationLink}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });

      const userWithoutPassword = {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      };

      res.status(201).json({
        user: userWithoutPassword,
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await findUserByEmail(email);

      if (!user) {
        return res.status(401).json({ message: "Email or password is wrong" });
      }

      if (password === user.password) {
        if (!user.verify) {
          return res.status(403).json({ message: "Email is not verified" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        res.status(200).json({
          token,
          user: {
            email: user.email,
            subscription: user.subscription,
            avatarURL: user.avatarURL,
          },
        });
      } else {
        return res.status(401).json({ message: "Email or password is wrong" });
      }
    } catch (error) {
      console.error("Error during login:", error);
      next(error);
    }
  },

  findUserById: async (req, res, next) => {
    try {
      const userId = req.userId;

      console.log("Searching for user by ID:", userId);

      const user = await findUserById(userId);

      if (!user) {
        console.log("User not found");
        return res.status(401).json({ message: "Not authorized" });
      }

      console.log("User found:", user);

      res.status(200).json({ message: "User found", user });
    } catch (error) {
      console.error("Error during findUserById:", error);
      next(error);
    }
  },

  logoutUser: async (req, res, next) => {
    try {
      const userId = req.userId;

      console.log("Logging out user with ID:", userId);

      const user = await findUserById(userId);

      if (!user) {
        console.log("User not found");
        return res.status(401).json({ message: "Not authorized" });
      }

      user.token = null;
      await user.save();

      console.log("User logged out successfully");

      return res.status(204).end();
    } catch (error) {
      console.error("Error during logoutUser:", error);
      next(error);
    }
  },

  getCurrentUser: async (req, res, next) => {
    try {
      const userId = req.userId;

      console.log("Getting current user with ID:", userId);

      const user = await findUserById(userId);

      if (!user) {
        console.log("User not found");
        return res.status(401).json({ message: "Not authorized" });
      }

      const userWithoutPassword = {
        email: user.email,
        subscription: user.subscription,
      };

      console.log("Current user found:", userWithoutPassword);

      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Error during getCurrentUser:", error);
      next(error);
    }
  },
  uploadAvatar: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const avatar = await jimp.read(req.file.path);
      await avatar.cover(250, 250);

      const uniqueFileName = `${Date.now()}-${userId}${path.extname(
        req.file.originalname
      )}`;

      const avatarSavePath = path.join("public", "avatars", uniqueFileName);
      await avatar.writeAsync(avatarSavePath);

      const avatarURL = `/avatars/${uniqueFileName}`;

      await User.updateOne({ _id: userId }, { avatarURL });
      await fs.unlink(req.file.path);
      res.status(200).json({
        avatarURL: avatarURL,
      });
    } catch (error) {
      next(error);
    }
  },
  verifyUser: async (req, res) => {
    const { verificationToken } = req.params;

    try {
      const result = await User.updateOne(
        { verificationToken },
        { verify: true, verificationToken: null }
      );

      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({ message: "Verification successful" });
    } catch (error) {
      console.error("Error verifying user:", error);
      return res.status(500).json({ message: "Server error" });
    }
  },
  resendVerificationEmail: async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "missing required field email" });
    }

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.verify) {
        return res
          .status(400)
          .json({ message: "Verification has already been passed" });
      }

      const verificationToken = user.verificationToken;

      const verificationLink = `http://localhost:${process.env.PORT}/users/verify/${verificationToken}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Email Verification",
        text: `Click the following link to verify your email: ${verificationLink}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending verification email:", error);
        } else {
          console.log("Verification email sent:", info.response);
        }
      });

      return res
        .status(200)
        .json({ message: "Verification email has been resent" });
    } catch (error) {
      console.error("Error resending verification email:", error);
      return res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = usersController;
