import API_URL from "../config"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

function PublicProject() {
  const { username, repoName } = useParams()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // ====================================================
  // FETCH PUBLIC PROJECT
  // ====================================================

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(
          `${API_URL}/api/public/project/${encodeURIComponent(
            username
          )}/${encodeURIComponent(repoName)}`
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Unable to load project"
          )
        }

        setData(result)
      } catch (error) {
        console.error(
          "Public project error:",
          error
        )

        setError(
          error.message ||
            "Unable to load project"
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [username, repoName])

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        <p className="text-slate-400">
          Loading verified project...
        </p>
      </div>
    )
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] px-6 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Project unavailable
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
    project,
    caseStudy,
    verification,
  } = data

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-5xl px-6 py-12">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-xl font-bold">
              Proofly
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Developer Evidence Platform
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400">
              ✓ GitHub Evidence
            </span>

            {caseStudy && (
              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-300">
                ✨ AI Generated
              </span>
            )}
          </div>
        </header>

        {/* ==================================================
            HERO
        ================================================== */}

        <section className="py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Verified Project Evidence
          </p>

          <h1 className="mt-4 break-words text-4xl font-bold md:text-5xl">
            {project.name}
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">
            {project.description ||
              "GitHub project analyzed by Proofly."}
          </p>

          <p className="mt-5 text-sm text-slate-500">
            Developer{" "}
            <span className="font-semibold text-slate-300">
              {developer.name}
            </span>
            {" · "}
            <span>
              @{developer.githubUsername}
            </span>
          </p>

          {project.repositoryUrl && (
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center rounded-lg bg-indigo-500 px-5 py-3 font-semibold transition hover:bg-indigo-400"
            >
              View GitHub Repository ↗
            </a>
          )}
        </section>

        {/* ==================================================
            PROJECT STATS
        ================================================== */}

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <p className="text-sm text-slate-500">
              Primary Language
            </p>

            <p className="mt-2 text-xl font-bold">
              {project.primaryLanguage ||
                "Not detected"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <p className="text-sm text-slate-500">
              GitHub Stars
            </p>

            <p className="mt-2 text-xl font-bold">
              {project.stars ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <p className="text-sm text-slate-500">
              GitHub Forks
            </p>

            <p className="mt-2 text-xl font-bold">
              {project.forks ?? 0}
            </p>
          </div>
        </section>

        {/* ==================================================
            SKILLS
        ================================================== */}

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">
                Skills Evidenced
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Technologies detected from GitHub
                repository language data.
              </p>
            </div>

            <span className="text-sm font-semibold text-emerald-400">
              ✓ GitHub
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {project.skills?.length > 0 ? (
              project.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-300"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-slate-500">
                No language evidence detected.
              </p>
            )}
          </div>
        </section>

        {/* ==================================================
            LANGUAGE EVIDENCE
        ================================================== */}

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">
                Verified Language Evidence
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Repository language composition
                reported through GitHub.
              </p>
            </div>

            {verification?.github && (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-400">
                ✓ Verified
              </span>
            )}
          </div>

          <div className="mt-6 space-y-5">
            {Object.entries(
              project.languagePercentages || {}
            ).length > 0 ? (
              Object.entries(
                project.languagePercentages || {}
              ).map(
                ([language, percentage]) => (
                  <div key={language}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {language}
                      </span>

                      <span className="text-slate-400">
                        {percentage}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{
                          width: `${Math.min(
                            Number(percentage) || 0,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )
            ) : (
              <p className="text-sm text-slate-500">
                No language composition available.
              </p>
            )}
          </div>
        </section>

        {/* ==================================================
            AI CASE STUDY
        ================================================== */}

        {caseStudy ? (
          <section className="mt-10 overflow-hidden rounded-2xl border border-purple-500/20 bg-purple-500/5">
            {/* AI Header */}

            <div className="border-b border-purple-500/20 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
                    Proofly Case Study
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    AI Project Case Study
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                    Professional interpretation
                    generated from the available
                    GitHub repository evidence.
                  </p>
                </div>

                <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-300">
                  ✨ AI Generated
                </span>
              </div>
            </div>

            <div className="p-6">

              {/* Role */}

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Suggested Role
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {caseStudy.role ||
                    "Developer"}
                </p>
              </div>

              {/* AI Skills */}

              {caseStudy.skills?.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-semibold">
                    Skills Referenced
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {caseStudy.skills.map(
                      (skill) => (
                        <span
                          key={skill}
                          className="rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-sm text-purple-200"
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Summary */}

              <div className="mt-8">
                <h3 className="font-semibold">
                  Project Summary
                </h3>

                <p className="mt-3 max-w-4xl leading-7 text-slate-300">
                  {caseStudy.summary}
                </p>
              </div>

              {/* Technical Highlights */}

              {caseStudy.keyContributions
                ?.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-semibold">
                    Technical Highlights
                  </h3>

                  <div className="mt-4 space-y-3">
                    {caseStudy.keyContributions.map(
                      (
                        contribution,
                        index
                      ) => (
                        <div
                          key={`${index}-${contribution}`}
                          className="flex gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-sm text-purple-300">
                            ✦
                          </div>

                          <p className="text-sm leading-6 text-slate-300">
                            {contribution}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* AI Disclosure */}

              <div className="mt-8 rounded-xl border border-purple-500/10 bg-slate-950/30 p-4">
                <p className="text-xs leading-5 text-slate-500">
                  <span className="font-semibold text-purple-300">
                    AI disclosure:
                  </span>{" "}
                  This role, summary and technical
                  highlights were generated by{" "}
                  <span className="font-medium text-purple-300">
                    {caseStudy.generatedBy ||
                      "Gemini AI"}
                  </span>{" "}
                  from available repository evidence.
                  They are AI-generated interpretation,
                  not independently verified GitHub
                  facts.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
            <h2 className="text-xl font-bold">
              AI Project Case Study
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              No AI case study has been generated
              for this project yet.
            </p>
          </section>
        )}

        {/* ==================================================
            VERIFICATION
        ================================================== */}

        <section className="mt-10 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-emerald-400">
                ✓ GitHub Evidence Verified
              </p>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Repository evidence was retrieved
                through GitHub and analyzed by{" "}
                <span className="font-medium text-slate-300">
                  {verification?.analyzedBy ||
                    "Proofly"}
                </span>
                .
              </p>
            </div>

            {verification?.aiGenerated && (
              <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                ✨ AI content included
              </span>
            )}
          </div>
        </section>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <footer className="mt-16 border-t border-slate-800 pt-8 text-center">
          <p className="text-sm text-slate-500">
            Powered by{" "}
            <span className="font-semibold text-slate-300">
              Proofly
            </span>
            {" · "}
            Don&apos;t just list your skills.
            Prove them.
          </p>

          <p className="mt-2 text-xs text-slate-600">
            GitHub evidence and AI interpretation
            are displayed separately.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default PublicProject