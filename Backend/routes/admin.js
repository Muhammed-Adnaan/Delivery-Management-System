const express = require("express");
const router = express.Router();
const Driver = require("../models/driver");
const Order = require("../models/order");
const Batch = require("../models/batch");
const Payment = require("../models/payment");
const nodemailer = require("nodemailer");
const OtpLog = require("../models/otp_log");

// Get all drivers
router.get("/drivers", async (req, res) => {
	try {
		const drivers = await Driver.findAll();
		res.json(drivers);
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch drivers." });
	}
});

// Get all orders
router.get("/orders", async (req, res) => {
	try {
		const orders = await Order.findAll();
		res.json(orders);
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch orders." });
	}
});

// Get all batches
router.get("/batches", async (req, res) => {
	try {
		const batches = await Batch.findAll();
		res.json(batches);
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch batches." });
	}
});

// Get all payments
router.get("/payments", async (req, res) => {
	try {
		const payments = await Payment.findAll();
		res.json(payments);
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch payments." });
	}
});

// Get all batches and their orders for a specific driver by name
router.get("/driver/:driverName/batches", async (req, res) => {
	const { driverName } = req.params;
	try {
		const driver = await Driver.findOne({ where: { name: driverName } });
		if (!driver) {
			return res.status(404).json({ error: "Driver not found." });
		}
		const batches = await Batch.findAll({ where: { driver_id: driver.id } });
		const batchIds = batches.map((b) => b.id);
		const orders = await Order.findAll({ where: { batch_id: batchIds } });

		const result = batches.map((batch) => ({
			...batch.toJSON(),
			orders: orders
				.filter((order) => order.batch_id === batch.id)
				.map((order) => ({
					...order.toJSON(),
					// amount and mode are now directly in the orders table
					amount: order.amount,
					mode: order.mode,
				})),
		}));
		// Log the batches and their orders with delivery_rank
		res.json(result);
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch driver batches." });
	}
});

// Send OTP to order email
router.post("/order/:orderId/send-otp", async (req, res) => {
	const { orderId } = req.params;
	try {
		// Looking up order ${orderId}
		const order = await Order.findByPk(orderId);
		if (!order || !order.email) {
			// Order not found or missing email for orderId=${orderId}
			return res.status(404).json({ error: "Order or email not found." });
		}
		// Generate OTP
		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		// Generated OTP ${otp} for orderId=${orderId}, email=${order.email}
		// Store OTP in DB
		await OtpLog.create({
			order_id: orderId,
			otp_code: otp,
			is_verified: false,
			sent_to_email: order.email,
			created_at: new Date(),
		});
		// OTP stored in DB for orderId=${orderId}
		// Send email
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		});
		const mailOptions = {
			from: process.env.SMTP_USER,
			to: order.email,
			subject: "Your Silo Fortune Delivery OTP",
			text: `Your OTP for order #${order.id} is: ${otp}`,
		};
		// Sending email to ${order.email}...
		await transporter.sendMail(mailOptions);
		// Email sent to ${order.email}
		res.json({ success: true });
	} catch (err) {
		// Error in send-otp
		res.status(500).json({ error: "Failed to send OTP." });
	}
});

// Verify OTP for order
router.post("/order/:orderId/verify-otp", async (req, res) => {
	const { orderId } = req.params;
	const { otp } = req.body;
	try {
		// Find the latest OTP log for this order
		const otpLog = await OtpLog.findOne({
			where: { order_id: orderId, is_verified: false },
			order: [["created_at", "DESC"]],
		});
		if (!otpLog) {
			return res
				.status(400)
				.json({ error: "OTP not found or already verified." });
		}
		if (otpLog.otp_code !== otp) {
			return res.status(400).json({ error: "Invalid OTP." });
		}
		// Mark OTP as verified
		await otpLog.update({ is_verified: true });
		// Mark order as delivered
		await Order.update(
			{ is_delivered: true, delivery_time: new Date() },
			{ where: { id: orderId } }
		);
		res.json({ success: true, message: "OTP verified and order delivered." });
	} catch (err) {
		res.status(500).json({ error: "Failed to verify OTP." });
	}
});

module.exports = router;
