const express = require("express")

const Portfolio = require("../models/Portfolio")
const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router()

// ======================================================
// GET MY PORTFOLIO SETTINGS
// GET /api/portfolio
// ======================================================

router.get("/", authMiddleware, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({
      user: req.user._id,
    })

    // Create default portfolio for first-time user
    if (!portfolio) {
      portfolio = await Portfolio.create({
        user: req.user._id,

        socialLinks: {
          github: req.user.githubUsername
            ? `https://github.com/${req.user.githubUsername}`
            : "",
        },
      })
    }

    res.json({
      portfolio,
    })
  } catch (error) {
    console.error(
      "Get portfolio error:",
      error
    )

    res.status(500).json({
      message: "Unable to load portfolio settings",
    })
  }
})

// ======================================================
// UPDATE MY PORTFOLIO
// PUT /api/portfolio
// ======================================================

router.put("/", authMiddleware, async (req, res) => {
  try {
    const {
      professionalTitle,
      bio,
      location,
      featuredProjects,
      socialLinks,
    } = req.body

    const portfolio =
      await Portfolio.findOneAndUpdate(
        {
          user: req.user._id,
        },
        {
          user: req.user._id,

          professionalTitle:
            professionalTitle || "",

          bio: bio || "",

          location: location || "",

          featuredProjects:
            Array.isArray(featuredProjects)
              ? featuredProjects
              : [],

          socialLinks: {
            linkedin:
              socialLinks?.linkedin || "",

            github:
              socialLinks?.github ||
              (req.user.githubUsername
                ? `https://github.com/${req.user.githubUsername}`
                : ""),

            website:
              socialLinks?.website || "",
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      )

    res.json({
      message: "Portfolio updated successfully",
      portfolio,
    })
  } catch (error) {
    console.error(
      "Update portfolio error:",
      error
    )

    res.status(500).json({
      message: "Unable to update portfolio",
    })
  }
})

module.exports = router