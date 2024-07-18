const express = require("express");

const { InfoController } = require("../../controller");
const bookingRoutes = require("./booking.routes");
const router = express.Router();

router.get("/info", InfoController.info);

router.use("/bookings", bookingRoutes);

module.exports = router;
