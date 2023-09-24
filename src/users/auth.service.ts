import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    const user = await this.usersService.findBy(email);

    if (user.length) {
      throw new BadRequestException('Email in use.');
    }

    /** generate salt  */
    const salt = randomBytes(8).toString('hex');

    /** hash */
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const result = salt + '.' + hash.toString('hex');

    const createUser = await this.usersService.create(email, result);

    return createUser;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.findBy(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [salt, storedHast] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash.toString('hex') !== storedHast) {
      throw new BadRequestException('wrong password');
    }

    return user;
  }
}
