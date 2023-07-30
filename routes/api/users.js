const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/usersController");
const usersValidation = require("../../validations/usersValidation");
const authMiddleware = require("../../validations/authMiddleware");
const checkAuthMiddleware = require("../../validations/checkAuthMiddleware");
router.post(
  "/register",
  usersValidation.validateUserRegister,
  usersController.register
);
router.post("/login", usersValidation.validateUserLogin, usersController.login);
router.post("/logout", authMiddleware, usersController.logoutUser);
router.get("/current", checkAuthMiddleware, usersController.getCurrentUser);
module.exports = router;
