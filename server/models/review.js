'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Review.init({
    rating: DataTypes.INTEGER,
    short_review: DataTypes.STRING,
    description: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    orderId: DataTypes.INTEGER,
    flowerShopId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};