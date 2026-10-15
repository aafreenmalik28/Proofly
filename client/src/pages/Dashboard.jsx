import API_URL from "../config"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function Dashboard() {
    const navigate = useNavigate()

    // ======================================================
    // STATE
    // ======================================================

    const [user, setUser] = useState(null)
    const [repositories, setRepositories] = useState([])
    const [skills, setSkills] = useState([])
    const [proofScore, setProofScore] = useState(0)

    const [skillEvidence, setSkillEvidence] = useState([])
    const [selectedSkill, setSelectedSkill] = useState(null)

    const [scoreBreakdown, setScoreBreakdown] = useState({
        projects: 0,
        skills: 0,
        quality: 0,
        github: 0,
    })

    const [loading, setLoading] = useState(true)
    const [reposLoading, setReposLoading] = useState(false)
    const [repoError, setRepoError] = useState("")

    const [caseStudies, setCaseStudies] = useState({})
    const [caseStudyLoading, setCaseStudyLoading] = useState(null)
    const [caseStudyError, setCaseStudyError] = useState({})

    const [githubReconnectRequired, setGitHubReconnectRequired] =
        useState(false)

    const [githubConnectionMessage, setGitHubConnectionMessage] =
        useState("")

    // NEW: tracks which repository share link was copied
    const [copiedRepoId, setCopiedRepoId] = useState(null)

    // Tracks public profile link copy state
    const [profileLinkCopied, setProfileLinkCopied] = useState(false)

    // ======================================================
    // 1. GET LOGGED-IN PROOFLY USER
    // ======================================================

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token")

                if (!token) {
                    navigate("/login")
                    return
                }

                const response = await fetch(
                    `${API_URL}/api/auth/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                const data = await response.json()

                if (!response.ok) {
                    localStorage.removeItem("token")
                    localStorage.removeItem("user")

                    navigate("/login")
                    return
                }

                setUser(data.user)
            } catch (error) {
                console.error(
                    "Unable to fetch user:",
                    error
                )
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [navigate])

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const githubStatus = params.get("github")

        if (githubStatus === "already_connected") {
            setGitHubConnectionMessage(
                "This GitHub account is already connected to another Proofly account."
            )

            window.history.replaceState(
                {},
                "",
                window.location.pathname
            )
        }
    }, [])

    // ======================================================
    // 2. FETCH + ANALYZE GITHUB REPOSITORIES
    // ======================================================

    useEffect(() => {
        const fetchRepositories = async () => {
            if (!user?.githubUsername) {
                return
            }

            try {
                setReposLoading(true)
                setRepoError("")

                const token =
                    localStorage.getItem("token")

                const response = await fetch(
                    `${API_URL}/api/github/repos`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                const data = await response.json()

                if (!response.ok) {
                    setRepoError(
                        data.message ||
                        "Unable to fetch repositories"
                    )

                    if (data.reconnectRequired) {
                        setGitHubReconnectRequired(true)
                    }

                    return
                }

                setGitHubReconnectRequired(false)

                setRepositories(
                    data.repositories || []
                )

                setSkills(
                    data.skills || []
                )

                setSkillEvidence(
                    data.skillEvidence || []
                )

                setProofScore(
                    data.proofScore || 0
                )

                setScoreBreakdown(
                    data.scoreBreakdown || {
                        projects: 0,
                        skills: 0,
                        quality: 0,
                        github: 0,
                    }
                )
            } catch (error) {
                console.error(
                    "Unable to fetch repositories:",
                    error
                )

                setRepoError(
                    "Unable to fetch repositories"
                )
            } finally {
                setReposLoading(false)
            }
        }

        fetchRepositories()
    }, [user])

    // ======================================================
    // 3. CONNECT / RECONNECT GITHUB
    // ======================================================

    const handleConnectGitHub = async () => {
        try {
            const token =
                localStorage.getItem("token")

            const response = await fetch(
                `${API_URL}/api/github/connect`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            const data = await response.json()

            if (!response.ok) {
                console.error(data.message)
                return
            }

            window.location.href =
                data.authorizationUrl
        } catch (error) {
            console.error(
                "Unable to connect GitHub:",
                error
            )
        }
    }

    // ======================================================
    // 4. LOGOUT
    // ======================================================

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")

        navigate("/login")
    }

    // ======================================================
    // 5. SELECT SKILL
    // ======================================================

    const handleSkillClick = (skill) => {
        const evidence = skillEvidence.find(
            (item) => item.skill === skill
        )

        setSelectedSkill(evidence || null)
    }

    // ======================================================
    // 6. GENERATE PROJECT CASE STUDY
    // ======================================================

    const handleGenerateCaseStudy = async (repo) => {
        try {
            setCaseStudyLoading(repo.id)

            setCaseStudyError((previous) => ({
                ...previous,
                [repo.id]: "",
            }))

            const token =
                localStorage.getItem("token")

            const response = await fetch(
                `${API_URL}/api/case-study/generate`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        name: repo.name,
                        description: repo.description,
                        languages: repo.languages,
                        languagePercentages:
                            repo.languagePercentages,
                        stars: repo.stars,
                        forks: repo.forks,
                        url: repo.url,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                setCaseStudyError((previous) => ({
                    ...previous,

                    [repo.id]:
                        data.message ||
                        "Unable to generate case study",
                }))

                return
            }

            setCaseStudies((previous) => ({
                ...previous,
                [repo.id]: data.caseStudy,
            }))
        } catch (error) {
            console.error(
                "Case study generation error:",
                error
            )

            setCaseStudyError((previous) => ({
                ...previous,
                [repo.id]:
                    "Unable to generate case study",
            }))
        } finally {
            setCaseStudyLoading(null)
        }
    }

    // ======================================================
    // 7. PUBLIC PROJECT URL
    // ======================================================

    const getPublicProjectUrl = (repo) => {
        if (!user?.githubUsername) {
            return ""
        }

        return `${window.location.origin
            }/project/${encodeURIComponent(
                user.githubUsername
            )}/${encodeURIComponent(repo.name)}`
    }

    // ======================================================
    // 8. COPY SHARE LINK
    // ======================================================

    const handleCopyShareLink = async (repo) => {
        try {
            const publicUrl =
                getPublicProjectUrl(repo)

            if (!publicUrl) {
                return
            }

            await navigator.clipboard.writeText(
                publicUrl
            )

            setCopiedRepoId(repo.id)

            setTimeout(() => {
                setCopiedRepoId(null)
            }, 2000)
        } catch (error) {
            console.error(
                "Unable to copy share link:",
                error
            )
        }
    }

    // ======================================================
    // 9. PUBLIC PROFILE URL
    // ======================================================

    const getPublicProfileUrl = () => {
        if (!user?.githubUsername) {
            return ""
        }

        return `${window.location.origin}/u/${encodeURIComponent(
            user.githubUsername
        )}`
    }


    // ======================================================
    // 10. VIEW PUBLIC PROFILE
    // ======================================================

    const handleViewProfile = () => {
        const profileUrl = getPublicProfileUrl()

        if (!profileUrl) {
            return
        }

        window.open(
            profileUrl,
            "_blank",
            "noopener,noreferrer"
        )
    }


    // ======================================================
    // 11. COPY PUBLIC PROFILE LINK
    // ======================================================

    const handleCopyProfileLink = async () => {
        try {
            const profileUrl = getPublicProfileUrl()

            if (!profileUrl) {
                return
            }

            await navigator.clipboard.writeText(
                profileUrl
            )

            setProfileLinkCopied(true)

            setTimeout(() => {
                setProfileLinkCopied(false)
            }, 2000)
        } catch (error) {
            console.error(
                "Unable to copy profile link:",
                error
            )
        }
    }

    // ======================================================
    // LOADING SCREEN
    // ======================================================

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
                <p className="text-slate-400">
                    Loading Proofly...
                </p>
            </div>
        )
    }

    // ======================================================
    // PAGE
    // ======================================================

    return (
        <div className="min-h-screen bg-[#050816] text-white">

            {/* =================================================
          NAVBAR
      ================================================= */}

            <nav className="border-b border-slate-800">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

                    <h1 className="text-2xl font-bold">
                        Proof
                        <span className="text-indigo-400">
                            ly
                        </span>
                    </h1>

                    <div className="flex items-center gap-4">

                        {user && (
                            <p className="hidden text-sm text-slate-400 sm:block">
                                {user.email}
                            </p>
                        )}

                        <button
                            onClick={handleLogout}
                            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium transition hover:border-slate-500"
                        >
                            Logout
                        </button>

                    </div>
                </div>
            </nav>

            {/* =================================================
          MAIN
      ================================================= */}

            <main className="mx-auto max-w-6xl px-6 py-12">

                {/* HEADING */}

                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

                    {/* WELCOME */}

                    {githubConnectionMessage && (
                        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-semibold text-amber-300">
                                        GitHub account already connected
                                    </p>

                                    <p className="mt-1 text-sm text-amber-200/80">
                                        {githubConnectionMessage}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setGitHubConnectionMessage("")
                                    }
                                    className="text-amber-300 transition hover:text-white"
                                    aria-label="Dismiss message"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <p className="text-sm text-slate-400">
                            Developer Dashboard
                        </p>

                        <h2 className="mt-2 text-3xl font-bold">
                            Welcome back, {user?.name} 👋
                        </h2>

                        <p className="mt-2 text-slate-400">
                            Your development work is becoming
                            verifiable proof.
                        </p>
                    </div>

                    {/* PUBLIC PROFILE ACTIONS */}

                    {user?.githubUsername && (
                        <div className="flex flex-wrap gap-3">

                            <button
                                onClick={handleViewProfile}
                                className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
                            >
                                👤 View My Profile ↗
                            </button>

                            <button
                                onClick={handleCopyProfileLink}
                                className={`rounded-lg border px-5 py-2.5 text-sm font-semibold transition ${profileLinkCopied
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                                    }`}
                            >
                                {profileLinkCopied
                                    ? "✓ Profile Link Copied!"
                                    : "🔗 Copy Profile Link"}
                            </button>

                            <button
                                onClick={() => navigate("/portfolio")}
                                className="rounded-lg bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400"
                            >
                                💼 My Portfolio
                            </button>

                        </div>
                    )}

                </div>

                {/* =================================================
            STATS
        ================================================= */}

                <div className="mt-10 grid gap-5 md:grid-cols-3">

                    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
                        <p className="text-sm text-slate-400">
                            Projects analyzed
                        </p>

                        <p className="mt-3 text-3xl font-bold">
                            {repositories.length}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
                        <p className="text-sm text-slate-400">
                            Skills detected
                        </p>

                        <p className="mt-3 text-3xl font-bold">
                            {skills.length}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
                        <p className="text-sm text-slate-400">
                            Proof score
                        </p>

                        <p className="mt-3 text-3xl font-bold text-indigo-400">
                            {proofScore}

                            <span className="text-lg text-slate-500">
                                /100
                            </span>
                        </p>
                    </div>

                </div>

                {/* =================================================
            PROOF SCORE BREAKDOWN
        ================================================= */}

                <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/40 p-7">

                    <div className="flex items-center justify-between">

                        <div>
                            <h3 className="text-lg font-semibold">
                                Proof Score Breakdown
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Your score is based on real GitHub
                                evidence.
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-2xl font-bold text-indigo-400">
                                {proofScore}

                                <span className="text-sm text-slate-500">
                                    /100
                                </span>
                            </p>
                        </div>

                    </div>

                    <div className="mt-7 grid gap-4 md:grid-cols-4">

                        <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                            <p className="text-sm text-slate-400">
                                Projects
                            </p>

                            <p className="mt-2 text-xl font-semibold">
                                {scoreBreakdown.projects}

                                <span className="text-sm text-slate-500">
                                    /30
                                </span>
                            </p>
                        </div>

                        <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                            <p className="text-sm text-slate-400">
                                Skills
                            </p>

                            <p className="mt-2 text-xl font-semibold">
                                {scoreBreakdown.skills}

                                <span className="text-sm text-slate-500">
                                    /30
                                </span>
                            </p>
                        </div>

                        <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                            <p className="text-sm text-slate-400">
                                Repository Quality
                            </p>

                            <p className="mt-2 text-xl font-semibold">
                                {scoreBreakdown.quality}

                                <span className="text-sm text-slate-500">
                                    /20
                                </span>
                            </p>
                        </div>

                        <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                            <p className="text-sm text-slate-400">
                                GitHub Verified
                            </p>

                            <p className="mt-2 text-xl font-semibold">
                                {scoreBreakdown.github}

                                <span className="text-sm text-slate-500">
                                    /20
                                </span>
                            </p>
                        </div>

                    </div>
                </div>

                {/* =================================================
            DETECTED SKILLS
        ================================================= */}

                {skills.length > 0 && (
                    <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/40 p-7">

                        <div>
                            <h3 className="text-lg font-semibold">
                                Detected Skills
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Technologies found in your GitHub
                                repositories. Click a skill to view
                                its evidence.
                            </p>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">

                            {skills.map((skill) => (
                                <button
                                    key={skill}
                                    onClick={() =>
                                        handleSkillClick(skill)
                                    }
                                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${selectedSkill?.skill === skill
                                        ? "border-indigo-400 bg-indigo-500/20 text-indigo-200"
                                        : "border-indigo-500/20 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200"
                                        }`}
                                >
                                    {skill}
                                </button>
                            ))}

                        </div>
                    </div>
                )}

                {/* =================================================
            SELECTED SKILL EVIDENCE
        ================================================= */}

                {selectedSkill && (
                    <div className="mt-6 rounded-xl border border-indigo-500/20 bg-slate-900/40 p-7">

                        <div className="flex items-start justify-between gap-4">

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                                    Verified Skill Evidence
                                </p>

                                <h3 className="mt-2 text-2xl font-bold text-white">
                                    {selectedSkill.skill}
                                </h3>

                                <p className="mt-2 text-sm text-slate-400">
                                    Evidence collected from your
                                    GitHub repositories.
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setSelectedSkill(null)
                                }
                                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
                            >
                                Close
                            </button>

                        </div>

                        {/* EVIDENCE STRENGTH */}

                        <div className="mt-7 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        Evidence Strength
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Based on verified GitHub project
                                        and code evidence.
                                    </p>
                                </div>

                                <div className="sm:text-right">

                                    <p className="text-2xl font-bold text-indigo-400">
                                        {selectedSkill.evidenceScore ?? 0}

                                        <span className="text-sm font-normal text-slate-500">
                                            /100
                                        </span>
                                    </p>

                                    <span className="mt-1 inline-block rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                                        {selectedSkill.evidenceLevel ||
                                            "Developing"}
                                    </span>

                                </div>
                            </div>

                            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-800">
                                <div
                                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                                    style={{
                                        width: `${Math.min(
                                            Math.max(
                                                selectedSkill.evidenceScore ||
                                                0,
                                                0
                                            ),
                                            100
                                        )}%`,
                                    }}
                                />
                            </div>

                            <div className="mt-2 flex justify-between text-xs text-slate-600">
                                <span>Developing</span>
                                <span>Proven</span>
                                <span>Strong</span>
                            </div>

                        </div>

                        {/* EVIDENCE STATS */}

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">

                            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">

                                <p className="text-sm text-slate-500">
                                    Projects using this skill
                                </p>

                                <p className="mt-2 text-2xl font-bold text-white">
                                    {selectedSkill.projectCount}
                                </p>

                                <p className="mt-1 text-xs text-slate-600">
                                    Verified GitHub{" "}
                                    {selectedSkill.projectCount === 1
                                        ? "project"
                                        : "projects"}
                                </p>

                            </div>

                            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">

                                <p className="text-sm text-slate-500">
                                    Code evidence
                                </p>

                                <p className="mt-2 text-2xl font-bold text-white">
                                    {(
                                        selectedSkill.totalBytes || 0
                                    ).toLocaleString()}{" "}

                                    <span className="text-sm font-normal text-slate-500">
                                        bytes
                                    </span>
                                </p>

                                <p className="mt-1 text-xs text-slate-600">
                                    Detected by GitHub language
                                    analysis
                                </p>

                            </div>

                        </div>

                        {/* PROJECT EVIDENCE */}

                        <div className="mt-7">

                            <div className="flex items-center justify-between">

                                <h4 className="text-sm font-semibold text-slate-300">
                                    Evidence by project
                                </h4>

                                <span className="text-xs text-slate-600">
                                    {selectedSkill.projects?.length ||
                                        0}{" "}
                                    {(selectedSkill.projects?.length ||
                                        0) === 1
                                        ? "source"
                                        : "sources"}
                                </span>

                            </div>

                            <div className="mt-3 space-y-3">

                                {selectedSkill.projects?.map(
                                    (project) => (
                                        <div
                                            key={project.id}
                                            className="flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-950/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                                        >

                                            <div>

                                                <p className="font-semibold text-white">
                                                    {project.name}
                                                </p>

                                                <div className="mt-2 flex flex-wrap items-center gap-2">

                                                    <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300">
                                                        {selectedSkill.skill}{" "}
                                                        {project.percentage}%
                                                    </span>

                                                    <span className="text-xs text-slate-500">
                                                        {(
                                                            project.bytes || 0
                                                        ).toLocaleString()}{" "}
                                                        bytes
                                                    </span>

                                                </div>
                                            </div>

                                            <a
                                                href={project.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-medium text-indigo-400 transition hover:text-indigo-300"
                                            >
                                                View GitHub Evidence ↗
                                            </a>

                                        </div>
                                    )
                                )}

                            </div>
                        </div>

                    </div>
                )}

                {/* =================================================
            GITHUB CONNECTION
        ================================================= */}

                <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/40 p-7">

                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

                        <div>

                            <div className="flex items-center gap-3">

                                <h3 className="text-xl font-semibold">
                                    GitHub
                                </h3>

                                {githubReconnectRequired ? (
                                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-400">
                                        Reconnect required
                                    </span>
                                ) : user?.githubUsername ? (
                                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                                        Connected
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400">
                                        Not connected
                                    </span>
                                )}

                            </div>

                            {user?.githubUsername ? (
                                <div className="mt-3">

                                    <p className="text-sm font-medium text-slate-300">
                                        @{user.githubUsername}
                                    </p>

                                    {githubReconnectRequired ? (
                                        <p className="mt-1 text-sm text-amber-400">
                                            GitHub authorization needs to
                                            be renewed. Reconnect your
                                            account to continue analyzing
                                            repositories.
                                        </p>
                                    ) : (
                                        <p className="mt-1 text-sm text-slate-400">
                                            Your GitHub account is connected
                                            to Proofly.
                                        </p>
                                    )}

                                </div>
                            ) : (
                                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                                    Connect your GitHub account so
                                    Proofly can analyze your
                                    repositories and technologies.
                                </p>
                            )}

                        </div>

                        <button
                            onClick={handleConnectGitHub}
                            className="rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400"
                        >
                            {user?.githubUsername
                                ? "Reconnect GitHub"
                                : "Connect GitHub"}
                        </button>

                    </div>
                </div>

                {/* =================================================
            PROJECTS
        ================================================= */}

                <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/40 p-7">

                    <div className="flex items-center justify-between">

                        <div>
                            <h3 className="text-lg font-semibold">
                                Your Projects
                            </h3>

                            {user?.githubUsername && (
                                <p className="mt-1 text-sm text-slate-500">
                                    Analyzed repositories from{" "}
                                    @{user.githubUsername}
                                </p>
                            )}
                        </div>

                        {repositories.length > 0 && (
                            <span className="text-sm text-slate-500">
                                {repositories.length}{" "}
                                {repositories.length === 1
                                    ? "project"
                                    : "projects"}
                            </span>
                        )}

                    </div>

                    {/* LOADING */}

                    {reposLoading && (
                        <div className="py-12 text-center">
                            <p className="text-slate-400">
                                Analyzing GitHub repositories...
                            </p>
                        </div>
                    )}

                    {/* ERROR */}

                    {!reposLoading && repoError && (
                        <div className="py-12 text-center">

                            <p className="text-red-400">
                                {repoError}
                            </p>

                            {githubReconnectRequired && (
                                <button
                                    onClick={handleConnectGitHub}
                                    className="mt-5 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
                                >
                                    Reconnect GitHub
                                </button>
                            )}

                        </div>
                    )}

                    {/* GITHUB NOT CONNECTED */}

                    {!reposLoading &&
                        !repoError &&
                        !user?.githubUsername && (
                            <div className="py-12 text-center">

                                <p className="text-slate-300">
                                    GitHub is not connected yet.
                                </p>

                                <p className="mt-2 text-sm text-slate-500">
                                    Connect GitHub to start building
                                    your proof of work.
                                </p>

                            </div>
                        )}

                    {/* NO REPOSITORIES */}

                    {!reposLoading &&
                        !repoError &&
                        user?.githubUsername &&
                        repositories.length === 0 && (
                            <div className="py-12 text-center">

                                <p className="text-slate-300">
                                    No public repositories found.
                                </p>

                                <p className="mt-2 text-sm text-slate-500">
                                    Create a public GitHub repository
                                    and Proofly will analyze it.
                                </p>

                            </div>
                        )}

                    {/* =================================================
              REPOSITORY CARDS
          ================================================= */}

                    {!reposLoading &&
                        !repoError &&
                        repositories.length > 0 && (
                            <div className="mt-7 grid gap-4 md:grid-cols-2">

                                {repositories.map((repo) => {
                                    const repoLanguages =
                                        Object.keys(
                                            repo.languages || {}
                                        )

                                    return (
                                        <div
                                            key={repo.id}
                                            className="rounded-xl border border-slate-800 bg-slate-950/50 p-5 transition hover:border-slate-700"
                                        >

                                            {/* REPOSITORY NAME */}

                                            <h4 className="text-lg font-semibold text-white">
                                                {repo.name}
                                            </h4>

                                            {/* DESCRIPTION */}

                                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                                {repo.description ||
                                                    "No description provided."}
                                            </p>

                                            {/* LANGUAGES */}

                                            {repoLanguages.length > 0 && (
                                                <div className="mt-5 flex flex-wrap gap-2">

                                                    {repoLanguages.map(
                                                        (language) => {
                                                            const percentage =
                                                                repo
                                                                    .languagePercentages?.[
                                                                language
                                                                ] || 0

                                                            return (
                                                                <span
                                                                    key={language}
                                                                    className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300"
                                                                >
                                                                    {language}{" "}
                                                                    {percentage}%
                                                                </span>
                                                            )
                                                        }
                                                    )}

                                                </div>
                                            )}

                                            {/* STATS */}

                                            <div className="mt-5 flex flex-wrap items-center gap-5 text-xs text-slate-500">

                                                <span>
                                                    ★ {repo.stars}
                                                </span>

                                                <span>
                                                    Forks {repo.forks}
                                                </span>

                                                {repo.primaryLanguage && (
                                                    <span>
                                                        Primary:{" "}
                                                        {repo.primaryLanguage}
                                                    </span>
                                                )}

                                            </div>

                                            {/* =================================================
                          PROJECT ACTIONS
                      ================================================= */}

                                            <div className="mt-5 flex flex-wrap items-center gap-3">

                                                {/* GITHUB */}

                                                <a
                                                    href={repo.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
                                                >
                                                    GitHub ↗
                                                </a>

                                                {/* GENERATE CASE STUDY */}

                                                <button
                                                    onClick={() =>
                                                        handleGenerateCaseStudy(
                                                            repo
                                                        )
                                                    }
                                                    disabled={
                                                        caseStudyLoading ===
                                                        repo.id
                                                    }
                                                    className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {caseStudyLoading ===
                                                        repo.id
                                                        ? "Generating..."
                                                        : caseStudies[repo.id]
                                                            ? "Regenerate Case Study"
                                                            : "✨ Generate Case Study"}
                                                </button>

                                                {/* PUBLIC PAGE */}

                                                <a
                                                    href={getPublicProjectUrl(
                                                        repo
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                                                >
                                                    View Public Page ↗
                                                </a>

                                                {/* COPY SHARE LINK */}

                                                <button
                                                    onClick={() =>
                                                        handleCopyShareLink(
                                                            repo
                                                        )
                                                    }
                                                    className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${copiedRepoId === repo.id
                                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                                        : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                                                        }`}
                                                >
                                                    {copiedRepoId === repo.id
                                                        ? "✓ Link Copied!"
                                                        : "🔗 Copy Share Link"}
                                                </button>

                                            </div>

                                            {/* =================================================
                          CASE STUDY ERROR
                      ================================================= */}

                                            {caseStudyError[repo.id] && (
                                                <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4">

                                                    <p className="text-sm text-red-400">
                                                        {
                                                            caseStudyError[
                                                            repo.id
                                                            ]
                                                        }
                                                    </p>

                                                </div>
                                            )}

                                            {/* =================================================
                          GENERATED CASE STUDY
                      ================================================= */}

                                            {caseStudies[repo.id] && (
                                                <div className="mt-5 rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">

                                                    {/* CASE STUDY HEADER */}

                                                    <div className="flex flex-wrap items-center justify-between gap-3">

                                                        <div>
                                                            <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                                                                Proofly Case Study
                                                            </p>

                                                            <h5 className="mt-1 text-lg font-bold text-white">
                                                                {
                                                                    caseStudies[
                                                                        repo.id
                                                                    ].projectName
                                                                }
                                                            </h5>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2">

                                                            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                                                                ✓ GitHub Evidence
                                                            </span>

                                                            <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                                                                ✨ AI Generated
                                                            </span>

                                                        </div>

                                                    </div>

                                                    {/* ROLE */}

                                                    <div className="mt-5">

                                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                            Suggested Role
                                                        </p>

                                                        <p className="mt-1 text-sm text-slate-200">
                                                            {
                                                                caseStudies[
                                                                    repo.id
                                                                ].role
                                                            }
                                                        </p>

                                                    </div>

                                                    {/* SUMMARY */}

                                                    <div className="mt-5">

                                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                            Project Summary
                                                        </p>

                                                        <p className="mt-2 text-sm leading-6 text-slate-300">
                                                            {
                                                                caseStudies[
                                                                    repo.id
                                                                ].summary
                                                            }
                                                        </p>

                                                    </div>

                                                    {/* SKILLS */}

                                                    {caseStudies[repo.id]
                                                        .skills?.length >
                                                        0 && (
                                                            <div className="mt-5">

                                                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                                    Repository Skills
                                                                </p>

                                                                <div className="mt-3 flex flex-wrap gap-2">

                                                                    {caseStudies[
                                                                        repo.id
                                                                    ].skills.map(
                                                                        (skill) => (
                                                                            <span
                                                                                key={
                                                                                    skill
                                                                                }
                                                                                className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300"
                                                                            >
                                                                                {
                                                                                    skill
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )}

                                                                </div>

                                                            </div>
                                                        )}

                                                    {/* KEY CONTRIBUTIONS */}

                                                    {caseStudies[repo.id]
                                                        .keyContributions
                                                        ?.length > 0 && (
                                                            <div className="mt-5">

                                                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                                    AI Technical Highlights
                                                                </p>

                                                                <ul className="mt-3 space-y-2">

                                                                    {caseStudies[
                                                                        repo.id
                                                                    ].keyContributions.map(
                                                                        (
                                                                            contribution,
                                                                            index
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="flex gap-2 text-sm leading-6 text-slate-300"
                                                                            >
                                                                                <span className="text-purple-400">
                                                                                    ✦
                                                                                </span>

                                                                                <span>
                                                                                    {
                                                                                        contribution
                                                                                    }
                                                                                </span>
                                                                            </li>
                                                                        )
                                                                    )}

                                                                </ul>

                                                            </div>
                                                        )}

                                                    {/* LANGUAGE EVIDENCE */}

                                                    {caseStudies[repo.id]
                                                        .evidence
                                                        ?.languages &&
                                                        Object.keys(
                                                            caseStudies[
                                                                repo.id
                                                            ].evidence
                                                                .languages
                                                        ).length > 0 && (
                                                            <div className="mt-5">

                                                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                                    Verified Language
                                                                    Evidence
                                                                </p>

                                                                <div className="mt-3 space-y-2">

                                                                    {Object.entries(
                                                                        caseStudies[
                                                                            repo.id
                                                                        ].evidence
                                                                            .languages
                                                                    ).map(
                                                                        ([
                                                                            language,
                                                                            percentage,
                                                                        ]) => (
                                                                            <div
                                                                                key={
                                                                                    language
                                                                                }
                                                                                className="flex items-center justify-between text-sm"
                                                                            >
                                                                                <span className="text-slate-300">
                                                                                    {
                                                                                        language
                                                                                    }
                                                                                </span>

                                                                                <span className="font-medium text-indigo-300">
                                                                                    {
                                                                                        percentage
                                                                                    }
                                                                                    %
                                                                                </span>
                                                                            </div>
                                                                        )
                                                                    )}

                                                                </div>

                                                            </div>
                                                        )}

                                                    {/* VERIFICATION */}

                                                    <div className="mt-5 border-t border-slate-800 pt-4">

                                                        <p className="text-xs leading-5 text-slate-500">
                                                            GitHub repository
                                                            evidence is verified
                                                            separately from the
                                                            AI-generated project
                                                            interpretation.
                                                        </p>

                                                    </div>

                                                    {/* PUBLIC CASE STUDY ACTIONS */}

                                                    <div className="mt-5 flex flex-wrap gap-3">

                                                        <a
                                                            href={getPublicProjectUrl(
                                                                repo
                                                            )}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                                                        >
                                                            View Public Case Study ↗
                                                        </a>

                                                        <button
                                                            onClick={() =>
                                                                handleCopyShareLink(
                                                                    repo
                                                                )
                                                            }
                                                            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                                                        >
                                                            {copiedRepoId ===
                                                                repo.id
                                                                ? "✓ Link Copied!"
                                                                : "🔗 Share Project"}
                                                        </button>

                                                    </div>

                                                </div>
                                            )}

                                        </div>
                                    )
                                })}

                            </div>
                        )}

                </div>

            </main>
        </div>
    )
}

export default Dashboard