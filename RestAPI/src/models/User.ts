import {
  Schema,
  model,
  Types,
  Document
} from "mongoose";

import type {
  DocumentBase
} from './Model';

import type {
  AuthorizedRequestBody
} from './Auth';

export type UserIdType = Types.ObjectId;

export interface IUserModel {
  username: string;
  email: string;
  profilePicture?: string;

  // -- sensitive fields: ensure they are omitted from public-facing views
  passwordHashed: string;
}

// -- define protected fields for later omission from public view
type UserProtectedFields =
  | "passwordHashed"
;

// === Data Transfer Objects ===================================================
//
// =============================================================================

// -- User with id and other basic document info
export type IUserDocument = IUserModel & DocumentBase;

// -- User, excluding sensitive fields
export type IUserPublicView = Omit<IUserDocument, UserProtectedFields>;

// -- Public view, excluding vector attributes
// -- In this case, there are no vector attributes
export type IUserAttribView = IUserPublicView;

// -- additional instance methods, to be defined in schema
interface IUserMethods {
  toPublicView: () => IUserPublicView;
  toAttribView: () => IUserAttribView;
}

// -- User as a Mongo document
export type IUser = IUserDocument & Document & IUserMethods;


// === REST Request Body Definitions ===========================================
//
// Definitions for REST API request bodies.
//
// =============================================================================

// -- for POST
export interface CreateUserRequest extends IUserModel {
  password: string;
}

// -- for PATCH
export type PatchUserData = Partial<CreateUserRequest>;

// -- (must be authorized)
export type PatchUserRequest = AuthorizedRequestBody & PatchUserData;

// -- for PUT
export type PutUserData = IUserDocument;

export type PutUserRequest = AuthorizedRequestBody & PutUserData;

// -- for DELETE
export interface DeleteUserData extends DocumentBase {
  // requires additional password confirmation
  password: string;
}

export type DeleteUserRequest = AuthorizedRequestBody & DeleteUserData;

// === Data Transfer Mappings ==================================================
//
// Maps a full User model into various views (i.e. public, attrib)
//
// =============================================================================

const toPublicView = (user: IUserDocument): IUserPublicView => {
  const {
    passwordHashed,
    ...out
  } = user;

  return out;
};// -- end toPublicView

// -- identical to toPublicView, in this case
const toAttribView = toPublicView;

// === userSchema ==============================================================
//
// Defines how user objects are stored/interacted with.
//
// =============================================================================
const userSchema = new Schema<IUser>(
  // -- fields
  {
    username: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    passwordHashed: { type: String, required: true },
    profilePicture: { type: String, required: false },
  },
  {
    // -- options
    // --- do not commit data not defined in schema
    strict: true,
    // --- do not omit empty fields
    minimize: false,

    // -- data transformation
    toObject: {
      getters: true,
      virtuals: true,
      transform: (_doc: IUser, ret: Partial<IUserDocument>): IUserPublicView => {
        delete ret.passwordHashed;

        return ret as IUserPublicView;
      }
    },
    toJSON: {
      getters: true,
      virtuals: true,
      transform: (_doc: IUser, ret: Partial<IUserDocument>): IUserPublicView => {
        delete ret.passwordHashed;

        return ret as IUserPublicView;
      }
    },

    // -- instance methods
    methods: {
      // -- Data transfer mappings
      toPublicView(): IUserPublicView {
        return toPublicView(this.toObject({ virtuals: true }));
      },// -- end toPublicView
      toAttribView(): IUserAttribView {
        return toAttribView(this.toObject({ virtuals: true }));
      }// -- end toAttribView
    }
  }
);// -- end userSchema

// -- virtual fields
userSchema.virtual('id').get(function() {
  return this._id;
});

// -- User Model
export const User = model<IUser>("User", userSchema, "users");
