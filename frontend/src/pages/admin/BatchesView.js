import React, { useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";

function BatchesView() {
	const [batches, setBatches] = useState([]);
	const [orders, setOrders] = useState([]);
	const [drivers, setDrivers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const { darkMode } = useTheme();

	useEffect(() => {
		Promise.all([
			fetch("/admin/batches").then((res) => res.json()),
			fetch("/admin/orders").then((res) => res.json()),
			fetch("/admin/drivers").then((res) => res.json()),
		])
			.then(([batches, orders, drivers]) => {
				setBatches(batches);
				setOrders(orders);
				setDrivers(drivers);
			})
			.catch(() => setError("Failed to fetch batches, orders, or drivers."))
			.finally(() => setLoading(false));
	}, []);

	if (loading)
		return (
			<div
				className={`p-8 text-center ${
					darkMode ? "text-gray-100" : "text-gray-900"
				}`}
			>
				<div className="text-4xl mb-4">🎯</div>
				<div className="text-xl font-bold mb-2">
					Loading delivery batches...
				</div>
				<div className="text-gray-500">Preparing the mission dashboard! 🚀</div>
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
				<h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent mb-2">
					🎯 Delivery Batches
				</h2>
				<p className="text-gray-500">
					Organize your delivery missions efficiently!
				</p>
			</div>

			{batches.length === 0 ? (
				<div
					className={`rounded-xl p-8 shadow-lg text-center transition-colors duration-300 ${
						darkMode
							? "bg-gradient-to-br from-green-900 to-green-800"
							: "bg-gradient-to-br from-green-50 to-green-100"
					}`}
				>
					<div className="text-6xl mb-4">📋</div>
					<div className="text-xl font-bold mb-2">No batches created yet!</div>
					<div className="text-gray-500">
						Your delivery missions await... 🚀
					</div>
				</div>
						) : (
				<div className="space-y-6">
					{batches.map((batch) => {
						const batchOrders = orders.filter(
							(order) => order.batch_id === batch.id
						);
						const driver = drivers.find((d) => d.id === batch.driver_id);
						const driverName = driver ? driver.name : "Unassigned";
						
						return (
							<div key={batch.id} className={`rounded-xl p-6 shadow-lg transition-colors duration-300 ${
								darkMode ? "bg-gradient-to-br from-green-900 to-green-800" : "bg-gradient-to-br from-green-50 to-green-100"
							}`}>
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
										🎯 Batch #{batch.id}
									</h3>
									<div className="flex items-center">
										<span className="mr-2">👨‍💼</span>
										<span className="font-semibold">{driverName}</span>
									</div>
								</div>
								
								{batchOrders.length === 0 ? (
									<div className="text-center py-4">
										<div className="text-2xl mb-2">📭</div>
										<p className="text-gray-500">No orders in this batch.</p>
									</div>
								) : (
									<div className="overflow-x-auto scrollbar-green">
										<table className="w-full">
											<thead>
												<tr className={`border-b-2 ${
													darkMode ? "border-green-600" : "border-green-400"
												}`}>
													<th className={`py-3 px-4 text-left font-bold ${
														darkMode ? "text-green-300" : "text-green-700"
													}`}>
														📦 Order ID
													</th>
													<th className={`py-3 px-4 text-left font-bold ${
														darkMode ? "text-green-300" : "text-green-700"
													}`}>
														👤 Customer
													</th>
													<th className={`py-3 px-4 text-left font-bold ${
														darkMode ? "text-green-300" : "text-green-700"
													}`}>
														📍 Address
													</th>
													<th className={`py-3 px-4 text-left font-bold ${
														darkMode ? "text-green-300" : "text-green-700"
													}`}>
														🚚 Status
													</th>
												</tr>
											</thead>
											<tbody>
												{batchOrders.map((order, index) => (
													<tr key={order.id} className={`border-b transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
														index % 2 === 0
															? darkMode ? "bg-green-800/50" : "bg-green-100/50"
															: darkMode ? "bg-green-800/30" : "bg-green-100/30"
													} ${darkMode ? "border-green-700" : "border-green-200"}`}>
														<td className="py-3 px-4 font-bold">
															<span className="text-lg">📦 #{order.id}</span>
														</td>
														<td className="py-3 px-4">
															<span className="font-semibold">{order.customer_name}</span>
														</td>
														<td className="py-3 px-4">
															<span className="text-sm">{order.address}</span>
														</td>
														<td className="py-3 px-4">
															<span className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
																order.is_delivered
																	? darkMode ? "bg-green-600 text-green-100" : "bg-green-100 text-green-800"
																	: darkMode ? "bg-orange-600 text-orange-100" : "bg-orange-100 text-orange-800"
															}`}>
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
						);
					})}
				</div>
			)}
		</div>
	);
}

export default BatchesView;
