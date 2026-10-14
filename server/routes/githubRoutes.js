const express = require("express")
const crypto = require("crypto")

const User = require("../models/User")
const EvidenceSnapshot = require("../models/EvidenceSnapshot")
const protect = require("../middleware/authMiddleware")

const router = express.Router()

// ======================================================
// TEMPORARY OAUTH STATES
// Local development only.
// Use Redis/database/session storage in production.
// ======================================================

const oauthStates = new Map()

// ======================================================
// GITHUB REQUEST HEADERS
// ======================================================

const createGitHubHeaders = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "Proofly",
  "X-GitHub-Api-Version": "2022-11-28",
})

// ======================================================
// 1. START GITHUB OAUTH
// GET /api/github/connect
// Protected route
// ======================================================

router.get("/connect", protect, async (req, res) => {
  try {
    const state = crypto.randomBytes(32).toString("hex")

    oauthStates.set(state, {
      userId: req.user._id.toString(),
      createdAt: Date.now(),
    })

    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: process.env.GITHUB_CALLBACK_URL,
      scope: "read:user user:email",
      state,
    })

    const authorizationUrl =
      `https://github.com/login/oauth/authorize?${params.toString()}`

    return res.status(200).json({
      authorizationUrl,
    })
  } catch (error) {
    console.error(
      "GitHub connect error:",
      error?.message || error
    )

    return res.status(500).json({
      message:
        "Unable to start GitHub connection",
    })
  }
})

// ======================================================
// 2. GITHUB OAUTH CALLBACK
// GET /api/github/callback
// ======================================================

router.get("/callback", async (req, res) => {
  try {
    const { code, state } = req.query

    // --------------------------------------------------
    // Validate callback
    // --------------------------------------------------

    if (!code || !state) {
      return res.status(400).json({
        message:
          "Invalid GitHub callback",
      })
    }

    // --------------------------------------------------
    // Validate OAuth state
    // --------------------------------------------------

    const stateData =
      oauthStates.get(state)

    if (!stateData) {
      return res.status(400).json({
        message:
          "Invalid or expired GitHub connection request",
      })
    }

    // State can only be used once.
    oauthStates.delete(state)

    // --------------------------------------------------
    // Check state expiration
    // --------------------------------------------------

    const tenMinutes =
      10 * 60 * 1000

    if (
      Date.now() - stateData.createdAt >
      tenMinutes
    ) {
      return res.status(400).json({
        message:
          "GitHub connection request expired",
      })
    }

    // ==================================================
    // EXCHANGE AUTHORIZATION CODE FOR TOKEN
    // ==================================================

    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",

        headers: {
          Accept:
            "application/json",

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: process.env.GITHUB_CALLBACK_URL,
        }),
      }
    )

    const tokenData =
      await tokenResponse.json()

    if (
      !tokenResponse.ok ||
      !tokenData.access_token
    ) {
      console.error(
        "GitHub token exchange failed:",
        tokenData
      )

      return res.status(400).json({
        message:
          "Unable to get GitHub access token",
      })
    }

    // ==================================================
    // VERIFY THE NEW TOKEN
    // ==================================================

    const githubHeaders =
      createGitHubHeaders(
        tokenData.access_token
      )

    const githubResponse =
      await fetch(
        "https://api.github.com/user",
        {
          headers:
            githubHeaders,
        }
      )

    const githubUser =
      await githubResponse
        .json()
        .catch(() => ({}))

    if (!githubResponse.ok) {
      console.error(
        "GitHub profile verification failed:",
        githubResponse.status,
        githubUser
      )

      return res.status(400).json({
        message:
          "Unable to verify GitHub account",
      })
    }

    // ==================================================
    // FIND PROOFLY USER
    // ==================================================

    const user =
      await User.findById(
        stateData.userId
      ).select("+githubAccessToken")

    if (!user) {
      return res.status(404).json({
        message:
          "Proofly user not found",
      })
    }

    // ==================================================
    // SAVE / REPLACE GITHUB CONNECTION
    // ==================================================

    user.githubUsername =
      githubUser.login

    user.githubAccessToken =
      tokenData.access_token

    await user.save()

    // ==================================================
    // VERIFY SAVED TOKEN
    // ==================================================

    const savedUser =
      await User.findById(
        user._id
      ).select("+githubAccessToken")

    if (
      !savedUser ||
      !savedUser.githubAccessToken
    ) {
      console.error(
        "GitHub token was not saved correctly"
      )

      return res.status(500).json({
        message:
          "Unable to save GitHub connection",
      })
    }

    const savedTokenCheck =
      await fetch(
        "https://api.github.com/user",
        {
          headers:
            createGitHubHeaders(
              savedUser.githubAccessToken
            ),
        }
      )

    if (!savedTokenCheck.ok) {
      const savedTokenError =
        await savedTokenCheck
          .json()
          .catch(() => ({}))

      console.error(
        "Saved GitHub token verification failed:",
        savedTokenCheck.status,
        savedTokenError
      )

      return res.status(500).json({
        message:
          "GitHub connection could not be verified after saving",
      })
    }

    console.log(
      `GitHub @${githubUser.login} linked to ${user.email}`
    )

    console.log(
      "Saved GitHub token verified successfully ✅"
    )

    // ==================================================
    // REDIRECT BACK TO PROOFLY
    // ==================================================

    return res.redirect(
      `${process.env.FRONTEND_URL}/dashboard?github=connected`
    )
  } catch (error) {
    console.error(
      "GitHub callback error:",
      error?.message || error
    )

    return res.status(500).json({
      message:
        "GitHub connection failed",
    })
  }
})

// ======================================================
// 3. GET REPOSITORIES + ANALYZE LANGUAGES
// GET /api/github/repos
// Protected route
// ======================================================

router.get(
  "/repos",
  protect,
  async (req, res) => {
    try {
      // ==================================================
      // GET CURRENT USER INCLUDING PRIVATE GITHUB TOKEN
      // ==================================================

      const user =
        await User.findById(
          req.user._id
        ).select("+githubAccessToken")

      if (
        !user ||
        !user.githubUsername
      ) {
        return res.status(400).json({
          message:
            "GitHub account is not connected",
        })
      }

      if (!user.githubAccessToken) {
        return res.status(401).json({
          message:
            "Please reconnect GitHub to continue",

          reconnectRequired:
            true,
        })
      }

      // ==================================================
      // GITHUB HEADERS
      // ==================================================

      const githubHeaders =
        createGitHubHeaders(
          user.githubAccessToken
        )

      // ==================================================
      // VALIDATE TOKEN FIRST
      // ==================================================

      const tokenCheckResponse =
        await fetch(
          "https://api.github.com/user",
          {
            headers:
              githubHeaders,
          }
        )

      if (!tokenCheckResponse.ok) {
        const tokenError =
          await tokenCheckResponse
            .json()
            .catch(() => ({}))

        console.error(
          "GitHub token validation error:",
          tokenCheckResponse.status,
          tokenError
        )

        if (
          tokenCheckResponse.status ===
          401
        ) {
          return res.status(401).json({
            message:
              "GitHub authorization expired. Please reconnect GitHub.",

            reconnectRequired:
              true,
          })
        }

        if (
          tokenCheckResponse.status ===
          403 ||
          tokenCheckResponse.status ===
          429
        ) {
          return res
            .status(
              tokenCheckResponse.status
            )
            .json({
              message:
                tokenError.message ||
                "GitHub API limit reached. Please try again later.",
            })
        }

        return res
          .status(
            tokenCheckResponse.status
          )
          .json({
            message:
              tokenError.message ||
              "Unable to verify GitHub authorization",
          })
      }

      // ==================================================
      // GET REPOSITORIES
      // ==================================================

      const response =
        await fetch(
          `https://api.github.com/users/${encodeURIComponent(
            user.githubUsername
          )}/repos?sort=updated&per_page=100`,
          {
            headers:
              githubHeaders,
          }
        )

      const repositories =
        await response
          .json()
          .catch(() => ([]))

      if (!response.ok) {
        console.error(
          "GitHub repository error:",
          response.status,
          repositories
        )

        if (
          response.status === 401
        ) {
          return res.status(401).json({
            message:
              "GitHub authorization expired. Please reconnect GitHub.",

            reconnectRequired:
              true,
          })
        }

        if (
          response.status === 403 ||
          response.status === 429
        ) {
          return res
            .status(response.status)
            .json({
              message:
                repositories.message ||
                "GitHub API limit reached. Please try again later.",
            })
        }

        return res
          .status(response.status)
          .json({
            message:
              repositories.message ||
              "Unable to fetch GitHub repositories",
          })
      }

      // ==================================================
      // ANALYZE EACH REPOSITORY
      // ==================================================

      const analyzedRepositories =
        await Promise.all(
          repositories.map(
            async (repo) => {
              try {
                // ------------------------------------------
                // GET LANGUAGES
                // ------------------------------------------

                const languageResponse =
                  await fetch(
                    repo.languages_url,
                    {
                      headers:
                        githubHeaders,
                    }
                  )

                let languages = {}

                if (
                  languageResponse.ok
                ) {
                  languages =
                    await languageResponse.json()
                } else {
                  const languageError =
                    await languageResponse
                      .json()
                      .catch(() => ({}))

                  console.error(
                    `Unable to fetch languages for ${repo.name}:`,
                    languageError
                  )
                }

                // ------------------------------------------
                // TOTAL LANGUAGE BYTES
                // ------------------------------------------

                const totalBytes =
                  Object.values(
                    languages
                  ).reduce(
                    (
                      total,
                      bytes
                    ) =>
                      total + bytes,
                    0
                  )

                // ------------------------------------------
                // LANGUAGE PERCENTAGES
                // ------------------------------------------

                const languagePercentages =
                  {}

                Object.entries(
                  languages
                ).forEach(
                  ([
                    language,
                    bytes,
                  ]) => {
                    const percentage =
                      totalBytes > 0
                        ? (
                          bytes /
                          totalBytes
                        ) * 100
                        : 0

                    languagePercentages[
                      language
                    ] =
                      Number(
                        percentage.toFixed(
                          1
                        )
                      )
                  }
                )

                // ------------------------------------------
                // RETURN ANALYZED REPOSITORY
                // ------------------------------------------

                return {
                  id:
                    repo.id,

                  name:
                    repo.name,

                  description:
                    repo.description ||
                    "",

                  url:
                    repo.html_url,

                  primaryLanguage:
                    repo.language,

                  languages,

                  languagePercentages,

                  totalBytes,

                  stars:
                    repo.stargazers_count,

                  forks:
                    repo.forks_count,

                  updatedAt:
                    repo.updated_at,
                }
              } catch (error) {
                console.error(
                  `Unable to analyze ${repo.name}:`,
                  error?.message ||
                  error
                )

                return {
                  id:
                    repo.id,

                  name:
                    repo.name,

                  description:
                    repo.description ||
                    "",

                  url:
                    repo.html_url,

                  primaryLanguage:
                    repo.language,

                  languages:
                    {},

                  languagePercentages:
                    {},

                  totalBytes:
                    0,

                  stars:
                    repo.stargazers_count,

                  forks:
                    repo.forks_count,

                  updatedAt:
                    repo.updated_at,
                }
              }
            }
          )
        )

      // ==================================================
      // 4. DETECT UNIQUE SKILLS
      // ==================================================

      const detectedSkills = [
        ...new Set(
          analyzedRepositories.flatMap(
            (repo) =>
              Object.keys(
                repo.languages ||
                {}
              )
          )
        ),
      ]

      // ==================================================
      // 5. BUILD SKILL EVIDENCE
      // ==================================================

      const skillEvidence =
        detectedSkills.map(
          (skill) => {
            const matchingRepositories =
              analyzedRepositories.filter(
                (repo) =>
                  Object.prototype
                    .hasOwnProperty
                    .call(
                      repo.languages ||
                      {},
                      skill
                    )
              )

            const totalBytes =
              matchingRepositories.reduce(
                (
                  total,
                  repo
                ) =>
                  total +
                  (
                    repo.languages[
                    skill
                    ] || 0
                  ),
                0
              )

            // ==============================================
            // EVIDENCE STRENGTH V1
            // ==============================================

            const projectEvidenceScore =
              Math.min(
                matchingRepositories.length *
                25,
                50
              )

            const codeEvidenceScore =
              Math.min(
                (
                  totalBytes /
                  5000
                ) * 50,
                50
              )

            const evidenceScore =
              Math.round(
                projectEvidenceScore +
                codeEvidenceScore
              )

            let evidenceLevel =
              "Developing"

            if (
              evidenceScore >= 75
            ) {
              evidenceLevel =
                "Strong"
            } else if (
              evidenceScore >= 40
            ) {
              evidenceLevel =
                "Proven"
            }

            // ==============================================
            // PROJECT EVIDENCE
            // ==============================================

            const projects =
              matchingRepositories.map(
                (repo) => ({
                  id:
                    repo.id,

                  name:
                    repo.name,

                  url:
                    repo.url,

                  bytes:
                    repo.languages[
                    skill
                    ] || 0,

                  percentage:
                    repo
                      .languagePercentages?.[
                    skill
                    ] || 0,
                })
              )

            return {
              skill,

              projectCount:
                matchingRepositories.length,

              totalBytes,

              evidenceScore,

              evidenceLevel,

              projects,
            }
          }
        )

      // ==================================================
      // 6. PROOF SCORE V1
      // ==================================================

      const projectScore =
        Math.min(
          analyzedRepositories.length *
          10,
          30
        )

      const skillScore =
        Math.min(
          detectedSkills.length *
          10,
          30
        )

      const qualityRepositories =
        analyzedRepositories.filter(
          (repo) =>
            repo.description &&
            Object.keys(
              repo.languages ||
              {}
            ).length > 0
        )

      const qualityScore =
        Math.min(
          qualityRepositories.length *
          10,
          20
        )

      const githubScore =
        user.githubUsername
          ? 20
          : 0

      let proofScore =
        projectScore +
        skillScore +
        qualityScore +
        githubScore

      proofScore =
        Math.min(
          proofScore,
          100
        )

      // ==================================================
      // 7. SAVE VERIFIED EVIDENCE SNAPSHOT
      // ==================================================

      await EvidenceSnapshot.findOneAndUpdate(
        {
          user: user._id,
        },
        {
          user:
            user._id,

          githubUsername:
            user.githubUsername,

          repositories:
            analyzedRepositories,

          skills:
            detectedSkills,

          skillEvidence,

          proofScore,

          scoreBreakdown: {
            projects:
              projectScore,

            skills:
              skillScore,

            quality:
              qualityScore,

            github:
              githubScore,
          },

          lastSyncedAt:
            new Date(),
        },
        {
          returnDocument: "after",
          upsert: true,
          runValidators: true,
        }
      )

      // ==================================================
      // 8. SEND DATA TO FRONTEND
      // ==================================================

      return res
        .status(200)
        .json({
          username:
            user.githubUsername,

          count:
            analyzedRepositories.length,

          skillCount:
            detectedSkills.length,

          skills:
            detectedSkills,

          skillEvidence,

          proofScore,

          scoreBreakdown: {
            projects:
              projectScore,

            skills:
              skillScore,

            quality:
              qualityScore,

            github:
              githubScore,
          },

          repositories:
            analyzedRepositories,
        })
    } catch (error) {
      console.error(
        "Repository analysis error:",
        error?.message || error
      )

      return res.status(500).json({
        message:
          "Unable to analyze repositories",
      })
    }
  }
)

module.exports = router