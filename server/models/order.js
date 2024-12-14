'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Order.init({
    delivery_address: DataTypes.STRING,
    total_cost: DataTypes.INTEGER,
    status: DataTypes.STRING,
    completion_time: DataTypes.STRING,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    date_of_ordering: DataTypes.DATE,
    userId: DataTypes.INTEGER,
    flowerShopId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};