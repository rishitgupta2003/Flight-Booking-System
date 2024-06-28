const axios = require("axios");
const { BookingRepository } = require("../repositories");
const db = require("../models");
const { Logger } = require("../config");
const { FLIGHT_SERVICE } = require("../config/server-config");
const { ApiError } = require("../utils");
const { StatusCodes } = require("http-status-codes");

async function createBooking(data){
    try{
        const result = db.sequelize.transaction(
            async function bookingImpl(t){
                const response = await axios.get(`${FLIGHT_SERVICE}/api/v1/flight/${data.flightId}`);
                const flight = response.data.data;
                if(data.noOfSeats > flight.totalSeats){
                    throw new ApiError(
                        StatusCodes.BAD_GATEWAY,
                        "No. of Seats Requested are not available"
                    );
                }
                console.log(flight);
            }
        );

        return result;
    }catch(error){
        Logger.error(error.message, {});
        throw new ApiError(
            error.status_code || StatusCodes.INTERNAL_SERVER_ERROR,
            error.message
        );
    }
}

module.exports =  {
    createBooking
}