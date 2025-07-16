import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  Query,
  Post,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { MailService } from './mail.service';
import { getMailProviders } from './mailProviders';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('mail')
@UseGuards(JwtAuthGuard)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('connect/:provider')
  connect(
    @Param('provider') provider: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    if (!getMailProviders()[provider]) {
      return res.status(400).json({ error: 'Unsupported provider' });
    }
    const url = this.mailService.getOAuthUrl(provider, req);
    return res.redirect(url);
  }

  @Get('callback/:provider')
  @Public()
  async callback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Parse userId from state (format: userId:timestamp)
    const userId = state?.split(':')[0];
    if (!userId) {
      throw new UnauthorizedException('Missing or invalid state (userId)');
    }
    if (!getMailProviders()[provider]) {
      return res.status(400).json({ error: 'Unsupported provider' });
    }
    try {
      await this.mailService.handleOAuthCallback(provider, code, userId);
      // Redirect back to frontend with success
      return res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'mail_connected', success: true }, '*');
                window.close();
              } else {
                // Fallback for browsers where window.opener is not set
                window.location.href = '${process.env.WEBAPP_FRONTEND_URL}/app/campaign/new?mail_connected=1';
              }
            </script>
          </body>
        </html>
        `);
    } catch {
      return res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'mail_connected', success: false }, '*');
                window.close();
              } else {
                // Fallback for browsers where window.opener is not set
                window.location.href = '${process.env.WEBAPP_FRONTEND_URL}/app/campaign/new?mail_connected=0';
              }
            </script>
          </body>
        </html>
        `);
    }
  }

  @Get('status')
  async status(@Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    // Return connected providers for the user
    return {
      error: 0,
      data: await this.mailService.getStatus(userId),
    };
  }

  @Post('disconnect/:provider')
  async disconnect(@Param('provider') provider: string, @Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.mailService.disconnectProvider(provider, userId);
  }
}
