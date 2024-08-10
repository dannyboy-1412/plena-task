import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({nullable: true})
    surname: string;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column()
    birthdate: Date;

    @Column({ nullable: true })
    age: number;

    @ManyToMany(() => User)
    @JoinTable({
        name: 'user_blocks',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'blocked_user_id', referencedColumnName: 'id' },
    })
    blockedUsers: User[];
}
