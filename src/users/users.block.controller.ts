import { Controller, Post, Param, ParseIntPipe, Headers, HttpException, HttpStatus} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';


@Controller('moderation')
export class BlockController {
  constructor(
    private readonly userService: UsersService,
    private authService: AuthService
  ) {}

  @Post('block/:blockedUserId')
  async blockUser(
    @Headers('authorization') authHeader: string, 
    @Param('blockedUserId', ParseIntPipe) blockedUserId: number,
  ) {
    const userId: number = this.authService.decode_token(authHeader);
    await this.userService.blockUser(userId, blockedUserId);
    
    return { message: 'User blocked successfully' };
  }

  @Post('unblock/:blockedUserId')
  async unblockUser(
    @Headers('authorization') authHeader: string, 
    @Param('blockedUserId', ParseIntPipe) blockedUserId: number,
  ) {
    const userId: number = this.authService.decode_token(authHeader);
    await this.userService.unblockUser(userId, blockedUserId);

    return { message: 'User unblocked successfully' };
  }
}
