import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

function Login() {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const { darkMode } = useTheme();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		// Login attempt started
		// Form data logged

		try {
			// Making API call to /user/login
			const res = await fetch("/user/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: formData.username,
					password: formData.password,
				}),
			});
			// Response status logged
			// Response headers logged

			const data = await res.json();
			// Response data logged

			if (res.ok) {
				// Login successful, storing user data
				// Store user info in localStorage
				localStorage.setItem("username", data.user.username);
				localStorage.setItem("role", data.user.role);
				if (data.driver) {
					localStorage.setItem("driver_id", data.driver.id);
				}
				// Stored in localStorage

				// Navigate to dashboard with proper role-based path
				const dashboardPath = `/dashboard/${data.user.role}`;
				// Navigating to dashboard
				navigate(dashboardPath);
			} else {
				// Login failed
				setError(data.error || "Login failed");
			}
		} catch (err) {
			// Login error
			// Try direct backend URL as fallback
			try {
				// Trying direct backend URL as fallback
				const fallbackRes = await fetch("/user/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						username: formData.username,
						password: formData.password,
					}),
				});
				const fallbackData = await fallbackRes.json();
				// Fallback response data logged

				if (fallbackRes.ok && fallbackData.success) {
					// Fallback login successful
					localStorage.setItem("username", fallbackData.user.username);
					localStorage.setItem("role", fallbackData.user.role);
					if (fallbackData.driver) {
						localStorage.setItem("driver_id", fallbackData.driver.id);
					}
					const dashboardPath = `/dashboard/${fallbackData.user.role}`;
					// Navigating to dashboard
					navigate(dashboardPath);
				} else {
					setError(fallbackData.error || "Login failed");
				}
			} catch (fallbackErr) {
				// Fallback login error
				setError("Login failed - please check your connection");
			}
		}
	};

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<div
			className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
				darkMode ? "bg-gray-900" : "bg-blue-50"
			}`}
		>
			<div
				className={`rounded-xl shadow-lg p-10 w-full max-w-md transition-colors duration-300 ${
					darkMode ? "bg-gray-800" : "bg-white"
				}`}
			>
				{/* Theme Toggle */}
				<div className="absolute top-8 right-8">
					<ThemeToggle
						className={
							darkMode
								? "bg-gray-700 text-gray-100 hover:bg-gray-600"
								: "bg-blue-300 text-blue-900 hover:bg-blue-400"
						}
					/>
				</div>

				<h2
					className={`text-3xl font-bold mb-6 text-center transition-colors duration-300 ${
						darkMode ? "text-gray-100" : "text-blue-700"
					}`}
				>
					Login
				</h2>
				<form onSubmit={handleSubmit} className="flex flex-col space-y-4">
					<label
						className={`font-semibold transition-colors duration-300 ${
							darkMode ? "text-gray-200" : "text-blue-700"
						}`}
					>
						Username or Email
						<input
							id="username"
							name="username"
							type="text"
							required
							className={`block w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 transition-colors duration-300 ${
								darkMode
									? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-400"
									: "bg-white border-gray-300 text-gray-900 focus:ring-blue-400"
							}`}
							placeholder="Enter your username or email"
							value={formData.username}
							onChange={handleChange}
							autoComplete="username"
						/>
					</label>
					<label
						className={`font-semibold transition-colors duration-300 ${
							darkMode ? "text-gray-200" : "text-blue-700"
						}`}
					>
						Password
						<input
							id="password"
							name="password"
							type="password"
							required
							className={`block w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 transition-colors duration-300 ${
								darkMode
									? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-400"
									: "bg-white border-gray-300 text-gray-900 focus:ring-blue-400"
							}`}
							placeholder="Enter your password"
							value={formData.password}
							onChange={handleChange}
							autoComplete="current-password"
						/>
					</label>

					{error && (
						<div className="text-red-600 text-sm text-center">{error}</div>
					)}

					<button
						type="submit"
						className={`font-semibold py-2 rounded transition duration-200 ${
							darkMode
								? "bg-blue-600 hover:bg-blue-700 text-gray-100"
								: "bg-blue-600 hover:bg-blue-700 text-white"
						}`}
					>
						Sign In
					</button>
				</form>
				<div className="mt-6 text-center">
					<Link
						to="/register"
						className={`hover:underline transition-colors duration-300 ${
							darkMode ? "text-blue-400" : "text-blue-500"
						}`}
					>
						Don't have an account? Register
					</Link>
				</div>
				<div className="mt-2 text-center">
					<Link
						to="/"
						className={`hover:underline transition-colors duration-300 ${
							darkMode ? "text-blue-400" : "text-blue-500"
						}`}
					>
						Back to Home
					</Link>
				</div>
			</div>
		</div>
	);
}

export default Login;
