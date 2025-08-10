"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const errorMiddleware = (err, req, res, next) => {
    let { statusCode, message } = err;
    if (!statusCode)
        statusCode = 500;
    if (!message)
        message = "Internal Server Error";
    res.status(statusCode).json(Object.assign({ success: false, message }, (process.env.NODE_ENV === "development" && { stack: err.stack })));
};
exports.errorMiddleware = errorMiddleware;
