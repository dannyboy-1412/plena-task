import { IsOptional, IsString } from 'class-validator';


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

    birthdate?: Date;
}
