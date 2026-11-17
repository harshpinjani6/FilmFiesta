import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Popular from "./pages/Popular";
import Upcoming from "./pages/Upcoming";
import TopRatedPage from "./pages/TopRatedPage";
import GenrePage from "./pages/GenrePage";
import Favorites from "./pages/Favorites";
import MovieDetails from "./pages/MovieDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { MovieContext } from "./context/MovieContext";
import AddMovie from "./pages/admin/AddMovie";

import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EditMovie from "./pages/admin/EditMovie";
import AdminProfile from "./pages/admin/AdminProfile";
import WatchHistory from "./pages/WatchHistory";

function App() {
  const { darkMode } = useContext(MovieContext);

  return (
    <div
      className={`flex min-h-screen flex-col ${
        darkMode
          ? "bg-[#111827] text-white"
          : "bg-white text-[#172033]"
      }`}
    >
      <Header />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/popular" element={<Popular />} />
          <Route path="/top-rated" element={<TopRatedPage />} />
          <Route path="/upcoming" element={<Upcoming />} />
          <Route path="/genres/:genre" element={<GenrePage />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/movie/:id" element={<MovieDetails />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/watch-history" element={<WatchHistory />} />
          
        <Route element={<AdminRoute />}>
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/add-movie"
            element={<AddMovie />}
          />

          <Route
            path="/admin/edit-movie/:id"
            element={<EditMovie />}
          />

          <Route
            path="/admin/profile"
            element={<AdminProfile />}
          />
        </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;