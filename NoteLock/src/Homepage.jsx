import { useEffect, useState } from "react";
import "./css/Homepage.css";
import { getSubjects, addSubject, deleteSubject, getNotes } from "./store";
import { signOut, useAuth } from "./AuthContext";

const FOLDER_COLORS = [
  "#909090",
  "#23C55D",
  "#FFD78A",
  "#B4E24A",
  "#FF6B91",
  "#8A6CFF",
];

export default function Homepage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [noteCounts, setNoteCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    setLoading(true);
    setError("");
    try {
      const data = await getSubjects();
      setSubjects(data);
      const counts = await Promise.all(
        data.map((subject) => getNotes(subject.id)),
      );
      setNoteCounts(
        Object.fromEntries(
          data.map((subject, i) => [subject.id, counts[i].length]),
        ),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddFolder() {
    const name = window.prompt("Folder name?");
    if (!name) return;
    const color = FOLDER_COLORS[subjects.length % FOLDER_COLORS.length];
    try {
      await addSubject({ name, color });
      loadSubjects();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteFolder(id, e) {
    e.stopPropagation();
    const confirmed = window.confirm("Delete this folder and all its notes?");
    if (!confirmed) return;
    try {
      await deleteSubject(id);
      loadSubjects(); // refresh the grid
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="phone-frame">
      <div className="home-root">
        <header className="home-header">
          <div className="profile-block">
            <div className="profile-icon" aria-hidden="true">
              {user?.email?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="profile-text">
              <h1>Home</h1>
              {user?.email && <p className="profile-email">{user.email}</p>}
            </div>
          </div>
          <div className="header-actions">
            <button
              className="add-btn"
              aria-label="Add folder"
              onClick={handleAddFolder}
            >
              +
            </button>
          </div>
        </header>

        {error && <p className="home-status home-error">{error}</p>}

        <main className="folders-grid">
          {loading ? (
            <p className="home-status">Loading…</p>
          ) : subjects.length === 0 ? (
            <p className="home-status">No folders yet — tap + to add one.</p>
          ) : (
            subjects.map((subject) => (
              <button
                className="folder"
                type="button"
                key={subject.id}
                onClick={() => {
                  window.location.hash = `/folder/${subject.id}`;
                }}
              >
                <div
                  className="folder-tab"
                  style={{ background: subject.color }}
                />
                <div className="folder-card" />
                <div
                  className="folder-swatch"
                  style={{ background: subject.color }}
                />
                <div className="folder-notes">
                  {noteCounts[subject.id] ?? 0} notes
                </div>
                <div className="folder-title">{subject.name}</div>
                <button
                  className="folder-delete-btn"
                  aria-label={`Delete ${subject.name}`}
                  onClick={(e) => handleDeleteFolder(subject.id, e)}
                >
                  ❌
                </button>
              </button>
            ))
          )}
        </main>

        <nav
          className="tabbar"
          role="navigation"
          aria-label="Bottom navigation"
        >
          <button className="tab-icon home" aria-label="Home">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M3 11.5L12 4l9 7.5" />
              <path d="M5 11.5v7a1 1 0 0 0 1 1h3v-5h6v5h3a1 1 0 0 0 1-1v-7" />
            </svg>
          </button>

          <button
            className="tab-icon camera"
            aria-label="Camera"
            onClick={() => {
              window.location.hash = "/capture";
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <rect x="3" y="7" width="18" height="12" rx="1" ry="1" />
              <path d="M8 7l1.2-2h5.6L16 7" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </button>

          <button className="signout-btn" onClick={signOut}>
            Sign out
          </button>
        </nav>
      </div>
    </div>
  );
}
