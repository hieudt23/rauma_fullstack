import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "BANNED";
  failedLoginAttempts: number;
  lockUntil: Date | null;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    status: { type: String, enum: ["ACTIVE", "BANNED"], default: "ACTIVE" },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

const UserModel: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ??
  mongoose.model<IUser>("User", UserSchema);

export default UserModel;
