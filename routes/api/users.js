const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/usersController");
const usersValidation = require("../../validations/usersValidation");
const authMiddleware = require("../../validations/authMiddleware");
const upload = require("../../multerConfig");

router.post(
  "/register",
  usersValidation.validateUserRegister,
  usersController.register
);
router.post("/login", usersValidation.validateUserLogin, usersController.login);
router.post("/logout", authMiddleware, usersController.logoutUser);
router.get("/current", authMiddleware, usersController.getCurrentUser);
router.post(
  "/avatars",
  authMiddleware,
  upload.single("avatar"),
  usersController.uploadAvatar
);
router.patch(
  "/avatars",
  authMiddleware,
  upload.single("avatar"),
  usersController.uploadAvatar
);
router.get("/verify/:verificationToken", usersController.verifyUser);

module.exports = router;
