import { AppException } from "@/common/exceptions/app.exception";
import { Injectable } from "@nestjs/common";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UsersRepository } from "./repositories/users.repository";

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async getProfile(userId: string) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      AppException.notFound("User");
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.usersRepository.updateProfile(userId, dto);

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
