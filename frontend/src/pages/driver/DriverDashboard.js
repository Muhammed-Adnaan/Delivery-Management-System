import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import BatchOrdersPage from "./BatchOrdersPage";
import LiveMapPage from "./LiveMapPage";
import DailyReportsPage from "./DailyReportsPage";
import ReportDetailsPage from "./ReportDetailsPage";

function DriverDashboard() {
	const [tab, setTab] = useState(0);
	const { darkMode } = useTheme();

	return (
		<div
			className={`flex flex-col h-screen transition-colors duration-300 ${
				darkMode ? "bg-gray-900" : "bg-blue-50"
			}`}
		>
			<Routes>
				<Route
					index
					element={
						<>
							<div className="flex-1 overflow-y-auto pb-16">
								{tab === 0 && <BatchOrdersPage />}
								{tab === 1 && <LiveMapPage />}
								{tab === 2 && <DailyReportsPage />}
							</div>
							<nav
								className={`flex justify-around fixed bottom-0 w-full z-10 transition-colors duration-300 ${
									darkMode
										? "bg-gray-800 text-gray-100"
										: "bg-blue-900 text-white"
								}`}
							>
								<button
									onClick={() => setTab(0)}
									className={`flex-1 py-3 transition-colors duration-200 ${
										tab === 0 ? (darkMode ? "bg-blue-700" : "bg-blue-700") : ""
									}`}
								>
									Orders
								</button>
								<button
									onClick={() => setTab(1)}
									className={`flex-1 py-3 transition-colors duration-200 ${
										tab === 1 ? (darkMode ? "bg-blue-700" : "bg-blue-700") : ""
									}`}
								>
									Map
								</button>
								<button
									onClick={() => setTab(2)}
									className={`flex-1 py-3 transition-colors duration-200 ${
										tab === 2 ? (darkMode ? "bg-blue-700" : "bg-blue-700") : ""
									}`}
								>
									Reports
								</button>
							</nav>
						</>
					}
				/>
				<Route path="report/:id" element={<ReportDetailsPage />} />
			</Routes>
		</div>
	);
}

export default DriverDashboard;
