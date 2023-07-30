const { User, findUserByEmail, findUserById } = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const usersController = {
  register: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Email in use" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log("Hashed password:", hashedPassword);
      const newUser = await User.create({ email, password });

      const userWithoutPassword = {
        email: newUser.email,
        subscription: newUser.subscription,
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
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        res.status(200).json(token);
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
};

module.exports = usersController;
