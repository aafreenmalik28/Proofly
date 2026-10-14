import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import PublicProject from "./pages/PublicProject"
import PublicProfile from "./pages/PublicProfile"
import Portfolio from "./pages/Portfolio"
import EditPortfolio from "./pages/EditPortfolio"

import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ========================================= */}
        {/* HOME */}
        {/* ========================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* ========================================= */}
        {/* AUTHENTICATION */}
        {/* ========================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ========================================= */}
        {/* PROTECTED DASHBOARD */}
        {/* ========================================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ========================================= */}
        {/* PROTECTED PORTFOLIO */}
        {/* ========================================= */}

        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          }
        />

        {/* ========================================= */}
        {/* PROTECTED EDIT PORTFOLIO */}
        {/* ========================================= */}

        <Route
          path="/portfolio/edit"
          element={
            <ProtectedRoute>
              <EditPortfolio />
            </ProtectedRoute>
          }
        />

        {/* ========================================= */}
        {/* PUBLIC PROJECT */}
        {/* Example:
            /project/aafreenmalik28/proofly-test-project
        */}
        {/* ========================================= */}

        <Route
          path="/project/:username/:repoName"
          element={<PublicProject />}
        />

        {/* ========================================= */}
        {/* PUBLIC DEVELOPER PROFILE */}
        {/* Example:
            /u/aafreenmalik28
        */}
        {/* ========================================= */}

        <Route
          path="/u/:username"
          element={<PublicProfile />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App