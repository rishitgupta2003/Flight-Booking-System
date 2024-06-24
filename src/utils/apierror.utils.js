class ApiError extends Error{
    constructor(
        status_code,
        message = "Something Went Wrong",
        errors,
        stack
    ){
        super(message);
        this.status_code = status_code;
        this.data = null;
        this.errors = errors;
        this.success = false;
        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = {
    ApiError
}