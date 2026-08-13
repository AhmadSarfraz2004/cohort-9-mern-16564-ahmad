import {Document, Types} from 'mongoose';

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

export interface IUser {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    refreshToken: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
}