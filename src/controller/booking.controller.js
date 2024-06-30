const { StatusCodes } = require("http-status-codes");
const { BookingService } = require("../services");
const { asyncHandler, ApiResponse, ApiError, compareTime } = require("../utils");

const createBooking = asyncHandler(
    async (req, res) => {
        try{
            const { flightId, userId, noOfSeats } = req.body;
            const result = await BookingService.createBooking(
                {
                    flightId,
                    userId,
                    noOfSeats: parseInt(noOfSeats)
                }
            );
            return res
                    .status(StatusCodes.CREATED)
                    .json(
                        new ApiResponse(
                            StatusCodes.CREATED,
                            result,
                            "Created Booking Successfully"
                        )
                    );
        }catch(error){
            throw new ApiError(
                error.status_code || StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
)

module.exports = {
    createBooking
}
