import { UserStatus } from '@shahi-packing/libs/shared-models';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn({
    name: 'user_id',
  })
  user_id: number;

  @Column({
    name: 'username',
    type: 'varchar',
    length: 70,
  })
  username: string;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 256,
  })
  password: string;

  @Column({
    name: 'branch',
    type: 'varchar',
    length: 50,
  })
  branch: string;

  @Column({
    name: 'role',
    type: 'varchar',
    length: 70,
  })
  role: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.Active,
  })
  status: UserStatus;
}
