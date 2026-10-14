const express = require("express")

const User = require("../models/User")
const Portfolio = require("../models/Portfolio")
const CaseStudy = require("../models/CaseStudy")
const EvidenceSnapshot = require("../models/EvidenceSnapshot")

const router = express.Router()

// ======================================================
// PUBLIC DEVELOPER PROFILE
// No Proofly login required
// Uses saved Proofly evidence instead of live GitHub API
// ======================================================

router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params

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
    // LOAD SAVED PORTFOLIO
    // ==================================================

    const portfolio = await Portfolio.findOne({
      user: user._id,
    }).lean()

    // ==================================================
    // LOAD VERIFIED EVIDENCE SNAPSHOT
    // ==================================================

    const snapshot = await EvidenceSnapshot.findOne({
      user: user._id,
    }).lean()

    if (!snapshot) {
      return res.status(404).json({
        message:
          "No verified GitHub evidence found. Please sync GitHub from the Proofly dashboard.",
      })
    }

    // ==================================================
    // LOAD SAVED AI CASE STUDIES
    // ==================================================

    const savedCaseStudies = await CaseStudy.find({
      user: user._id,
    })
      .select(
        "repositoryName role summary skills keyContributions generatedBy updatedAt"
      )
      .lean()

    // ==================================================
    // MAP CASE STUDIES
    // ==================================================

    const caseStudyMap = {}

    savedCaseStudies.forEach((caseStudy) => {
      caseStudyMap[caseStudy.repositoryName] = {
        role: caseStudy.role,

        summary: caseStudy.summary,

        skills: caseStudy.skills || [],

        keyContributions:
          caseStudy.keyContributions || [],

        generatedBy:
          caseStudy.generatedBy || "Gemini AI",

        updatedAt: caseStudy.updatedAt,
      }
    })

    // ==================================================
    // BUILD PUBLIC PROJECTS
    // ==================================================

    const publicProjects = (
      snapshot.repositories || []
    ).map((repo) => ({
      ...repo,

      publicUrl: `/project/${encodeURIComponent(
        username
      )}/${encodeURIComponent(repo.name)}`,

      hasCaseStudy: Boolean(
        caseStudyMap[repo.name]
      ),

      caseStudy:
        caseStudyMap[repo.name] || null,
    }))

    // ==================================================
    // PUBLIC-SAFE RESPONSE
    // ==================================================

    return res.status(200).json({
      developer: {
        name: user.name,

        githubUsername:
          user.githubUsername,

        professionalTitle:
          portfolio?.professionalTitle || "",

        bio:
          portfolio?.bio || "",

        location:
          portfolio?.location || "",

        socialLinks: {
          linkedin:
            portfolio?.socialLinks?.linkedin || "",

          github:
            portfolio?.socialLinks?.github ||
            `https://github.com/${user.githubUsername}`,

          website:
            portfolio?.socialLinks?.website || "",
        },
      },

      proof: {
        score:
          snapshot.proofScore || 0,

        breakdown:
          snapshot.scoreBreakdown || {
            projects: 0,
            skills: 0,
            quality: 0,
            github: 0,
          },
      },

      skills:
        snapshot.skillEvidence || [],

      projects:
        publicProjects,

      verification: {
        github: true,

        analyzedBy:
          "Proofly",

        lastSyncedAt:
          snapshot.lastSyncedAt,
      },
    })
  } catch (error) {
    console.error(
      "Public profile error:",
      error?.message || error
    )

    return res.status(500).json({
      message:
        "Unable to load public developer profile",
    })
  }
})

module.exports = router