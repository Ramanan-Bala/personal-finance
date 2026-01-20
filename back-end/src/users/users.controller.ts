import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AllExceptionsFilter } from "@/common/filters/all-exceptions.filter";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import {
  Body,
  Controller,
  Get,
  Patch,
  UseFilters,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard)
@UseFilters(AllExceptionsFilter)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("profile")
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Patch("profile")
  async updateProfile(
    @CurrentUser() user: any,
    @Body(ValidationPipe) dto: UpdateProfileDto
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }
}
