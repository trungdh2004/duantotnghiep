import { Document, Types } from "mongoose";

interface MongooseDocument extends Document<Types.ObjectId> {
  _doc: any;
}

export interface IUser extends MongooseDocument {
  userName: string;
  email: string;
  password: string;
  avatarUrl: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_admin: boolean;
  blocked_at: boolean;
  comment_blocked_at: boolean;
  phone: string;
  birthDay: string;
  bio: string;
}
