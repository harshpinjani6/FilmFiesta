import {
  useRef,
  useState,
  useContext,
  useEffect,
} from "react";

import {
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import NotificationBell from "./NotificationBell";
import { MovieContext } from "../context/MovieContext";
import { useAuth } from "../context/AuthContext";

function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const [showExplore, setShowExplore] = useState(false);

  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const exploreRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  const {
    search,
    setSearch,
    darkMode,
    toggleDarkMode,
  } = useContext(MovieContext);

  // Main desktop navigation
  const mainLinks = [
    ["/", "Home"],
    ["/popular", "Popular"],
    ["/top-rated", "Top Rated"],
  ];

  // Explore dropdown links
  const exploreLinks = [
    ["/upcoming", "Upcoming Movies"],
    ["/favorites", "Favorites"],

    ...(user?.role === "user"
      ? [["/watch-history", "Watch History"]]
      : []),
  ];

  // Admin links
  const adminLinks =
    user?.role === "admin"
      ? [
          ["/admin", "Admin Dashboard"],
          ["/admin/profile", "Admin Profile"],
        ]
      : [];

  const allLinks = [
    ...mainLinks,
    ...exploreLinks,
    ...adminLinks,
  ];

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    setShowExplore(false);
    navigate("/");
  };

  const closeMenus = () => {
    setShowMenu(false);
    setShowExplore(false);
  };

  const navClass = ({ isActive }) =>
    `whitespace-nowrap font-semibold transition ${
      isActive
        ? "text-[#d1b36b]"
        : "text-white hover:text-[#d1b36b]"
    }`;

  // Close dropdown on route change
  useEffect(() => {
    setShowMenu(false);
    setShowExplore(false);
  }, [location.pathname]);

  // Close Explore dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        exploreRef.current &&
        !exploreRef.current.contains(event.target)
      ) {
        setShowExplore(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // Close menus when switching to desktop
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(min-width: 1024px)"
    );

    const handleResize = (event) => {
      if (event.matches) {
        setShowMenu(false);
      } else {
        setShowExplore(false);
      }
    };

    mediaQuery.addEventListener("change", handleResize);

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleResize
      );
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#172033] text-white shadow-lg">
      <nav className="mx-auto w-full max-w-[1900px] px-4 py-3 lg:px-6">

        {/* Single Row Navbar */}
        <div className="flex min-h-12 items-center justify-between gap-3">

          {/* Logo */}
          <NavLink
            to="/"
            onClick={closeMenus}
            className="flex shrink-0 items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d1b36b] text-lg font-bold text-[#172033]">
              F
            </div>

            <span className="text-xl font-bold text-[#d1b36b] xl:text-2xl">
              FilmFiesta
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden min-w-0 items-center justify-center gap-4 lg:flex xl:gap-6">

            {mainLinks.map(([path, label]) => (
              <NavLink
                key={path}
                to={path}
                onClick={closeMenus}
                className={navClass}
              >
                {label}
              </NavLink>
            ))}

            {/* Explore Dropdown */}
            <div
              ref={exploreRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setShowExplore((prev) => !prev)
                }
                aria-expanded={showExplore}
                aria-haspopup="true"
                className={`flex items-center gap-1 whitespace-nowrap font-semibold transition hover:text-[#d1b36b] ${
                  exploreLinks.some(
                    ([path]) => location.pathname === path
                  )
                    ? "text-[#d1b36b]"
                    : "text-white"
                }`}
              >
                Explore

                <span
                  className={`text-xs transition-transform ${
                    showExplore ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {showExplore && (
                <div className="absolute left-0 top-full z-[100] mt-3 w-52 overflow-hidden rounded-xl border border-slate-700 bg-[#1f2937] py-2 shadow-2xl">

                  {exploreLinks.map(([path, label]) => (
                    <NavLink
                      key={path}
                      to={path}
                      onClick={closeMenus}
                      className={({ isActive }) =>
                        `block px-4 py-3 text-sm font-medium transition ${
                          isActive
                            ? "bg-[#374151] text-[#d1b36b]"
                            : "text-white hover:bg-[#374151] hover:text-[#d1b36b]"
                        }`
                      }
                    >
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Navigation */}
            {adminLinks.map(([path, label]) => (
              <NavLink
                key={path}
                to={path}
                onClick={closeMenus}
                className={navClass}
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Right Controls */}
          <div className="hidden shrink-0 items-center gap-2 lg:flex xl:gap-3">

            <NotificationBell />

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg text-[#b89236] transition hover:bg-[#d1b36b] hover:text-white"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            {/* Search */}
            <div
              onClick={() =>
                searchInputRef.current?.focus()
              }
              className="flex h-10 w-32 cursor-text items-center gap-2 rounded-lg border border-slate-500 bg-slate-600/70 px-3 xl:w-48 2xl:w-60"
            >
              <span>🔍</span>

              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search movies..."
                aria-label="Search movies"
                className="min-w-0 w-full bg-transparent text-sm text-white outline-none placeholder-gray-300"
              />
            </div>

            {/* Login / Logout */}
            {user ? (
              <>
                <span className="hidden max-w-28 truncate text-sm text-[#d1b36b] 2xl:block">
                  Hi, {user.name}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-[#d1b36b] px-3 py-2 font-semibold text-[#d1b36b] transition hover:bg-[#d1b36b] hover:text-[#172033]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={closeMenus}
                  className="rounded-lg border border-[#d1b36b] px-3 py-2 font-semibold text-[#d1b36b] transition hover:bg-[#d1b36b] hover:text-[#172033]"
                >
                  Login
                </NavLink>

                <NavLink
                  to="/register"
                  onClick={closeMenus}
                  className="rounded-lg bg-[#d1b36b] px-3 py-2 font-semibold text-[#172033] transition hover:bg-white"
                >
                  Register
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex shrink-0 items-center gap-2 lg:hidden">

            <NotificationBell />

            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#b89236]"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <button
              type="button"
              onClick={() =>
                setShowMenu((prev) => !prev)
              }
              aria-label="Toggle menu"
              aria-expanded={showMenu}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-500 text-xl"
            >
              {showMenu ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {showMenu && (
          <div className="mt-4 border-t border-slate-700 pt-4 lg:hidden">

            {/* Mobile Search */}
            <div
              onClick={() =>
                mobileSearchInputRef.current?.focus()
              }
              className="mb-5 flex h-11 items-center gap-2 rounded-lg border border-slate-500 bg-slate-600/70 px-3"
            >
              <span>🔍</span>

              <input
                ref={mobileSearchInputRef}
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search movies..."
                aria-label="Search movies"
                className="min-w-0 w-full bg-transparent text-white outline-none placeholder-gray-300"
              />
            </div>

            {/* Mobile Links */}
            <ul className="flex flex-col gap-4 text-center">

              {allLinks.map(([path, label]) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    onClick={closeMenus}
                    className={navClass}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Mobile Authentication */}
            <div className="mt-5 flex flex-col items-center gap-3 border-t border-slate-700 pt-5">

              {user ? (
                <>
                  <span className="text-[#d1b36b]">
                    Welcome, {user.name}
                  </span>

                  <button
                    type="button"
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
                    onClick={closeMenus}
                    className="w-full rounded-lg border border-[#d1b36b] py-2 text-center font-semibold text-[#d1b36b]"
                  >
                    Login
                  </NavLink>

                  <NavLink
                    to="/register"
                    onClick={closeMenus}
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