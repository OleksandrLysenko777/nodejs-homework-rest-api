const mongoose = require("mongoose");
const gravatar = require("gravatar");
const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");

const userSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    avatarURL: {
      type: String,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, 'Verify token is required'],
    },
    token: String,
  },
  { versionKey: false }
);

userSchema.pre("save", async function (next) {
  if (!this.avatarURL) {
    try {
      const email = this.email;

      const gravatarURL = gravatar.url(
        email,
        { s: "250", r: "pg", d: "robohash" },
        true
      );
      const response = await axios.get(gravatarURL, {
        responseType: "arraybuffer",
      });

      const avatarFileName = `${Date.now()}-${this._id}.jpg`;
      const avatarSavePath = path.join("public", "avatars", avatarFileName);

      await fs.writeFile(avatarSavePath, response.data);

      this.avatarURL = gravatarURL;
    } catch (error) {
      console.error("Error saving avatar:", error);
    }
  }
  next();
});

const User = mongoose.model("User", userSchema);

const findUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.error("Error finding user:", error);
    throw error;
  }
};

const findUserById = async (userId) => {
  const user = await User.findById(userId);
  return user;
};

module.exports = {
  User,
  findUserByEmail,
  findUserById,
};
