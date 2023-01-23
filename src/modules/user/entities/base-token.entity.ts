import { PrimaryGeneratedColumn, BaseEntity, Column, CreateDateColumn } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export abstract class BaseTokenEntity extends BaseEntity {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    /**
     * token的值
     */
    @Expose()
    @Column({ length: 1000 })
    value!: string;

    @Column({
        comment: '过期时间',
    })
    @Expose()
    expired_at!: Date;

    @CreateDateColumn({
        comment: 'token创建时间',
    })
    createdAt!: Date;
}
