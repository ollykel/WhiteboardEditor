import {
  Schema,
  Types,
  Document,
  model
} from "mongoose";

import type {
  DocumentBase
} from './Model';

import type {
  UserIdType
} from './User';

export type WhiteboardIdType = Types.ObjectId;

export interface ICanvasModel {
  width: number;
  height: number;
  name: string;
  time_created: Date;
  time_last_modified: Date;

  // -- vector fields: exclude from attribute view
  allowed_users: Types.ObjectId[];  // references to User
  shapes: Record<string, Record<string, any>>;
}

type CanvasVectorFields = 
  | "allowed_users"
  | "shapes"
;

const CANVAS_VECTOR_FIELDS = [
  "allowed_users",
  "shapes"
];

// === Data Transfer Objects ===================================================
//
// =============================================================================

// -- Canvas with id and other basic document info
export type ICanvasDocument = ICanvasModel & DocumentBase;

export type ICanvasPublicView = ICanvasDocument;

export type ICanvasAttribView = Omit<ICanvasPublicView, CanvasVectorFields>;

// -- additional instance methods, to be defined in schema
interface ICanvasMethods {
  toPublicView: () => ICanvasPublicView;
  toAttribView: () => ICanvasAttribView;
}

// -- Canvas as Mongo document
export type ICanvas = ICanvasDocument & Document & ICanvasMethods;

const canvasToAttribView = (canvas: ICanvasDocument): ICanvasAttribView => {
  const {
    allowed_users: _allowed_users,
    shapes: _shapes,
    ...out
  } = canvas;

  return out;
};

export const canvasSchema = new Schema<ICanvas>(
  // -- fields
  {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    name: { type: String, required: true },
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
  },
  {
    // -- instance methods
    methods: {
      toPublicView(): ICanvasPublicView {
        return this.toObject({ virtuals: true });
      },
      toAttribView(): ICanvasAttribView {
        return canvasToAttribView(this.toObject({ virtuals: true }));
      }
    },
    // -- static methods
    statics: {
      findAttribViews(options: Record<string, any>) {
        return this.find(options)
          .select(CANVAS_VECTOR_FIELDS
            .map(field => `-${field}`)
            .join(' ')
          );
      }
    }
  }
);

export type IWhiteboardPermissionEnum =
  | 'view'
  | 'edit'
  | 'own'
;

export interface IWhiteboardUserPermissionBase {
  permission: IWhiteboardPermissionEnum;
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

export interface IWhiteboardModel {
  name: string;
  time_created: Date;
  owner: UserIdType;        // reference to User

  // -- vector fields: exclude from attribute view
  canvases: ICanvas[];
  shared_users: IWhiteboardUserPermission[];
}

type WhiteboardVectorFields = 
  | "canvases"
  | "shared_users"
;

const WHITEBOARD_VECTOR_FIELDS = [
  "canvases",
  "shared_users"
];

// === Data Transfer Objects ===================================================
//
// =============================================================================

export type IWhiteboardDocument = IWhiteboardModel & DocumentBase;

export type IWhiteboardPublicView = IWhiteboardDocument;

export type IWhiteboardAttribView = Omit<IWhiteboardPublicView, WhiteboardVectorFields>;

// -- additional instance methods, to be defined in schema
interface IWhiteboardMethods {
  toPublicView: () => IWhiteboardPublicView;
  toAttribView: () => IWhiteboardAttribView;
}


export type IWhiteboard = IWhiteboardDocument & Document & IWhiteboardMethods;

const whiteboardToAttribView = (wb: IWhiteboardDocument): IWhiteboardAttribView => {
  const {
    canvases,
    shared_users,
    ...out
  } = wb;

  return out;
};

const whiteboardSchema = new Schema<IWhiteboard>(
  {
    name: { type: String, required: true },
    time_created: { type: Date, default: Date.now },
    canvases: [canvasSchema],
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    shared_users: [whiteboardUserPermissionSchema]
  },
  {
    // -- instance methods
    methods: {
      toPublicView() {
        return this.toObject({ virtuals: true });
      },
      toAttribView() {
        return whiteboardToAttribView(this.toObject({ virtuals: true }));
      }
    },
    // -- static methods
    statics: {
      findAttribViews(options: Record<string, any>) {
        return this.find(options)
          .select(WHITEBOARD_VECTOR_FIELDS
            .map(field => `-${field}`)
            .join(' ')
          );
      },
      findCanvases(options: Record<string, any>) {
        return this.find(options)
          .select("canvases");
      },
      findSharedUsers(options: Record<string, any>) {
        return this.find(options)
          .select("shared_users");
      }
    }
  }
);

export const Canvas = model<ICanvas>("Canvas", canvasSchema);
export const Whiteboard = model<IWhiteboard>("Whiteboard", whiteboardSchema);
