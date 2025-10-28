import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

function Register() {
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
		phone: "",
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { darkMode } = useTheme();

	const role = searchParams.get("role") || "driver";

	useEffect(() => {
		// Pre-fill role if provided in URL
		if (role) {
			setFormData((prev) => ({ ...prev, role }));
		}
	}, [role]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		try {
			const res = await fetch("/user/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: formData.username,
					email: formData.email,
					password: formData.password,
					role: role,
					phone: formData.phone,
				}),
			});

			const data = await res.json();

			if (res.ok) {
				setSuccess("Registration successful! Redirecting to login...");
				setTimeout(() => {
					navigate("/login");
				}, 2000);
			} else {
				setError(data.error || "Registration failed");
			}
		} catch (err) {
			setError("Registration failed - please check your connection");
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
					Register as {role.charAt(0).toUpperCase() + role.slice(1)}
				</h2>

				<form onSubmit={handleSubmit} className="flex flex-col space-y-4">
					<label
						className={`font-semibold transition-colors duration-300 ${
							darkMode ? "text-gray-200" : "text-blue-700"
						}`}
					>
						Username
						<input
							name="username"
							type="text"
							required
							className={`block w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 transition-colors duration-300 ${
								darkMode
									? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-400"
									: "bg-white border-gray-300 text-gray-900 focus:ring-blue-400"
							}`}
							placeholder="Enter your username"
							value={formData.username}
							onChange={handleChange}
						/>
					</label>

					<label
						className={`font-semibold transition-colors duration-300 ${
							darkMode ? "text-gray-200" : "text-blue-700"
						}`}
					>
						Email
						<input
							name="email"
							type="email"
							required
							className={`block w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 transition-colors duration-300 ${
								darkMode
									? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-400"
									: "bg-white border-gray-300 text-gray-900 focus:ring-blue-400"
							}`}
							placeholder="Enter your email"
							value={formData.email}
							onChange={handleChange}
						/>
					</label>

					<label
						className={`font-semibold transition-colors duration-300 ${
							darkMode ? "text-gray-200" : "text-blue-700"
						}`}
					>
						Phone (Optional)
						<input
							name="phone"
							type="tel"
							className={`block w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 transition-colors duration-300 ${
								darkMode
									? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-400"
									: "bg-white border-gray-300 text-gray-900 focus:ring-blue-400"
							}`}
							placeholder="Enter your phone number"
							value={formData.phone}
							onChange={handleChange}
						/>
					</label>

					<label
						className={`font-semibold transition-colors duration-300 ${
							darkMode ? "text-gray-200" : "text-blue-700"
						}`}
					>
						Password
						<input
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
						/>
					</label>

					<label
						className={`font-semibold transition-colors duration-300 ${
							darkMode ? "text-gray-200" : "text-blue-700"
						}`}
					>
						Confirm Password
						<input
							name="confirmPassword"
							type="password"
							required
							className={`block w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 transition-colors duration-300 ${
								darkMode
									? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-400"
									: "bg-white border-gray-300 text-gray-900 focus:ring-blue-400"
							}`}
							placeholder="Confirm your password"
							value={formData.confirmPassword}
							onChange={handleChange}
						/>
					</label>

					{error && (
						<div className="text-red-600 text-sm text-center">{error}</div>
					)}

					{success && (
						<div className="text-green-600 text-sm text-center">{success}</div>
					)}

					<button
						type="submit"
						className={`font-semibold py-2 rounded transition duration-200 ${
							darkMode
								? "bg-purple-600 hover:bg-purple-700 text-gray-100"
								: "bg-purple-600 hover:bg-purple-700 text-white"
						}`}
					>
						Register
					</button>
				</form>

				<div className="mt-6 text-center">
					<Link
						to="/login"
						className={`hover:underline transition-colors duration-300 ${
							darkMode ? "text-blue-400" : "text-blue-500"
						}`}
					>
						Already have an account? Login
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

export default Register;
