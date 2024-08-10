import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';


export class SearchUserDto {
    @IsString()
    @Type(() => String)
    username?: string;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    minAge?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    maxAge?: number;
  }