const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
require("dotenv").config()

// ======================================================
// ROUTES
// ======================================================

const authRoutes = require("./routes/authRoutes")
const githubRoutes = require("./routes/githubRoutes")
const caseStudyRoutes = require("./routes/caseStudyRoutes")
const publicRoutes = require("./routes/publicRoutes")
const publicProfileRoutes = require("./routes/publicProfileRoutes")
const portfolioRoutes = require("./routes/portfolioRoutes")

const app = express()

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
)
app.use(express.json())

// ======================================================
// API ROUTES
// ======================================================

app.use("/api/auth", authRoutes)
app.use("/api/github", githubRoutes)
app.use("/api/case-study", caseStudyRoutes)
app.use("/api/public", publicRoutes)
app.use("/api/public/profile", publicProfileRoutes)
app.use("/api/portfolio", portfolioRoutes)

// ======================================================
// ROOT ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.json({
    message: "Proofly API is running 🚀",
  })
})

// ======================================================
// START SERVER
// ======================================================

const PORT = process.env.PORT || 5000

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(
      "MongoDB connected successfully ✅"
    )

    app.listen(PORT, () => {
      console.log(
        `Proofly server running on port ${PORT}`
      )
    })
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:"
    )
    console.error(error.message)
  })