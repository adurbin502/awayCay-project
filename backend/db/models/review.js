'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Reviews extends Model {
    static associate(models) {
      Reviews.belongsTo(models.User, { foreignKey: 'userId' });
      Reviews.belongsTo(models.Spot, { foreignKey: 'spotId' });
    }
  }

  Reviews.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      spotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      review: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      stars: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      }
    },
    {
      sequelize,
      modelName: 'Reviews',
    }
  );
  return Reviews;
};
