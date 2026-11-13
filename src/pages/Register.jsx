
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setSubmitting(true);

    try {
      await register(name, email, password);
      setSuccess("Account created successfully! Please login.");
      setTimeout(() => navigate("/login"), 1200);
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
        autoComplete="off"
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-gray-900 shadow-xl"
      >
        <h1 className="mb-2 text-center text-3xl font-bold">
          Create Account
        </h1>
        <p className="mb-7 text-center text-gray-500">
          Join FilmFiesta today!
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {success && (
          <p className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-700">
            {success}
          </p>
        )}

        <label className="mb-2 block text-sm font-medium">Full Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="mb-5 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-purple-600"
          name="register-name"
          autoComplete="off"
        />

        <label className="mb-2 block text-sm font-medium">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="mb-5 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-purple-600"
          name="register-email"
          autoComplete="off"
        />

        <label className="mb-2 block text-sm font-medium">Password</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 8 characters"
          className="mb-6 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-purple-600"
          name="register-password"
          autoComplete="new-password"
            />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-purple-700 py-3 font-semibold text-white hover:bg-purple-800 disabled:opacity-60"
        >
          {submitting ? "Creating Account..." : "Register"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-purple-700">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;