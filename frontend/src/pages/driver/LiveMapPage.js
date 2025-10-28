import React, { useEffect, useState } from "react";
import {
	GoogleMap,
	Marker,
	Polyline,
	useJsApiLoader,
} from "@react-google-maps/api";
import { useTheme } from "../../contexts/ThemeContext";

const containerStyle = {
	width: "100%",
	height: "400px",
};

const HASSAN_CENTER = { lat: 13.0072, lng: 76.0962 };

function LiveMapPage() {
	const [currentPosition, setCurrentPosition] = useState(HASSAN_CENTER);
	const [orders, setOrders] = useState([]);
	const [currentIdx, setCurrentIdx] = useState(0);
	const [loading, setLoading] = useState(true);
	const { darkMode } = useTheme();
	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
	});

	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setCurrentPosition({
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					});
				},
				(error) => {
					console.error("Error getting geolocation:", error);
					setCurrentPosition(HASSAN_CENTER);
				}
			);
		} else {
			setCurrentPosition(HASSAN_CENTER);
		}
	}, []);

	// Fetch the driver's batch orders and sort by delivery_rank
	useEffect(() => {
		const driverName = localStorage.getItem("username");
		if (!driverName) return;
		fetch(`/admin/driver/${driverName}/batches`)
			.then((res) => res.json())
			.then((batches) => {
				const batchOrders = batches[0]?.orders || [];
				const sorted = batchOrders
					.filter((o) => !o.is_delivered)
					.sort((a, b) => (a.delivery_rank || 0) - (b.delivery_rank || 0));
				setOrders(sorted);
				setLoading(false);
			})
			.catch(() => {
				setOrders([]);
				setLoading(false);
			});
	}, []);

	const currentOrder = orders[currentIdx] || null;
	const nextOrder = orders[currentIdx + 1] || null;

	// Route path from current order to remaining orders
	const routePath = currentOrder
		? [
				{ lat: currentOrder.latitude, lng: currentOrder.longitude }, // Current order
				...orders
					.slice(currentIdx + 1)
					.map((order) => ({ lat: order.latitude, lng: order.longitude })), // Remaining orders
		  ]
		: [];

	// Map center based on current order
	const mapCenter = currentOrder
		? { lat: currentOrder.latitude, lng: currentOrder.longitude }
		: HASSAN_CENTER;

	if (loading) {
		return (
			<div
				className={`flex flex-col h-full items-center justify-center transition-colors duration-300 ${
					darkMode ? "bg-gray-900 text-gray-100" : "bg-blue-50 text-gray-900"
				}`}
			>
				<div className="text-6xl mb-4">🗺️</div>
				<div className="text-xl font-bold mb-2">
					Loading your delivery map...
				</div>
				<div className="text-gray-500">
					Preparing your navigation adventure! 🚀
				</div>
			</div>
		);
	}

	return (
		<div
			className={`flex flex-col h-full transition-colors duration-300 ${
				darkMode ? "bg-gray-900" : "bg-blue-50"
			}`}
		>
			{/* Header */}
			<div className="text-center py-4">
				<h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
					🗺️ Live Delivery Map
				</h1>
				<p className="text-sm text-gray-500">
					Navigate your delivery route with style! 🚚
				</p>
			</div>

			{/* Order Status Bar */}
			<div
				className={`sticky top-0 p-4 text-center font-bold z-10 transition-colors duration-300 ${
					currentOrder
						? darkMode
							? "bg-gradient-to-r from-purple-700 to-purple-600"
							: "bg-gradient-to-r from-purple-400 to-purple-300"
						: darkMode
						? "bg-gradient-to-r from-gray-700 to-gray-600"
						: "bg-gradient-to-r from-gray-600 to-gray-500"
				} text-white shadow-lg`}
			>
				{currentOrder ? (
					<div className="flex items-center justify-center space-x-4">
						<div className="flex items-center">
							<span className="text-2xl mr-2">📦</span>
							<span>Current: #{currentOrder.id}</span>
						</div>
						<div className="flex items-center">
							<span className="text-2xl mr-2">🎯</span>
							<span>Next: {nextOrder ? `#${nextOrder.id}` : "None"}</span>
						</div>
						<div className="flex items-center">
							<span className="text-2xl mr-2">📊</span>
							<span>
								Progress: {currentIdx + 1}/{orders.length}
							</span>
						</div>
					</div>
				) : (
					<div className="flex items-center justify-center">
						<span className="text-2xl mr-2">🎉</span>
						<span>All orders delivered! Great job!</span>
					</div>
				)}
			</div>
			{/* Google Map */}
			<div
				className={`flex-1 flex items-center justify-center transition-colors duration-300 ${
					darkMode ? "bg-gray-800" : "bg-gray-100"
				}`}
			>
				{isLoaded && mapCenter ? (
					<GoogleMap
						mapContainerStyle={containerStyle}
						center={mapCenter}
						zoom={15}
					>
						{/* Driver's current position */}
						<Marker
							position={currentPosition}
							label="You"
							icon={{
								url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
								scaledSize: new window.google.maps.Size(30, 30),
							}}
						/>

						{/* Current order marker */}
						{currentOrder && (
							<Marker
								position={{
									lat: currentOrder.latitude,
									lng: currentOrder.longitude,
								}}
								label="Current"
								icon={{
									url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
									scaledSize: new window.google.maps.Size(30, 30),
								}}
							/>
						)}

						{/* Remaining orders */}
						{orders.slice(currentIdx + 1).map((order, idx) => (
							<Marker
								key={order.id}
								position={{ lat: order.latitude, lng: order.longitude }}
								label={(idx + 2).toString()}
								icon={{
									url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
									scaledSize: new window.google.maps.Size(25, 25),
								}}
							/>
						))}

						{/* Route line from current to remaining orders */}
						{routePath.length > 1 && (
							<Polyline
								path={routePath}
								options={{
									strokeColor: "#a855f7",
									strokeWeight: 4,
									strokeOpacity: 0.8,
								}}
							/>
						)}
					</GoogleMap>
				) : (
					<div
						className={`text-center ${
							darkMode ? "text-gray-400" : "text-gray-600"
						}`}
					>
						<div className="text-4xl mb-4">🌍</div>
						<div className="text-lg font-bold mb-2">Loading map...</div>
						<div className="text-sm">Getting your location ready! 📍</div>
					</div>
				)}
			</div>
			{/* Navigation Controls */}
			{currentOrder && (
				<div
					className={`p-4 transition-colors duration-300 ${
						darkMode ? "bg-gray-800" : "bg-white"
					}`}
				>
					<div className="flex justify-center gap-4">
						<button
							disabled={currentIdx === 0}
							onClick={() => setCurrentIdx((idx) => Math.max(0, idx - 1))}
							className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
								darkMode
									? "bg-gray-600 hover:bg-gray-500 text-gray-100"
									: "bg-gray-300 hover:bg-gray-400 text-gray-800"
							}`}
						>
							⬅️ Previous Order
						</button>
						<button
							disabled={currentIdx >= orders.length - 1}
							onClick={() =>
								setCurrentIdx((idx) => Math.min(orders.length - 1, idx + 1))
							}
							className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
								darkMode
									? "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400"
									: "bg-gradient-to-r from-purple-400 to-purple-300 hover:from-purple-300 hover:to-purple-200"
							} text-white shadow-lg`}
						>
							Next Order ➡️
						</button>
					</div>
					<div className="text-center mt-3">
						<div
							className={`text-sm ${
								darkMode ? "text-gray-400" : "text-gray-600"
							}`}
						>
							Use these buttons to navigate through your delivery route! 🚚
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default LiveMapPage;
