import React, { useRef, useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

const navItems = [
	{ label: "🚚 Drivers", path: "/dashboard/admin/drivers", emoji: "🚚" },
	{ label: "📦 Orders", path: "/dashboard/admin/orders", emoji: "📦" },
	{ label: "🎯 Batches", path: "/dashboard/admin/batches", emoji: "🎯" },
	{ label: "💰 Payments", path: "/dashboard/admin/payments", emoji: "💰" },
];

function AdminLayout() {
	const location = useLocation();
	const fileInputRef = useRef();
	const [groupStatus, setGroupStatus] = useState("");
	const { darkMode } = useTheme();

	const handleUploadClick = () => {
		fileInputRef.current.click();
	};

	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (!file) return;
		const formData = new FormData();
		formData.append("file", file);
		try {
			const res = await fetch("/api/upload-csv", {
				method: "POST",
				body: formData,
			});
			if (res.ok) {
				alert("File uploaded successfully!");
			} else {
				alert("Upload failed.");
			}
		} catch (err) {
			alert("Upload error.");
		}
		e.target.value = null;
	};

	const handleGroupOrders = async () => {
		setGroupStatus("");
		try {
			const res = await fetch("/api/cluster-orders", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({}),
			});
			const data = await res.json();
			if (res.ok) {
				setGroupStatus(
					`Orders clustered and assigned to ${data.driversCount} drivers successfully.`
				);
			} else {
				setGroupStatus(data.error || "Failed to cluster orders.");
			}
		} catch {
			setGroupStatus("Failed to cluster orders.");
		}
	};

	return (
		<div
			className={`flex min-h-screen transition-colors duration-300 ${
				darkMode ? "bg-gray-900" : "bg-blue-50"
			}`}
		>
			<nav
				className={`w-64 flex flex-col py-8 px-6 space-y-4 transition-colors duration-300 ${
					darkMode
						? "bg-gradient-to-b from-gray-800 to-gray-900 text-gray-100"
						: "bg-gradient-to-b from-blue-900 to-blue-800 text-blue-100"
				}`}
			>
				<div className="text-center mb-6">
					<h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
						👑 Admin Panel
					</h1>
				</div>
				<button
					className={`mb-4 py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
						darkMode
							? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
							: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
					}`}
					onClick={handleUploadClick}
				>
					📁 Upload CSV
				</button>
				<button
					className={`mb-6 py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
						darkMode
							? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600"
							: "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600"
					}`}
					onClick={handleGroupOrders}
				>
					🎯 Group Orders
				</button>
				<input
					type="file"
					accept=".csv"
					ref={fileInputRef}
					style={{ display: "none" }}
					onChange={handleFileChange}
				/>
				{navItems.map((item) => (
					<Link
						key={item.path}
						to={item.path}
						className={`py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-semibold ${
							location.pathname === item.path
								? darkMode
									? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
									: "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
								: darkMode
								? "hover:bg-gradient-to-r hover:from-blue-700 hover:to-purple-700"
								: "hover:bg-gradient-to-r hover:from-blue-700 hover:to-purple-700"
						}`}
					>
						{item.label}
					</Link>
				))}
				{groupStatus && (
					<div
						className={`mt-6 p-3 rounded-lg text-center text-sm ${
							groupStatus.toLowerCase().includes("success")
								? darkMode
									? "bg-green-800 text-green-200 border border-green-600"
									: "bg-green-100 text-green-800 border border-green-300"
								: darkMode
								? "bg-red-800 text-red-200 border border-red-600"
								: "bg-red-100 text-red-800 border border-red-300"
						}`}
					>
						{groupStatus.toLowerCase().includes("success") ? "✅ " : "❌ "}
						{groupStatus}
					</div>
				)}
			</nav>
			<main
				className={`flex-1 p-8 transition-colors duration-300 ${
					darkMode ? "bg-gray-900" : "bg-blue-50"
				}`}
			>
				<Outlet />
			</main>
		</div>
	);
}

export default AdminLayout;
