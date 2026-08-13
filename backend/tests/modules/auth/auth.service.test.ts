import { expect } from 'chai';
import sinon from 'sinon';

import { authRepository } from '../../../src/modules/auth/auth.repository.js';
import { passwordUtils } from '../../../src/common/utils/password.js';
import { jwtUtils } from '../../../src/common/utils/jwt.js';
import { authService } from '../../../src/modules/auth/auth.service.js';
import { AppError } from '../../../src/common/errors/AppError.js';

describe('authService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('register', () => {
    it('should throw a conflict error if email already exists', async () => {
      sinon.stub(authRepository, 'findByEmail').resolves({ _id: '123' } as any);

      try {
        await authService.register({
          name: 'Test',
          email: 'test@test.com',
          password: 'Password123',
        });

        expect.fail('Expected register to throw, but it did not');
      } catch (err) {
        expect(err).to.be.instanceOf(AppError);
        expect((err as AppError).statusCode).to.equal(409);
        expect((err as AppError).message).to.equal(
          'Email is already registered'
        );
      }
    });

    it('should hash the password and create a user if email is new', async () => {
      sinon.stub(authRepository, 'findByEmail').resolves(null);

      const hashStub = sinon
        .stub(passwordUtils, 'hashPassword')
        .resolves('hashed_pw');

      const createStub = sinon
        .stub(authRepository, 'create')
        .resolves({
          _id: 'abc123',
          name: 'Test',
          email: 'test@test.com',
          role: 'user',
        } as any);

      const result = await authService.register({
        name: 'Test',
        email: 'test@test.com',
        password: 'Password123',
      });

      expect(hashStub.calledWith('Password123')).to.be.true;
      expect(createStub.calledOnce).to.be.true;

      expect(result).to.deep.equal({
        id: 'abc123',
        name: 'Test',
        email: 'test@test.com',
        role: 'user',
      });

      expect(result).to.not.have.property('password');
    });
  });

  describe('login', () => {
    it('should throw unauthorized if user does not exist', async () => {
      sinon.stub(authRepository, 'findByEmail').resolves(null);

      try {
        await authService.login({
          email: 'ghost@test.com',
          password: 'whatever',
        });

        expect.fail('Expected login to throw, but it did not');
      } catch (err) {
        expect(err).to.be.instanceOf(AppError);
        expect((err as AppError).statusCode).to.equal(401);
      }
    });

    it('should throw unauthorized if password is invalid', async () => {
      sinon.stub(authRepository, 'findByEmail').resolves({
        _id: '123',
        password: 'hashed_pw',
      } as any);

      sinon.stub(passwordUtils, 'comparePassword').resolves(false);

      try {
        await authService.login({
          email: 'test@test.com',
          password: 'wrongpw',
        });

        expect.fail('Expected login to throw, but it did not');
      } catch (err) {
        expect((err as AppError).statusCode).to.equal(401);
      }
    });

    it('should return tokens and user data on successful login', async () => {
      const fakeUser = {
        _id: {
          toString: () => 'user123',
        },
        name: 'Test',
        email: 'test@test.com',
        role: 'user',
        password: 'hashed_pw',
      };

      sinon.stub(authRepository, 'findByEmail').resolves(fakeUser as any);

      sinon.stub(passwordUtils, 'comparePassword').resolves(true);

      sinon
        .stub(jwtUtils, 'generateAccessToken')
        .returns('fake_access_token');

      sinon
        .stub(jwtUtils, 'generateRefreshToken')
        .returns('fake_refresh_token');

      const updateStub = sinon
        .stub(authRepository, 'updateRefreshToken')
        .resolves();

      const result = await authService.login({
        email: 'test@test.com',
        password: 'Password123',
      });

      expect(result.accessToken).to.equal('fake_access_token');
      expect(result.refreshToken).to.equal('fake_refresh_token');
      expect(result.user.email).to.equal('test@test.com');

      expect(
        updateStub.calledWith('user123', 'fake_refresh_token')
      ).to.be.true;
    });
  });

  describe('logout', () => {
    it('should call updateRefreshToken with null', async () => {
      const updateStub = sinon
        .stub(authRepository, 'updateRefreshToken')
        .resolves();

      await authService.logout('user123');

      expect(updateStub.calledWith('user123', null)).to.be.true;
    });
  });

  describe('getCurrentUser', () => {
    it('should throw not found if user does not exist', async () => {
      sinon.stub(authRepository, 'findById').resolves(null);

      try {
        await authService.getCurrentUser('nonexistent');

        expect.fail('Expected getCurrentUser to throw, but it did not');
      } catch (err) {
        expect((err as AppError).statusCode).to.equal(404);
      }
    });

    it('should return user data without password if user exists', async () => {
      sinon.stub(authRepository, 'findById').resolves({
        _id: 'user123',
        name: 'Test',
        email: 'test@test.com',
        role: 'user',
        password: 'should_never_appear',
      } as any);

      const result = await authService.getCurrentUser('user123');

      expect(result).to.not.have.property('password');
      expect(result.email).to.equal('test@test.com');
    });
  });
});