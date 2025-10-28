const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Batch = require("./batch");

const Order = sequelize.define(
	"Order",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		customer_name: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		address: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		city: {
			type: DataTypes.STRING(100),
			allowNull: true,
		},
		latitude: {
			type: DataTypes.FLOAT,
			allowNull: true,
		},
		longitude: {
			type: DataTypes.FLOAT,
			allowNull: true,
		},
		weight: {
			type: DataTypes.FLOAT,
			allowNull: true,
		},
		eta: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		batch_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: "batches",
				key: "id",
			},
			onDelete: "SET NULL",
			onUpdate: "CASCADE",
		},
		is_delivered: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		delivery_time: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		payment_status: {
			type: DataTypes.ENUM("pending", "paid", "cod"),
			defaultValue: "pending",
		},
		delivery_rank: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		amount: {
			type: DataTypes.FLOAT,
			allowNull: true,
		},
		mode: {
			type: DataTypes.ENUM("upi", "cod"),
			allowNull: true,
		},
		created_at: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "orders",
		timestamps: false,
	}
);

Order.belongsTo(Batch, { foreignKey: "batch_id" });

module.exports = Order;
