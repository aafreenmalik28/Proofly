const express = require("express")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const jwt = require("jsonwebtoken")
const protect = require("../middleware/authMiddleware")

const router = express.Router()

// REGISTER USER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all fields",
      })
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    })

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: "Server error",
    })
  }
})

// LOGIN USER
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
      })
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
    })

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      })
    }

    // Compare entered password with hashed password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    )

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      })
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    )

    // Send user + token
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        githubUsername: user.githubUsername,
      },
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: "Server error",
    })
  }
})

// GET CURRENT LOGGED-IN USER
router.get("/me", protect, async (req, res) => {
  res.status(200).json({
    user: req.user,
  })
})

module.exports = router