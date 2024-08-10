import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, Not, In, Equal, And } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { ChangePasswordDto } from './dto/change-password.dto'
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async signUp(createUserDto: SignUpDto): Promise<Record<string, string>> {
    const { username, birthdate, password } = createUserDto;
    const temp_user = await this.userRepository.findOne({ where: { username: username } });

    if (temp_user) {
      throw new ConflictException("username already in use");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Calculate the age based on the birthdate
    const today: Date = new Date();
    const birthDate: Date = new Date(birthdate);

    let age: number = today.getFullYear() - birthDate.getFullYear();
    const monthDiff: number = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const user: User = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      age: age
    });

    await this.userRepository.save(user);
    return {"message": `User ${username} signed up successfully`};
  }

  async login(username: string, password: string): Promise<{ access_token: string }> {
    const user: User = await this.userRepository.findOne({where:{username}});
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid: boolean = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, username: username };
    return {
      "access_token": await this.jwtService.signAsync(payload)
    };
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async search(userId: number, searchUserDto: SearchUserDto): Promise<User[]> {
    const { username, minAge, maxAge } = searchUserDto;
    const query: any = {};

    if (userId == -1) {
      throw new UnauthorizedException();
    }
    const currentUser: User = await this.userRepository.findOne({where:{id: userId}, relations: ['blockedUsers']});
    const blockedUserIds: number[] = currentUser.blockedUsers.map(user => user.id);

    if (username) {
      query.username = Like(`%${username}%`);
    }

    if (minAge !== undefined && maxAge !== undefined) {
      query.age = Between(minAge, maxAge);
    }

    query.id = And(
      Not(In(blockedUserIds)),
      Not(Equal(userId))
    );

    return this.userRepository.find({ where: query });
  }

  async update(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({where:{id: userId}});
  
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    if (Object.keys(updateUserDto).length === 0) {
      throw new UnauthorizedException();  
    }

    const { name, surname } = updateUserDto;

    const updatedUser = {
      ...user,
      ...(name !== undefined && { name }),
      ...(surname !== undefined && { surname }),
  };
    return this.userRepository.save(updatedUser);
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto
  ): Promise<Record<string, string>> {
    const user = await this.userRepository.findOne({where:{id: userId}});

    const pwMatch = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password
    );

    if (!pwMatch) {
      throw new Error("Incorrect password");
    }

    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.userRepository.save(user);

    return {"message":"Password updated successfully"};
  }

  async remove(id: number): Promise<String> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User not found`);
    }

    return `User deleted`;
  }

  async blockUser(userId: number, blockedUserId: number): Promise<void> {
    if (userId == -1) {
      throw new UnauthorizedException();
    }
    
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['blockedUsers'] });
    const blockedUser = await this.userRepository.findOne({ where: { id: blockedUserId } });

    if (!user || !blockedUser) {
      throw new NotFoundException('User not found');
    }

    user.blockedUsers.push(blockedUser);
    await this.userRepository.save(user);
  }

  async unblockUser(userId: number, blockedUserId: number): Promise<void> {
    if (userId == -1) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['blockedUsers'] });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.blockedUsers = user.blockedUsers.filter(user => user.id !== blockedUserId);
    await this.userRepository.save(user);
  }
}
