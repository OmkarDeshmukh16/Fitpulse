const { ValidationError } = require('../utils/errors');

/**
 * Higher-order middleware for request payload/query/param validation.
 * @param {Object} schemas - { body, query, params }
 * @example
 * validate({
 *   body: (data) => {
 *     const errors = [];
 *     if (!data.email) errors.push({ field: 'email', message: 'Email is required' });
 *     return errors;
 *   }
 * })
 */
const validate = (schemas = {}) => {
  return (req, res, next) => {
    const errorDetails = [];

    ['body', 'query', 'params'].forEach((target) => {
      const validator = schemas[target];
      if (!validator) return;

      if (typeof validator === 'function') {
        const errors = validator(req[target]);
        if (Array.isArray(errors) && errors.length > 0) {
          errorDetails.push(...errors.map(err => typeof err === 'string' ? { target, message: err } : { target, ...err }));
        }
      } else if (validator && typeof validator.parse === 'function') {
        // Zod compatibility
        try {
          req[target] = validator.parse(req[target]);
        } catch (zodErr) {
          if (zodErr.errors) {
            errorDetails.push(...zodErr.errors.map(e => ({
              target,
              field: e.path.join('.'),
              message: e.message,
            })));
          } else {
            errorDetails.push({ target, message: zodErr.message });
          }
        }
      }
    });

    if (errorDetails.length > 0) {
      return next(new ValidationError('Request validation failed', errorDetails));
    }

    next();
  };
};

module.exports = validate;
