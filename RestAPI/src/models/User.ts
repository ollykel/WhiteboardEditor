import { Schema, model, Document, Types } from "mongoose";

import type {
  AuthorizedRequestBody
} from './Auth';

export type UserIdType = Types.ObjectId;

// === IUser ===================================================================
//
// Non-confidential user data.
//
// =============================================================================
export interface IUser extends Document {
  _id: UserIdType;
  username: string;
  email: string;
}

// === IUserFull ===============================================================
//
// Full user data, including password hash.
//
// =============================================================================
export interface IUserFull extends IUser {
  passwordHashed: string;
}

export interface CreateUserRequest extends Omit<IUser, '_id'> {
  password: string;
}

export type PatchUserData = Partial<CreateUserRequest>;

export type PatchUserRequest = AuthorizedRequestBody & PatchUserData;

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
