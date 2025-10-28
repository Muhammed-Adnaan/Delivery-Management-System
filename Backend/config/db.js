const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.MYSQL_URL, {
	dialect: "mysql",
	logging: false,
});
// sequelize.sync({ alter: true });

module.exports = sequelize;
