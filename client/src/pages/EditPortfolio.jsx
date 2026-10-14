import API_URL from "../config"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function EditPortfolio() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    professionalTitle: "",
    bio: "",
    location: "",
    socialLinks: {
      linkedin: "",
      github: "",
      website: "",
    },
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // ======================================================
  // LOAD EXISTING PORTFOLIO
  // ======================================================

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          navigate("/login")
          return
        }

        const response = await fetch(
          `${API_URL}/api/portfolio`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load portfolio"
          )
        }

        const portfolio = data.portfolio

        setFormData({
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
              portfolio?.socialLinks?.github || "",

            website:
              portfolio?.socialLinks?.website || "",
          },
        })
      } catch (error) {
        console.error(
          "Load portfolio error:",
          error
        )

        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadPortfolio()
  }, [navigate])

  // ======================================================
  // INPUT CHANGE
  // ======================================================

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // ======================================================
  // SOCIAL LINK CHANGE
  // ======================================================

  const handleSocialChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,

      socialLinks: {
        ...previous.socialLinks,
        [name]: value,
      },
    }))
  }

  // ======================================================
  // SAVE PORTFOLIO
  // ======================================================

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setSaving(true)
      setMessage("")
      setError("")

      const token = localStorage.getItem("token")

      const response = await fetch(
        `${API_URL}/api/portfolio`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(formData),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save portfolio"
        )
      }

      setMessage(
        "Portfolio saved successfully ✓"
      )
    } catch (error) {
      console.error(
        "Save portfolio error:",
        error
      )

      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">
          Loading portfolio settings...
        </p>
      </div>
    )
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* HEADER */}

        <div className="mb-10">

          <button
            onClick={() =>
              navigate("/portfolio")
            }
            className="text-sm font-medium text-slate-400 transition hover:text-white"
          >
            ← Back to Portfolio
          </button>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Portfolio Builder
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Edit Your Portfolio
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Personalize your developer profile while
            keeping your skills and project evidence
            verified by Proofly.
          </p>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-7"
        >

          {/* PROFESSIONAL TITLE */}

          <div>

            <label className="text-sm font-semibold text-slate-300">
              Professional Title
            </label>

            <input
              type="text"
              name="professionalTitle"
              value={formData.professionalTitle}
              onChange={handleChange}
              placeholder="MERN Stack Developer"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
            />

            <p className="mt-2 text-xs text-slate-500">
              Example: MERN Stack Developer,
              Frontend Developer, Full Stack Developer
            </p>

          </div>

          {/* BIO */}

          <div className="mt-7">

            <label className="text-sm font-semibold text-slate-300">
              Bio
            </label>

            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="5"
              placeholder="Tell recruiters and clients about yourself..."
              className="mt-2 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
            />

          </div>

          {/* LOCATION */}

          <div className="mt-7">

            <label className="text-sm font-semibold text-slate-300">
              Location
            </label>

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
            />

            <p className="mt-2 text-xs text-slate-500">
              Optional
            </p>

          </div>

          {/* SOCIAL LINKS */}

          <div className="mt-10 border-t border-slate-800 pt-8">

            <h2 className="text-lg font-semibold">
              Social Links
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add links recruiters can use to
              learn more about you.
            </p>

            {/* LINKEDIN */}

            <div className="mt-6">

              <label className="text-sm font-semibold text-slate-300">
                LinkedIn
              </label>

              <input
                type="url"
                name="linkedin"
                value={
                  formData.socialLinks.linkedin
                }
                onChange={handleSocialChange}
                placeholder="https://linkedin.com/in/username"
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
              />

            </div>

            {/* GITHUB */}

            <div className="mt-6">

              <label className="text-sm font-semibold text-slate-300">
                GitHub
              </label>

              <input
                type="url"
                name="github"
                value={
                  formData.socialLinks.github
                }
                onChange={handleSocialChange}
                placeholder="https://github.com/username"
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
              />

            </div>

            {/* WEBSITE */}

            <div className="mt-6">

              <label className="text-sm font-semibold text-slate-300">
                Personal Website
              </label>

              <input
                type="url"
                name="website"
                value={
                  formData.socialLinks.website
                }
                onChange={handleSocialChange}
                placeholder="https://yourwebsite.com"
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
              />

            </div>

          </div>

          {/* MESSAGES */}

          {message && (
            <div className="mt-7 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-7 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* ACTIONS */}

          <div className="mt-8 flex flex-wrap gap-3">

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Portfolio"}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/portfolio")
              }
              className="rounded-lg border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Preview Portfolio
            </button>

          </div>

        </form>

      </div>
    </div>
  )
}

export default EditPortfolio