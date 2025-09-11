import { Schema, Types, Document, model } from "mongoose";

import type {
  UserIdType
} from './User';

export type WhiteboardIdType = Types.ObjectId;

export interface ICanvas extends Document {
  width: number;
  height: number;
  time_created: Date;
  time_last_modified: Date;
  allowed_users: Types.ObjectId[];  // references to User
  shapes: Record<string, Record<string, any>>;
}

export const canvasSchema = new Schema<ICanvas>({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  time_created: { type: Date, default: Date.now },
  time_last_modified: { type: Date, default: Date.now },
  allowed_users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  shapes: {
    type: Schema.Types.Map,
    of: {
      type: Schema.Types.Map,
      of: Schema.Types.Mixed
    }
  }
});

export type WhiteboardPermissionEnum =
  | 'view'
  | 'edit'
  | 'own'
;

export interface IWhiteboardUserPermissionBase {
  permission: WhiteboardPermissionEnum;
}

export interface IWhiteboardUserPermissionById extends IWhiteboardUserPermissionBase {
  type: 'id';
  user_id: Types.ObjectId;
}

export interface IWhiteboardUserPermissionByEmail extends IWhiteboardUserPermissionBase {
  type: 'email';
  email: string;
}

export type IWhiteboardUserPermission = 
  | IWhiteboardUserPermissionById
  | IWhiteboardUserPermissionByEmail
;

const whiteboardUserPermissionSchema = new Schema<IWhiteboardUserPermissionBase>({
    permission: { type: String, enum: ['view', 'edit', 'own'], required: true }
  }, {
    discriminatorKey: 'type'
  }
);

export const WhiteboardUserPermission = model<IWhiteboardUserPermissionBase>('WhiteboardUserPermission', whiteboardUserPermissionSchema);

export const WhiteboardUserPermissionById = WhiteboardUserPermission.discriminator<IWhiteboardUserPermissionById>('id', new Schema({
  user_id: { type: Types.ObjectId, ref: "User", required: true }
}));

export const WhiteboardUserPermissionByEmail = WhiteboardUserPermission.discriminator<IWhiteboardUserPermissionByEmail>('email', new Schema({
  email: { type: String, required: true }
}));

export interface IWhiteboard extends Document {
  _id: WhiteboardIdType;
  name: string;
  time_created: Date;
  canvases: ICanvas[];
  owner: UserIdType;        // reference to User
  shared_users: IWhiteboardUserPermission[];
}

const whiteboardSchema = new Schema<IWhiteboard>({
  name: { type: String, required: true },
  time_created: { type: Date, default: Date.now },
  canvases: [canvasSchema],
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  shared_users: [WhiteboardUserPermission]
});

export const Canvas = model<ICanvas>("Canvas", canvasSchema);
export const Whiteboard = model<IWhiteboard>("Whiteboard", whiteboardSchema);
