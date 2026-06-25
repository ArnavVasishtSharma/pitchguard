import { useState } from "react"
import SplashScreen from "./components/SplashScreen"
import LeagueDock from "./components/LeagueDock"
import ClubPicker from "./components/ClubPicker"
import PitchGuard from "./components/PitchGuard"
import CustomCursor from "./components/ui/CustomCursor"

type Phase = "splash" | "leagueDock" | "clubPicker" | "dashboard"

export default function App() {
  const [phase, setPhase] = useState<Phase>("splash")
  const [league, setLeague] = useState("")
  const [club, setClub] = useState("")

  const handleSplashComplete = () => setPhase("leagueDock")

  const handleSelectLeague = (l: string) => {
    setLeague(l)
    setPhase("clubPicker")
  }

  const handleSelectClub = (c: string) => {
    setClub(c)
    setPhase("dashboard")
  }

  const handleBackToLeagues = () => {
    setPhase("leagueDock")
  }

  const handleBackToClubs = () => {
    setPhase("clubPicker")
  }

  return (
    <div style={{ background: "#040a05", minHeight: "100vh", position: "relative" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <CustomCursor />

      {/* Each phase mounts cleanly with a CSS fade-in. No state timeouts that can freeze. */}
      {phase === "splash" && (
        <div className="phase-wrapper">
          {/* @ts-ignore - Preserving your original duration prop */}
          <SplashScreen onComplete={handleSplashComplete} duration={3000} />
        </div>
      )}

      {phase === "leagueDock" && (
        <div className="phase-wrapper">
          <LeagueDock onSelectLeague={handleSelectLeague} />
        </div>
      )}

      {phase === "clubPicker" && (
        <div className="phase-wrapper">
          <ClubPicker league={league} onSelectClub={handleSelectClub} onBack={handleBackToLeagues} />
        </div>
      )}

      {phase === "dashboard" && (
        <div className="phase-wrapper">
          <PitchGuard league={league} club={club} onBack={handleBackToClubs} />
        </div>
      )}

      <style>{`
        body { margin: 0; background: #040a05; }
        .phase-wrapper {
          position: absolute;
          inset: 0;
          animation: phaseIn 0.5s ease-out forwards;
        }
        @keyframes phaseIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}