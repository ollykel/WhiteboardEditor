import {
  Schema,
  model,
  Types,
  type Document,
  type Model,
} from "mongoose";

import type {
  DocumentVirtualBase,
  DocumentViewMethods,
  ViewDocument,
} from './Model';

import {
  type IUser,
  type IUserPublicView,
  type IUserAttribView,
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
  & DocumentViewMethods<IShape, IShapePublicView, IShapeAttribView>
  & Document <Types.ObjectId>
;

export type IShapeVirtual = DocumentVirtualBase;

export type ShapeModelType = Model<IShapeDocument, {}, {}, IShapeVirtual>;

export const shapeSchema = new Schema<IShape, ShapeModelType, {}, {}, IShapeVirtual>(
  // -- fields
  {
    canvas_id: { type: Schema.Types.ObjectId, ref: 'Canvas', required: true },
    type: { type: String, enum: SHAPE_TYPE_ENUM, required: true },
  },
  {
    // -- misc. options
    strict: false,

    // -- serialization options
    toObject: {
      virtuals: false,
    },
    toJSON: {
      virtuals: false,
      transform: (_, ret: Partial<IShape>) => {
        delete ret._id;

        return ret;
      },
    },

    // -- instance methods
    methods: {
      toPublicView() {
        // -- no fields to hide
        return this.toJSON();
      },
      toAttribView() {
        // -- no vector fields
        return this.toJSON();
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

shapeSchema.virtual('id').get(function() {
  return this._id;
});

export const Shape = model<IShape>("Shape", shapeSchema, "shapes");

export interface ICanvasModel <UserType> {
  name: string;
  width: number;
  height: number;
  time_created: Date;
  time_last_modified: Date;

  // -- vector fields: exclude from attribute view
  allowed_users: UserType[];  // references to User
}

export interface ICanvasDocument <UserType> extends ICanvasModel <UserType> {
  // reference to parent whiteboard
  whiteboard_id: Types.ObjectId;
}

// -- Canvas as Mongo document
export type ICanvas <UserType> =
  & ICanvasDocument <UserType>
  & DocumentViewMethods<ICanvas <IUser>, ICanvasPublicView, ICanvasAttribView>
  & Document <Types.ObjectId>
;

export interface ICanvasVirtual <ShapeType> extends DocumentVirtualBase {
  shapes: ShapeType[];
}

export type ICanvasFull = ICanvas<IUser> & ICanvasVirtual<IShape>;

export type CanvasModelType = Model<ICanvasDocument <Types.ObjectId>, {}, {}, ICanvasVirtual <Types.ObjectId>>;

type CanvasVectorFields = 
  | "shapes"
;

const CANVAS_VECTOR_FIELDS = [
  "shapes"
];

// === Data Transfer Objects ===================================================
//
// =============================================================================

export type ICanvasPublicView = ViewDocument <ICanvasDocument <IUserPublicView> & ICanvasVirtual<IShapePublicView>>;

export type ICanvasAttribView = Omit<ICanvasPublicView, CanvasVectorFields>;

const CANVAS_POP_FIELDS_ATTRIBS = [
  'allowed_users',
];

const CANVAS_POP_FIELDS_FULL = [
  ...CANVAS_POP_FIELDS_ATTRIBS,
  'shapes',
];

export const canvasSchema = new Schema<ICanvas <Types.ObjectId>, CanvasModelType, {}, {}, ICanvasVirtual <Types.ObjectId>>(
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
      virtuals: false,
    },
    toJSON: {
      virtuals: false,
      transform: (_, ret: Partial<ICanvas <Types.ObjectId>>) => {
        delete ret._id;

        return ret;
      },
    },
    // -- instance methods
    methods: {
      async populateAttribs(): Promise<ICanvas <IUser>> {
        return await this.populate(CANVAS_POP_FIELDS_ATTRIBS);
      },
      async populateFull(): Promise<ICanvas <IUser>> {
        return await this.populate(CANVAS_POP_FIELDS_FULL);
      },
      toPublicView(): ICanvasPublicView {
        const obj = this.toObject({ virtuals: true });

        const {
          allowed_users: _allowed_users,
          shapes: _shapes,
          ...fields
        } = obj;

        return ({
          ...fields,
          allowed_users: (this as unknown as ICanvas <IUser>)
            .allowed_users.map(user => user.toPublicView()),
          shapes: (this as unknown as ICanvas <IUser> & ICanvasVirtual<IShape>)
            .shapes.map(shape => shape.toPublicView()),
        });
      },
      toAttribView(): ICanvasAttribView {
        const obj = this.toObject({ virtuals: true });

        const {
          allowed_users,
          shapes,
          ...fields
        } = obj;

        return ({
          ...fields,
          allowed_users: (this as unknown as ICanvas <IUser>)
            .allowed_users.map(user => user.toAttribView()),
        });
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
          )
          .populate({
            path: 'allowed_users',
          });
      }
    },
  }
);

canvasSchema.virtual('id').get(function() {
  return this._id;
});

canvasSchema.virtual('shapes', {
  ref: 'Shape',
  localField: '_id',
  foreignField: 'canvas_id',
  justOne: false,
});

// ALWAYS specify collection name explicitly ("canvases"), otherwise it will
// incorrectly be named "canvas".
export const Canvas = model<ICanvas<Types.ObjectId>>("Canvas", canvasSchema, "canvases");

export type IWhiteboardPermissionEnum =
  | 'view'
  | 'edit'
  | 'own'
;

export interface IWhiteboardUserPermissionBase {
  permission: IWhiteboardPermissionEnum;
}

export interface IWhiteboardUserPermissionById <UserType> extends IWhiteboardUserPermissionBase {
  type: 'user';
  user: UserType;
}

export interface IWhiteboardUserPermissionByEmail extends IWhiteboardUserPermissionBase {
  type: 'email';
  email: string;
}

export type IWhiteboardUserPermissionModel <UserType> = 
  | IWhiteboardUserPermissionById <UserType>
  | IWhiteboardUserPermissionByEmail
;

export type IWhiteboardUserPermissionPublicView = IWhiteboardUserPermissionModel<IUserPublicView>;

export type IWhiteboardUserPermissionAttribView = IWhiteboardUserPermissionModel<IUserAttribView>;

export type IWhiteboardUserPermission <UserType> =
  & IWhiteboardUserPermissionModel<UserType>
  & DocumentViewMethods<
    IWhiteboardUserPermission<UserType>,
    IWhiteboardUserPermissionPublicView,
    IWhiteboardUserPermissionAttribView
  >
  & Document<Types.ObjectId>
;

export type WhiteboardUserPermissionModelType <UserType> = Model<IWhiteboardUserPermission<UserType>, {}, {}, {}>;

const whiteboardUserPermissionSchema = new Schema<IWhiteboardUserPermission <Types.ObjectId>, WhiteboardUserPermissionModelType<Types.ObjectId>, {}, {}, {}>(
  {
    permission: { type: String, enum: ['view', 'edit', 'own'], required: true },
  },
  {
    discriminatorKey: 'type',
  }
);

export interface IWhiteboardModel <UserType> {
  name: string;
  time_created: Date;
  owner: IUser;        // reference to User

  // -- vector fields: exclude from attribute view
  shared_users: IWhiteboardUserPermission<UserType>[];
}

export type IWhiteboard <UserType> =
  & IWhiteboardDocument <UserType>
  & DocumentViewMethods<IWhiteboard <IUser>, IWhiteboardPublicView, IWhiteboardAttribView>
  & Document <Types.ObjectId>
;

export interface IWhiteboardVirtual <CanvasType> extends DocumentVirtualBase {
  canvases: CanvasType[];
}

export type IWhiteboardFull = IWhiteboard<IUser> & IWhiteboardVirtual<ICanvasFull>;

type WhiteboardVectorFields = 
  | "canvases"
;

const WHITEBOARD_VECTOR_FIELDS = [
  "canvases",
];

const WHITEBOARD_POP_FIELDS_ATTRIBS = [
  'owner',
  {
    path: 'shared_users',
    populate: [
      'user',
    ],
  },
];

const WHITEBOARD_POP_FIELDS_FULL = [
  ...WHITEBOARD_POP_FIELDS_ATTRIBS,
  {
    path: 'canvases',
    populate: CANVAS_POP_FIELDS_FULL,
  },
];

// === Data Transfer Objects ===================================================
//
// =============================================================================

export type IWhiteboardDocument <UserType> = IWhiteboardModel <UserType>;

export type IWhiteboardPublicView = ViewDocument<IWhiteboardDocument <IUser>>;

export type IWhiteboardAttribView = Omit<IWhiteboardPublicView, WhiteboardVectorFields>;

export interface IWhiteboardSchema <UserType> extends Model<IWhiteboard<UserType>, {}, {}, IWhiteboardVirtual<UserType>> {
  findFull: (options: Record<string, any>) => Promise<IWhiteboard <IUser>[]>;
  findAttribs: (options: Record<string, any>) => Promise<IWhiteboard<IUser>[]>;
  findSharedUsersByWhiteboardId: (whiteboardId: Types.ObjectId) => Promise<IWhiteboardUserPermission<IUser>[] | null>;
}

const whiteboardSchema = new Schema<IWhiteboard<Types.ObjectId>, IWhiteboardSchema<Types.ObjectId>, {}, {}, IWhiteboardVirtual <Types.ObjectId>>(
  {
    name: { type: String, required: true },
    time_created: { type: Date, default: Date.now },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    shared_users: [whiteboardUserPermissionSchema],
  },
  {
    toObject: {
      virtuals: false,
    },
    toJSON: {
      virtuals: true,
      transform: (_, ret: Partial<IWhiteboard<Types.ObjectId>>) => {
        delete ret._id;

        return ret;
      },
    },
    // -- instance methods
    methods: {
      async populateAttribs(): Promise<IWhiteboard <IUser>> {
        await this.populate(WHITEBOARD_POP_FIELDS_ATTRIBS);
        return this as unknown as IWhiteboard <IUser>;
      },
      async populateFull(): Promise<IWhiteboard <IUser>> {
        await this.populate(WHITEBOARD_POP_FIELDS_FULL);
        return this as unknown as IWhiteboard <IUser>;
      },
      toPublicView() {
        const obj = this.toObject({ virtuals: true });
        const {
          _id,
          owner: _owner,
          shared_users: _shared_users,
          canvases: _canvases,
          ...fields
        } = obj;

        return ({
          ...fields,
          owner: this.owner.toPublicView(),
          shared_users: (this as unknown as IWhiteboard <IUser>)
            .shared_users
            .map(perm => perm.toPublicView()),
          canvases: (this as unknown as IWhiteboardFull).canvases.map(canvas => canvas.toPublicView()),
        });
      },
      toAttribView() {
        const obj = this.toObject({ virtuals: true });
        const {
          _id,
          owner: _owner,
          shared_users: _shared_users,
          canvases: _canvases,
          ...fields
        } = obj;

        return ({
          ...fields,
          owner: this.owner.toAttribView(),
          shared_users: (this as unknown as IWhiteboard <IUser>)
            .shared_users
            .map(perm => perm.toAttribView()),
        });
      }
    },
    // -- static methods
    statics: {
      findFull(options: Record<string, any>) {
        return this.find(options)
          .populate(WHITEBOARD_POP_FIELDS_FULL);
      },
      findAttribs(options: Record<string, any>) {
        return this.find(options)
          .select(WHITEBOARD_VECTOR_FIELDS.map(field => `-${field}`).join(' '))
          .populate(WHITEBOARD_POP_FIELDS_ATTRIBS);
      },
      async findSharedUsersByWhiteboardId(whiteboardId: Types.ObjectId): Promise<IWhiteboardUserPermission<IUser>[] | null> {
        const res : Partial<IWhiteboard <IUser>> | null = await this.findById(whiteboardId)
          .select("shared_users")
          .then(wb => wb?.populateAttribs() || null);

        if ((! res) || (! Array.isArray(res.shared_users))) {
          return null;
        } else {
          return res.shared_users;
        }
      }
    },
  }
);

const sharedUsersArraySchema = whiteboardSchema.path('shared_users').schema;

sharedUsersArraySchema.discriminator('user', new Schema<IWhiteboardUserPermissionById<Types.ObjectId>>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    // -- serialization options
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
    // -- instance methods
    methods: {
      async populateAttribs(): Promise<IWhiteboardUserPermissionById<IUser>> {
        return await this.populate([
          'user',
        ]);
      },
      async populateFull(): Promise<IWhiteboardUserPermissionById<IUser>> {
        return await this.populate([
          'user',
        ]);
      },
      toAttribView(): IWhiteboardUserPermissionById<IUserAttribView> {
        const obj = this.toObject({ virtuals: true });
        const {
          user: _user,
          ...fields
        } = obj;

        return ({
          ...fields,
          user: (this as unknown as IWhiteboardUserPermissionById<IUser>).user.toAttribView(),
        });
      },
      toPublicView(): IWhiteboardUserPermissionById<IUserPublicView> {
        const obj = this.toObject({ virtuals: true });
        const {
          user: _user,
          ...fields
        } = obj;

        return ({
          ...fields,
          user: (this as unknown as IWhiteboardUserPermissionById<IUser>).user.toPublicView(),
        });
      },
    },
  },
));

sharedUsersArraySchema.discriminator('email', new Schema<IWhiteboardUserPermissionByEmail>(
  {
    email: { type: String, required: true },
  },
  {
    // -- serialization options
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
    // -- instance methods
    methods: {
      async populateAttribs(): Promise<IWhiteboardUserPermissionByEmail> {
        return await this.populate([]);
      },
      async populateFull(): Promise<IWhiteboardUserPermissionByEmail> {
        return await this.populate([]);
      },
      toAttribView(): IWhiteboardUserPermissionByEmail {
        return this.toObject({ virtuals: true });
      },
      toPublicView(): IWhiteboardUserPermissionByEmail {
        return this.toObject({ virtuals: true });
      },
    },
  },
));

whiteboardSchema.virtual('id').get(function() {
  return this._id;
});

whiteboardSchema.virtual('canvases', {
  ref: 'Canvas',
  localField: '_id',
  foreignField: 'whiteboard_id',
  justOne: false,
});

export const Whiteboard = model<IWhiteboard <Types.ObjectId>, IWhiteboardSchema <Types.ObjectId>>("Whiteboard", whiteboardSchema, "whiteboards");
