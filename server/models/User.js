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
      trim: true,
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

// One GitHub account can only be connected
// to one Proofly user.
//
// Users without a GitHub connection are ignored
// by this unique index.
userSchema.index(
  { githubUsername: 1 },
  {
    unique: true,
    partialFilterExpression: {
      githubUsername: {
        $type: "string",
      },
    },
  }
)

const User = mongoose.model("User", userSchema)

module.exports = User