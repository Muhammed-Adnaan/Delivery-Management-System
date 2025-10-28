const fs = require("fs");
const csv = require("csv-parser");
const Order = require("../models/order");
// const Payment = require("../models/payment");

exports.uploadCSV = async (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: "No file uploaded" });
	}

	// File uploaded: ${req.file.originalname}

	const results = [];
	fs.createReadStream(req.file.path)
		.pipe(csv())
		.on("data", (data) => results.push(data))
		.on("end", async () => {
			try {
				// CSV parsed, rows: ${results.length}
				// Sample row: ${results[0]}

				let createdOrders = 0;

				for (const row of results) {
					await Order.create({
						customer_name: row.customer_name,
						email: row.email || null,
						address: row.address,
						city: row.city || null,
						latitude: parseFloat(row.latitude) || null,
						longitude: parseFloat(row.longitude) || null,
						weight: parseFloat(row.weight) || null,
						eta: row.eta ? new Date(row.eta) : null,
						payment_status: row.payment_status || "pending",
						amount: row.amount ? parseFloat(row.amount) : null,
						mode: row.mode,
					});
					createdOrders++;
				}

				res.status(201).json({
					message: "Orders uploaded successfully",
					orders: createdOrders,
				});
			} catch (err) {
				// Upload error
				console.error("Upload error:", err);
				res.status(500).json({ error: err.message });
			} finally {
				// Clean up temp file
				try {
					fs.unlinkSync(req.file.path);
				} catch (cleanupErr) {
					// Failed to cleanup temp file
				}
			}
		})
		.on("error", (err) => {
			// CSV parsing error
			console.error("CSV parsing error:", err);
			res.status(500).json({ error: "Failed to parse CSV file" });
		});
};
