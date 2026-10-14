import { Link } from "react-router-dom"

function Home() {
  return (
    <div className="min-h-screen bg-[#050816] text-white">

      {/* Navbar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">

        <div className="text-2xl font-bold tracking-tight">
          Proof<span className="text-indigo-400">ly</span>
        </div>

        <div className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>

          <a href="#how-it-works" className="transition hover:text-white">
            How it works
          </a>

          <a href="#about" className="transition hover:text-white">
            About
          </a>
        </div>

        <Link
            to="/login"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium         transition hover:border-slate-500 hover:bg-slate-900"
        >
            Sign in
        </Link>

      </nav>


      {/* Hero */}
      <main className="mx-auto max-w-7xl px-6 pt-24 pb-20 text-center lg:px-8 lg:pt-32">

        <div className="mx-auto mb-6 w-fit rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
          Your work speaks louder than your resume.
        </div>

        <h1 className="mx-auto max-w-5xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">

          Don't just list your skills.

          <span className="block bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Prove them.
          </span>

        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-400">
          Proofly turns your real GitHub activity into skill evidence,
          intelligent project case studies and a portfolio that shows
          what you can actually build.
        </p>


        {/* Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">

          <button className="rounded-xl bg-indigo-500 px-7 py-3.5 font-semibold shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400">
            Connect GitHub
          </button>

          <button className="rounded-xl border border-slate-700 px-7 py-3.5 font-semibold text-slate-300 transition hover:bg-slate-900">
            See how it works
          </button>

        </div>


        {/* Product Preview */}
        <div className="mx-auto mt-20 max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/50 p-3 shadow-2xl">

          <div className="rounded-xl border border-slate-800 bg-[#080d1c] p-6 text-left">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Developer Profile
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Your Proof of Work
                </h2>
              </div>

              <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                GitHub Connected
              </span>

            </div>


            <div className="grid gap-4 md:grid-cols-3">

              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
                <p className="text-sm text-slate-500">
                  Projects analyzed
                </p>

                <p className="mt-2 text-3xl font-bold">
                  12
                </p>
              </div>


              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
                <p className="text-sm text-slate-500">
                  Skills detected
                </p>

                <p className="mt-2 text-3xl font-bold">
                  18
                </p>
              </div>


              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
                <p className="text-sm text-slate-500">
                  Proof score
                </p>

                <p className="mt-2 text-3xl font-bold text-indigo-400">
                  82
                </p>
              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  )
}

export default Home