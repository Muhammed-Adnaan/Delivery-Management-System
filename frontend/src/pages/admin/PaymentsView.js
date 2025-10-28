import React, { useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";

function PaymentsView() {
	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const { darkMode } = useTheme();

	useEffect(() => {
		fetch("/admin/payments")
			.then((res) => res.json())
			.then(setPayments)
			.catch(() => setError("Failed to fetch payments."))
			.finally(() => setLoading(false));
	}, []);

	if (loading)
		return (
			<div
				className={`p-8 text-center ${
					darkMode ? "text-gray-100" : "text-gray-900"
				}`}
			>
				<div className="text-4xl mb-4">💰</div>
				<div className="text-xl font-bold mb-2">Loading payment records...</div>
				<div className="text-gray-500">
					Preparing the financial dashboard! 💳
				</div>
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
				<h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent mb-2">
					💰 Payment Records
				</h2>
				<p className="text-gray-500">Track all your financial transactions!</p>
			</div>

			<div
				className={`rounded-xl p-6 shadow-lg transition-colors duration-300 ${
					darkMode
						? "bg-gradient-to-br from-yellow-900 to-yellow-800"
						: "bg-gradient-to-br from-yellow-50 to-yellow-100"
				}`}
			>
				{payments.length === 0 ? (
					<div className="text-center py-8">
						<div className="text-6xl mb-4">💳</div>
						<div className="text-xl font-bold mb-2">
							No payments recorded yet!
						</div>
						<div className="text-gray-500">
							Your payment dashboard awaits... 🚀
						</div>
					</div>
				) : (
					<div className="overflow-x-auto scrollbar-yellow">
						<table className="w-full">
							<thead>
								<tr
									className={`border-b-2 ${
										darkMode ? "border-yellow-600" : "border-yellow-400"
									}`}
								>
									<th
										className={`py-4 px-4 text-left font-bold text-lg ${
											darkMode ? "text-yellow-300" : "text-yellow-700"
										}`}
									>
										💰 Payment ID
									</th>
									<th
										className={`py-4 px-4 text-left font-bold text-lg ${
											darkMode ? "text-yellow-300" : "text-yellow-700"
										}`}
									>
										📦 Order ID
									</th>
									<th
										className={`py-4 px-4 text-left font-bold text-lg ${
											darkMode ? "text-yellow-300" : "text-yellow-700"
										}`}
									>
										💳 Mode
									</th>
									<th
										className={`py-4 px-4 text-left font-bold text-lg ${
											darkMode ? "text-yellow-300" : "text-yellow-700"
										}`}
									>
										📊 Status
									</th>
									<th
										className={`py-4 px-4 text-left font-bold text-lg ${
											darkMode ? "text-yellow-300" : "text-yellow-700"
										}`}
									>
										🕒 Paid At
									</th>
								</tr>
							</thead>
							<tbody>
								{payments.map((payment, index) => (
									<tr
										key={payment.id}
										className={`border-b transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
											index % 2 === 0
												? darkMode
													? "bg-yellow-800/50"
													: "bg-yellow-100/50"
												: darkMode
												? "bg-yellow-800/30"
												: "bg-yellow-100/30"
										} ${darkMode ? "border-yellow-700" : "border-yellow-200"}`}
									>
										<td className="py-4 px-4 font-bold">
											<span className="text-lg">💰 #{payment.id}</span>
										</td>
										<td className="py-4 px-4">
											<span className="font-semibold">
												📦 #{payment.order_id}
											</span>
										</td>
										<td className="py-4 px-4">
											<span
												className={`px-3 py-1 rounded-full text-xs font-semibold ${
													payment.mode === "upi"
														? darkMode
															? "bg-blue-600 text-blue-100"
															: "bg-blue-100 text-blue-800"
														: darkMode
														? "bg-green-600 text-green-100"
														: "bg-green-100 text-green-800"
												}`}
											>
												{payment.mode === "upi" ? "💳 UPI" : "💵 Cash"}
											</span>
										</td>
										<td className="py-4 px-4">
											<span
												className={`px-3 py-1 rounded-full text-xs font-semibold ${
													payment.status === "completed"
														? darkMode
															? "bg-green-600 text-green-100"
															: "bg-green-100 text-green-800"
														: darkMode
														? "bg-yellow-600 text-yellow-100"
														: "bg-yellow-100 text-yellow-800"
												}`}
											>
												{payment.status === "completed"
													? "✅ Completed"
													: "⏳ Pending"}
											</span>
										</td>
										<td className="py-4 px-4">
											<span className="text-sm">
												{payment.paid_at || "N/A"}
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

export default PaymentsView;
