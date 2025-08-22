import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
}

export interface IUserFull extends IUser {
  passwordHashed: string;
}

export interface CreateUserRequest extends IUser {
  password: string;
}

const userSchema = new Schema<IUserFull>({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  passwordHashed: { type: String, required: true },
});

// Ensure sensitive fields are excluded from API responses
userSchema.set("toJSON", {
  transform: (_doc, ret: Partial<IUserFull>) => {
    delete ret.passwordHashed;
    return ret;
  }
});

export const User = model<IUserFull>("User", userSchema);
