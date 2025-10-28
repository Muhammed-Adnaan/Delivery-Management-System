import React, { useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";

function OrdersView() {
	const [orders, setOrders] = useState([]);
	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const { darkMode } = useTheme();

	useEffect(() => {
		Promise.all([
			fetch("/admin/orders").then((res) => res.json()),
			fetch("/admin/payments").then((res) => res.json()),
		])
			.then(([orders, payments]) => {
				setOrders(orders);
				setPayments(payments);
			})
			.catch(() => setError("Failed to fetch orders/payments."))
			.finally(() => setLoading(false));
	}, []);

	function getPaymentStatus(orderId) {
		const payment = payments.find((p) => p.order_id === orderId);
		return payment ? payment.status : "pending";
	}

	function formatDate(dateStr) {
		if (!dateStr) return "-";
		const d = new Date(dateStr);
		const day = String(d.getDate()).padStart(2, "0");
		const month = String(d.getMonth() + 1).padStart(2, "0");
		const year = d.getFullYear();
		return `${day}/${month}/${year}`;
	}

	if (loading)
		return (
			<div
				className={`p-8 text-center ${
					darkMode ? "text-gray-100" : "text-gray-900"
				}`}
			>
				<div className="text-4xl mb-4">📦</div>
				<div className="text-xl font-bold mb-2">Loading customer orders...</div>
				<div className="text-gray-500">Preparing the order dashboard! 📊</div>
			</div>
		);
	if (error) return <div className="text-red-600 p-4">{error}</div>;

	return (
		<div
			className={`transition-colors duration-300 ${
				darkMode ? "text-gray-100" : "text-gray-900"
			}`}
		>
			<div className="text-center mb-8">
				<h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-2">
					📦 Customer Orders
				</h2>
				<p className="text-gray-500">
					Track all your delivery orders in one place!
				</p>
			</div>

			<div
				className={`rounded-xl p-6 shadow-lg transition-colors duration-300 ${
					darkMode
						? "bg-gradient-to-br from-purple-900 to-purple-800"
						: "bg-gradient-to-br from-purple-50 to-purple-100"
				}`}
			>
				{orders.length === 0 ? (
					<div className="text-center py-8">
						<div className="text-6xl mb-4">📭</div>
						<div className="text-xl font-bold mb-2">No orders placed yet!</div>
						<div className="text-gray-500">
							Your order dashboard awaits... 🚀
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
										📦 Order ID
									</th>
									<th
										className={`py-4 px-4 text-left font-bold text-lg ${
											darkMode ? "text-purple-300" : "text-purple-700"
										}`}
									>
										👤 Customer
									</th>
									<th
										className={`py-4 px-4 text-left font-bold text-lg ${
											darkMode ? "text-purple-300" : "text-purple-700"
										}`}
									>
										📍 Address
									</th>
									<th
										className={`py-4 px-4 text-left font-bold text-lg ${
											darkMode ? "text-purple-300" : "text-purple-700"
										}`}
									>
										📋 Batch
									</th>
									<th
										className={`py-4 px-4 text-left font-bold text-lg ${
											darkMode ? "text-purple-300" : "text-purple-700"
										}`}
									>
										🚚 Status
									</th>
									<th
										className={`py-4 px-4 text-left font-bold text-lg ${
											darkMode ? "text-purple-300" : "text-purple-700"
										}`}
									>
										💸 Payment
									</th>
									<th
										className={`py-4 px-4 text-left font-bold text-lg ${
											darkMode ? "text-purple-300" : "text-purple-700"
										}`}
									>
										🕒 Created
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
										} ${darkMode ? "border-purple-700" : "border-purple-200"}`}
									>
										<td className="py-4 px-4 font-bold">
											<span className="text-lg">📦 #{order.id}</span>
										</td>
										<td className="py-4 px-4">
											<span className="font-semibold">
												{order.customer_name}
											</span>
										</td>
										<td className="py-4 px-4">
											<span className="text-sm">{order.address}</span>
										</td>
										<td className="py-4 px-4">
											<span
												className={`px-3 py-1 rounded-full text-xs font-semibold ${
													order.batch_id
														? darkMode
															? "bg-blue-600 text-blue-100"
															: "bg-blue-100 text-blue-800"
														: darkMode
														? "bg-gray-600 text-gray-100"
														: "bg-gray-100 text-gray-800"
												}`}
											>
												{order.batch_id || "Unassigned"}
											</span>
										</td>
										<td className="py-4 px-4">
											<span
												className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
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
										<td className="py-4 px-4">
											<span
												className={`px-3 py-1 rounded-full text-xs font-semibold ${
													getPaymentStatus(order.id) === "completed"
														? darkMode
															? "bg-green-600 text-green-100"
															: "bg-green-100 text-green-800"
														: darkMode
														? "bg-yellow-600 text-yellow-100"
														: "bg-yellow-100 text-yellow-800"
												}`}
											>
												{getPaymentStatus(order.id)}
											</span>
										</td>
										<td className="py-4 px-4">
											<span className="text-sm">
												{order.created_at
													? formatDate(order.created_at)
													: "N/A"}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}

export default OrdersView;
