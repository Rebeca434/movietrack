import { useEffect, useState, useMemo } from "react";
import { getPopularMovies, searchMovies } from "./services/api";
import MovieCard from "./components/MovieCard";
import Sidebar from "./components/Sidebar";
import { FaHome } from "react-icons/fa";

const VIEW_LABELS = {
  all:      { title: "All Movies",      desc: (n) => `Movies in your collection` },
  want:     { title: "Want to Watch",   desc: (n) => `${n} movies on your watchlist` },
  watching: { title: "Watching",        desc: (n) => `${n} movies in progress` },
  watched:  { title: "Watched",         desc: (n) => `${n} movies you've seen` },
  top:      { title: "Favorites",           desc: (n) => `Your ${n} favourite picks` },
};

function App() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieStatus, setMovieStatus] = useState({});
  const [topFavorites, setTopFavorites] = useState([]);
  const [view, setView] = useState("all");

  // Load localStorage
  useEffect(() => {
    const savedStatus = localStorage.getItem("movieStatus");
    const savedTop = localStorage.getItem("topFavorites");
    if (savedStatus) setMovieStatus(JSON.parse(savedStatus));
    if (savedTop) setTopFavorites(JSON.parse(savedTop));
  }, []);

  // Load popular movies
  useEffect(() => {
    getPopularMovies().then((data) => {
      setMovies(data);
    });
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;
    const data = await searchMovies(search);
    setMovies(data);
  };

  const handleReset = async () => {
    const data = await getPopularMovies();
    setMovies(data);
    setSearch("");
    setView("all");
  };

  const setStatus = (movie, status) => {
    const updated = { ...movieStatus };
    if (!status) {
      delete updated[movie.id];
    } else {
      updated[movie.id] = status;
    }
    setMovieStatus(updated);
    localStorage.setItem("movieStatus", JSON.stringify(updated));
  };

 const toggleTop = (movie) => {
  const exists = topFavorites.find((m) => m.id === movie.id);
  let updated;
  if (exists) {
    updated = topFavorites.filter((m) => m.id !== movie.id);
  } else {
    updated = [...topFavorites, movie];
  }
  setTopFavorites(updated);
  localStorage.setItem("topFavorites", JSON.stringify(updated));
};

  // useMemo: recalcula filtered solo cuando cambian movies, topFavorites, movieStatus o view
  const filtered = useMemo(() => {
    if (view === "all") return movies;
    if (view === "top") return topFavorites;
    const base = [...movies, ...topFavorites];
    const unique = Array.from(new Map(base.map((m) => [m.id, m])).values());
    return unique.filter((m) => movieStatus[m.id] === view);
  }, [movies, topFavorites, movieStatus, view]);

  // useMemo: recalcula contadores solo cuando cambian los datos relevantes
  const counts = useMemo(() => ({
    all:      movies.length,
    want:     Object.values(movieStatus).filter((s) => s === "want").length,
    watching: Object.values(movieStatus).filter((s) => s === "watching").length,
    watched:  Object.values(movieStatus).filter((s) => s === "watched").length,
    top:      topFavorites.length,
  }), [movies, movieStatus, topFavorites]);
  const { title, desc } = VIEW_LABELS[view] || VIEW_LABELS.all;

  return (
    <div className="layout">
      <Sidebar view={view} setView={setView} counts={counts} />

      <main className="main">
        {/* TOP BAR */}
        <div className="top-bar">
          <div className="search-wrapper">
            <span className="search-icon"></span>
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button className="btn-search" onClick={handleSearch}>Search</button>
          <button className="btn-home" onClick={handleReset} title="Back to Popular">
            <FaHome />
          </button>
        </div>

        {/* PAGE HEADER */}
        <div className="page-header">
          <h1>{title}</h1>
          <p>{desc(filtered.length)}</p>
        </div>

        {/* GRID */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <p>No movies here yet</p>
          </div>
        ) : (
          <div className="movies-grid">
            {filtered.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                setStatus={setStatus}
                currentStatus={movieStatus[movie.id]}
                toggleTop={toggleTop}
                isTop={topFavorites.some((m) => m.id === movie.id)}
                onSelect={setSelectedMovie}
              />
            ))}
          </div>
        )}
      </main>

      {/* MODAL */}
      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              className="modal-poster"
              src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
              alt={selectedMovie.title}
            />
            <div className="modal-body">
              <h2>{selectedMovie.title}</h2>
              <div className="modal-rating">★ {selectedMovie.vote_average?.toFixed(1)}</div>
              <p>{selectedMovie.overview}</p>
              <button className="modal-close" onClick={() => setSelectedMovie(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
