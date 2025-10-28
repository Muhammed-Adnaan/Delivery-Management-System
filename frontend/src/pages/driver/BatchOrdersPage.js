import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useTheme } from "../../contexts/ThemeContext";

function BatchOrdersPage() {
	const [batches, setBatches] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [filter, setFilter] = useState("all"); // all, delivered, undelivered
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [otpSent, setOtpSent] = useState(false);
	const [otp, setOtp] = useState("");
	const [otpStatus, setOtpStatus] = useState("");
	const [modalOpen, setModalOpen] = useState(false);
	const [showPayment, setShowPayment] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState("");
	const [cashConfirm, setCashConfirm] = useState(null);
	const [paymentStatus, setPaymentStatus] = useState("");
	const { darkMode } = useTheme();

	// Read UPI ID and Payee Name from environment variables
	const UPI_ID = process.env.REACT_APP_UPI_ID || "silofortune@icici";
	const PAYEE_NAME = process.env.REACT_APP_PAYEE_NAME || "SiloFortune";

	// Function to refresh batches data
	const refreshBatchesData = async () => {
		const driverName = localStorage.getItem("username");
		if (!driverName) return;

		try {
			const res = await fetch(`/admin/driver/${driverName}/batches`);
			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}
			const updatedBatches = await res.json();
			setBatches(updatedBatches);
		} catch (error) {
			console.error("Failed to refresh batches data:", error);
		}
	};

	useEffect(() => {
		const driverName = localStorage.getItem("username");
		if (!driverName) {
			setError("No driver ID found. Please log in as a driver.");
			setLoading(false);
			return;
		}
		fetch(`/admin/driver/${driverName}/batches`)
			.then((res) => {
				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`);
				}
				return res.json();
			})
			.then((batches) => {
				// Frontend batches logged
				setBatches(batches);
			})
			.catch(() => setError("Failed to fetch batches."))
			.finally(() => setLoading(false));
	}, []);

	const handleOrderClick = (order) => {
		setSelectedOrder(order);
		setOtp("");
		setOtpStatus("");
		setOtpSent(false);
		setModalOpen(true);
		setShowPayment(false);
		setPaymentMethod("");
		setCashConfirm(null);
		setPaymentStatus("");
	};

	const handleSendOtp = async () => {
		setOtpStatus("");
		try {
			const res = await fetch(`/api/order/${selectedOrder.id}/send-otp`, {
				method: "POST",
			});
			const response = await res.json();
			if (response.success) {
				setOtpSent(true);
				setOtpStatus("OTP sent to " + selectedOrder.email);
			} else {
				setOtpStatus("Failed to send OTP.");
			}
		} catch {
			setOtpStatus("Failed to send OTP.");
		}
	};

	const handleVerifyOtp = async () => {
		setOtpStatus("");
		try {
			const res = await fetch(`/api/order/${selectedOrder.id}/verify-otp`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ otp }),
			});
			const response = await res.json();
			if (response.success) {
				setOtpStatus("OTP verified! Order delivered.");
				setShowPayment(true);
			} else {
				setOtpStatus(response.error || "Invalid OTP.");
			}
		} catch {
			setOtpStatus("Failed to verify OTP.");
		}
	};

	// Payment logic
	const handleSelectPayment = (method) => {
		setPaymentMethod(method);
		setCashConfirm(null);
		setPaymentStatus("");
	};

	const handleCashConfirm = async (received) => {
		setCashConfirm(received);
		if (received) {
			try {
				const res = await fetch(`/api/order/${selectedOrder.id}/cash-payment`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ amount: selectedOrder.amount }),
				});
				const response = await res.json();
				if (response.success) {
					setPaymentStatus("Cash payment received and recorded.");
					// Refresh batches data to update UI
					refreshBatchesData();
				} else {
					setPaymentStatus("Failed to record cash payment.");
				}
			} catch {
				setPaymentStatus("Failed to record cash payment.");
			}
		} else {
			setPaymentStatus("Cash payment not received.");
		}
	};

	const handleUpiPayment = async (done) => {
		if (done) {
			try {
				const res = await fetch(`/api/order/${selectedOrder.id}/upi-payment`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ amount: selectedOrder.amount }),
				});
				const response = await res.json();
				if (response.success) {
					setPaymentStatus("UPI payment recorded.");
					// Refresh batches data to update UI
					refreshBatchesData();
				} else {
					setPaymentStatus("Failed to record UPI payment.");
				}
			} catch {
				setPaymentStatus("Failed to record UPI payment.");
			}
		} else {
			setPaymentStatus("UPI payment cancelled.");
		}
	};

	// UPI QR code string using env variables
	const upiString =
		selectedOrder && selectedOrder.amount
			? `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(
					PAYEE_NAME
			  )}&am=${selectedOrder.amount}&cu=INR&tn=Order%20${selectedOrder.id}`
			: "";

	const OrderCard = ({ order }) => (
		<div
			className={`border-2 rounded-xl p-4 shadow-lg flex flex-col cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
				order.is_delivered
					? darkMode
						? "bg-gradient-to-br from-green-800 to-green-700 border-green-500 text-green-100"
						: "bg-gradient-to-br from-green-100 to-green-200 border-green-400 text-green-800"
					: darkMode
					? "bg-gradient-to-br from-purple-800 to-purple-700 border-purple-500 text-purple-100"
					: "bg-gradient-to-br from-purple-100 to-purple-200 border-purple-400 text-purple-800"
			}`}
			onClick={() => handleOrderClick(order)}
		>
			<div className="flex items-center justify-between mb-2">
				<span className="text-lg font-bold">📦 Order #{order.id}</span>
				{order.is_delivered ? (
					<span className="text-2xl">✅</span>
				) : (
					<span className="text-2xl">🚚</span>
				)}
			</div>
			<div className="space-y-2 text-sm">
				<div className="flex items-center">
					<span className="mr-2">🏆</span>
					<b>Rank:</b> {order.delivery_rank ?? "N/A"}
				</div>
				<div className="flex items-center">
					<span className="mr-2">📧</span>
					<b>Email:</b> {order.email || "N/A"}
				</div>
				<div className="flex items-center">
					<span className="mr-2">📍</span>
					<b>Address:</b> {order.address}
				</div>
				<div className="flex items-center">
					<span className="mr-2">💰</span>
					<b>Amount:</b> ₹{order.amount || "N/A"}
				</div>
				<div className="flex items-center">
					<span className="mr-2">💳</span>
					<b>Mode:</b> {order.mode || "N/A"}
				</div>
				<div className="flex items-center">
					<span className="mr-2">💸</span>
					<b>Payment:</b> {order.payment_status || "Pending"}
				</div>
			</div>
			{!order.is_delivered && (
				<div className="mt-3 text-center">
					<span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full">
						Click to deliver! 🎯
					</span>
				</div>
			)}
		</div>
	);

	if (loading)
		return (
			<div
				className={`p-8 text-center ${
					darkMode ? "text-gray-100" : "text-gray-900"
				}`}
			>
				<div className="text-4xl mb-4">🚚</div>
				<div className="text-xl font-bold mb-2">
					Loading your delivery missions...
				</div>
				<div className="text-gray-500">Preparing your adventure! 🎯</div>
			</div>
		);
	if (error) return <div className="text-red-600 p-2">{error}</div>;

	return (
		<div
			className={`p-4 transition-colors duration-300 ${
				darkMode ? "text-gray-100" : "text-gray-900"
			}`}
		>
			<h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
				Your Delivery Adventures!
			</h2>
			<div className="flex gap-3 mb-6 justify-center">
				<button
					onClick={() => setFilter("all")}
					className={`px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
						filter === "all"
							? darkMode
								? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
								: "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
							: darkMode
							? "bg-gray-600 text-gray-100 hover:bg-gray-500"
							: "bg-gray-200 text-gray-700 hover:bg-gray-300"
					}`}
				>
					📦 All Orders
				</button>
				<button
					onClick={() => setFilter("delivered")}
					className={`px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
						filter === "delivered"
							? darkMode
								? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg"
								: "bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg"
							: darkMode
							? "bg-gray-600 text-gray-100 hover:bg-gray-500"
							: "bg-gray-200 text-gray-700 hover:bg-gray-300"
					}`}
				>
					✅ Delivered
				</button>
				<button
					onClick={() => setFilter("undelivered")}
					className={`px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
						filter === "undelivered"
							? darkMode
								? "bg-gradient-to-r from-orange-600 to-red-500 text-white shadow-lg"
								: "bg-gradient-to-r from-orange-500 to-red-400 text-white shadow-lg"
							: darkMode
							? "bg-gray-600 text-gray-100 hover:bg-gray-500"
							: "bg-gray-200 text-gray-700 hover:bg-gray-300"
					}`}
				>
					🚀 Pending
				</button>
			</div>
			{batches.length === 0 ? (
				<div className="text-center py-8">
					<div className="text-6xl mb-4">📦</div>
					<div className="text-xl font-bold mb-2">
						No delivery missions yet!
					</div>
					<div className="text-gray-500">Your adventure awaits... 🚀</div>
				</div>
			) : (
				batches.map((batch) => {
					let orders = batch.orders || [];
					if (filter === "delivered")
						orders = orders.filter((o) => o.is_delivered);
					if (filter === "undelivered")
						orders = orders.filter((o) => !o.is_delivered);

					// Sort orders by delivery_rank in ascending order
					const sortOrdersByRank = (orderList) => {
						return orderList.sort((a, b) => {
							const rankA = a.delivery_rank || 999; // Default to high number if no rank
							const rankB = b.delivery_rank || 999;
							return rankA - rankB; // Ascending order
						});
					};

					const deliveredOrders = sortOrdersByRank(
						batch.orders.filter((o) => o.is_delivered)
					);
					const undeliveredOrders = sortOrdersByRank(
						batch.orders.filter((o) => !o.is_delivered)
					);
					orders = sortOrdersByRank(orders);
					return (
						<div
							key={batch.id}
							className={`mb-6 border-2 rounded-xl p-4 shadow-lg transition-all duration-300 hover:shadow-xl ${
								darkMode
									? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-500"
									: "bg-gradient-to-br from-white to-gray-50 border-gray-300"
							}`}
						>
							<div className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
								🎯 Batch #{batch.id} - Delivery Mission! 🚀
							</div>
							{filter === "all" ? (
								<>
									<div
										className={`text-lg font-bold mb-3 text-center ${
											darkMode ? "text-green-400" : "text-green-700"
										}`}
									>
										🎉 Successfully Delivered! 🎉
									</div>
									{deliveredOrders.length === 0 ? (
										<div
											className={`mb-2 text-center py-4 ${
												darkMode ? "text-gray-400" : "text-gray-500"
											}`}
										>
											<div className="text-2xl mb-2">📭</div>
											No completed deliveries yet!
										</div>
									) : (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-2">
											{deliveredOrders.map((order) => (
												<OrderCard key={order.id} order={order} />
											))}
										</div>
									)}
									<div
										className={`text-lg font-bold mb-3 text-center ${
											darkMode ? "text-orange-400" : "text-orange-700"
										}`}
									>
										🚀 Ready for Delivery! 🎯
									</div>
									{undeliveredOrders.length === 0 ? (
										<div
											className={`text-center py-4 ${
												darkMode ? "text-gray-400" : "text-gray-500"
											}`}
										>
											<div className="text-2xl mb-2">🎉</div>
											All orders delivered! Great job!
										</div>
									) : (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
											{undeliveredOrders.map((order) => (
												<OrderCard key={order.id} order={order} />
											))}
										</div>
									)}
								</>
							) : orders.length === 0 ? (
								<div
									className={`text-center py-4 ${
										darkMode ? "text-gray-400" : "text-gray-500"
									}`}
								>
									<div className="text-2xl mb-2">🔍</div>
									No orders found for this filter!
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
									{orders.map((order) => (
										<OrderCard key={order.id} order={order} />
									))}
								</div>
							)}
						</div>
					);
				})
			)}
			{/* OTP Modal */}
			{modalOpen && selectedOrder && (
				<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
					<div
						className={`rounded-lg shadow-lg p-6 w-full max-w-xs relative transition-colors duration-300 ${
							darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
						}`}
					>
						<button
							className={`absolute top-2 right-2 ${
								darkMode ? "text-gray-400" : "text-gray-500"
							}`}
							onClick={() => setModalOpen(false)}
						>
							&times;
						</button>
						<h3 className="text-lg font-bold mb-2">
							Order #{selectedOrder.id}
						</h3>
						<div className="mb-2">
							Email: <b>{selectedOrder.email}</b>
						</div>
						{!showPayment ? (
							<>
								<button
									onClick={handleSendOtp}
									className={`mb-2 px-4 py-2 rounded w-full transition-colors duration-200 ${
										darkMode
											? "bg-blue-600 hover:bg-blue-700 text-gray-100"
											: "bg-blue-700 text-white"
									}`}
								>
									Send OTP
								</button>
								{otpSent && (
									<div className="mb-2">
										<input
											type="text"
											placeholder="Enter OTP"
											value={otp}
											onChange={(e) => setOtp(e.target.value)}
											className={`border p-2 rounded w-full mb-2 transition-colors duration-300 ${
												darkMode
													? "bg-gray-700 border-gray-600 text-gray-100"
													: "bg-white border-gray-300 text-gray-900"
											}`}
										/>
										<button
											onClick={handleVerifyOtp}
											className={`px-4 py-2 rounded w-full transition-colors duration-200 ${
												darkMode
													? "bg-purple-600 hover:bg-purple-700 text-gray-100"
													: "bg-purple-700 text-white"
											}`}
										>
											Verify OTP
										</button>
									</div>
								)}
								{otpStatus && (
									<div
										className={`mt-2 text-center text-sm ${
											otpStatus.toLowerCase().includes("fail") ||
											otpStatus.toLowerCase().includes("error") ||
											otpStatus.toLowerCase().includes("invalid")
												? "text-red-600"
												: "text-green-700"
										}`}
									>
										{otpStatus}
									</div>
								)}
							</>
						) : (
							<>
								<div className="mb-2 font-bold">Select Payment Method:</div>
								<div className="flex gap-2 mb-4">
									<button
										onClick={() => handleSelectPayment("upi")}
										className={`flex-1 py-2 rounded transition-colors duration-200 ${
											paymentMethod === "upi"
												? darkMode
													? "bg-blue-700 text-gray-100"
													: "bg-blue-700 text-white"
												: darkMode
												? "bg-gray-600 text-gray-100"
												: "bg-blue-100 text-blue-900"
										}`}
									>
										UPI
									</button>
									<button
										onClick={() => handleSelectPayment("cash")}
										className={`flex-1 py-2 rounded transition-colors duration-200 ${
											paymentMethod === "cash"
												? darkMode
													? "bg-purple-700 text-gray-100"
													: "bg-purple-700 text-white"
												: darkMode
												? "bg-gray-600 text-gray-100"
												: "bg-purple-100 text-purple-900"
										}`}
									>
										Cash
									</button>
								</div>
								{paymentMethod === "upi" && (
									<div className="flex flex-col items-center">
										<div className="mb-2">Scan to pay:</div>
										<QRCodeCanvas value={upiString} size={180} />
										<div
											className={`mt-2 text-xs break-all ${
												darkMode ? "text-gray-400" : "text-gray-500"
											}`}
										>
											{upiString}
										</div>
										<div className="flex gap-2 mt-4">
											<button
												onClick={() => handleUpiPayment(true)}
												className={`px-4 py-2 rounded transition-colors duration-200 ${
													darkMode
														? "bg-blue-600 hover:bg-blue-700 text-gray-100"
														: "bg-blue-700 text-white"
												}`}
											>
												Payment Done
											</button>
											<button
												onClick={() => handleUpiPayment(false)}
												className={`px-4 py-2 rounded transition-colors duration-200 ${
													darkMode
														? "bg-red-600 hover:bg-red-700 text-gray-100"
														: "bg-red-600 text-white"
												}`}
											>
												Cancel
											</button>
										</div>
										{paymentStatus && (
											<div
												className={`mt-2 text-center text-sm ${
													paymentStatus.toLowerCase().includes("fail") ||
													paymentStatus.toLowerCase().includes("cancel")
														? "text-red-600"
														: "text-green-700"
												}`}
											>
												{paymentStatus}
											</div>
										)}
									</div>
								)}
								{paymentMethod === "cash" && (
									<div className="flex flex-col items-center">
										<div className="mb-2">Received full amount?</div>
										<div className="flex gap-2">
											<button
												onClick={() => handleCashConfirm(true)}
												className={`px-4 py-2 rounded transition-colors duration-200 ${
													darkMode
														? "bg-purple-600 hover:bg-purple-700 text-gray-100"
														: "bg-purple-700 text-white"
												}`}
											>
												Yes
											</button>
											<button
												onClick={() => handleCashConfirm(false)}
												className={`px-4 py-2 rounded transition-colors duration-200 ${
													darkMode
														? "bg-red-600 hover:bg-red-700 text-gray-100"
														: "bg-red-600 text-white"
												}`}
											>
												No
											</button>
										</div>
										{cashConfirm !== null && (
											<div
												className={`mt-2 text-center text-sm ${
													cashConfirm ? "text-green-700" : "text-red-600"
												}`}
											>
												{paymentStatus}
											</div>
										)}
									</div>
								)}
							</>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export default BatchOrdersPage;
