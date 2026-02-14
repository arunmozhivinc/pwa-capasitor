import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../sequelize";

export interface UserAttributes {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  googleId: string | null;
  facebookId: string | null;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "name" | "avatarUrl" | "googleId" | "facebookId" | "tokenVersion" | "createdAt" | "updatedAt"
>;

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public name!: string | null;
  public avatarUrl!: string | null;
  public googleId!: string | null;
  public facebookId!: string | null;
  public tokenVersion!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance method to increment token version (for logout everywhere)
  public async incrementTokenVersion(): Promise<void> {
    this.tokenVersion += 1;
    await this.save();
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    avatarUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    facebookId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    tokenVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    indexes: [
      { fields: ["email"], unique: true },
      { fields: ["googleId"], unique: true },
      { fields: ["facebookId"], unique: true },
    ],
  }
);

export default User;
