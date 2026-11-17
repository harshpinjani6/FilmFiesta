
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initial = user?.name?.charAt(0).toUpperCase() || "A";

  return (
    <div className="min-h-screen bg-[#111827] px-4 py-10 text-white">

      <div className="mx-auto max-w-2xl">

        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#d1b36b]">
            Admin Profile
          </h1>

          <p className="mt-2 text-gray-400">
            View your FilmFiesta administrator account.
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl bg-[#1f2937] p-6 shadow-xl md:p-10">

          {/* Avatar */}
          <div className="mb-8 flex flex-col items-center">

            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#b89236] text-4xl font-bold text-white">
              {initial}
            </div>

            <h2 className="mt-4 text-2xl font-bold">
              {user?.name || "Admin"}
            </h2>

            <span className="mt-2 rounded-full bg-[#b89236]/20 px-4 py-1 text-sm font-semibold text-[#d1b36b]">
              Administrator
            </span>

          </div>

          {/* Account Information */}
          <div className="space-y-5">

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Full Name
              </label>

              <div className="rounded-lg bg-[#111827] px-4 py-3">
                {user?.name || "Not available"}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Email Address
              </label>

              <div className="rounded-lg bg-[#111827] px-4 py-3">
                {user?.email || "Not available"}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Account Role
              </label>

              <div className="rounded-lg bg-[#111827] px-4 py-3 capitalize text-[#d1b36b]">
                {user?.role || "Not available"}
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-wrap gap-4">

            <Link
              to="/admin"
              className="rounded-lg bg-[#b89236] px-6 py-3 font-semibold text-white transition hover:bg-[#d1b36b]"
            >
              Back to Dashboard
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-red-500 px-6 py-3 font-semibold text-red-400 transition hover:bg-red-600 hover:text-white"
            >
              Logout
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

export default AdminProfile;