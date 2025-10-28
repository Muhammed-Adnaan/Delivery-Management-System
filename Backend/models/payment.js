const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Order = require("./order");

const Payment = sequelize.define(
	"Payment",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		order_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "orders",
				key: "id",
			},
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		},
		mode: {
			type: DataTypes.ENUM("upi", "cod"),
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM("success", "failed"),
			defaultValue: "success",
		},
		amount: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 0,
		},
		paid_at: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "payments",
		timestamps: false,
	}
);

Payment.belongsTo(Order, { foreignKey: "order_id" });

module.exports = Payment;
