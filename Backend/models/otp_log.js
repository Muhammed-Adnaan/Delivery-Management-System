const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Order = require("./order");

const OtpLog = sequelize.define(
	"OtpLog",
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
		otp_code: {
			type: DataTypes.STRING(6),
			allowNull: true,
		},
		is_verified: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		sent_to_email: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		created_at: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "otp_logs",
		timestamps: false,
	}
);

OtpLog.belongsTo(Order, { foreignKey: "order_id" });

module.exports = OtpLog;
