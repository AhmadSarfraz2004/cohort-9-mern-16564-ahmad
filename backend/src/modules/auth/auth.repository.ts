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

    updateRefreshToken: async (
        userId: string,
        refreshToken: string | null
    ): Promise<IUserDocument | null> => {
        return UserModel.findByIdAndUpdate(
            userId,
            { refreshToken },
            { new: true }
        );
    },

    findByRefreshToken: async (
        refreshToken: string
    ): Promise<IUserDocument | null> => {
        return UserModel.findOne({ refreshToken }).select('+refreshToken');
    },
};