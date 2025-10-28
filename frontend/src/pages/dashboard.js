import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Nav from "../components/Nav";
import AdminLayout from "./admin/AdminLayout";
import DriversView from "./admin/DriversView";
import OrdersView from "./admin/OrdersView";
import BatchesView from "./admin/BatchesView";
import PaymentsView from "./admin/PaymentsView";
import Admin from "./admin";
import DriverDashboard from "./driver/DriverDashboard";

function Dashboard() {
	const [username, setUsername] = useState("");
	const [role, setRole] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		// Dashboard component loaded
		const u = localStorage.getItem("username") || "";
		const r = localStorage.getItem("role") || "";
		// Retrieved from localStorage

		setUsername(u);
		setRole(r);

		if (!u || !r) {
			// No user data found, redirecting to login
			navigate("/login");
		} else {
			// User authenticated
		}
	}, [navigate]);

	// If no user data, don't render anything
	if (!username || !role) {
		// Dashboard: No user data, not rendering
		return null;
	}

	// Dashboard rendering for user
	return (
		<>
			<Nav userName={username} role={role} />
			<Routes>
				{/* Redirect root dashboard to role-specific path */}
				<Route path="/" element={<Navigate to={role} replace />} />

				{role === "admin" && (
					<Route path="admin" element={<AdminLayout />}>
						<Route index element={<Admin />} />
						<Route path="drivers" element={<DriversView />} />
						<Route path="orders" element={<OrdersView />} />
						<Route path="batches" element={<BatchesView />} />
						<Route path="payments" element={<PaymentsView />} />
					</Route>
				)}
				{role === "driver" && (
					<Route path="driver/*" element={<DriverDashboard />} />
				)}
			</Routes>
		</>
	);
}

export default Dashboard;
