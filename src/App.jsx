import { useEffect, useState, useMemo } from "react";
import { getPopularMovies, searchMovies } from "./services/api";
import MovieCard from "./components/MovieCard";
import Sidebar from "./components/Sidebar";
import { FaHome } from "react-icons/fa";

const VIEW_LABELS = {
  all:      { title: "All Movies",    desc: () => `Popular movies` },
  want:     { title: "Want to Watch", desc: (n) => `${n} movies on your watchlist` },
  watching: { title: "Watching",      desc: (n) => `${n} movies in progress` },
  watched:  { title: "Watched",       desc: (n) => `${n} movies you've seen` },
  top:      { title: "Favorites",     desc: (n) => `${n} favorite picks` },
};

function App() {
  const [movies, setMovies] = useState([]);
  const [savedMovies, setSavedMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieStatus, setMovieStatus] = useState({});
  const [topFavorites, setTopFavorites] = useState([]);
  const [view, setView] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load localStorage
  useEffect(() => {
    const savedStatus = localStorage.getItem("movieStatus");
    const savedTop = localStorage.getItem("topFavorites");
    const savedMoviesData = localStorage.getItem("savedMovies");
    if (savedStatus) setMovieStatus(JSON.parse(savedStatus));
    if (savedTop) setTopFavorites(JSON.parse(savedTop));
    if (savedMoviesData) setSavedMovies(JSON.parse(savedMoviesData));
  }, []);

  // Load popular movies
  useEffect(() => {
    setLoading(true);
    getPopularMovies()
      .then((data) => setMovies(data))
      .catch(() => setError("Failed to load movies."))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchMovies(search);
      setMovies(data);
    } catch (err) {
      setError("Can not perform search. Please try again.");
    } finally {
      setLoading(false);
    } 
  };

  const handleReset = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPopularMovies();
      setMovies(data);
      setSearch("");
      setView("all");
    } catch (err) {
      setError("Failed to reset movies.");
    } finally {
      setLoading(false);
    }
  };


  const setStatus = (movie, status) => {
    const updated = { ...movieStatus };
    if (!status) {
      delete updated[movie.id];
    } else {
      updated[movie.id] = status;
      setSavedMovies(prev => {
        const exists = prev.find(m => m.id === movie.id);
        const newSaved = exists ? prev : [...prev, movie];
        localStorage.setItem("savedMovies", JSON.stringify(newSaved)); 
        return newSaved;
      });
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
    const base = [...movies, ...savedMovies, ...topFavorites];
    const unique = Array.from(new Map(base.map((m) => [m.id, m])).values());
    return unique.filter((m) => movieStatus[m.id] === view);
  }, [movies,savedMovies, topFavorites, movieStatus, view]);

  const { title, desc } = VIEW_LABELS[view] || VIEW_LABELS.all;

  return (
    <div className="layout">
      <Sidebar view={view} setView={setView} />

      <main className="main">
        <div className="top-bar">
          <div className="search-wrapper">
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

        <div className="page-header">
          <h1>{title}</h1>
          <p>{desc(filtered.length)}</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading movies...</p>
          </div>
        ) : error ? (
          <div className="error-state">
          <p>{error}</p>
          <button className="btn-search" onClick={handleReset}>Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
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