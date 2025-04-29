import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { FeatureFlagModule } from './feature-flag/feature-flag.module';

@Module({
  imports: [AuthModule, DatabaseModule, FeatureFlagModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
