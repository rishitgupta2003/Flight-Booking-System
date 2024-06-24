class ApiResponse {
    constructor(
        status_code,
        data,
        message = "success"
    ){
        this.status_code = status_code;
        this.data = data;
        this.message = message
    }
}

module.exports = {
    ApiResponse
}