import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
  Query,
  Patch,
  Delete,
  Session,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './users.entity';
@Controller('auth')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Get('/color/:color')
  setSession(@Param('color') color: string, @Session() session: any) {
    session.color = color;
  }

  @Get('/color')
  getSession(@Session() session: any) {
    return session.color;
  }

  @Get('/whoami')
  @UseGuards(AuthGuard)
  whoami(@CurrentUser() user: User) {
    return user;
  }

  @Get('/signout')
  signOut(@Session() session: any) {
    session.userId = null;
  }

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const { email, password } = body;

    const user = await this.authService.signup(email, password);

    session.userId = user.id;

    return user;
  }

  @Post('/signin')
  signin(@Body() body: CreateUserDto) {
    const { email, password } = body;

    return this.authService.signin(email, password);
  }

  @Get()
  async findAll() {
    return this.userService.find();
  }

  @Get('/:id')
  async findUser(@Param('id') id: string) {
    const user = await this.userService.findOne(parseInt(id));

    if (!user) {
      throw new NotFoundException('User is not found from auth controller');
    }

    return user;
  }

  @Get()
  async findAllUsersByEmail(@Query('email') email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User is not found by email.');
    }

    return user;
  }

  @Patch('/:id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto ) {
    return await this.userService.update(parseInt(id), body);
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    return await this.userService.remove(parseInt(id));
  }
}
