import React from "react";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../contexts/ThemeContext";

function Hero() {
	const { darkMode } = useTheme();

	return (
		<div>
			{/* Theme Toggle Button and Hero Section */}
			<div
				className={`flex flex-col items-center justify-center min-h-screen transition-colors duration-700 ${
					darkMode ? "bg-gray-900" : "bg-blue-50"
				} py-12 relative`}
			>
				{/* Theme Toggle Button */}
				<div className="absolute top-8 right-8 z-10">
					<ThemeToggle
						className={
							darkMode
								? "bg-gray-700 text-gray-100 hover:bg-gray-600"
								: "bg-blue-300 text-blue-900 hover:bg-blue-400"
						}
					/>
				</div>

				{/* Hero Section */}
				<div
					className={`rounded-xl shadow-lg p-10 flex flex-col items-center w-full max-w-xl transition-colors duration-700
					${darkMode ? "bg-gray-800" : "bg-white"}`}
				>
					<h2
						className={`text-5xl font-extrabold mb-6 transition-colors duration-700
						${darkMode ? "text-gray-100" : "text-blue-800"}`}
					>
						Fortune
					</h2>
					<p
						className={`text-lg mb-10 text-center transition-colors duration-700
						${darkMode ? "text-gray-200" : "text-blue-700"}`}
					>
						Welcome to Silo Fortune! Choose your role to continue.
					</p>
					<h3
						className={`mb-5 text-2xl font-bold transition-colors duration-700 ${
							darkMode ? "text-gray-100" : "text-blue-800"
						}`}
					>
						Register
					</h3>
					<div className="flex justify-center space-x-6">
						<button
							onClick={() => (window.location.href = "/register?role=admin")}
							className={`font-semibold py-3 px-8 rounded-lg shadow transition duration-200
                                ${
																	darkMode
																		? "bg-blue-600 hover:bg-blue-700 text-gray-100"
																		: "bg-blue-600 hover:bg-blue-700 text-white"
																}`}
						>
							Admin
						</button>
						<button
							onClick={() => (window.location.href = "/register?role=driver")}
							className={`font-semibold py-3 px-8 rounded-lg shadow transition duration-200
                                ${
																	darkMode
																		? "bg-purple-600 hover:bg-purple-700 text-gray-100"
																		: "bg-purple-600 hover:bg-purple-700 text-white"
																}`}
						>
							Driver
						</button>
					</div>
					<div className="flex justify-center mt-8">
						<a
							href="/login"
							className={`font-semibold transition duration-200 hover:underline
                                ${
																	darkMode
																		? "text-indigo-400 hover:text-indigo-300"
																		: "text-indigo-600 hover:text-indigo-700"
																}`}
						>
							Already have an account? Login
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Hero;
