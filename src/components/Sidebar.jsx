function Sidebar({ view, setView, counts }) {
  const navItems = [
    { id: "all",      icon: "⊞", label: "All Movies" },
    { id: "want",     icon: "◷", label: "Want to Watch" },
    { id: "watching", icon: "◎", label: "Watching" },
    { id: "watched",  icon: "✓", label: "Watched" },
    { id: "top",      icon: "★", label: "Favorites" },
  ];

  return (
    <div className="sidebar-pro">
      <div className="sidebar-logo">
        
        <h2>MovieTrack</h2>
      </div>

      <span className="sidebar-section-label">Library</span>

      {navItems.map(({ id, icon, label }) => (
        <button
          key={id}
          className={view === id ? "active" : ""}
          onClick={() => setView(id)}
        >
          <span className="sidebar-btn-icon">{icon}</span>
          <span className="sidebar-btn-label">{label}</span>
        </button>
      ))}
    </div>
  );
}

export default Sidebar;
