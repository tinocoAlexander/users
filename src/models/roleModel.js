// models/roleModel.js
import { DataTypes } from "sequelize";
import sequelize from "../config/bd.js";

const Role = sequelize.define("Role", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  roleName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  timestamps: false,
  tableName: "roles",
});

export default Role;
