const { isArray, map } = require('lodash');
// consimport map from 'lodash/map';

const paranoidDeleteCascade = models => async (instance, options, next) => {
  // Only operate on paranoid models
  if (!instance.$modelOptions.paranoid) {
    return next();
  }

  const modelName = instance.$modelOptions.name.singular;

  await Promise.all(
    // Go over all associations of the instance model, and delete if needed
    map(models[modelName].associations, async association => {
      try {
        // Only delete if cascade is set up correctly
        if (association.options.onDelete !== 'CASCADE') {
          return true;
        }

        let relationModel = association.target;

        const getOptions = { transaction: options.transaction };

        // Handle "through" cases
        if (association.through) {
          relationModel = association.through.model;

          // Include the id of the through model instance
          getOptions.include = [
            {
              model: relationModel,
            },
          ];
        }

        // Load id(s) of association
        const instances = await instance[`get${association.as}`](getOptions);

        if (isArray(instances)) {
          // Association has no results so nothing to delete
          if (instances.length === 0) {
            return true;
          }

          // Delete all individually as bulk delete doesn't cascase in sequelize
          return await Promise.all(
            instances.map(i => i.destroy(Object.assign({}, options, { individualHooks: true })))
          );
        }

        // Association is not set, so nothing to delete
        if (!instances) {
          return true;
        }

        return await instances.destroy(options);
      } catch (error) {
        // If we had issues deleting, we have bigger problems
        Promise.resolve(true);
      }

      return true;
    })
  );

  return next();
};

module.exports = paranoidDeleteCascade;
