
import { useRef, useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { MovieContext } from "../context/MovieContext";
import { useAuth } from "../context/AuthContext";

function Header() {
  const [showMenu, setShowMenu] = useState(false);

  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const {
    search,
    setSearch,
    darkMode,
    toggleDarkMode,
  } = useContext(MovieContext);

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate("/");
  };

  const navClass = ({ isActive }) =>
    `font-semibold transition ${
      isActive
        ? "text-[#d1b36b]"
        : "text-white hover:text-[#d1b36b]"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-[#172033] text-white shadow-lg">
      <nav className="mx-auto max-w-7xl px-5 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-2"
            onClick={() => setShowMenu(false)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d1b36b] font-bold text-[#172033]">
              F
            </div>
            <span className="text-2xl font-bold text-[#d1b36b]">
              FilmFiesta
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <ul className="flex items-center gap-6">
              <li><NavLink to="/" className={navClass}>Home</NavLink></li>
              <li><NavLink to="/popular" className={navClass}>Popular</NavLink></li>
              <li><NavLink to="/top-rated" className={navClass}>Top Rated</NavLink></li>
              <li><NavLink to="/upcoming" className={navClass}>Upcoming</NavLink></li>
              <li><NavLink to="/favorites" className={navClass}>Favorites</NavLink></li>
            </ul>
          </div>

          {/* Desktop Right */}
          <div className="hidden items-center gap-3 md:flex">
            <NotificationBell />

            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg text-[#b89236] transition hover:bg-[#d1b36b] hover:text-white"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <div
              onClick={() => searchInputRef.current?.focus()}
              className="flex h-10 w-48 cursor-text items-center gap-2 rounded-lg border border-slate-500 bg-slate-600/70 px-3"
            >
              <span>🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search movies..."
                className="w-full bg-transparent text-white outline-none placeholder-gray-300"
              />
            </div>

            {user ? (
              <>
                <span className="text-sm text-[#d1b36b]">
                  Hi, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-[#d1b36b] px-4 py-2 font-semibold text-[#d1b36b] hover:bg-[#d1b36b] hover:text-[#172033]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="rounded-lg border border-[#d1b36b] px-4 py-2 font-semibold text-[#d1b36b] hover:bg-[#d1b36b] hover:text-[#172033]"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-lg bg-[#d1b36b] px-4 py-2 font-semibold text-[#172033] hover:bg-white"
                >
                  Register
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Right */}
          <div className="flex items-center gap-2 md:hidden">
            <NotificationBell />

            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#b89236]"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <button
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Toggle menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-500"
            >
              {showMenu ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="mt-5 border-t border-slate-700 pt-5 md:hidden">

            <div
              onClick={() => mobileSearchInputRef.current?.focus()}
              className="mb-5 flex h-11 cursor-text items-center gap-2 rounded-lg border border-slate-500 bg-slate-600/70 px-3"
            >
              <span>🔍</span>
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search movies..."
                className="w-full bg-transparent text-white outline-none placeholder-gray-300"
              />
            </div>

            <ul className="flex flex-col gap-4 text-center">
              {[
                ["/", "Home"],
                ["/popular", "Popular"],
                ["/top-rated", "Top Rated"],
                ["/upcoming", "Upcoming"],
                ["/favorites", "Favorites"],
              ].map(([path, label]) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    onClick={() => setShowMenu(false)}
                    className={navClass}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-col items-center gap-3 border-t border-slate-700 pt-5">
              {user ? (
                <>
                  <span className="text-[#d1b36b]">
                    Welcome, {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-lg border border-[#d1b36b] py-2 font-semibold text-[#d1b36b]"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    onClick={() => setShowMenu(false)}
                    className="w-full rounded-lg border border-[#d1b36b] py-2 text-center font-semibold text-[#d1b36b]"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={() => setShowMenu(false)}
                    className="w-full rounded-lg bg-[#d1b36b] py-2 text-center font-semibold text-[#172033]"
                  >
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;