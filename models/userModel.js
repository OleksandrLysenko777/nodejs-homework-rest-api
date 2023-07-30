const mongoose = require("mongoose");

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
    token: String,
  },
  { versionKey: false }
);

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
