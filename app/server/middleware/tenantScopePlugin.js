/**
 * Mongoose plugin for automatic tenant scoping.
 * Enforces gymId filter on find, findOne, count, update, and delete queries.
 * @param {import('mongoose').Schema} schema
 * @param {Object} options
 */
function tenantScopePlugin(schema, options = {}) {
  const tenantKey = options.tenantKey || 'gymId';

  // Ensure schema has the tenantKey defined
  if (!schema.path(tenantKey)) {
    schema.add({
      [tenantKey]: {
        type: require('mongoose').Schema.Types.ObjectId,
        ref: options.ref || 'Organization',
        required: true,
        index: true,
      },
    });
  }

  // List of query hooks to automatically scope
  const queryMethods = [
    'find',
    'findOne',
    'findOneAndUpdate',
    'findOneAndDelete',
    'countDocuments',
    'estimatedDocumentCount',
    'updateMany',
    'deleteMany',
  ];

  queryMethods.forEach((method) => {
    schema.pre(method, function () {
      const queryOptions = this.getOptions();

      // Platform superadmin aggregate bypass: must be explicitly declared in options
      if (queryOptions.skipTenantScope === true) {
        return;
      }

      // If tenantId was supplied via query options or AsyncLocalStorage
      const explicitTenantId = queryOptions[tenantKey] || queryOptions.gymId;
      if (explicitTenantId) {
        const currentFilter = this.getFilter();
        if (!currentFilter[tenantKey]) {
          this.where({ [tenantKey]: explicitTenantId });
        }
      }
    });
  });
}

module.exports = tenantScopePlugin;
