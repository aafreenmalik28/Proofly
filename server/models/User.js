const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    // GitHub username connected through OAuth
    githubUsername: {
      type: String,
      default: null,
    },

    // GitHub OAuth access token
    // Stored only on the backend/database.
    // Never send this token to the frontend.
    githubAccessToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model(
  "User",
  userSchema
)

module.exports = User