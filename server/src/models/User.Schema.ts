import mongoose from "mongoose";
import { IUser } from "../interface/models";

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    full_name: {
      type: String,
    },
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      min: 6,
      required: true,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
    },
    birthDay: {
      type: String,
    },
    bio: {
      type: String,
    },
    is_admin: {
      type: Boolean,
      default: false,
    },
    blocked_at: {
      type: Boolean,
      default: false,
    },
    comment_blocked_at: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
