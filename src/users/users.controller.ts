import { Controller, Get, Post, Body, Patch, Delete, Query, ValidationPipe, UsePipes, Headers, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto'
import { SearchUserDto } from './dto/search-user.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto'
import { CacheInterceptor } from '@nestjs/cache-manager';
import { plainToInstance } from 'class-transformer';

@Controller('users')
@UseInterceptors(CacheInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private authService: AuthService
  ) {}

  @Get()
  async findAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll()
    return plainToInstance(UserResponseDto, users);
  }

  @Get('search')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async search(
    @Headers('authorization') authHeader: string, 
    @Query() searchUserDto: SearchUserDto
  ): Promise<UserResponseDto[]> {
    
    const userId: number = this.authService.decode_token(authHeader);
    const users = await this.usersService.search(userId, searchUserDto);
    
    return plainToInstance(UserResponseDto, users);
  }

  @Post("signup")
  async signUp(@Body(new ValidationPipe({ whitelist: true })) signUpDto: SignUpDto) {
    console.log('signup', signUpDto)
    return await this.usersService.signUp(signUpDto);
  }

  @Post("login")
  async login(@Body(new ValidationPipe({ whitelist: true })) loginDto: LoginDto) {
    const {username, password} = loginDto
    return await this.usersService.login(username, password);
  }

  @Patch('update-password')
  async updatePassword(
    @Headers('authorization') authHeader: string,
    @Body(new ValidationPipe({ whitelist: true })) changePasswordDto: ChangePasswordDto
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'User not logged in' };
    }
    const id: number = this.authService.decode_token(authHeader);
    return await this.usersService.changePassword(id, changePasswordDto);
  }
  
  @Patch('update-user')
  async update(
    @Headers('authorization') authHeader: string,
    @Body(new ValidationPipe({ whitelist: true })) updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    const id: number = this.authService.decode_token(authHeader);
    const updatedUser = await this.usersService.update(id, updateUserDto)
    
    return plainToInstance(UserResponseDto, updatedUser); ;
  }

  @Delete('remove-user')
  async remove(@Headers('authorization') authHeader: string) {
  
    const id: number = this.authService.decode_token(authHeader);
    return await this.usersService.remove(id);
  }
}
