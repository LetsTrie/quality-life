import { Module } from '@nestjs/common';

import { InstrumentAuthoringService } from './instrument-authoring.service';
import { InstrumentsController } from './instruments.controller';
import { InstrumentsService } from './instruments.service';

@Module({
  controllers: [InstrumentsController],
  providers: [InstrumentsService, InstrumentAuthoringService],
  exports: [InstrumentsService, InstrumentAuthoringService],
})
export class InstrumentsModule {}

