const { ForbiddenError, UnauthorizedError } = require('../utils/errors');

/**
 * Deny-by-default role authorization middleware.
 * Checks caller role within the active tenant context (or global role for superadmin).
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // SuperAdmin always has platform-level access
    if (req.user.role === 'superadmin') {
      return next();
    }

    // Determine role in current tenant context
    const effectiveRole = req.tenant?.role || req.user.role;

    if (!allowedRoles.includes(effectiveRole)) {
      return next(
        new ForbiddenError(`Role '${effectiveRole}' is not authorized to perform this action`)
      );
    }

    next();
  };
};

/**
 * Enforces trainer isolation: Trainers can only query or mutate their assigned members.
 */
const enforceTrainerScope = (req, queryFilter = {}) => {
  const effectiveRole = req.tenant?.role || req.user?.role;
  if (effectiveRole === 'trainer') {
    return {
      ...queryFilter,
      trainerId: req.user._id,
    };
  }
  return queryFilter;
};

module.exports = {
  requireRole,
  enforceTrainerScope,
};
