import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const passwordUtils = {
  hashPassword: async (plainPassword: string): Promise<string> => {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
  },

  comparePassword: async (
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> => {
    return bcrypt.compare(plainPassword, hashedPassword);
  },
};