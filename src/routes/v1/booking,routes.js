const express = require("express");
const router = express.Router();
const { BookingController } = require("../../controller");
router.route("/").get(BookingController.createBooking);

module.exports = router;