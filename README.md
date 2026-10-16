# Proofly

> **Don't just list your skills. Prove them.**

Proofly is a full-stack developer evidence platform that transforms real GitHub activity into **verifiable skill evidence, project case studies, proof scores, and a shareable developer portfolio**.

Instead of simply claiming technologies on a resume, developers can connect their GitHub account and let Proofly analyze their actual repositories to demonstrate what they have built.

## 🚀 Live Application

**Live App:** https://proofly-psmf.onrender.com

**GitHub Repository:** https://github.com/aafreenmalik28/Proofly

---

## 💡 The Problem

Developer portfolios and resumes usually contain self-reported skills such as:

- JavaScript
- React
- Node.js
- MongoDB
- HTML & CSS

But recruiters have to manually inspect GitHub repositories to determine whether those skills are actually demonstrated.

**Proofly turns repository activity into structured evidence.**

---

## ✨ Key Features

### 🔐 Authentication

- Secure user registration and login
- Password hashing
- JWT-based authentication
- Protected dashboard and portfolio routes

### 🐙 GitHub OAuth Integration

Developers can securely connect their GitHub account using OAuth.

Proofly retrieves repository information and converts it into structured developer evidence.

A GitHub account can only be connected to **one Proofly account**, helping protect the integrity of verified profiles.

### 📊 Proof Score

Proofly calculates a developer **Proof Score out of 100** based on GitHub-backed evidence.

The score currently considers:

| Category | Maximum |
| --- | ---: |
| Projects | 30 |
| Skills | 30 |
| Repository Quality | 20 |
| GitHub Verified | 20 |
| **Total** | **100** |

This makes the score understandable instead of presenting developers with an unexplained number.

### 🧠 Skill Evidence

Proofly analyzes repository language data to identify demonstrated technologies.

Instead of only showing:

`JavaScript`

Proofly can provide evidence such as:

`JavaScript — demonstrated through actual repository language usage`

### ✨ AI-Generated Case Studies

Developers can generate structured project case studies from their repository evidence using AI.

Case studies can include:

- Developer role
- Project summary
- Skills used
- Key contributions

Proofly deliberately distinguishes between:

**✓ GitHub Evidence** — factual repository information

**✨ AI Generated** — AI-written interpretation of that evidence

This prevents AI-generated descriptions from being presented as verified GitHub facts.

### 👤 Public Developer Profiles

Every connected developer can have a shareable public profile containing:

- Developer information
- GitHub verification
- Proof Score
- Score breakdown
- Detected skills
- Repository evidence
- Projects
- AI-generated case studies

Example route:

```text
/u/:username
```

### 📁 Public Project Evidence Pages

Individual repositories can also have dedicated public evidence pages.

Example route:

```text
/project/:username/:repoName
```

These pages can be shared with recruiters, clients, or hiring managers without requiring them to create a Proofly account.

### 🔗 Shareable Portfolio

Developers can create a portfolio containing:

- Professional title
- Bio
- Location
- GitHub
- LinkedIn
- Personal website
- Verified projects
- Skills
- Proof Score

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- React Router
- Tailwind CSS

### Backend

- Node.js
- Express.js
- REST API
- JWT Authentication
- bcrypt

### Database

- MongoDB
- Mongoose
- MongoDB Atlas

### Integrations

- GitHub OAuth
- GitHub API
- Gemini AI

### Deployment

- Render
- MongoDB Atlas

---

## 🏗️ Architecture

```text
                     ┌────────────────────┐
                     │      Developer     │
                     └─────────┬──────────┘
                               │
                               ▼
                     ┌────────────────────┐
                     │   React Frontend   │
                     │   Vite + Router    │
                     └─────────┬──────────┘
                               │
                          REST API
                               │
                               ▼
                     ┌────────────────────┐
                     │ Express / Node API │
                     └──────┬─────┬───────┘
                            │     │
               ┌────────────┘     └────────────┐
               ▼                               ▼
      ┌─────────────────┐             ┌─────────────────┐
      │  MongoDB Atlas  │             │   GitHub API    │
      │                 │             │     + OAuth     │
      └────────┬────────┘             └─────────────────┘
               │
               ▼
      ┌─────────────────┐
      │ EvidenceSnapshot│
      │ Portfolio       │
      │ Case Studies    │
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │    Gemini AI    │
      │  Case Studies   │
      └─────────────────┘
```

---

## 🔎 Evidence Architecture

Proofly stores analyzed GitHub information as an **Evidence Snapshot**.

This allows public developer and project pages to use previously verified repository evidence rather than repeatedly requesting GitHub data whenever somebody views a profile.

The snapshot contains information such as:

- GitHub username
- Analyzed repositories
- Detected skills
- Skill evidence
- Proof Score
- Score breakdown
- Last synchronization time

---

## 🔒 Security

Proofly includes several production-focused security measures:

- Passwords are hashed before storage
- JWT authentication protects private routes
- Secrets are stored using environment variables
- `.env` files are excluded from Git
- GitHub OAuth uses state validation
- GitHub access tokens are not exposed to the frontend
- Duplicate GitHub account linking is prevented
- Public profiles use stored evidence rather than exposing GitHub credentials
- MongoDB Atlas network access is restricted for production infrastructure

---

## 📂 Project Structure

```text
Proofly/
│
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── App.jsx
│       ├── config.js
│       └── main.jsx
│
├── server/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── .gitignore
└── README.md
```

---

## ⚙️ Local Development

### 1. Clone the repository

```bash
git clone https://github.com/aafreenmalik28/Proofly.git
cd Proofly
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

```bash
cd ../server
npm install
```

### 4. Configure environment variables

Create:

```text
server/.env
```

Configure the required environment variables for MongoDB, JWT, GitHub OAuth, Gemini, and the frontend URL.

Create:

```text
client/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000
```

> Never commit `.env` files or API credentials to Git.

### 5. Start the backend

```bash
cd server
npx nodemon server.js
```

The API runs locally on:

```text
http://localhost:5000
```

### 6. Start the frontend

Open another terminal:

```bash
cd client
npm run dev
```

The frontend runs locally on:

```text
http://localhost:5173
```

---

## 🗺️ Future Roadmap

Possible future improvements include:

- GitHub evidence synchronization controls
- More advanced repository-quality analysis
- Additional skill-detection signals
- Improved Proof Score algorithms
- Portfolio customization
- More AI-assisted project insights
- Additional developer-platform integrations
- Recruiter-focused profile views

---

## 🎯 Project Goal

Proofly explores a simple idea:

> **A developer's portfolio should be backed by evidence, not just claims.**

By combining GitHub activity, structured evidence, AI-assisted interpretation, and public developer profiles, Proofly turns development work into something that can be **shown, shared, and verified**.

---

## 👩‍💻 Author

**Aafreen Malik**

MERN Stack Developer

GitHub: https://github.com/aafreenmalik28

---

## 📌 Release

**Proofly v1.0.0 — Production MVP**

The first production release includes authentication, GitHub OAuth, repository analysis, Proof Score calculation, skill evidence, AI-generated case studies, developer portfolios, and public evidence pages.