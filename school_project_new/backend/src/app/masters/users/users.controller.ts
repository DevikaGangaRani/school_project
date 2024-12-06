import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersModeReq } from '@shahi-packing/libs/shared-models';
import { UsersService } from './users.service';
import { Response } from 'express';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/addUsers')
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createUserDto: UsersModeReq, @Res() res) {
    try {
      const user = await this.usersService.create(createUserDto);
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'User successfully created',
        user,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Post('/getUsers')
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async findAll(@Res() res) {
    try {
      const users = await this.usersService.findAll();
      return res.status(HttpStatus.OK).json({
        success: true,
        users,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Patch('/updateUsers/:user_id')
  @ApiResponse({ status: 200, description: 'User successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async update(
    @Param('user_id') user_id: string,
    @Body() updateUserDto: UsersModeReq,
    @Res() res
  ) {
    try {
      const user = await this.usersService.update(
        Number(user_id),
        updateUserDto
      );
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'User successfully updated',
        user,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Delete('/deleteUsers/:user_id')
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async remove(@Param('user_id') user_id: string, @Res() res) {
    try {
      await this.usersService.remove(Number(user_id));
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'User successfully deleted',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Post('/authenticate')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['username', 'password'],
    },
  })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async authenticate(
    @Body() credentials: { username: string; password: string },
    @Res() response: Response
  ) {
    try {
      const { userDetails, token } =
        await this.usersService.validateCredentials(
          credentials.username,
          credentials.password,
          response
        );

      return response.status(HttpStatus.OK).json({
        success: true,
        message: 'Authentication successful',
        token,
        userDetails,
      });
    } catch (error) {
      console.error('Error during authentication:', error.message);

      return response.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Incorrect username or password. Please try again.',
      });
    }
  }
}
