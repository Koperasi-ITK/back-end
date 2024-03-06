const express = require("express");
const morgan = require("morgan");

const ApiError = require("../utils/apiError");
const errorHandler = require("./controller/errorConttroller");
const router = require("./routes");
const userRoutes = require("./routes/User")
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));
app.use('/api/users', userRoutes);

app.all("*", (req, res, next) => {
  next(new ApiError("Routes does not exist", 404));
});

app.use(errorHandler);

module.exports = app;
