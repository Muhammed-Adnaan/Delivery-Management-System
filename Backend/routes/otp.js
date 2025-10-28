const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const Payment = require("../models/payment");
const OtpLog = require("../models/otp_log");
const nodemailer = require("nodemailer");

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

// Record cash payment
router.post("/order/:orderId/cash-payment", async (req, res) => {
	const { orderId } = req.params;
	const { amount } = req.body;
	try {
		// Create or update payment record
		let payment = await Payment.findOne({ where: { order_id: orderId } });
		if (payment) {
			await payment.update({
				mode: "cod",
				amount: amount,
				status: "success",
				paid_at: new Date(),
			});
		} else {
			await Payment.create({
				order_id: orderId,
				mode: "cod",
				amount: amount,
				status: "success",
				paid_at: new Date(),
			});
		}
		// Update order payment status
		await Order.update({ payment_status: "cod" }, { where: { id: orderId } });
		res.json({ success: true, message: "Cash payment recorded." });
	} catch (err) {
		res.status(500).json({ error: "Failed to record cash payment." });
	}
});

// Record UPI payment
router.post("/order/:orderId/upi-payment", async (req, res) => {
	const { orderId } = req.params;
	const { amount } = req.body;
	try {
		// Create or update payment record
		let payment = await Payment.findOne({ where: { order_id: orderId } });
		if (payment) {
			await payment.update({
				mode: "upi",
				amount: amount,
				status: "success",
				paid_at: new Date(),
			});
		} else {
			await Payment.create({
				order_id: orderId,
				mode: "upi",
				amount: amount,
				status: "success",
				paid_at: new Date(),
			});
		}
		// Update order payment status
		await Order.update({ payment_status: "paid" }, { where: { id: orderId } });
		res.json({ success: true, message: "UPI payment recorded." });
	} catch (err) {
		res.status(500).json({ error: "Failed to record UPI payment." });
	}
});

module.exports = router;
