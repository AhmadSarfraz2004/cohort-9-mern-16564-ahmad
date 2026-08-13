import { UserModel } from '../user/user.model.js';
import { IUserDocument } from '../user/user.types.js';

export const authRepository = {
  create: async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<IUserDocument> => {
    return UserModel.create(data);
  },

  findByEmail: async (
    email: string,
    withPassword = false
  ): Promise<IUserDocument | null> => {
    const query = UserModel.findOne({ email });
    return withPassword ? query.select('+password') : query;
  },

  findById: async (id: string): Promise<IUserDocument | null> => {
    return UserModel.findById(id);
  },


  setRefreshTokenHash: async (
    userId: string,
    refreshTokenHash: string | null
  ): Promise<IUserDocument | null> => {
    return UserModel.findByIdAndUpdate(
      userId,
      { refreshTokenHash },
      { new: true }
    );
  },

  rotateRefreshTokenHash: async (
    userId: string,
    currentHash: string,
    newHash: string
  ): Promise<IUserDocument | null> => {
    return UserModel.findOneAndUpdate(
      { _id: userId, refreshTokenHash: currentHash },
      { refreshTokenHash: newHash },
      { new: true }
    );
  },

  findById_withRefreshHash: async (
    userId: string
  ): Promise<IUserDocument | null> => {
    return UserModel.findById(userId).select('+refreshTokenHash');
  },
};