const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Driver = require("./driver");

const Batch = sequelize.define(
	"Batch",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		status: {
			type: DataTypes.STRING(20),
			defaultValue: "unassigned", // 'assigned', 'in_progress', 'completed'
		},
		driver_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: "drivers",
				key: "id",
			},
			onDelete: "SET NULL",
			onUpdate: "CASCADE",
		},
		created_at: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "batches",
		timestamps: false,
	}
);

Batch.belongsTo(Driver, { foreignKey: "driver_id" });

module.exports = Batch;
