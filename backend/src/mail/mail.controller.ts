import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  Query,
  Post,
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

  /**
   * Step 1: Redirect user to provider’s OAuth page
   */
  @Get('connect/:provider')
  connect(
    @Param('provider') provider: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const providerConfig = getMailProviders()[provider];

    if (!providerConfig) {
      return res.status(400).json({ error: 'Unsupported provider' });
    }

    if (providerConfig.apiKeyOnly) {
      return res
        .status(400)
        .json({ error: `${providerConfig.name} uses API key, not OAuth` });
    }

    const url = this.mailService.getOAuthUrl(provider, req);
    return res.redirect(url);
  }

  /**
   * Step 2: Handle OAuth callback
   */
  @Get('callback/:provider')
  @Public()
  async callback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const providerConfig = getMailProviders()[provider];

    if (!providerConfig) {
      return res.status(400).json({ error: 'Unsupported provider' });
    }

    if (providerConfig.apiKeyOnly) {
      return res
        .status(400)
        .json({ error: `${providerConfig.name} does not support OAuth` });
    }

    try {
      await this.mailService.handleOAuthCallback(provider, code, state);

      // ✅ Success response back to frontend popup
      return res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'mail_connected', success: true }, '*');
                window.close();
              } else {
                window.location.href = '${process.env.WEBAPP_FRONTEND_URL}/app/campaign/new?mail_connected=1';
              }
            </script>
          </body>
        </html>
      `);
    } catch (err) {
      return res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'mail_connected', success: false, error: "${(err as Error).message}" }, '*');
                window.close();
              } else {
                window.location.href = '${process.env.WEBAPP_FRONTEND_URL}/app/campaign/new?mail_connected=0';
              }
            </script>
          </body>
        </html>
      `);
    }
  }

  /**
   * Step 3: Check connected providers
   */
  @Get('status')
  async status(@Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();

    return {
      error: 0,
      data: await this.mailService.getStatus(userId),
    };
  }

  /**
   * Step 4: Disconnect provider
   */
  @Post('disconnect/:provider')
  async disconnect(@Param('provider') provider: string, @Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();

    return this.mailService.disconnectProvider(provider, userId);
  }
}
