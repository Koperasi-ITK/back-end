const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const utils = require("../utils/utils");
const errorHandler = require("./controller/errorConttroller");
const router = require("./routes");
const userRoutes = require("./routes/User")
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));
app.use("/api/v1", router);

app.get("/test-connection", (req, res) => {
  return res.status(200).send("ok");
});

app.all("*", (req, res, next) => {
  next(utils.apiError("Routes does not exist", 404));
});

app.use(errorHandler);

module.exports = app;
