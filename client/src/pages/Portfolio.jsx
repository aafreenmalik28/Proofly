import API_URL from "../config"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function Portfolio() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)

  const [portfolio, setPortfolio] = useState({
    professionalTitle: "",
    bio: "",
    location: "",
    socialLinks: {
      linkedin: "",
      github: "",
      website: "",
    },
  })

  const [repositories, setRepositories] = useState([])
  const [skills, setSkills] = useState([])
  const [skillEvidence, setSkillEvidence] = useState([])
  const [proofScore, setProofScore] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // ======================================================
  // LOAD COMPLETE PORTFOLIO
  // ======================================================

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          navigate("/login")
          return
        }

        // ==================================================
        // 1. GET CURRENT PROOFLY USER
        // ==================================================

        const userResponse = await fetch(
          `${API_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const userData = await userResponse.json()

        if (!userResponse.ok) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")

          navigate("/login")
          return
        }

        const currentUser =
          userData.user || userData

        setUser(currentUser)

        if (!currentUser.githubUsername) {
          throw new Error(
            "Connect GitHub before building your portfolio"
          )
        }

        // ==================================================
        // 2. GET SAVED PORTFOLIO SETTINGS
        // ==================================================

        const portfolioResponse = await fetch(
          `${API_URL}/api/portfolio`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const portfolioData =
          await portfolioResponse.json()

        if (!portfolioResponse.ok) {
          throw new Error(
            portfolioData.message ||
              "Unable to load portfolio settings"
          )
        }

        const savedPortfolio =
          portfolioData.portfolio || {}

        setPortfolio({
          professionalTitle:
            savedPortfolio.professionalTitle || "",

          bio:
            savedPortfolio.bio || "",

          location:
            savedPortfolio.location || "",

          socialLinks: {
            linkedin:
              savedPortfolio.socialLinks?.linkedin ||
              "",

            github:
              savedPortfolio.socialLinks?.github ||
              "",

            website:
              savedPortfolio.socialLinks?.website ||
              "",
          },
        })

        // ==================================================
        // 3. GET AUTHENTICATED GITHUB EVIDENCE
        // ==================================================

        const repoResponse = await fetch(
          `${API_URL}/api/github/repos`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const repoData =
          await repoResponse.json()

        if (!repoResponse.ok) {
          if (repoData.reconnectRequired) {
            throw new Error(
              "GitHub authorization needs to be renewed. Reconnect GitHub from your dashboard."
            )
          }

          throw new Error(
            repoData.message ||
              "Unable to load portfolio evidence"
          )
        }

        setRepositories(
          repoData.repositories || []
        )

        setSkills(
          repoData.skills || []
        )

        setSkillEvidence(
          repoData.skillEvidence || []
        )

        setProofScore(
          repoData.proofScore || 0
        )
      } catch (error) {
        console.error(
          "Portfolio error:",
          error
        )

        setError(
          error.message ||
            "Unable to load portfolio"
        )
      } finally {
        setLoading(false)
      }
    }

    loadPortfolio()
  }, [navigate])

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <p className="text-lg font-semibold">
            Building your Proofly portfolio...
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Loading your profile and verified
            GitHub evidence
          </p>
        </div>
      </div>
    )
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-lg text-center">

          <h1 className="text-2xl font-bold">
            Unable to load portfolio
          </h1>

          <p className="mt-3 text-slate-400">
            {error}
          </p>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="mt-6 rounded-lg bg-indigo-500 px-5 py-3 font-semibold transition hover:bg-indigo-400"
          >
            Back to Dashboard
          </button>

        </div>
      </div>
    )
  }

  // ======================================================
  // SOCIAL LINKS
  // ======================================================

  const hasSocialLinks =
    portfolio.socialLinks.linkedin ||
    portfolio.socialLinks.github ||
    portfolio.socialLinks.website

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* =================================================
            TOP NAVIGATION
        ================================================= */}

        <div className="mb-12 flex flex-wrap items-center justify-between gap-4">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="text-sm font-medium text-slate-400 transition hover:text-white"
          >
            ← Back to Dashboard
          </button>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() =>
                navigate("/portfolio/edit")
              }
              className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              ✎ Edit Portfolio
            </button>

            <button
              onClick={() =>
                window.open(
                  `/u/${encodeURIComponent(
                    user.githubUsername
                  )}`,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              View Public Profile ↗
            </button>

            <div className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-300">
              Proofly Portfolio
            </div>

          </div>
        </div>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 md:p-10">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">

            <div className="max-w-3xl">

              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
                Verified Developer Portfolio
              </p>

              <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                {user?.name || "Developer"}
              </h1>

              {portfolio.professionalTitle ? (
                <p className="mt-4 text-xl font-semibold text-indigo-300 md:text-2xl">
                  {portfolio.professionalTitle}
                </p>
              ) : (
                <p className="mt-4 text-xl text-slate-400">
                  Developer
                </p>
              )}

              {portfolio.bio ? (
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
                  {portfolio.bio}
                </p>
              ) : (
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
                  Don&apos;t just list your skills.
                  Prove them with real project
                  evidence.
                </p>
              )}

              <div className="mt-7 flex flex-wrap gap-3">

                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                  ✓ GitHub Verified
                </span>

                <span className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300">
                  @{user.githubUsername}
                </span>

                {portfolio.location && (
                  <span className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300">
                    📍 {portfolio.location}
                  </span>
                )}

              </div>

            </div>

            {/* SOCIAL LINKS */}

            {hasSocialLinks && (
              <div className="flex min-w-[180px] flex-wrap gap-3 lg:max-w-[240px] lg:justify-end">

                {portfolio.socialLinks.linkedin && (
                  <a
                    href={
                      portfolio.socialLinks.linkedin
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-indigo-500 hover:text-white"
                  >
                    LinkedIn ↗
                  </a>
                )}

                {portfolio.socialLinks.github && (
                  <a
                    href={
                      portfolio.socialLinks.github
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-indigo-500 hover:text-white"
                  >
                    GitHub ↗
                  </a>
                )}

                {portfolio.socialLinks.website && (
                  <a
                    href={
                      portfolio.socialLinks.website
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-indigo-500 hover:text-white"
                  >
                    Website ↗
                  </a>
                )}

              </div>
            )}

          </div>

        </section>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mt-8 grid gap-6 md:grid-cols-3">

          {/* PROOF SCORE */}

          <div className="rounded-2xl border border-indigo-500/20 bg-slate-900 p-6">

            <p className="text-sm font-medium text-slate-400">
              Proof Score
            </p>

            <div className="mt-3 flex items-end gap-1">

              <p className="text-4xl font-bold text-indigo-400">
                {proofScore}
              </p>

              <span className="mb-1 text-sm text-slate-500">
                /100
              </span>

            </div>

            <p className="mt-3 text-sm text-slate-500">
              Calculated from verified repository
              evidence.
            </p>

          </div>

          {/* SKILLS */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm font-medium text-slate-400">
              Verified Skills
            </p>

            <p className="mt-3 text-4xl font-bold">
              {skills.length}
            </p>

            <p className="mt-3 text-sm text-slate-500">
              Technologies evidenced across
              GitHub projects.
            </p>

          </div>

          {/* PROJECTS */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm font-medium text-slate-400">
              Verified Projects
            </p>

            <p className="mt-3 text-4xl font-bold">
              {repositories.length}
            </p>

            <p className="mt-3 text-sm text-slate-500">
              GitHub repositories analyzed by
              Proofly.
            </p>

          </div>

        </section>

        {/* =================================================
            VERIFIED SKILLS
        ================================================= */}

        <section className="mt-12">

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
              Evidence
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Verified Skills
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Skills detected from your real GitHub
              repository data.
            </p>
          </div>

          {skillEvidence.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

              {skillEvidence.map((skill) => (
                <div
                  key={skill.skill}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h3 className="font-bold">
                        {skill.skill}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {skill.projectCount} verified{" "}
                        {skill.projectCount === 1
                          ? "project"
                          : "projects"}
                      </p>

                    </div>

                    <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                      {skill.evidenceLevel ||
                        "Developing"}
                    </span>

                  </div>

                  <div className="mt-5 flex items-end gap-1">

                    <span className="text-2xl font-bold text-indigo-400">
                      {skill.evidenceScore || 0}
                    </span>

                    <span className="mb-1 text-xs text-slate-500">
                      /100
                    </span>

                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">

                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{
                        width: `${Math.min(
                          skill.evidenceScore || 0,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>
              ))}

            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
              No verified skill evidence available yet.
            </div>
          )}

        </section>

        {/* =================================================
            VERIFIED PROJECTS
        ================================================= */}

        <section className="mt-12 pb-16">

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-400">
              Proof of Work
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Verified Projects
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Real repositories analyzed by Proofly
              as evidence of your development work.
            </p>

          </div>

          {repositories.length > 0 ? (
            <div className="mt-6 grid gap-6 md:grid-cols-2">

              {repositories.map((project) => (

                <article
                  key={project.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h3 className="text-xl font-bold">
                        {project.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Primary language:{" "}
                        {project.primaryLanguage ||
                          "Not detected"}
                      </p>

                    </div>

                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      ✓ GitHub
                    </span>

                  </div>

                  <p className="mt-5 text-sm leading-6 text-slate-400">
                    {project.description ||
                      "No repository description provided."}
                  </p>

                  {/* LANGUAGES */}

                  <div className="mt-5 flex flex-wrap gap-2">

                    {Object.entries(
                      project.languagePercentages ||
                        {}
                    ).map(
                      ([language, percentage]) => (

                        <span
                          key={language}
                          className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300"
                        >
                          {language} {percentage}%
                        </span>

                      )
                    )}

                  </div>

                  {/* REPOSITORY STATS */}

                  <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-800 pt-5 text-xs text-slate-500">

                    <span>
                      ★ {project.stars || 0}
                    </span>

                    <span>
                      Forks {project.forks || 0}
                    </span>

                  </div>

                  {/* ACTIONS */}

                  <div className="mt-5 flex flex-wrap gap-3">

                    <button
                      onClick={() =>
                        navigate(
                          `/project/${encodeURIComponent(
                            user.githubUsername
                          )}/${encodeURIComponent(
                            project.name
                          )}`
                        )
                      }
                      className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold transition hover:bg-indigo-400"
                    >
                      View Evidence →
                    </button>

                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
                    >
                      GitHub ↗
                    </a>

                  </div>

                </article>

              ))}

            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
              No verified projects available yet.
            </div>
          )}

        </section>

      </div>
    </div>
  )
}

export default Portfolio