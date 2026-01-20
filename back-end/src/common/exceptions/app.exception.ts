import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

export class AppException {
  static badRequest(message: string): never {
    throw new BadRequestException(message);
  }

  static notFound(resource: string): never {
    throw new NotFoundException(`${resource} not found`);
  }

  static conflict(message: string): never {
    throw new ConflictException(message);
  }

  static forbidden(message: string): never {
    throw new ForbiddenException(message);
  }

  static internalError(message: string): never {
    throw new InternalServerErrorException(message);
  }
}
