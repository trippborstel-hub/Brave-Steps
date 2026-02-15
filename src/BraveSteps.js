import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA & CONSTANTS ─────────────────────────────────────────────────

const STORAGE_KEY = "brave-steps-data";

const DEFAULT_EXPOSURES = [
  { id: 1, name: "Putting on a shirt", fearLevel: 3, completed: [], category: "touch" },
  { id: 2, name: "Pet a dog", fearLevel: 4, completed: [], category: "touch" },
  { id: 3, name: "Use a public water fountain", fearLevel: 5, completed: [], category: "public" },
  { id: 4, name: "Eat a snack without washing hands first", fearLevel: 7, completed: [], category: "food" },
  { id: 5, name: "Touch a shopping cart handle", fearLevel: 6, completed: [], category: "public" },
  { id: 6, name: "Sit on a public bench", fearLevel: 4, completed: [], category: "public" },
  { id: 7, name: "Share a bag of chips with a friend", fearLevel: 8, completed: [], category: "food" },
  { id: 8, name: "Use a public restroom", fearLevel: 9, completed: [], category: "public" },
];

const CATEGORY_ICONS = {
  touch: "✋",
  public: "🏙️",
  food: "🍎",
  other: "⭐",
};

const ENCOURAGEMENTS = [
  "You did something really brave just now.",
  "OCD said you couldn't, but you just proved it wrong.",
  "Your courage muscle is getting stronger!",
  "That anxiety? It's already starting to fade. You knew it would.",
  "Every time you do this, it gets a little easier. Science says so.",
  "You're literally rewiring your brain right now. How cool is that?",
  "The hard part is over. You chose brave.",
  "Your therapist would be proud of this moment.",
];

const ANXIETY_LABELS = [
  { level: 0, label: "Totally chill", emoji: "😌", color: "#4ECDC4" },
  { level: 1, label: "Barely notice it", emoji: "🙂", color: "#7BD4A8" },
  { level: 2, label: "A tiny bit uneasy", emoji: "🙂", color: "#A8DB8E" },
  { level: 3, label: "A little nervous", emoji: "😐", color: "#C5E17A" },
  { level: 4, label: "Kinda uncomfortable", emoji: "😕", color: "#E2D66A" },
  { level: 5, label: "Medium worried", emoji: "😟", color: "#F0C45C" },
  { level: 6, label: "Pretty anxious", emoji: "😰", color: "#F0A84E" },
  { level: 7, label: "Really hard", emoji: "😥", color: "#EF8C42" },
  { level: 8, label: "Super tough", emoji: "😣", color: "#ED6F38" },
  { level: 9, label: "Almost unbearable", emoji: "😖", color: "#E85230" },
  { level: 10, label: "Max anxiety", emoji: "🫠", color: "#E03528" },
];

// ─── PERSISTENCE HOOKS ────────────────────────────────────────────────

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.exposures)) {
        return parsed.exposures;
      }
    }
  } catch (e) {
    console.warn("Failed to load saved data:", e);
  }
  return null;
}

function saveData(exposures) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ exposures, lastSaved: new Date().toISOString() })
    );
  } catch (e) {
    console.warn("Failed to save data:", e);
  }
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────

function AnxietySlider({ value, onChange, label }) {
  const info = ANXIETY_LABELS[value];
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "#7a7a8e", fontFamily: "'Nunito', sans-serif" }}>{label}</span>
        <span style={{ fontSize: 14, fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: info.color }}>
          {info.emoji} {info.label} ({value}/10)
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          width: "100%",
          accentColor: info.color,
          height: 8,
          cursor: "pointer",
        }}
      />
    </div>
  );
}

// ─── FEAR LADDER ──────────────────────────────────────────────────────

function FearLadder({ exposures, onSelect, onAdd, onDelete }) {
  const sorted = [...exposures].sort((a, b) => a.fearLevel - b.fearLevel);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFear, setNewFear] = useState(5);
  const [newCategory, setNewCategory] = useState("other");

  const handleAdd = () => {
    if (newName.trim()) {
      onAdd({ name: newName.trim(), fearLevel: newFear, category: newCategory });
      setNewName("");
      setNewFear(5);
      setShowAdd(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 22, color: "#2d2d3f", margin: 0 }}>
          🪜 My Fear Ladder
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            background: showAdd ? "#e8e8f0" : "linear-gradient(135deg, #6C63FF, #8B7FFF)",
            color: showAdd ? "#6C63FF" : "#fff",
            border: "none",
            borderRadius: 12,
            padding: "8px 16px",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {showAdd ? "Cancel" : "+ Add Step"}
        </button>
      </div>

      {showAdd && (
        <div
          style={{
            background: "#f7f6ff",
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            border: "2px dashed #c4bfff",
          }}
        >
          <input
            type="text"
            placeholder="What's the exposure? (e.g., 'Touch a park bench')"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              border: "2px solid #e0dff0",
              fontFamily: "'Nunito', sans-serif",
              fontSize: 14,
              marginBottom: 12,
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {Object.entries(CATEGORY_ICONS).map(([cat, icon]) => (
              <button
                key={cat}
                onClick={() => setNewCategory(cat)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: newCategory === cat ? "2px solid #6C63FF" : "2px solid #e0dff0",
                  background: newCategory === cat ? "#ededff" : "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                {icon} {cat}
              </button>
            ))}
          </div>
          <AnxietySlider value={newFear} onChange={setNewFear} label="How scary does this feel?" />
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            style={{
              background: newName.trim() ? "linear-gradient(135deg, #6C63FF, #8B7FFF)" : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 24px",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              cursor: newName.trim() ? "pointer" : "not-allowed",
              width: "100%",
            }}
          >
            Add to My Ladder
          </button>
        </div>
      )}

      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 22,
            top: 20,
            bottom: 20,
            width: 3,
            background: "linear-gradient(to bottom, #4ECDC4, #F0C45C, #E03528)",
            borderRadius: 4,
            zIndex: 0,
          }}
        />
        {sorted.map((exp) => {
          const completionCount = exp.completed.length;
          const lastAnxiety = completionCount > 0 ? exp.completed[completionCount - 1].anxietyAfter : null;
          const firstAnxiety = completionCount > 0 ? exp.completed[0].anxietyBefore : null;
          const improving = completionCount >= 2 && lastAnxiety < firstAnxiety;

          return (
            <div
              key={exp.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                marginBottom: 6,
                borderRadius: 14,
                position: "relative",
                zIndex: 1,
                background: "#fff",
                border: "2px solid #f0eff8",
                transition: "all 0.2s",
                boxShadow: "0 2px 8px rgba(108,99,255,0.06)",
              }}
            >
              <div
                onClick={() => onSelect(exp)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  flex: 1,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background:
                      completionCount > 0
                        ? "linear-gradient(135deg, #4ECDC4, #44B8B0)"
                        : `linear-gradient(135deg, ${ANXIETY_LABELS[exp.fearLevel].color}88, ${ANXIETY_LABELS[exp.fearLevel].color})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: completionCount > 0 ? 18 : 16,
                    fontWeight: 800,
                    color: "#fff",
                    flexShrink: 0,
                    fontFamily: "'Baloo 2', cursive",
                    boxShadow: `0 3px 10px ${completionCount > 0 ? "#4ECDC444" : ANXIETY_LABELS[exp.fearLevel].color + "44"}`,
                  }}
                >
                  {completionCount > 0 ? "✓" : exp.fearLevel}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{CATEGORY_ICONS[exp.category] || "⭐"}</span>
                    <span
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#2d2d3f",
                      }}
                    >
                      {exp.name}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    {completionCount > 0 && (
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: "'Nunito', sans-serif",
                          color: "#4ECDC4",
                          fontWeight: 700,
                          background: "#e8faf8",
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        Done {completionCount}x
                      </span>
                    )}
                    {improving && (
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: "'Nunito', sans-serif",
                          color: "#6C63FF",
                          fontWeight: 700,
                          background: "#ededff",
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        📉 Getting easier!
                      </span>
                    )}
                    {completionCount === 0 && (
                      <span style={{ fontSize: 12, fontFamily: "'Nunito', sans-serif", color: "#aaa" }}>
                        Not tried yet — you got this!
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: 18, color: "#c4bfff" }}>→</div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Remove "${exp.name}" from your ladder?`)) {
                    onDelete(exp.id);
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 16,
                  color: "#ddd",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: 6,
                  flexShrink: 0,
                }}
                title="Remove this step"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── EXPOSURE SESSION ─────────────────────────────────────────────────

function ExposureSession({ exposure, onComplete, onCancel }) {
  const [phase, setPhase] = useState("prep");
  const [anxietyBefore, setAnxietyBefore] = useState(exposure.fearLevel);
  const [anxietyPeak, setAnxietyPeak] = useState(exposure.fearLevel);
  const [anxietyAfter, setAnxietyAfter] = useState(Math.max(0, exposure.fearLevel - 2));
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [encouragement, setEncouragement] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const startExposure = () => {
    setPhase("during");
    setTimerRunning(true);
  };

  const finishExposure = () => {
    setTimerRunning(false);
    setPhase("after");
  };

  const completeSession = () => {
    const enc = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
    setEncouragement(enc);
    setPhase("done");
    onComplete({
      date: new Date().toISOString(),
      anxietyBefore,
      anxietyPeak,
      anxietyAfter,
      duration: seconds,
    });
  };

  const phaseStyles = {
    prep: { bg: "#f7f6ff", border: "#e0dff0" },
    during: { bg: "#fff8f0", border: "#fce8d0" },
    after: { bg: "#f0faf8", border: "#d0f0ec" },
    done: { bg: "#f0faf8", border: "#d0f0ec" },
  };

  const ps = phaseStyles[phase];

  return (
    <div
      style={{
        background: ps.bg,
        borderRadius: 20,
        padding: 28,
        border: `2px solid ${ps.border}`,
        transition: "all 0.4s ease",
      }}
    >
      <button
        onClick={onCancel}
        style={{
          background: "none",
          border: "none",
          fontFamily: "'Nunito', sans-serif",
          fontSize: 14,
          color: "#999",
          cursor: "pointer",
          marginBottom: 12,
          padding: 0,
        }}
      >
        ← Back to ladder
      </button>

      <h2 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 22, color: "#2d2d3f", margin: "0 0 4px 0" }}>
        {CATEGORY_ICONS[exposure.category]} {exposure.name}
      </h2>
      <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "#999", marginBottom: 24 }}>
        Fear level: {exposure.fearLevel}/10 · Completed {exposure.completed.length} time
        {exposure.completed.length !== 1 ? "s" : ""}
      </div>

      {/* PREP PHASE */}
      {phase === "prep" && (
        <div>
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 20,
              marginBottom: 20,
              border: "1px solid #e8e8f0",
            }}
          >
            <h3 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 17, color: "#6C63FF", margin: "0 0 8px 0" }}>
              🧠 Before you start
            </h3>
            <p
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 14,
                lineHeight: 1.7,
                color: "#555",
                margin: 0,
              }}
            >
              Remember: the goal isn't to feel zero anxiety. The goal is to{" "}
              <strong style={{ color: "#6C63FF" }}>sit with the uncomfortable feeling</strong> and let your brain learn
              that nothing bad happens. Your anxiety will go up — that's normal and expected — and then it will come back
              down on its own. You don't need to do anything to make it go away.
            </p>
          </div>

          <AnxietySlider value={anxietyBefore} onChange={setAnxietyBefore} label="How anxious do you feel right now?" />

          <button
            onClick={startExposure}
            style={{
              background: "linear-gradient(135deg, #6C63FF, #8B7FFF)",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "14px 28px",
              fontFamily: "'Baloo 2', cursive",
              fontSize: 18,
              cursor: "pointer",
              width: "100%",
              boxShadow: "0 4px 20px rgba(108,99,255,0.3)",
              transition: "all 0.2s",
            }}
          >
            I'm ready. Let's do this! 💪
          </button>
        </div>
      )}

      {/* DURING PHASE */}
      {phase === "during" && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 48, color: "#F0A84E", marginBottom: 8 }}>
            {formatTime(seconds)}
          </div>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 15, color: "#888", marginBottom: 24 }}>
            You're doing it right now. Stay with it. 🌊
          </p>

          <div style={{ marginTop: 20 }}>
            <AnxietySlider
              value={anxietyPeak}
              onChange={setAnxietyPeak}
              label="What's the highest your anxiety has been?"
            />
          </div>

          <button
            onClick={finishExposure}
            style={{
              background: "linear-gradient(135deg, #4ECDC4, #44B8B0)",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "14px 28px",
              fontFamily: "'Baloo 2', cursive",
              fontSize: 18,
              cursor: "pointer",
              width: "100%",
              boxShadow: "0 4px 20px rgba(78,205,196,0.3)",
            }}
          >
            I did it! ✨
          </button>
        </div>
      )}

      {/* AFTER PHASE */}
      {phase === "after" && (
        <div>
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 20,
              marginBottom: 20,
              border: "1px solid #d0f0ec",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 15, lineHeight: 1.7, color: "#555", margin: 0 }}>
              You stayed with it for <strong style={{ color: "#4ECDC4" }}>{formatTime(seconds)}</strong>. That takes
              real courage.
            </p>
          </div>

          <AnxietySlider value={anxietyAfter} onChange={setAnxietyAfter} label="How anxious do you feel now?" />

          {anxietyAfter < anxietyPeak && (
            <div
              style={{
                background: "#e8faf8",
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                fontFamily: "'Nunito', sans-serif",
                fontSize: 14,
                color: "#2a9d8f",
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              📉 Your anxiety dropped from {anxietyPeak} to {anxietyAfter}. See? It comes down on its own!
            </div>
          )}

          <button
            onClick={completeSession}
            style={{
              background: "linear-gradient(135deg, #4ECDC4, #44B8B0)",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "14px 28px",
              fontFamily: "'Baloo 2', cursive",
              fontSize: 18,
              cursor: "pointer",
              width: "100%",
              boxShadow: "0 4px 20px rgba(78,205,196,0.3)",
            }}
          >
            Save & finish 🏆
          </button>
        </div>
      )}

      {/* DONE PHASE */}
      {phase === "done" && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🏆</div>
          <h3 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 22, color: "#4ECDC4", margin: "0 0 12px 0" }}>
            Brave Step Complete!
          </h3>
          <p
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 16,
              color: "#555",
              lineHeight: 1.7,
              fontStyle: "italic",
              maxWidth: 360,
              margin: "0 auto 24px",
            }}
          >
            "{encouragement}"
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { label: "Before", val: anxietyBefore },
              { label: "Peak", val: anxietyPeak },
              { label: "After", val: anxietyAfter },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: "12px 20px",
                  border: "1px solid #e8e8f0",
                }}
              >
                <div style={{ fontSize: 11, color: "#999", fontFamily: "'Nunito', sans-serif" }}>{s.label}</div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: ANXIETY_LABELS[s.val].color,
                    fontFamily: "'Baloo 2', cursive",
                  }}
                >
                  {s.val}
                </div>
              </div>
            ))}
            <div style={{ background: "#fff", borderRadius: 12, padding: "12px 20px", border: "1px solid #e8e8f0" }}>
              <div style={{ fontSize: 11, color: "#999", fontFamily: "'Nunito', sans-serif" }}>Time</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#6C63FF", fontFamily: "'Baloo 2', cursive" }}>
                {formatTime(seconds)}
              </div>
            </div>
          </div>

          <button
            onClick={onCancel}
            style={{
              background: "linear-gradient(135deg, #6C63FF, #8B7FFF)",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "14px 28px",
              fontFamily: "'Baloo 2', cursive",
              fontSize: 16,
              cursor: "pointer",
              marginTop: 24,
              boxShadow: "0 4px 20px rgba(108,99,255,0.3)",
            }}
          >
            Back to My Ladder
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PROGRESS VIEW ────────────────────────────────────────────────────

function ProgressView({ exposures }) {
  const allCompletions = exposures
    .flatMap((exp) => exp.completed.map((c) => ({ ...c, name: exp.name, fearLevel: exp.fearLevel })))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const totalExposures = allCompletions.length;
  const uniqueCompleted = exposures.filter((e) => e.completed.length > 0).length;
  const totalExposureItems = exposures.length;

  const today = new Date();
  let streak = 0;
  const daySet = new Set(allCompletions.map((c) => new Date(c.date).toDateString()));
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (daySet.has(d.toDateString())) {
      streak++;
    } else if (i > 0) break;
  }

  const habituating = exposures.filter((e) => {
    if (e.completed.length < 2) return false;
    const first = e.completed[0].anxietyBefore;
    const last = e.completed[e.completed.length - 1].anxietyAfter;
    return last < first;
  });

  return (
    <div>
      <h2 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 22, color: "#2d2d3f", margin: "0 0 20px 0" }}>
        📊 My Progress
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Brave Steps", value: totalExposures, icon: "💪", color: "#6C63FF" },
          { label: "Unique Exposures", value: `${uniqueCompleted}/${totalExposureItems}`, icon: "🎯", color: "#4ECDC4" },
          { label: "Day Streak", value: streak, icon: "🔥", color: "#F0A84E" },
          { label: "Getting Easier", value: habituating.length, icon: "📉", color: "#2a9d8f" },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              textAlign: "center",
              border: "2px solid #f0eff8",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 28, color: stat.color }}>{stat.value}</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "#999" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <h3 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 17, color: "#2d2d3f", margin: "0 0 12px 0" }}>
        Recent Brave Steps
      </h3>
      {allCompletions.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            fontFamily: "'Nunito', sans-serif",
            color: "#aaa",
            fontSize: 15,
          }}
        >
          No exposures completed yet. You'll see your progress here once you start! 🌱
        </div>
      ) : (
        [...allCompletions]
          .reverse()
          .slice(0, 10)
          .map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                marginBottom: 6,
                borderRadius: 12,
                background: "#fff",
                border: "1px solid #f0eff8",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background:
                    c.anxietyAfter < c.anxietyBefore
                      ? "linear-gradient(135deg, #4ECDC4, #44B8B0)"
                      : "linear-gradient(135deg, #F0C45C, #F0A84E)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {c.anxietyAfter < c.anxietyBefore ? "📉" : "💪"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14, color: "#2d2d3f" }}>
                  {c.name}
                </div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "#999" }}>
                  {c.anxietyBefore} → {c.anxietyAfter} anxiety ·{" "}
                  {Math.floor(c.duration / 60)}:{(c.duration % 60).toString().padStart(2, "0")} held
                </div>
              </div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#ccc" }}>
                {new Date(c.date).toLocaleDateString()}
              </div>
            </div>
          ))
      )}

      <div
        style={{
          background: "#f7f6ff",
          borderRadius: 14,
          padding: 20,
          marginTop: 24,
          border: "1px solid #e0dff0",
        }}
      >
        <h4 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 15, color: "#6C63FF", margin: "0 0 8px 0" }}>
          🧠 Why this works (the science!)
        </h4>
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, lineHeight: 1.7, color: "#666", margin: 0 }}>
          Every time you face something scary and nothing bad happens, your brain updates its threat map. This is called{" "}
          <strong>habituation</strong> — your amygdala (the brain's alarm system) learns to stop firing false alarms.
          Research shows that with repeated exposure, anxiety responses decrease significantly. You're not just being
          brave — you're physically changing your brain's wiring! 🧬
        </p>
      </div>
    </div>
  );
}

// ─── LEARN VIEW ───────────────────────────────────────────────────────

function LearnView() {
  const topics = [
    {
      title: "What is OCD, really?",
      icon: "🧠",
      content:
        "OCD stands for Obsessive-Compulsive Disorder. It's when your brain gets stuck in a loop — it sends you scary thoughts (obsessions) and then makes you feel like you HAVE to do certain things to feel safe (compulsions). The thing is, your brain is lying to you. The danger it's warning you about? It's either not real or way exaggerated. OCD is like a super-sensitive smoke alarm that goes off when you make toast. The alarm is real, but there's no fire.",
    },
    {
      title: "What is contamination OCD?",
      icon: "🫧",
      content:
        "Contamination OCD is a type of OCD where your brain tells you things are dirty, dangerous, or contaminated when they're actually safe. It might make you want to wash your hands over and over, avoid touching things, or worry that you'll get sick from normal, everyday stuff. The tricky part is that the anxiety feels SO real that it's hard to believe it's just your brain being overprotective.",
    },
    {
      title: "Why does exposure therapy work?",
      icon: "🪜",
      content:
        "Imagine your brain has a volume dial for fear. Right now, for certain things, that dial is cranked up to 10 when it should be at a 2. Exposure therapy helps turn that dial back down by showing your brain — through experience — that the scary thing isn't actually dangerous. The first time feels terrible. The second time feels bad. The fifth time? Your brain starts to go, 'Oh wait, nothing happened. Maybe I can chill.' That's called habituation, and it's backed by decades of research.",
    },
    {
      title: "The anxiety wave 🌊",
      icon: "🌊",
      content:
        "Here's something cool about anxiety: it always, always, ALWAYS comes back down on its own. Even if you don't do anything to make it go away. Anxiety is like a wave — it rises, peaks, and falls. Most anxiety waves peak within 20-30 minutes and then start to drop. The problem with compulsions (like handwashing) is that they stop the wave early, so your brain never learns that it would have come down on its own. When you ride the wave without doing compulsions, you're teaching your brain the most important lesson: I can handle this.",
    },
    {
      title: "Your brain is amazing",
      icon: "✨",
      content:
        "Your brain has something called neuroplasticity — it can literally rewire itself based on new experiences. Every time you do an exposure and nothing bad happens, you're building new neural pathways that say 'this is safe.' Over time, those new pathways get stronger and the old fear pathways get weaker. You're not just being brave — you're a neuroscientist running experiments on your own brain!",
    },
    {
      title: "It's okay to feel scared",
      icon: "💛",
      content:
        "Being brave doesn't mean not feeling scared. Being brave means feeling scared AND doing it anyway. Some days will be harder than others, and that's completely normal. Even going backward sometimes is part of going forward. What matters is that you keep showing up. Every single brave step counts, even the tiny ones. Especially the tiny ones.",
    },
  ];

  const [openTopic, setOpenTopic] = useState(null);

  return (
    <div>
      <h2 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 22, color: "#2d2d3f", margin: "0 0 8px 0" }}>
        📚 Learn About OCD
      </h2>
      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: "#999", marginBottom: 20 }}>
        Understanding what's happening in your brain is a superpower.
      </p>

      {topics.map((topic, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div
            onClick={() => setOpenTopic(openTopic === i ? null : i)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "16px 18px",
              borderRadius: openTopic === i ? "14px 14px 0 0" : 14,
              background: "#fff",
              border: `2px solid ${openTopic === i ? "#c4bfff" : "#f0eff8"}`,
              borderBottom: openTopic === i ? "1px solid #e8e8f0" : undefined,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: 22 }}>{topic.icon}</span>
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: "#2d2d3f",
                flex: 1,
              }}
            >
              {topic.title}
            </span>
            <span
              style={{
                color: "#c4bfff",
                fontSize: 18,
                transform: openTopic === i ? "rotate(90deg)" : "none",
                transition: "transform 0.2s",
              }}
            >
              →
            </span>
          </div>
          {openTopic === i && (
            <div
              style={{
                padding: "18px 20px",
                borderRadius: "0 0 14px 14px",
                background: "#faf9ff",
                border: "2px solid #c4bfff",
                borderTop: "none",
              }}
            >
              <p
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: "#555",
                  margin: 0,
                }}
              >
                {topic.content}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── SETTINGS VIEW ────────────────────────────────────────────────────

function SettingsView({ onReset }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div>
      <h2 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 22, color: "#2d2d3f", margin: "0 0 20px 0" }}>
        ⚙️ Settings
      </h2>

      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 20,
          border: "2px solid #f0eff8",
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15, color: "#2d2d3f", margin: "0 0 8px 0" }}>
          About Brave Steps
        </h3>
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, lineHeight: 1.7, color: "#666", margin: 0 }}>
          Brave Steps is a tool to help you track your exposure therapy exercises between sessions with your therapist.
          It is <strong>not</strong> a replacement for working with a trained professional — it's a companion to support
          the work you're already doing. All your data is stored on this device only and is never sent anywhere.
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 20,
          border: "2px solid #f0eff8",
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15, color: "#2d2d3f", margin: "0 0 8px 0" }}>
          Your data
        </h3>
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, lineHeight: 1.7, color: "#666", margin: "0 0 16px 0" }}>
          Everything is saved on this device in your browser. If you clear your browser data, your progress will be
          lost. Consider taking screenshots of your progress to share with your therapist!
        </p>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              background: "none",
              border: "2px solid #ED6F38",
              borderRadius: 10,
              padding: "8px 16px",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: "#ED6F38",
              cursor: "pointer",
            }}
          >
            Reset all data
          </button>
        ) : (
          <div style={{ background: "#fff5f2", borderRadius: 10, padding: 16, border: "1px solid #fdd" }}>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "#c0392b", margin: "0 0 12px 0" }}>
              This will erase all your progress and start fresh. Are you sure?
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  onReset();
                  setShowConfirm(false);
                }}
                style={{
                  background: "#ED6F38",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Yes, reset everything
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  background: "#f0eff8",
                  color: "#666",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────

export default function BraveSteps() {
  const [exposures, setExposures] = useState(() => {
    const saved = loadData();
    return saved || DEFAULT_EXPOSURES;
  });
  const [activeView, setActiveView] = useState("ladder");
  const [selectedExposure, setSelectedExposure] = useState(null);

  // Persist on every change
  useEffect(() => {
    saveData(exposures);
  }, [exposures]);

  const handleComplete = useCallback((sessionData) => {
    setExposures((prev) =>
      prev.map((exp) =>
        exp.id === selectedExposure.id ? { ...exp, completed: [...exp.completed, sessionData] } : exp
      )
    );
  }, [selectedExposure]);

  const handleAddExposure = useCallback(({ name, fearLevel, category }) => {
    const newId = Date.now(); // unique ID
    setExposures((prev) => [...prev, { id: newId, name, fearLevel, completed: [], category }]);
  }, []);

  const handleDeleteExposure = useCallback((id) => {
    setExposures((prev) => prev.filter((exp) => exp.id !== id));
  }, []);

  const handleReset = useCallback(() => {
    setExposures(DEFAULT_EXPOSURES);
    setSelectedExposure(null);
    setActiveView("ladder");
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const navItems = [
    { key: "ladder", label: "Ladder", icon: "🪜" },
    { key: "progress", label: "Progress", icon: "📊" },
    { key: "learn", label: "Learn", icon: "📚" },
    { key: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8f7ff 0%, #f0eff8 50%, #e8f6f5 100%)",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 4px;
          background: #e8e8f0;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: currentColor;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #6C63FF 0%, #8B7FFF 50%, #4ECDC4 100%)",
          padding: "28px 24px 20px",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            fontSize: 120,
            opacity: 0.1,
            transform: "rotate(15deg)",
          }}
        >
          🦁
        </div>
        <h1
          style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: 30,
            margin: "0 0 4px 0",
            position: "relative",
          }}
        >
          Brave Steps
        </h1>
        <p
          style={{
            fontSize: 14,
            opacity: 0.85,
            margin: 0,
            fontFamily: "'Nunito', sans-serif",
            position: "relative",
          }}
        >
          One brave step at a time. You've got this. 💪
        </p>
      </div>

      {/* Nav tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "12px 16px",
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          borderBottom: "1px solid #e8e8f0",
        }}
      >
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setActiveView(item.key);
              setSelectedExposure(null);
            }}
            style={{
              flex: 1,
              padding: "10px 4px",
              borderRadius: 12,
              border: "none",
              background: activeView === item.key ? "#fff" : "transparent",
              boxShadow: activeView === item.key ? "0 2px 8px rgba(108,99,255,0.12)" : "none",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: activeView === item.key ? 800 : 600,
              fontSize: 12,
              color: activeView === item.key ? "#6C63FF" : "#999",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "20px 16px 40px", maxWidth: 520, margin: "0 auto" }}>
        {activeView === "ladder" && !selectedExposure && (
          <FearLadder
            exposures={exposures}
            onSelect={setSelectedExposure}
            onAdd={handleAddExposure}
            onDelete={handleDeleteExposure}
          />
        )}
        {activeView === "ladder" && selectedExposure && (
          <ExposureSession
            exposure={selectedExposure}
            onComplete={handleComplete}
            onCancel={() => setSelectedExposure(null)}
          />
        )}
        {activeView === "progress" && <ProgressView exposures={exposures} />}
        {activeView === "learn" && <LearnView />}
        {activeView === "settings" && <SettingsView onReset={handleReset} />}
      </div>
    </div>
  );
}
