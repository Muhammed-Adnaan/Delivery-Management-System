import React, { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

function Admin() {
	const [drivers, setDrivers] = useState([]);
	const [orders, setOrders] = useState([]);
	const [batches, setBatches] = useState([]);
	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const { darkMode } = useTheme();

	useEffect(() => {
		async function fetchData() {
			try {
				const [driversRes, ordersRes, batchesRes, paymentsRes] =
					await Promise.all([
						fetch("http://localhost:3001/admin/drivers"),
						fetch("http://localhost:3001/admin/orders"),
						fetch("http://localhost:3001/admin/batches"),
						fetch("http://localhost:3001/admin/payments"),
					]);
				const [drivers, orders, batches, payments] = await Promise.all([
					driversRes.json(),
					ordersRes.json(),
					batchesRes.json(),
					paymentsRes.json(),
				]);
				setDrivers(drivers);
				setOrders(orders);
				setBatches(batches);
				setPayments(payments);
				setLoading(false);
			} catch (err) {
				setError("Failed to fetch admin data.");
				setLoading(false);
			}
		}
		fetchData();
	}, []);

	function getPaymentStatus(orderId) {
		const payment = payments.find((p) => p.order_id === orderId);
		return payment ? payment.status : "pending";
	}

	if (loading)
		return (
			<div
				className={`p-8 text-center ${
					darkMode ? "text-gray-100" : "text-gray-900"
				}`}
			>
				<div className="text-4xl mb-4">👨‍💼</div>
				<div className="text-xl font-bold mb-2">
					Loading your admin dashboard...
				</div>
				<div className="text-gray-500">Preparing your command center! 🎯</div>
			</div>
		);
	if (error) return <div className="text-red-600 p-4">{error}</div>;

	return (
		<div
			className={`p-6 space-y-8 transition-colors duration-300 ${
				darkMode ? "text-gray-100" : "text-gray-900"
			}`}
		>
			<div className="text-center mb-8">
				<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
					👑 Admin Command Center 🎯
				</h1>
				<p className="text-gray-500">Manage your delivery empire from here!</p>
			</div>
			<section>
				<div className={`rounded-xl p-6 shadow-lg transition-colors duration-300 ${
					darkMode ? "bg-gradient-to-br from-blue-900 to-blue-800" : "bg-gradient-to-br from-blue-50 to-blue-100"
				}`}>
					<h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
						🚚 Your Delivery Heroes
					</h2>
					{drivers.length === 0 ? (
						<div className="text-center py-4">
							<div className="text-2xl mb-2">👥</div>
							<p className="text-gray-500">No drivers registered yet!</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{drivers.map((driver) => (
								<div key={driver.id} className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
									darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"
								}`}>
									<div className="flex items-center mb-2">
										<span className="text-2xl mr-2">👨‍💼</span>
										<span className="font-bold">{driver.name}</span>
									</div>
									<div className="flex items-center text-sm">
										<span className="mr-2">📧</span>
										<span className="text-gray-500">{driver.email}</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</section>
			<section>
				<div className={`rounded-xl p-6 shadow-lg transition-colors duration-300 ${
					darkMode ? "bg-gradient-to-br from-purple-900 to-purple-800" : "bg-gradient-to-br from-purple-50 to-purple-100"
				}`}>
					<h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
						📦 Customer Orders
					</h2>
					{orders.length === 0 ? (
						<div className="text-center py-4">
							<div className="text-2xl mb-2">📭</div>
							<p className="text-gray-500">No orders placed yet!</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{orders.map((order) => (
								<div key={order.id} className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
									order.is_delivered
										? darkMode ? "bg-green-800 border-green-600" : "bg-green-100 border-green-400"
										: darkMode ? "bg-orange-800 border-orange-600" : "bg-orange-100 border-orange-400"
								}`}>
									<div className="flex items-center justify-between mb-2">
										<span className="font-bold">📦 Order #{order.id}</span>
										{order.is_delivered ? (
											<span className="text-2xl">✅</span>
										) : (
											<span className="text-2xl">🚚</span>
										)}
									</div>
									<div className="space-y-1 text-sm">
										<div className="flex items-center">
											<span className="mr-2">👤</span>
											<span><b>Customer:</b> {order.customer_name}</span>
										</div>
										<div className="flex items-center">
											<span className="mr-2">📍</span>
											<span><b>Address:</b> {order.address}</span>
										</div>
										<div className="flex items-center">
											<span className="mr-2">📋</span>
											<span><b>Batch:</b> {order.batch_id || "Unassigned"}</span>
										</div>
										<div className="flex items-center">
											<span className="mr-2">💸</span>
											<span><b>Payment:</b> {getPaymentStatus(order.id)}</span>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</section>
			<section>
				<div className={`rounded-xl p-6 shadow-lg transition-colors duration-300 ${
					darkMode ? "bg-gradient-to-br from-green-900 to-green-800" : "bg-gradient-to-br from-green-50 to-green-100"
				}`}>
					<h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
						🎯 Delivery Batches
					</h2>
					{batches.length === 0 ? (
						<div className="text-center py-4">
							<div className="text-2xl mb-2">📋</div>
							<p className="text-gray-500">No batches created yet!</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{batches.map((batch) => (
								<div key={batch.id} className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
									darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"
								}`}>
									<div className="flex items-center justify-center">
										<span className="text-2xl mr-2">🎯</span>
										<span className="font-bold text-lg">Batch #{batch.id}</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</section>
			<section>
				<div className={`rounded-xl p-6 shadow-lg transition-colors duration-300 ${
					darkMode ? "bg-gradient-to-br from-yellow-900 to-yellow-800" : "bg-gradient-to-br from-yellow-50 to-yellow-100"
				}`}>
					<h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">
						💰 Payment Records
					</h2>
					{payments.length === 0 ? (
						<div className="text-center py-4">
							<div className="text-2xl mb-2">💳</div>
							<p className="text-gray-500">No payments recorded yet!</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{payments.map((payment) => (
								<div key={payment.id} className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
									payment.status === "completed"
										? darkMode ? "bg-green-800 border-green-600" : "bg-green-100 border-green-400"
										: darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"
								}`}>
									<div className="flex items-center justify-between mb-2">
										<span className="font-bold">💰 Payment #{payment.id}</span>
										{payment.status === "completed" ? (
											<span className="text-2xl">✅</span>
										) : (
											<span className="text-2xl">⏳</span>
										)}
									</div>
									<div className="space-y-1 text-sm">
										<div className="flex items-center">
											<span className="mr-2">📦</span>
											<span><b>Order:</b> #{payment.order_id}</span>
										</div>
										<div className="flex items-center">
											<span className="mr-2">💳</span>
											<span><b>Mode:</b> {payment.mode}</span>
										</div>
										<div className="flex items-center">
											<span className="mr-2">📊</span>
											<span><b>Status:</b> {payment.status}</span>
										</div>
										<div className="flex items-center">
											<span className="mr-2">🕒</span>
											<span><b>Paid:</b> {payment.paid_at}</span>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</section>
		</div>
	);
}

export default Admin;
