import { Entity, OneToOne, ManyToOne } from 'typeorm';
import { BaseTokenEntity } from './base-token.entity';
import { RefreshTokenEntity } from './refresh-token.entity';
import { UserEntity } from './user.entity';

/**
 * accessToken与refreshToken是一对的
 */
@Entity('user_access_token')
export class AccessTokenEntity extends BaseTokenEntity {
    /**
     * 关联的refreshToken
     */
    @OneToOne(
        () => RefreshTokenEntity,
        (refreshToken: RefreshTokenEntity) => refreshToken.accessToken,
        {
            cascade: true,
        },
    )
    refreshToken!: RefreshTokenEntity;

    @ManyToOne(() => UserEntity, (user: UserEntity) => user.accessTokens, {
        onDelete: 'CASCADE',
    })
    user!: UserEntity;
}
