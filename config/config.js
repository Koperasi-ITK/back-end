const Sequelize = require("sequelize");
const dotEnv = require("dotenv");
dotEnv.config();

const { DB_USERNAME = "", DB_PASSWORD = "", DB_NAME = "", DB_HOST = "" } = process.env;

const databaseValidation = async () => {
  try {
    await sequelize.authenticate();
    console.log("Success connect to database");
  } catch (err) {
    console.error(`Unable to connect to the database: ${err}`);
  }
};

const sequelize = new Sequelize(`${DB_NAME}_development`, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false,
  timezone: "+08:00",
  dialectOptions: {
    useUTC: false,
    dateStrings: true,
    typeCast: true,
  },
});

module.exports = {
  databaseValidation,
  development: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: `${DB_NAME}`,
    host: DB_HOST,
    dialect: "mysql",
    timezone: "+08:00",
    dialectOptions: {
      useUTC: false,
      dateStrings: true,
      typeCast: true,
    },
  },
  test: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: `${DB_NAME}_test`,
    host: DB_HOST,
    dialect: "mysql",
    timezone: "+08:00",
    dialectOptions: {
      useUTC: false,
      dateStrings: true,
      typeCast: true,
    },
  },
  production: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: `${DB_NAME}`,
    host: DB_HOST,
    dialect: "mysql",
    timezone: "+08:00",
    dialectOptions: {
      useUTC: false,
      dateStrings: true,
      typeCast: true,
    },
  },
};
