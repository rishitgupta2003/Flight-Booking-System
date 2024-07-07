const { StatusCodes } = require("http-status-codes");
const { BookingService } = require("../services");
const { asyncHandler, ApiResponse, ApiError, compareTime } = require("../utils");
const inMemDb = {};

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

const makePayment = asyncHandler(
    async (req, res) => {
        try{
            console.log("inside Controller");
            const idempotencyKey = req.headers['x-idempotency-key'];
            const { totalCost, userId, bookingId } = req.body;
            if(!idempotencyKey) {
                throw new ApiError(
                    StatusCodes.BAD_REQUEST, "idempotency-key is missing"
                );
            }

            if(inMemDb[idempotencyKey]){
                throw new ApiError(
                    StatusCodes.BAD_REQUEST, "Cannot Try Again on Successful payment"
                );
            }

            const response = await BookingService.makePayment(
                {
                    totalCost,
                    userId,
                    bookingId
                }
            )

            inMemDb[idempotencyKey] = idempotencyKey;
            return res
                    .status(StatusCodes.OK)
                    .json(
                        new ApiResponse(
                            StatusCodes.OK,
                            response,
                            "Payment Successfull"
                        )
                    );
        }catch(error){
            throw new ApiError(
                error.status_code || StatusCodes.INTERNAL_SERVER_ERROR, error.message || "Something Went Wrong"
            );
        }
    }
);

module.exports = {
    createBooking,
    makePayment
}
