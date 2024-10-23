'use strict';
const { Model } = require('sequelize');

class SpotImage extends Model {
  static associate(models) {
    SpotImage.belongsTo(models.Spot, { foreignKey: 'spotId' });
  }
}

SpotImage.init({
  spotId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Spots',
      key: 'id'
    }
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  preview: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'SpotImage',
});

module.exports = SpotImage;

