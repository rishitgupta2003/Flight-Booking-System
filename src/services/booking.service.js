const axios = require("axios");
const { BookingRepository } = require("../repositories");
const db = require("../models");
const { Logger } = require("../config");
const { FLIGHT_SERVICE } = require("../config/server-config");
const { ApiError } = require("../utils");
const { StatusCodes } = require("http-status-codes");
const { BOOKING_STATUS } = require("../utils");
const { BOOKED, CANCELLED } = BOOKING_STATUS;


const bookingRepository = new BookingRepository();

async function createBooking(data){
    const transaction = await db.sequelize.transaction();
    try{
        const response = await axios.get(`${FLIGHT_SERVICE}/api/v1/flight/${data.flightId}`);
        const flightData = response.data.data;
        if(data.noOfSeats > flightData.totalSeats){
            throw new ApiError(StatusCodes.BAD_REQUEST, "Not Enough Seats Are Available");
        }
        const totalBillingAmount = data.noOfSeats * flightData.price;
        const bookingPayload = {...data, totalCost: totalBillingAmount};
        const booking = await bookingRepository.createBooking(bookingPayload, transaction);
        await axios.patch(`${FLIGHT_SERVICE}/api/v1/flight/${data.flightId}/seats`,
            {
                seats: data.noOfSeats
            }
        );
        await transaction.commit();
        console.log(booking);
        return booking;
    }catch(error){
        await transaction.rollback();
        throw new ApiError(
            error.status_code || StatusCodes.INTERNAL_SERVER_ERROR, error.message || "Something Went Wrong"
        );
    } 
}

async function makePayment(data){
    console.log("inside service");
    console.log(data);
    const transaction = await db.sequelize.transaction();
    try{
        const bookingDetails = await bookingRepository.get(data.bookingId, transaction);
        if(bookingDetails.status == CANCELLED){
            throw new ApiError(StatusCodes.BAD_REQUEST, "The Booking has Expired");
        }

        if(bookingDetails.status == BOOKED){
            throw new ApiError(StatusCodes.BAD_REQUEST, "Cannot Try Again on Booked Ticket");
        }

        const bookingTime = new Date(bookingDetails.createdAt);
        const currentTime = new Date();
        if(currentTime - bookingDetails > 300000){
            await cancelBooking(data.bookindId);
            throw new ApiError(StatusCodes.BAD_REQUEST, "Payment Time Expired");
        }

        if(bookingDetails.totalCost != data.totalCost){
            throw new ApiError(StatusCodes.BAD_REQUEST, "Amount Doesn't Match");
        }
        //assuming payment here is done
        const updateData = {
            id: data.bookingId,
            data: {
                status: BOOKED
            }

        }
        await bookingRepository.update(
            updateData, transaction
        );
        await transaction.commit();

    }catch(error){
        await transaction.rollback();
        throw new ApiError(
            error.status_code || StatusCodes.INTERNAL_SERVER_ERROR, error.message || "Something Went Wrong"
        );
    }
}

async function cancelBooking(bookingID){
    const transaction = await db.sequelize.transaction();
    try{
        const bookingDetails = await bookingRepository.get(bookingID, transaction);
        if(bookingDetails.status == CANCELLED){
            await transaction.commit();
            return true;
        }
        await axios.patch(`${FLIGHT_SERVICE}/api/v1/flight/${bookingDetails.flightId}/seats`, {
            seats: bookingDetails.noOfSeats,
            dec: 0
        });
        const updateData = {
            id: bookingID,
            data: {
                status: CANCELLED
            }
        }
        await bookingRepository.update(updateData, transaction);
        await transaction.commit();
    }catch(error){
        await transaction.rollback();
        throw new ApiError(
            error.status_code || StatusCodes.INTERNAL_SERVER_ERROR, error.message || "Something Went Wrong"
        );
    }
}

async function cancelOldBookings(){
    try{
        const time = new Date(Date.now() - 1000 * 300); //5 min
        const response = await bookingRepository.cancelOldBooking(time);
        return response;
    }catch(error){
        throw new ApiError(
            error.status_code || StatusCodes.INTERNAL_SERVER_ERROR, error.message || "Something Went Wrong"
        );
    }
}

module.exports =  {
    createBooking,
    makePayment,
    cancelOldBookings
}