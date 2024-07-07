const express = require("express");
const router = express.Router();
const { BookingController } = require("../../controller");
router.route("/").post(BookingController.createBooking);
router.route("/payments").post(BookingController.makePayment);

module.exports = router;