import React, { useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";

function DriversView() {
	const [drivers, setDrivers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const { darkMode } = useTheme();

	useEffect(() => {
		fetch("/admin/drivers")
			.then((res) => res.json())
			.then(setDrivers)
			.catch(() => setError("Failed to fetch drivers."))
			.finally(() => setLoading(false));
	}, []);

	if (loading)
		return (
			<div
				className={`p-8 text-center ${
					darkMode ? "text-gray-100" : "text-gray-900"
				}`}
			>
				<div className="text-4xl mb-4">🚚</div>
				<div className="text-xl font-bold mb-2">
					Loading your delivery heroes...
				</div>
				<div className="text-gray-500">Preparing the driver roster! 👨‍💼</div>
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
				<h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
					🚚 Your Delivery Heroes
				</h2>
				<p className="text-gray-500">
					Meet the team that makes deliveries happen!
				</p>
			</div>

			<div
				className={`rounded-xl p-6 shadow-lg transition-colors duration-300 ${
					darkMode
						? "bg-gradient-to-br from-blue-900 to-blue-800"
						: "bg-gradient-to-br from-blue-50 to-blue-100"
				}`}
			>
				{drivers.length === 0 ? (
					<div className="text-center py-8">
						<div className="text-6xl mb-4">👥</div>
						<div className="text-xl font-bold mb-2">
							No drivers registered yet!
						</div>
						<div className="text-gray-500">Your delivery team awaits... 🚀</div>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{drivers.map((driver) => (
							<div
								key={driver.id}
								className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
									darkMode
										? "bg-gray-800 border-gray-600"
										: "bg-white border-gray-200"
								}`}
							>
								<div className="flex items-center mb-4">
									<span className="text-3xl mr-3">👨‍💼</span>
									<div>
										<h3 className="text-lg font-bold">{driver.name}</h3>
										<p className="text-sm text-gray-500">Driver #{driver.id}</p>
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex items-center">
										<span className="mr-2">📧</span>
										<span className="text-sm">{driver.email}</span>
									</div>
									<div className="flex items-center">
										<span className="mr-2">🚚</span>
										<span className="text-sm">Ready for deliveries!</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default DriversView;
