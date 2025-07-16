import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { DatabaseModule } from 'src/database/database.module';
import { FileController } from './file.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
