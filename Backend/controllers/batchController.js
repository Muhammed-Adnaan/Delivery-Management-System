const Batch = require("../models/batch");
const Driver = require("../models/driver");

exports.assignBatchToDriver = async (req, res) => {
	const { batch_id, driver_id } = req.body;
	if (!batch_id || !driver_id) {
		return res
			.status(400)
			.json({ error: "batch_id and driver_id are required" });
	}
	try {
		const batch = await Batch.findByPk(batch_id);
		if (!batch) {
			return res.status(404).json({ error: "Batch not found" });
		}
		const driver = await Driver.findByPk(driver_id);
		if (!driver) {
			return res.status(404).json({ error: "Driver not found" });
		}
		batch.driver_id = driver_id;
		batch.status = "assigned";
		await batch.save();
		res.status(200).json({ message: "Batch assigned to driver", batch });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
