const CrudRepository = require("./crud.repository");
const { Booking } = require("../models");
const { Logger } = require("../config");
const { Op } = require("sequelize");
const { BOOKING_STATUS } = require('../utils');
const { default: axios } = require("axios");
const { FLIGHT_SERVICE } = require("../config/server-config");
const { BOOKED, CANCELLED } = BOOKING_STATUS;

class BookingRepository extends CrudRepository{
    constructor(){
        super(Booking);
    }

    async createBooking(data, transaction){
        try {
            const response = await this.model.create(data, {transaction: transaction});
            return response
        } catch (error) {
            Logger.error("Something Went Wrong" + error.message, {});
            throw error
        }
    }

    async get(data, transaction){
        try{
            const response = await this.model.findByPk(data, {transaction: transaction});
            return response;
        }catch(error){
            Logger.error("Something Went Wrong" + error.message);
            throw error
        }
    }

    async update(data, transaction){
        const response = await this.model.update(data.data,
            {
                where: {
                    id: data.id
                }
            },
            {
                transaction: transaction
            }
        );

        return response;
    }

    async cancelOldBooking(timestamp){
        const booking = await Booking.findAll(
            {
                where: {
                    [Op.and]: [
                        {
                            createdAt: {
                                [Op.lt] : timestamp
                            },
                            status: {
                                [Op.ne] : BOOKED
                            },
                            status: {
                                [Op.ne] : CANCELLED
                            }
                        }
                    ]
                }
            }
        );

        booking.forEach(async (Booking)=> {
            console.log(Booking.dataValues.flightId);
            await axios.patch(`${FLIGHT_SERVICE}/api/v1/flight/${Booking.dataValues.flightId}/seats`, 
                {
                    seats: Booking.dataValues.noOfSeats,
                    dec: 0
                }
            )
        });

        const response = await Booking.update(
            { status: CANCELLED},
            {
                where: {
                    [Op.and]: [
                        {
                            createdAt: {
                                [Op.lt] : timestamp
                            },
                            status: {
                                [Op.ne] : BOOKED
                            },
                            status: {
                                [Op.ne] : CANCELLED
                            }
                        }
                    ]
                }
            }
        );

        return response;
    }
}

module.exports = BookingRepository;