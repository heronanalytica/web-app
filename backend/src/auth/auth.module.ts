import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';
import { FeatureFlagModule } from 'src/feature-flag/feature-flag.module';

@Module({
  imports: [
    JwtModule.register({
      secret: 'super-secret', // TODO: move this to env later
      signOptions: { expiresIn: '1h' },
    }),
    DatabaseModule,
    FeatureFlagModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
