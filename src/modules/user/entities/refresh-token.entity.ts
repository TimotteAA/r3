import { Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseTokenEntity } from './base-token.entity';
import { AccessTokenEntity } from './access-token.entity';

@Entity('user_refresh_token')
export class RefreshTokenEntity extends BaseTokenEntity {
    /**
     * 关联的accessToken
     */
    @OneToOne(() => AccessTokenEntity, (accessToken) => accessToken.refreshToken, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    accessToken!: AccessTokenEntity;
}
