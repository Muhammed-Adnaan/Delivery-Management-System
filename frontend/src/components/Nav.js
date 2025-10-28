import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";

function Nav({ userName, role }) {
	const navigate = useNavigate();
	const { darkMode } = useTheme();

	const handleLogout = () => {
		localStorage.removeItem("username");
		localStorage.removeItem("role");
		localStorage.removeItem("driver_id");
		navigate("/");
	};

	return (
		<nav
			className={`p-4 shadow-lg transition-colors duration-300 ${
				darkMode ? "bg-gray-800 text-gray-100" : "bg-blue-600 text-white"
			}`}
		>
			<div className="flex justify-between items-center">
				<div className="flex items-center space-x-4">
					<h1 className="text-xl font-bold">Silo Fortune</h1>
					<span className="text-sm opacity-75">
						Welcome, {userName} ({role})
					</span>
				</div>
				<div className="flex items-center space-x-4">
					<ThemeToggle 
						className={
							darkMode
								? "bg-gray-700 text-gray-100 hover:bg-gray-600"
								: "bg-blue-500 text-white hover:bg-blue-400"
						}
					/>
					<button
						onClick={handleLogout}
						className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
							darkMode
								? "bg-red-600 hover:bg-red-700 text-gray-100"
								: "bg-red-500 hover:bg-red-600 text-white"
						}`}
					>
						Logout
					</button>
				</div>
			</div>
		</nav>
	);
}

export default Nav;
