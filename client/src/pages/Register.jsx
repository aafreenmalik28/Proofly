import API_URL from "../config"
import { useState } from "react"
import { Link } from "react-router-dom"

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Handle registration
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setMessage("")

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || "Registration failed")
        return
      }

      setMessage("Account created successfully! ðŸŽ‰")

      // Clear form after successful registration
      setFormData({
        name: "",
        email: "",
        password: "",
      })
    } catch (error) {
      console.error(error)
      setMessage("Unable to connect to server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link
          to="/"
          className="block text-center text-3xl font-bold mb-10"
        >
          Proof<span className="text-indigo-400">ly</span>
        </Link>

        {/* Register Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8">

          <h1 className="text-2xl font-bold">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Start turning your work into proof.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="text-sm text-slate-300"
              >
                Name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
                autoComplete="name"
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="text-sm text-slate-300"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="text-sm text-slate-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                minLength={8}
                required
                autoComplete="new-password"
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500"
              />
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-500 py-3 font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

            {/* Response Message */}
            {message && (
              <p className="text-center text-sm text-slate-300">
                {message}
              </p>
            )}

          </form>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

export default Register
