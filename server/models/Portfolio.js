const mongoose = require("mongoose")

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    professionalTitle: {
      type: String,
      trim: true,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    featuredProjects: {
      type: [String],
      default: [],
    },

    socialLinks: {
      linkedin: {
        type: String,
        trim: true,
        default: "",
      },

      github: {
        type: String,
        trim: true,
        default: "",
      },

      website: {
        type: String,
        trim: true,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
)

const Portfolio = mongoose.model(
  "Portfolio",
  portfolioSchema
)

module.exports = Portfolio