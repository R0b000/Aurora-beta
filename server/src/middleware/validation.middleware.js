const authValidator = (rule) => {
    return async (req, res, next) => {
        try {
            await rule.validateAsync(req.body, { abortEarly: false });
            next();
        } catch (error) {
            let errBag = {};
            error.details.map(items => {
                errBag[items.path] = items.message
            })
            throw ({
                data: errBag,
                code: 404,
                status: 'Validation Error',
                message: "Error in Validation",
            })
        }
    }
}

module.exports = authValidator