const Order = require("../models/order");
const Batch = require("../models/batch");
const Driver = require("../models/driver");
const { clusterOrders } = require("../services/clusteringService");

exports.clusterAndBatchOrders = async (req, res) => {
	try {
		// Count existing drivers
		const drivers = await Driver.findAll({ where: { active: true } });
		const numDrivers = drivers.length;

		if (numDrivers === 0) {
			return res.status(400).json({
				error: "No active drivers found. Please register drivers first.",
			});
		}

		// Found ${numDrivers} active drivers for clustering

		// Fetch unbatched orders
		const orders = await Order.findAll({ where: { batch_id: null } });
		if (orders.length === 0) {
			return res.status(400).json({ error: "No unbatched orders found" });
		}

		// Found ${orders.length} unbatched orders for clustering

		// Cluster orders based on number of drivers
		const batches = clusterOrders(orders, numDrivers);

		// Create batches and assign to drivers
		const createdBatches = [];
		for (let i = 0; i < batches.length; i++) {
			const batchOrders = batches[i];
			if (batchOrders.length === 0) continue;

			// Assign batch to driver (round-robin assignment)
			const driver = drivers[i % drivers.length];

			const batch = await Batch.create({
				status: "assigned",
				driver_id: driver.id,
				created_at: new Date(),
			});

			// Update orders with batch_id and delivery_rank
			for (const order of batchOrders) {
				await Order.update(
					{
						batch_id: batch.id,
						delivery_rank: order.delivery_rank,
					},
					{ where: { id: order.id } }
				);
			}

			createdBatches.push({
				batch,
				driver: { id: driver.id, name: driver.name },
				orders: batchOrders.map((o) => o.id),
				orderCount: batchOrders.length,
			});
		}

		// Created ${createdBatches.length} batches and assigned to drivers

		res.status(201).json({
			message: `Orders clustered into ${createdBatches.length} batches and assigned to ${numDrivers} drivers`,
			driversCount: numDrivers,
			ordersCount: orders.length,
			batches: createdBatches,
		});
	} catch (err) {
		// Clustering error
		res.status(500).json({ error: err.message });
	}
};
