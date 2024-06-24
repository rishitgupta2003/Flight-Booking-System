const asyncHandler = (requestHandler) => async (req, res, next) => {
    try{
        return await requestHandler(req, res, next);
    }catch(err){
        res.status(err.status_code).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
    asyncHandler
}