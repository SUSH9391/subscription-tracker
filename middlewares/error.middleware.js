
const errorMiddleware = (err, req, res, next) => {
    try {
        let error = { ...err };

        error.message = err.message;

        console.error(err);

        // Mongoose invalid ObjectId
        if (err.name === 'CastError') {
            error = new Error('Resource not found');
            error.statusCode = 404;
        }

        // Mongoose duplicate key
        if (err.code === 11000) {
            error = new Error('Duplicate field value entered');
            error.statusCode = 400;
        }

        // Mongoose validation errors
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors)
                .map(val => val.message);

            error = new Error(message.join(', '));
            error.statusCode = 400;
        }

        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || 'Server Error'
        });

    } catch (error) {
        next(error);
    }
};

export default errorMiddleware;
