import {
  BadRequestException,
  Injectable,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModeReq } from '@shahi-packing/libs/shared-models';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import Cryptr = require('cryptr');
import { Response } from 'express';

@Injectable()
export class UsersService {
  private readonly cryptr: Cryptr;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService
  ) {
    this.cryptr = new Cryptr('myTotallySecretKey', {
      encoding: 'base64',
      pbkdf2Iterations: 10000,
      saltLength: 10,
    });
  }

  async create(req: UsersModeReq): Promise<UserEntity> {
    try {
      const userObj = new UserEntity();

      userObj.username = req.username;
      userObj.password = this.cryptr.encrypt(req.password);
      userObj.branch = req.branch;
      userObj.role = req.role;
      userObj.status = req.status;

      console.log(userObj, 'User Created');
      return await this.userRepository.save(userObj);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new BadRequestException('Error creating user');
    }
  }

  async findAll(): Promise<UserEntity[]> {
    try {
      return await this.userRepository.find();
    } catch (error) {
      console.error('Error finding users:', error);
      throw new BadRequestException('Error finding users');
    }
  }

  async update(user_id: number, req: UsersModeReq): Promise<UserEntity> {
    try {
      const userToUpdate = await this.userRepository.findOne({
        where: { user_id },
      });
      if (!userToUpdate) {
        throw new BadRequestException('User not found');
      }

      userToUpdate.username = req.username;
      userToUpdate.password = this.cryptr.encrypt(req.password);
      userToUpdate.branch = req.branch;
      userToUpdate.role = req.role;
      userToUpdate.status = req.status;

      console.log(userToUpdate, 'User updated');
      return await this.userRepository.save(userToUpdate);
    } catch (error) {
      console.error('Error occurred while updating user:', error.message);
      throw new BadRequestException('Error updating user');
    }
  }

  async remove(user_id: number): Promise<void> {
    try {
      await this.userRepository.delete(user_id);
    } catch (error) {
      console.error('Error occurred while deleting user:', error.message);
      throw new BadRequestException('Error deleting user');
    }
  }

  async validateUser(password: string): Promise<boolean> {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return passwordRegex.test(password);
  }

  async validateCredentials(
    username: string,
    password: string,
    @Res({ passthrough: true }) response: Response
  ): Promise<{ userDetails: any; token: string }> {
    try {
      const user = await this.userRepository.findOne({ where: { username } });
      if (!user) {
        throw new UnauthorizedException('Invalid username or password');
      }

      const decryptedPassword = this.cryptr.decrypt(user.password);
      if (decryptedPassword !== password) {
        throw new UnauthorizedException('Invalid username or password');
      }

      const payload = {
        username: user.username,
        user_id: user.user_id,
        role: user.role,
        branch: user.branch,
        status: user.status,
      };
      const token = this.jwtService.sign(payload);

      response.cookie('token', token, {
        httpOnly: true, // Accessible only by the web server
        maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 7 days
        secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
        sameSite: 'none', // Adjust based on your needs (strict, lax, none)
        path: '/', // Path for which the cookie is valid
      });

      return { userDetails: payload, token };
    } catch (error) {
      console.error('Error during credential validation:', error.message);
      throw new UnauthorizedException('Invalid username or password');
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

export default UsersService;
