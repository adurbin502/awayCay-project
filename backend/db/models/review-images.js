'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReviewImage extends Model {
    static associate(models) {
      // Define association here
      ReviewImage.belongsTo(models.Review, { foreignKey: 'reviewId' });
    }
  }

  ReviewImage.init({
    reviewId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Reviews',
        key: 'id'
      }
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ReviewImages',
  });

  return ReviewImage;
};
