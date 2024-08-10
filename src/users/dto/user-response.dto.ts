import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
    @Expose()
    name: string;

    @Expose()
    surname: string;

    @Expose()
    username: string;

    @Expose()
    birthdate: Date;

    @Expose()
    age: number;

}