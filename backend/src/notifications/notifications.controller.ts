import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

interface AuthedRequest {
  user: { userId: string };
}

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@Req() req: AuthedRequest) {
    return this.notificationsService.list(req.user.userId);
  }

  @Post(':id/read')
  markRead(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.notificationsService.markRead(req.user.userId, id);
  }

  @Post('read-all')
  markAllRead(@Req() req: AuthedRequest) {
    return this.notificationsService.markAllRead(req.user.userId);
  }
}
