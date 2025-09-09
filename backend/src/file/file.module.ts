import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { DatabaseModule } from 'src/database/database.module';
import { FileController } from './file.controller';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [DatabaseModule, AwsModule],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
