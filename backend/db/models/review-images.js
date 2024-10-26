'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReviewImages extends Model {
    static associate(models) {
      // Define association with onDelete CASCADE
      ReviewImages.belongsTo(models.Reviews, {
        foreignKey: 'reviewId',
        onDelete: 'CASCADE'
      });
    }
  }

  ReviewImages.init({
    reviewId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Reviews',
        key: 'id'
      },
      onDelete: 'CASCADE'  // Add onDelete here
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ReviewImages',
  });

  return ReviewImages;
};

