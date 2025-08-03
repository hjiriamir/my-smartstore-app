import { DataTypes } from "sequelize";
import sequelize from "../Config/database1.js";
import Produit from "./Produit.js";

const PriceHistory = sequelize.define(
  "PriceHistory",
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
    old_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    new_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    change_type: {
      type: DataTypes.ENUM(
        "percentage",
        "fixed",
        "new_price",
        "promotion"
      ),
      allowNull: false,
    },
    change_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    changed_by: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    changed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "price_history",
    timestamps: false,
  }
);

export default PriceHistory;
