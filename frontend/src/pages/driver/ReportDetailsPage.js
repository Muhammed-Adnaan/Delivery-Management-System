import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import localforage from "localforage";
import { useTheme } from "../../contexts/ThemeContext";

function ReportDetailsPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { darkMode } = useTheme();
	const [report, setReport] = useState(null);
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const driverName = localStorage.getItem("username") || "";

	useEffect(() => {
		async function fetchData() {
			const reports = await localforage.getItem("dailyReports");
			const found = Array.isArray(reports)
				? reports.find((r) => String(r.id) === String(id))
				: null;
			setReport(found);
			if (!found) {
				setLoading(false);
				setError("Report not found.");
				return;
			}
			// Fetch all orders for this driver
			try {
				const batches = await fetch(`/admin/driver/${driverName}/batches`).then(
					(res) => res.json()
				);
				const allOrders = batches.flatMap((batch) => batch.orders || []);
				// All orders assigned to the driver (not just for the report date)
				setOrders(allOrders);
			} catch {
				setError("Failed to fetch orders.");
			}
			setLoading(false);
		}
		fetchData();
	}, [id, driverName]);

	if (loading)
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="text-4xl mb-4">🔄</div>
					<div className="text-xl font-semibold">
						Loading your report details...
					</div>
					<div className="text-gray-500">
						Gathering all the delivery data! 📊
					</div>
				</div>
			</div>
		);

	if (error)
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="text-4xl mb-4">❌</div>
					<div className="text-xl font-semibold text-red-600">{error}</div>
					<div className="text-gray-500">Something went wrong! 😔</div>
				</div>
			</div>
		);

	if (!report) return null;

	// Sum amount for all orders (not just delivered)
	const totalAmount = orders.reduce(
		(sum, order) => sum + (order.amount || 0),
		0
	);

	// Sum amount for delivered orders only
	const totalDeliveredAmount = orders.reduce(
		(sum, order) => sum + (order.is_delivered ? order.amount || 0 : 0),
		0
	);

	// Calculate performance percentage
	const performance =
		orders.length > 0
			? Math.round(
					(orders.filter((order) => order.is_delivered).length /
						orders.length) *
						100
			  )
			: 0;

	return (
		<div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
			<div className="max-w-4xl mx-auto">
				{/* Header Section */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
						📋 Report Details #{id}
					</h1>
					<p className="text-gray-500">
						Your delivery performance breakdown! 📊
					</p>
				</div>

				{/* Back Button */}
				<div className="mb-6">
					<button
						onClick={() => navigate("/dashboard/driver")}
						className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
							darkMode
								? "bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500"
								: "bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400"
						} text-white shadow-lg`}
					>
						⬅️ Back to Reports
					</button>
				</div>

				{/* Report Info Card */}
				<div
					className={`rounded-xl p-4 md:p-6 shadow-lg mb-6 transition-colors duration-300 ${
						darkMode
							? "bg-gradient-to-br from-purple-900 to-purple-800"
							: "bg-gradient-to-br from-purple-50 to-purple-100"
					}`}
				>
					<div className="grid grid-cols-3 gap-2 md:gap-6">
						<div className="text-center">
							<div className="text-xl md:text-3xl mb-1 md:mb-2">👨‍💼</div>
							<div className="text-xs md:text-sm text-white-500">Driver</div>
							<div className="font-bold text-sm md:text-lg">{driverName}</div>
						</div>
						<div className="text-center">
							<div className="text-xl md:text-3xl mb-1 md:mb-2">📅</div>
							<div className="text-xs md:text-sm text-white-500">
								Report Date
							</div>
							<div className="font-bold text-sm md:text-lg">{report.date}</div>
						</div>
						<div className="text-center">
							<div className="text-xl md:text-3xl mb-1 md:mb-2">📊</div>
							<div className="text-xs md:text-sm text-white-500">
								Performance
							</div>
							<div
								className={`font-bold text-xs md:text-lg px-2 md:px-3 py-1 rounded-full ${
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
								{performance}% Success
							</div>
						</div>
					</div>
				</div>

				{/* Orders Table */}
				<div
					className={`rounded-xl p-6 shadow-lg transition-colors duration-300 ${
						darkMode
							? "bg-gradient-to-br from-purple-900 to-purple-800"
							: "bg-gradient-to-br from-purple-50 to-purple-100"
					}`}
				>
					<h3 className="text-2xl font-bold mb-4 text-center">
						📦 Order Details
					</h3>

					{orders.length === 0 ? (
						<div className="text-center py-8">
							<div className="text-4xl mb-4">📭</div>
							<div className="text-lg font-semibold">No orders found!</div>
							<div className="text-gray-500">
								This report doesn't have any orders yet.
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
											🆔 Order ID
										</th>
										<th
											className={`py-4 px-4 text-left font-bold text-lg ${
												darkMode ? "text-purple-300" : "text-purple-700"
											}`}
										>
											💰 Amount
										</th>
										<th
											className={`py-4 px-4 text-left font-bold text-lg ${
												darkMode ? "text-purple-300" : "text-purple-700"
											}`}
										>
											✅ Status
										</th>
									</tr>
								</thead>
								<tbody>
									{orders.map((order, index) => (
										<tr
											key={order.id}
											className={`border-b transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
												index % 2 === 0
													? darkMode
														? "bg-purple-800/50"
														: "bg-purple-100/50"
													: darkMode
													? "bg-purple-800/30"
													: "bg-purple-100/30"
											} ${
												darkMode ? "border-purple-700" : "border-purple-200"
											}`}
										>
											<td className="py-4 px-4">
												<span className="font-bold">📦 #{order.id}</span>
											</td>
											<td className="py-4 px-4">
												<span className="font-semibold">
													₹{order.amount ? order.amount.toFixed(2) : "0.00"}
												</span>
											</td>
											<td className="py-4 px-1 ">
												<span
													className={`px-3 py-1 rounded-full text-xs font-semibold ${
														order.is_delivered
															? darkMode
																? "bg-green-600 text-green-100"
																: "bg-green-100 text-green-800"
															: darkMode
															? "bg-orange-600 text-orange-100"
															: "bg-orange-100 text-orange-800"
													}`}
												>
													{order.is_delivered ? "✅ Delivered" : "🚚 Pending"}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
					<div
						className={`rounded-xl p-6 shadow-lg transition-all duration-300 transform hover:scale-105 ${
							darkMode
								? "bg-gradient-to-br from-green-900 to-green-800"
								: "bg-gradient-to-br from-green-50 to-green-100"
						}`}
					>
						<div className="text-center">
							<div className="text-4xl mb-4">💰</div>
							<div className="text-lg font-semibold mb-2">
								Total Orders Value
							</div>
							<div className="text-3xl font-bold text-green-600 dark:text-green-400">
								₹{totalAmount.toFixed(2)}
							</div>
							<div className="text-sm text-white-500 mt-2">
								All assigned orders
							</div>
						</div>
					</div>

					<div
						className={`rounded-xl p-6 shadow-lg transition-all duration-300 transform hover:scale-105 ${
							darkMode
								? "bg-gradient-to-br from-blue-900 to-blue-800"
								: "bg-gradient-to-br from-blue-50 to-blue-100"
						}`}
					>
						<div className="text-center">
							<div className="text-4xl mb-4">🎯</div>
							<div className="text-lg font-semibold mb-2">
								Delivered Orders Value
							</div>
							<div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
								₹{totalDeliveredAmount.toFixed(2)}
							</div>
							<div className="text-sm text-white-500 mt-2">
								Successfully delivered
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ReportDetailsPage;
