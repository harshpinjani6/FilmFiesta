
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-gray-900 shadow-xl"
      >
        <h1 className="mb-2 text-center text-3xl font-bold">
          Welcome Back!
        </h1>
        <p className="mb-7 text-center text-gray-500">
          Login to your FilmFiesta account
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <label className="mb-2 block text-sm font-medium">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="mb-5 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-purple-600"
        />

        <label className="mb-2 block text-sm font-medium">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="mb-6 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-purple-600"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-purple-700 py-3 font-semibold text-white hover:bg-purple-800 disabled:opacity-60"
        >
          {submitting ? "Logging in..." : "Login"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-purple-700">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;