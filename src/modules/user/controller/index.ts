import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../dto';

@Controller('users')
export class UserController {
    @Post()
    async create(@Body() data: CreateUserDto) {
        return data;
    }
}
