/**
 * Joi request body validation middleware factory.
 * Usage: validate(joiSchema)
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join(', ');
    if (process.env.NODE_ENV === 'development') {
      console.error('[Validation Error]', message);
    }
    const err = new Error(message);
    err.statusCode = 422;
    return next(err);
  }
  next();
};

module.exports = validate;
