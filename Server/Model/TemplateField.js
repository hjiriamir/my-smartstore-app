import { DataTypes } from "sequelize";
import sequelize from "../Config/database1.js";
import LabelTemplate from "./LabelTemplate.js";

const TemplateField = sequelize.define(
  "TemplateField",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    template_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "label_templates",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    field_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "template_fields",
    timestamps: false,
  }
);

export default TemplateField;
