const express = require("express")

const User = require("../models/User")
const CaseStudy = require("../models/CaseStudy")
const EvidenceSnapshot = require("../models/EvidenceSnapshot")

const router = express.Router()

// ======================================================
// PUBLIC PROJECT EVIDENCE
// No Proofly login required
// Uses saved verified EvidenceSnapshot
// ======================================================

router.get(
  "/project/:username/:repoName",
  async (req, res) => {
    try {
      const { username, repoName } = req.params

      // ==================================================
      // FIND PROOFLY USER
      // ==================================================

      const user = await User.findOne({
        githubUsername: username,
      }).lean()

      if (!user) {
        return res.status(404).json({
          message: "Proofly developer not found",
        })
      }

      // ==================================================
      // LOAD VERIFIED EVIDENCE SNAPSHOT
      // ==================================================

      const snapshot =
        await EvidenceSnapshot.findOne({
          user: user._id,
        }).lean()

      if (!snapshot) {
        return res.status(404).json({
          message:
            "No verified GitHub evidence found. Please sync GitHub from the Proofly dashboard.",
        })
      }

      // ==================================================
      // FIND PROJECT INSIDE SNAPSHOT
      // ==================================================

      const repository = (
        snapshot.repositories || []
      ).find(
        (repo) =>
          repo.name?.toLowerCase() ===
          repoName.toLowerCase()
      )

      if (!repository) {
        return res.status(404).json({
          message:
            "Verified project evidence not found",
        })
      }

      // ==================================================
      // LOAD SAVED AI CASE STUDY
      // ==================================================

      const savedCaseStudy =
        await CaseStudy.findOne({
          user: user._id,
          repositoryName: repository.name,
        }).lean()

      // ==================================================
      // PREPARE PUBLIC AI CASE STUDY
      // ==================================================

      let caseStudy = null

      if (savedCaseStudy) {
        caseStudy = {
          role:
            savedCaseStudy.role || "",

          summary:
            savedCaseStudy.summary || "",

          skills:
            savedCaseStudy.skills || [],

          keyContributions:
            savedCaseStudy.keyContributions || [],

          generatedBy:
            savedCaseStudy.generatedBy ||
            "Gemini AI",

          generatedAt:
            savedCaseStudy.updatedAt,
        }
      }

      // ==================================================
      // PROJECT SKILLS
      // ==================================================

      const projectSkills =
        Object.keys(
          repository.languages || {}
        )

      // ==================================================
      // PUBLIC-SAFE RESPONSE
      // ==================================================

      return res.status(200).json({
        developer: {
          name:
            user.name,

          githubUsername:
            user.githubUsername,
        },

        project: {
          name:
            repository.name,

          description:
            repository.description || "",

          repositoryUrl:
            repository.url || "",

          stars:
            repository.stars ?? 0,

          forks:
            repository.forks ?? 0,

          updatedAt:
            repository.updatedAt,

          primaryLanguage:
            repository.primaryLanguage || "",

          skills:
            projectSkills,

          languagePercentages:
            repository.languagePercentages ||
            {},
        },

        // ----------------------------------------------
        // AI-GENERATED CONTENT
        // This is NOT marked as GitHub verified
        // ----------------------------------------------

        caseStudy,

        // ----------------------------------------------
        // VERIFICATION METADATA
        // ----------------------------------------------

        verification: {
          github: true,

          analyzedBy:
            "Proofly",

          aiGenerated:
            Boolean(caseStudy),

          lastSyncedAt:
            snapshot.lastSyncedAt,
        },
      })
    } catch (error) {
      console.error(
        "Public project error:",
        error?.message || error
      )

      return res.status(500).json({
        message:
          "Unable to load public project",
      })
    }
  }
)

module.exports = router