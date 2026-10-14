const mongoose = require("mongoose")

const caseStudySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    githubUsername: {
      type: String,
      required: true,
      trim: true,
    },

    repositoryName: {
      type: String,
      required: true,
      trim: true,
    },

    repositoryUrl: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      default: "Developer",
    },

    summary: {
      type: String,
      required: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    keyContributions: {
      type: [String],
      default: [],
    },

    languagePercentages: {
      type: Map,
      of: Number,
      default: {},
    },

    stars: {
      type: Number,
      default: 0,
    },

    forks: {
      type: Number,
      default: 0,
    },

    generatedBy: {
      type: String,
      default: "Gemini AI",
    },
  },
  {
    timestamps: true,
  }
)

// One saved case study per repository for each user.
caseStudySchema.index(
  {
    user: 1,
    repositoryName: 1,
  },
  {
    unique: true,
  }
)

const CaseStudy = mongoose.model(
  "CaseStudy",
  caseStudySchema
)

module.exports = CaseStudy