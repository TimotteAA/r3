import { SetMetadata } from '@nestjs/common';
import { ALLOW_GUEST } from '@/modules/core/constants';

export const GUEST = () => SetMetadata(ALLOW_GUEST, true);
