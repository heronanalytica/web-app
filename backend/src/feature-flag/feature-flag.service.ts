import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class FeatureFlagService {
  constructor(private db: DatabaseService) {}

  async isEnabled(flagName: string): Promise<boolean> {
    const flag = await this.db.featureFlag.findUnique({
      where: { name: flagName },
    });
    return flag?.enabled ?? false;
  }
}
