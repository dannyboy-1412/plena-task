import { IsOptional, IsString, IsDateString } from 'class-validator';


export class SignUpDto {
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    surname?: string;

    @IsString()
    username?: string;

    @IsString()
    password: string;

    @IsDateString()
    birthdate?: Date;
}
