import { useState } from "react";
import { Star, ChevronDown } from "lucide-react";

const STATUS_LABELS = {
  want: "Want",
  watching: "Watching",
  watched: "Watched",
};

function MovieCard({ movie, setStatus, currentStatus, toggleTop, isTop, onSelect }) {
  const [open, setOpen] = useState(false);

  const handleDropdownClick = (e) => {
    e.stopPropagation();
    setOpen(!open);
  };

  const handleSetStatus = (e, status) => {
    e.stopPropagation();
    setStatus(movie, status);
    setOpen(false);
  };

  return (
    <div className="movie-card-pro">
      {/* POSTER */}
      <div className="poster-container" onClick={() => onSelect(movie)}>
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
        />

        {/* TOP BUTTON */}
        <button
          className={`top-btn ${isTop ? "active" : ""}`}
          onClick={(e) => { e.stopPropagation(); toggleTop(movie); }}
          title={isTop ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Star size={14} fill={isTop ? "currentColor" : "none"} />
        </button>

        {/* STATUS BADGE */}
        {currentStatus && (
          <div className={`badge ${currentStatus}`}>
            {STATUS_LABELS[currentStatus] || currentStatus}
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="card-content">
        <h3 title={movie.title}>{movie.title}</h3>
        <div className="card-rating">
          <span className="star">★</span>
          <span>{movie.vote_average?.toFixed(1)}</span>
        </div>

        {/* DROPDOWN */}
        <div className="dropdown">
          <button
            className={currentStatus ? `status-${currentStatus}` : ""}
            onClick={handleDropdownClick}
          >
            <span>{STATUS_LABELS[currentStatus] || "Set Status"}</span>
            <ChevronDown size={13} />
          </button>

          {open && (
            <div className="dropdown-menu">
              <button className="opt-want"     onClick={(e) => handleSetStatus(e, "want")}>     🕐 Want to Watch</button>
              <button className="opt-watching" onClick={(e) => handleSetStatus(e, "watching")}> 👁 Watching</button>
              <button className="opt-watched"  onClick={(e) => handleSetStatus(e, "watched")}>  ✓ Watched</button>
              <button                          onClick={(e) => handleSetStatus(e, "")}>         ✕ Clear</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
