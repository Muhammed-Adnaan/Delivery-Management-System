import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Hero from "./pages/hero";
import Admin from "./pages/admin";
import Driver from "./pages/driver";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";

function App() {
	return (
		<ThemeProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Hero />} />
					<Route path="/admin" element={<Admin />} />
					<Route path="/driver" element={<Driver />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/dashboard/*" element={<Dashboard />} />
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;
