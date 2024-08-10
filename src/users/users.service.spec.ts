import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { newDb, IMemoryDb } from 'pg-mem';
import { AppModule } from '../app.module';


describe('UsersService', () => {
  let service: UsersService;
  let module: TestingModule;

  beforeAll(async () => {
    const db:IMemoryDb = newDb();

    const dataSource = await db.adapters.createTypeormDataSource({
      type: 'postgres',
      entities: [User],
      synchronize: true,
    });
    await dataSource.initialize();
    module = await Test.createTestingModule({
      imports: [
        AppModule
      ],
      providers: [UsersService],
    }).overrideProvider("DATABASE_CONNECTION")
    .useValue(dataSource)
    .compile();

    const app = module.createNestApplication();

    await app.init();

    service = module.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should create a user', async () => {
    const user = await service.signUp({
      name: 'Test User',
      username: 'testuser',
      password:"password",
      birthdate:new Date(2012, 7, 15, 13, 30, 0),
    });
    expect(user.name).toBe('Test User');
    expect(user.username).toBe('testuser');
  });
  
  it('should return a list of users', async () => {
    const user = await service.signUp({
      name: 'Test User',
      username: 'testuser',
      password:"password",
      birthdate:new Date(2012, 7, 15, 13, 30, 0),
    });
    const foundUser = await service.findAll();
    expect(foundUser).toBeDefined();
    expect(foundUser).toMatchObject([
      {
        name: 'Test User',
        username: 'testuser',
        password:"password",
        birthdate:new Date(2012, 7, 15, 13, 30, 0),
      }
    ])
  });
});