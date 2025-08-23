import { Request, Response } from "express";
import { Types } from "mongoose";

// --- local imports
import { Whiteboard } from '../models/Whiteboard';

import { IWhiteboard } from '../models/Whiteboard';
import type {
  AuthorizedRequestBody
} from '../models/Auth';

export interface CreateWhiteboardRequest extends AuthorizedRequestBody {
  name: string;
}

export const getWhiteboardsByOwner = async (ownerId: Types.ObjectId): Promise<IWhiteboard[]> => {
  return await Whiteboard.find({ owner: ownerId });
};// end getWhiteboardsByOwner

export const createWhiteboard = async (
  req: Request<{}, any, CreateWhiteboardRequest, {}>,
  res: Response
) => {
  try {
    const { authUser, name } = req.body;
    const { id: ownerId } = authUser;

    const whiteboard = new Whiteboard({
      name,
      canvases: [],
      owner: ownerId,
      shared_users: []
    });

    console.log('Attempting to create new whiteboard:', whiteboard);

    await whiteboard.save();
    res.status(201).json(whiteboard);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
