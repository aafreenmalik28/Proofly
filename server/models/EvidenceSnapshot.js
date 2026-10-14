const mongoose = require("mongoose")

const evidenceSnapshotSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
      },

      githubUsername: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      repositories: {
        type: Array,
        default: [],
      },

      skills: {
        type: [String],
        default: [],
      },

      skillEvidence: {
        type: Array,
        default: [],
      },

      proofScore: {
        type: Number,
        default: 0,
      },

      scoreBreakdown: {
        projects: {
          type: Number,
          default: 0,
        },

        skills: {
          type: Number,
          default: 0,
        },

        quality: {
          type: Number,
          default: 0,
        },

        github: {
          type: Number,
          default: 0,
        },
      },

      lastSyncedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  )

const EvidenceSnapshot = mongoose.model(
  "EvidenceSnapshot",
  evidenceSnapshotSchema
)

module.exports = EvidenceSnapshot