import {
  Schema,
  Types,
  Document,
  Model,
  model
} from "mongoose";

import type {
  DocumentBase,
  DocumentViewMethods
} from './Model';

import {
  type IUser,
} from './User';

export type WhiteboardIdType = Types.ObjectId;

export type ShapeTypeEnum = 
  | 'rect'
  | 'ellipse'
  | 'vector'
;

const SHAPE_TYPE_ENUM = [
  'rect',
  'ellipse',
  'vector',
];

export interface IShapeModel {
  type: ShapeTypeEnum;
  // other shape fields vary by shape
  // no need to specify them here
}

export interface IShapeDocument extends IShapeModel {
  // reference to the parent canvas
  canvas_id: Types.ObjectId;
}

// -- no protected fields
export type IShapePublicView = IShapeDocument;

// -- no vector fields
export type IShapeAttribView = IShapeDocument;

export type IShape =
  & IShapeDocument
  & DocumentViewMethods<IShapePublicView, IShapeAttribView>
  & Document
;

export const shapeSchema = new Schema<IShape>(
  // -- fields
  {
    canvas_id: { type: Schema.Types.ObjectId, ref: 'Canvas', required: true },
    type: { type: String, enum: SHAPE_TYPE_ENUM, required: true },
  },
  {
    // -- misc. options
    strict: false,
    // -- instance methods
    methods: {
      toPublicView() {
        // -- no fields to hide
        return this;
      },
      toAttribView() {
        // -- no vector fields
        return this;
      }
    },
    // -- static methods
    statics: {
      findByWhiteboard(whiteboard_id: Types.ObjectId) {
        return this.find({ whiteboard_id });
      }
    }
  }
);

export const Shape = model<IShape>("Shape", shapeSchema, "shapes");

export interface ICanvasModel {
  name: string;
  width: number;
  height: number;
  time_created: Date;
  time_last_modified: Date;

  // -- vector fields: exclude from attribute view
  allowed_users: IUser[];  // references to User
  shapes: IShape[];
}

export interface ICanvasDocument extends ICanvasModel {
  // reference to parent whiteboard
  whiteboard_id: Types.ObjectId;
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

export type ICanvasPublicView = ICanvasDocument;

export type ICanvasAttribView = Omit<ICanvasPublicView, CanvasVectorFields>;

// -- Canvas as Mongo document
export type ICanvas =
  & ICanvasDocument
  & DocumentViewMethods<ICanvasPublicView, ICanvasAttribView>
  & Document
;

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
    whiteboard_id: { type: Schema.Types.ObjectId, ref: 'Whiteboard', required: true },
    name: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    time_created: { type: Date, default: Date.now },
    time_last_modified: { type: Date, default: Date.now },

    // -- embedded vector fields
    allowed_users: [{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  {
    toObject: {
      virtuals: true
    },
    toJSON: {
      virtuals: false
    },
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
      // retrieve documents with all virtuals populated
      findFull(options: Record<string, any>) {
        return this.find(options)
          .populate({
            path: 'allowed_users',
          })
          .populate({
            path: 'shapes',
          });
      },
      // retrieve documents excluding vector fields
      findAttribViews(options: Record<string, any>) {
        return this.find(options)
          .select(CANVAS_VECTOR_FIELDS
            .map(field => `-${field}`)
            .join(' ')
          );
      }
    },
  }
);

canvasSchema.virtual('shapes', {
  ref: 'Shape',
  localField: '_id',
  foreignField: 'canvas_id',
  justOne: false,
});

// ALWAYS specify collection name explicitly ("canvases"), otherwise it will
// incorrectly be named "canvas".
export const Canvas = model<ICanvas>("Canvas", canvasSchema, "canvases");

export type IWhiteboardPermissionEnum =
  | 'view'
  | 'edit'
  | 'own'
;

export interface IWhiteboardUserPermissionBase {
  permission: IWhiteboardPermissionEnum;
}

export interface IWhiteboardUserPermissionById extends IWhiteboardUserPermissionBase {
  type: 'user';
  user: Types.ObjectId;
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

export const WhiteboardUserPermission = model<IWhiteboardUserPermissionBase>(
  'WhiteboardUserPermission', whiteboardUserPermissionSchema, "whiteboardUserPermissions"
);

export const WhiteboardUserPermissionById = WhiteboardUserPermission.discriminator<IWhiteboardUserPermissionById>(
  'user',
  new Schema({
    user: { type: Types.ObjectId, ref: "User", required: true },
  })
);

export const WhiteboardUserPermissionByEmail = WhiteboardUserPermission.discriminator<IWhiteboardUserPermissionByEmail>('email', new Schema({
  email: { type: String, required: true }
}));

export interface IWhiteboardModel {
  name: string;
  time_created: Date;
  owner: IUser;        // reference to User

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

export type IWhiteboard =
  & IWhiteboardDocument
  & DocumentViewMethods<IWhiteboardPublicView, IWhiteboardAttribView>
  & Document
;

export interface IWhiteboardSchema extends Model<IWhiteboard> {
  findFull: (options: Record<string, any>) => Promise<IWhiteboard[]>;
  findAttribViews: (options: Record<string, any>) => Promise<IWhiteboardAttribView[]>;
  findCanvasesByWhiteboardId: (whiteboardId: Types.ObjectId) => Promise<ICanvasAttribView[] | null>;
  findSharedUsersByWhiteboardId: (whiteboardId: Types.ObjectId) => Promise<IWhiteboardUserPermission[] | null>;
}

const whiteboardToAttribView = (wb: IWhiteboardDocument): IWhiteboardAttribView => {
  const {
    canvases,
    shared_users,
    ...out
  } = wb;

  return out;
};

const whiteboardSchema = new Schema<IWhiteboard, IWhiteboardSchema>(
  {
    name: { type: String, required: true },
    time_created: { type: Date, default: Date.now },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    shared_users: [whiteboardUserPermissionSchema]
  },
  {
    toObject: {
      virtuals: true
    },
    toJSON: {
      virtuals: false,
    },
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
      findFull(options: Record<string, any>) {
        return this.find(options)
          .populate({
            path: 'owner',
          })
          .populate({
            path: 'canvases',
            populate: [
              { path: 'shapes' },
              { path: 'allowed_users' },
            ],
          });
      },
      findAttribViews(options: Record<string, any>): Promise<IWhiteboardAttribView[]> {
        return this.find(options)
          .select(WHITEBOARD_VECTOR_FIELDS
            .map(field => `-${field}`)
            .join(' ')
          )
          .populate({
            path: 'owner',
          });
      },
      async findCanvasesByWhiteboardId(whiteboardId: Types.ObjectId): Promise<ICanvasAttribView[] | null> {
        const res : Partial<IWhiteboard> | null = await this.findById(whiteboardId)
          .populate('canvases')
          .select("canvases");

        if ((! res) || (! Array.isArray(res.canvases))) {
          return null;
        } else {
          return res.canvases;
        }
      },
      async findSharedUsersByWhiteboardId(whiteboardId: Types.ObjectId): Promise<IWhiteboardUserPermission[] | null> {
        const res : Partial<IWhiteboard> | null = await this.findById(whiteboardId)
          .select("shared_users");

        if ((! res) || (! Array.isArray(res.shared_users))) {
          return null;
        } else {
          return res.shared_users;
        }
      }
    },
  }
);

whiteboardSchema.virtual('canvases', {
  ref: 'Canvas',
  localField: '_id',
  foreignField: 'whiteboard_id',
  justOne: false,
});

export const Whiteboard = model<IWhiteboard, IWhiteboardSchema>("Whiteboard", whiteboardSchema, "whiteboards");
