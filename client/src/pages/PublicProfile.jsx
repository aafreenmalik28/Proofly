import API_URL from "../config"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

function PublicProfile() {
  const { username } = useParams()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // ======================================================
  // FETCH PUBLIC PROFILE
  // ======================================================

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(
          `${API_URL}/api/public/profile/${encodeURIComponent(
            username
          )}`
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.message || "Unable to load developer profile"
          )
        }

        setData(result)
      } catch (error) {
        console.error("Public profile error:", error)

        setError(
          error.message || "Unable to load developer profile"
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username])

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-400" />

          <p className="mt-4 text-sm text-slate-400">
            Loading Proofly profile...
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
      <div className="flex min-h-screen items-center justify-center bg-[#050816] px-6 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">
            Profile unavailable
          </h1>

          <p className="mt-3 text-slate-400">
            {error}
          </p>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const {
    developer,
    proof,
    skills = [],
    projects = [],
    verification,
  } = data

  const socialLinks = developer?.socialLinks || {}

  const lastSynced = verification?.lastSyncedAt
    ? new Date(verification.lastSyncedAt).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
    : null

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 lg:px-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <Link to="/" className="group">
            <h1 className="text-2xl font-bold tracking-tight">
              Proof
              <span className="text-indigo-400">
                ly
              </span>
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Developer Evidence Platform
            </p>
          </Link>

          {verification?.github && (
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400">
              <span>✓</span>
              <span>GitHub Verified</span>
            </div>
          )}
        </header>

        {/* =================================================
            PROFILE
        ================================================= */}

        <section className="py-10">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 sm:p-8">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">

              {/* PROFILE INFO */}

              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-400">
                  Verified Developer
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  {developer?.name}
                </h2>

                {developer?.professionalTitle && (
                  <p className="mt-2 text-lg font-medium text-slate-200">
                    {developer.professionalTitle}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                  <span>
                    @{developer?.githubUsername}
                  </span>

                  {developer?.location && (
                    <span>
                      📍 {developer.location}
                    </span>
                  )}
                </div>

                {developer?.bio && (
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                    {developer.bio}
                  </p>
                )}

                {/* SOCIAL LINKS */}

                <div className="mt-6 flex flex-wrap gap-3">
                  {socialLinks.github && (
                    <a
                      href={socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
                    >
                      GitHub ↗
                    </a>
                  )}

                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
                    >
                      LinkedIn ↗
                    </a>
                  )}

                  {socialLinks.website && (
                    <a
                      href={socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
                    >
                      Website ↗
                    </a>
                  )}
                </div>
              </div>

              {/* PROOF SCORE */}

              <div className="shrink-0">
                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 text-center lg:min-w-[190px]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">
                    Proof Score
                  </p>

                  <div className="mt-3">
                    <span className="text-5xl font-bold text-white">
                      {proof?.score ?? 0}
                    </span>

                    <span className="text-lg text-slate-500">
                      /100
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    Verified evidence score
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            SCORE BREAKDOWN
        ================================================= */}

        <section>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <ScoreCard
              label="Projects"
              score={proof?.breakdown?.projects}
              max={30}
            />

            <ScoreCard
              label="Skills"
              score={proof?.breakdown?.skills}
              max={30}
            />

            <ScoreCard
              label="Repository Quality"
              score={proof?.breakdown?.quality}
              max={20}
            />

            <ScoreCard
              label="GitHub Verified"
              score={proof?.breakdown?.github}
              max={20}
            />
          </div>
        </section>

        {/* =================================================
            VERIFIED SKILLS
        ================================================= */}

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
                Evidence
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                Verified Skills
              </h3>
            </div>

            <p className="text-sm text-slate-500">
              {skills.length}{" "}
              {skills.length === 1
                ? "skill"
                : "skills"}{" "}
              detected
            </p>
          </div>

          {skills.length > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {skills.map((skill) => (
                <div
                  key={skill.skill}
                  className="rounded-xl border border-slate-800 bg-slate-900/30 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">
                        {skill.skill}
                      </h4>

                      <p className="mt-1 text-xs text-slate-500">
                        {skill.projectCount}{" "}
                        {skill.projectCount === 1
                          ? "verified project"
                          : "verified projects"}
                      </p>
                    </div>

                    <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300">
                      {skill.evidenceLevel}
                    </span>
                  </div>

                  <div className="mt-5 flex items-end justify-between">
                    <p className="text-2xl font-bold text-indigo-400">
                      {skill.evidenceScore}
                      <span className="text-xs font-normal text-slate-500">
                        /100
                      </span>
                    </p>

                    <span className="text-xs text-slate-500">
                      {skill.projectCount} project
                      {skill.projectCount === 1
                        ? ""
                        : "s"}
                    </span>
                  </div>

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{
                        width: `${Math.min(
                          Math.max(
                            skill.evidenceScore || 0,
                            0
                          ),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No verified skills available." />
          )}
        </section>

        {/* =================================================
            VERIFIED PROJECTS
        ================================================= */}

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Proof of Work
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                Verified Projects
              </h3>
            </div>

            <p className="text-sm text-slate-500">
              {projects.length}{" "}
              {projects.length === 1
                ? "project"
                : "projects"}{" "}
              analyzed
            </p>
          </div>

          {projects.length > 0 ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/30 p-6 transition hover:border-slate-700"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="break-words text-lg font-bold">
                        {project.name}
                      </h4>

                      {project.primaryLanguage && (
                        <p className="mt-2 text-xs text-slate-500">
                          Primary:{" "}
                          <span className="text-slate-300">
                            {project.primaryLanguage}
                          </span>
                        </p>
                      )}
                    </div>

                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                      ✓ GitHub
                    </span>
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-6 text-slate-400">
                    {project.description ||
                      "GitHub project analyzed by Proofly."}
                  </p>

                  {/* LANGUAGES */}

                  {Object.keys(
                    project.languagePercentages || {}
                  ).length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {Object.entries(
                        project.languagePercentages
                      ).map(
                        ([language, percentage]) => (
                          <span
                            key={language}
                            className="rounded-full border border-slate-700 bg-slate-800/50 px-2.5 py-1 text-xs text-slate-300"
                          >
                            {language} {percentage}%
                          </span>
                        )
                      )}
                    </div>
                  )}

                  {/* CASE STUDY */}

                  {project.hasCaseStudy && (
                    <div className="mt-5 rounded-xl border border-purple-500/15 bg-purple-500/5 p-4">
                      <div className="flex items-center gap-2">
                        <span>✨</span>

                        <p className="text-xs font-semibold uppercase tracking-wide text-purple-300">
                          AI Generated Case Study
                        </p>
                      </div>

                      {project.caseStudy?.role && (
                        <p className="mt-3 text-sm font-semibold text-slate-200">
                          {project.caseStudy.role}
                        </p>
                      )}

                      {project.caseStudy?.summary && (
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                          {project.caseStudy.summary}
                        </p>
                      )}
                    </div>
                  )}

                  {/* ACTIONS */}

                  <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-800 pt-5">
                    <Link
                      to={project.publicUrl}
                      className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
                    >
                      View Evidence →
                    </Link>

                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                    >
                      GitHub ↗
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState text="No verified projects available." />
          )}
        </section>

        {/* =================================================
            VERIFICATION
        ================================================= */}

        <section className="mt-12 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 font-bold text-emerald-400">
              ✓
            </div>

            <div>
              <h3 className="font-semibold text-emerald-400">
                GitHub Evidence Verified
              </h3>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Repository and language evidence on this
                profile was analyzed by{" "}
                <span className="font-medium text-slate-300">
                  {verification?.analyzedBy ||
                    "Proofly"}
                </span>
                .
              </p>

              {lastSynced && (
                <p className="mt-2 text-xs text-slate-500">
                  Evidence last synced: {lastSynced}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="mt-14 border-t border-slate-800 py-8 text-center">
          <p className="text-sm text-slate-500">
            Powered by{" "}
            <span className="font-semibold text-slate-300">
              Proofly
            </span>
            {" · "}
            Don&apos;t just list your skills. Prove them.
          </p>
        </footer>
      </div>
    </div>
  )
}

// ======================================================
// SCORE CARD
// ======================================================

function ScoreCard({ label, score = 0, max }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold">
        {score ?? 0}

        <span className="ml-1 text-xs font-normal text-slate-500">
          /{max}
        </span>
      </p>
    </div>
  )
}

// ======================================================
// EMPTY STATE
// ======================================================

function EmptyState({ text }) {
  return (
    <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/30 p-6">
      <p className="text-sm text-slate-500">
        {text}
      </p>
    </div>
  )
}

export default PublicProfile