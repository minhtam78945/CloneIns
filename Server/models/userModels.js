const mongoose = require("mongoose");
const { isEmail } = require("validator");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Required"],
      minlength: [6, "Must be at least 6 characters"],
      unique: true,
    },
    displayName: {
      type: String,
      default: "New User",
    },
    about: {
      type: String,
      default: "I'm a new user",
    },
    email: {
      type: String,
      required: [true, "Required"],
      minlength: [6, "Must be at least 6 characters"],
      unique: true,
      validate: [isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      select: false,
      minlength: [8, "Must be 8 characters or more"],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default:
        "https://i.pinimg.com/736x/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg",
    },
    theme: {
      type: String,
      default: "#ff9051",
    },
    followers: {
      type: Array,
      default: [],
    },
    followings: {
      type: Array,
      default: [],
    },
    favorites: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.plugin(uniqueValidator, {
  message: "Error, expected {PATH} to be unique",
});

module.exports = mongoose.model("User", userSchema);
