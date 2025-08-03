import { DataTypes } from "sequelize";
import sequelize from "../Config/database1.js";
import Produit from "./Produit.js";

const StockAlert = sequelize.define(
  "StockAlert",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: "produits",
        key: "produit_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    alert_type: {
      type: DataTypes.ENUM("low_stock", "out_of_stock"),
      allowNull: false,
    },
    threshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    notified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "stock_alerts",
    timestamps: false,
  }
);

export default StockAlert;
