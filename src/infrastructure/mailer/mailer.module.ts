import { Global, Module } from '@nestjs/common';
import { MailService } from './mailer.service';

@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailerModule {}
