import React, { useEffect, useState } from "react";
import localforage from "localforage";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

function DailyReportsPage() {
	const [reports, setReports] = useState([]);
	const [ordersToday, setOrdersToday] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const { darkMode } = useTheme();

	useEffect(() => {
		localforage.getItem("dailyReports").then((data) => {
			setReports(Array.isArray(data) ? data : []);
		});
		// Fetch batch orders for this driver
		const driverName = localStorage.getItem("username");
		if (!driverName) {
			setError("No driver name found. Please log in as a driver.");
			setLoading(false);
			return;
		}
		fetch(`/admin/driver/${driverName}/batches`)
			.then((res) => res.json())
			.then((batches) => {
				// Flatten all orders from all batches
				const allOrders = batches.flatMap((batch) => batch.orders || []);
				setOrdersToday(allOrders);
				setLoading(false);
			})
			.catch(() => {
				setError("Failed to fetch batch orders.");
				setLoading(false);
			});
	}, []);

	const addTestReport = async () => {
		const today = new Date().toISOString().slice(0, 10);
		// All orders assigned to the driver (regardless of date)
		const totalAssigned = ordersToday.length;
		// Number of orders delivered (is_delivered true)
		const delivered = ordersToday.filter((order) => order.is_delivered).length;
		// Prevent duplicate reports for the same day
		let updatedReports = [...reports];
		const existingIndex = updatedReports.findIndex((r) => r.date === today);
		const newReport = { id: Date.now(), date: today, delivered, totalAssigned };
		if (existingIndex !== -1) {
			updatedReports[existingIndex] = newReport;
		} else {
			updatedReports = [...updatedReports, newReport];
		}
		await localforage.setItem("dailyReports", updatedReports);
		setReports(updatedReports);
	};

	const clearReports = async () => {
		await localforage.removeItem("dailyReports");
		setReports([]);
	};

	if (loading)
		return (
			<div
				className={`p-8 text-center ${
					darkMode ? "text-gray-100" : "text-gray-900"
				}`}
			>
				<div className="text-4xl mb-4">📊</div>
				<div className="text-xl font-bold mb-2">
					Loading your daily reports...
				</div>
				<div className="text-gray-500">
					Preparing your performance dashboard! 📈
				</div>
			</div>
		);
	if (error) return <div className="text-red-600 p-4">{error}</div>;

	return (
		<div
			className={`p-6 transition-colors duration-300 ${
				darkMode ? "text-gray-100" : "text-gray-900"
			}`}
		>
			<div className="text-center mb-8">
				<h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
					Daily Performance Reports
				</h2>
				<p className="text-gray-500">
					Track your delivery achievements and progress! 🎯
				</p>
			</div>
			<div className="mb-6 flex gap-3 justify-center">
				<button
					onClick={addTestReport}
					className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
						darkMode
							? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
							: "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
					} text-white shadow-lg`}
				>
					📝 Add Today's Report
				</button>
				<button
					onClick={clearReports}
					className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
						darkMode
							? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
							: "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
					} text-white shadow-lg`}
				>
					🗑️ Clear All Reports
				</button>
			</div>
			<div
				className={`rounded-xl p-6 shadow-lg transition-colors duration-300 ${
					darkMode
						? "bg-gradient-to-br from-purple-900 to-purple-800"
						: "bg-gradient-to-br from-purple-50 to-purple-100"
				}`}
			>
				{reports.length === 0 ? (
					<div className="text-center py-8">
						<div className="text-6xl mb-4">📋</div>
						<div className="text-xl font-bold mb-2">
							No reports generated yet!
						</div>
						<div className="text-gray-500">
							Click "Add Today's Report" to get started! 📊
						</div>
					</div>
				) : (
					<div className="overflow-x-auto scrollbar-purple">
						<table className="w-full">
							<thead>
								<tr
									className={`border-b-2 ${
										darkMode ? "border-purple-600" : "border-purple-400"
									}`}
								>
									<th
										className={`py-4 px-4 text-left font-bold text-lg ${
											darkMode ? "text-purple-300" : "text-purple-700"
										}`}
									>
										🆔 Report ID
									</th>
									<th
										className={`py-4 px-4 text-left font-bold text-lg ${
											darkMode ? "text-purple-300" : "text-purple-700"
										}`}
									>
										📅 Date
									</th>
									<th
										className={`py-4 px-4 text-left font-bold text-lg ${
											darkMode ? "text-purple-300" : "text-purple-700"
										}`}
									>
										✅ Delivered
									</th>
									<th
										className={`py-4 px-4 text-left font-bold text-lg ${
											darkMode ? "text-blue-300" : "text-blue-700"
										}`}
									>
										📦 Total Assigned
									</th>
									<th
										className={`py-4 px-4 text-left font-bold text-lg ${
											darkMode ? "text-purple-300" : "text-purple-700"
										}`}
									>
										📊 Performance
									</th>
								</tr>
							</thead>
							<tbody>
								{reports.map((report, index) => {
									const performance =
										report.totalAssigned > 0
											? Math.round(
													(report.delivered / report.totalAssigned) * 100
											  )
											: 0;
									return (
										<tr
											key={report.id}
											className={`border-b transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
												index % 2 === 0
													? darkMode
														? "bg-purple-800/50"
														: "bg-purple-100/50"
													: darkMode
													? "bg-purple-800/30"
													: "bg-purple-100/30"
											} ${darkMode ? "border-purple-700" : "border-purple-200"}`}
										>
											<td className="py-4 px-4">
												<button
													className={`font-bold hover:underline transition-colors duration-200 ${
														darkMode
															? "text-purple-300 hover:text-purple-200"
															: "text-purple-600 hover:text-purple-700"
													}`}
													onClick={() =>
														navigate(`/dashboard/driver/report/${report.id}`)
													}
												>
													📋 #{report.id}
												</button>
											</td>
											<td className="py-4 px-4">
												<span className="font-semibold">{report.date}</span>
											</td>
											<td className="py-4 px-4">
												<span
													className={`px-3 py-1 rounded-full text-xs font-semibold ${
														report.delivered > 0
															? darkMode
																? "bg-green-600 text-green-100"
																: "bg-green-100 text-green-800"
															: darkMode
															? "bg-gray-600 text-gray-100"
															: "bg-gray-100 text-gray-800"
													}`}
												>
													<span className="hidden md:inline">
														{report.delivered} delivered
													</span>
													<span className="md:hidden">{report.delivered}</span>
												</span>
											</td>
											<td className="py-4 px-4">
												<span className="font-semibold">
													{report.totalAssigned}
												</span>
											</td>
											<td className="py-4 px-4">
												<span
													className={`px-3 py-1 rounded-full text-xs font-semibold ${
														performance >= 80
															? darkMode
																? "bg-green-600 text-green-100"
																: "bg-green-100 text-green-800"
															: performance >= 60
															? darkMode
																? "bg-yellow-600 text-yellow-100"
																: "bg-yellow-100 text-yellow-800"
															: darkMode
															? "bg-red-600 text-red-100"
															: "bg-red-100 text-red-800"
													}`}
												>
													<span className="hidden md:inline">
														{performance}% success
													</span>
													<span className="md:hidden">{performance}%</span>
												</span>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}

export default DailyReportsPage;
