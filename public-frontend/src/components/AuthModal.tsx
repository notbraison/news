import React, { useState, useEffect } from "react";
import { User, authService } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    number: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setForm({ fname: "", lname: "", email: "", password: "", number: "" });
      setError("");
      setIsSignUp(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (isSignUp && !form.fname.trim()) {
      setError("First name is required");
      return;
    }
    if (isSignUp && !form.lname.trim()) {
      setError("Last name is required");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!form.password.trim()) {
      setError("Password is required");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        await register(
          form.fname,
          form.lname,
          form.email,
          form.password,
          form.number
        );
      } else {
        await login(form.email, form.password);
      }

      // Call success callback
      if (onAuthSuccess) {
        // Get the current user from context
        const currentUser = authService.getUser();
        if (currentUser) {
          onAuthSuccess(currentUser);
        }
      }

      // Close modal
      onClose();

      // Show success message
      const message = isSignUp
        ? "Account created successfully!"
        : "Welcome back!";
      // You can add a toast notification here if you have a toast system
    } catch (err: any) {
      setError(
        err.message ||
          (isSignUp ? "Failed to create account" : "Failed to sign in")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-10 mx-2 animate-fade-in">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
          disabled={loading}
        >
          ×
        </button>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-6 text-red-600">
          {isSignUp ? "Create your account" : "Sign in to News Website"}
        </h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  First Name
                </label>
                <input
                  type="text"
                  name="fname"
                  autoComplete="given-name"
                  value={form.fname}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lname"
                  autoComplete="family-name"
                  value={form.lname}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  placeholder="Last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  Phone Number (optional)
                </label>
                <input
                  type="text"
                  name="number"
                  autoComplete="tel"
                  value={form.number}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  placeholder="Phone number"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Password
            </label>
            <input
              type="password"
              name="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm text-center font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold rounded-lg shadow transition-all focus:outline-none focus:ring-2 focus:ring-red-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isSignUp ? "Creating Account..." : "Signing In..."}
              </div>
            ) : isSignUp ? (
              "Sign Up"
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            className="text-red-600 hover:underline font-semibold ml-1"
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={loading}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
