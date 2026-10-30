const Organization = require('../models/Organization.model');
const OrganizationMembership = require('../models/OrganizationMembership.model');
const { ForbiddenError, NotFoundError } = require('../utils/errors');

/**
 * Tenant resolution middleware.
 * Resolves tenant server-side from authenticated session/token and active memberships.
 * Never blindly trusts client-supplied tenant IDs.
 */
const resolveTenantContext = async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  // Super Admin handling
  if (req.user.role === 'superadmin') {
    const requestedGymId = req.headers['x-gym-context'] || req.headers['x-support-impersonate-gym'] || req.query.gymContext;
    if (requestedGymId) {
      const org = await Organization.findOne({ _id: requestedGymId, isDeleted: false });
      if (!org) {
        return next(new NotFoundError('Requested gym tenant was not found'));
      }
      req.tenant = {
        id: org._id,
        organization: org,
        role: 'superadmin',
        isImpersonating: true,
      };
      req.user.gymId = org._id;
    }
    return next();
  }

  // Standard staff or member: resolve active organization membership
  let targetGymId = req.headers['x-gym-context'] || req.user.gymId;

  let membership = null;
  if (targetGymId) {
    membership = await OrganizationMembership.findOne({
      userId: req.user._id,
      organizationId: targetGymId,
      status: 'active',
    }).populate('organizationId');
  }

  // Fallback to user's default active membership if not specified or not found
  if (!membership) {
    membership = await OrganizationMembership.findOne({
      userId: req.user._id,
      status: 'active',
    }).sort({ isDefault: -1, createdAt: 1 }).populate('organizationId');
  }

  let org = membership?.organizationId;

  // Fallback to direct Organization lookup by req.user.gymId if migration is in progress
  if (!org && req.user.gymId) {
    org = await Organization.findOne({ _id: req.user.gymId, isDeleted: false });
  }

  if (!org) {
    return next(new ForbiddenError('You are not associated with any active gym workspace'));
  }

  if (org.isDeleted || org.status === 'suspended') {
    return next(new ForbiddenError(`Gym workspace "${org.name}" is suspended. Please contact platform support.`));
  }

  // Check if workspace is past grace period (read-only mode)
  const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  if (org.status === 'past_due' && isWriteMethod) {
    const isBillingPath = req.path.includes('/payments') || req.path.includes('/subscriptions') || req.path.includes('/renew');
    if (!isBillingPath) {
      return next(new ForbiddenError('Subscription payment is past due. Workspace is in read-only mode until payment is resolved.'));
    }
  }

  // Bind tenant to request
  req.tenant = {
    id: org._id,
    organization: org,
    membership,
    role: membership?.role || req.user.role,
    isImpersonating: false,
  };

  // Maintain backward compatibility for controllers relying on req.user.gymId
  req.user.gymId = org._id;

  next();
};

module.exports = { resolveTenantContext };
