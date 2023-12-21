import { HttpException, HttpStatus } from '@nestjs/common';
export const generalError = (message: string, httpStatus: HttpStatus) => {
  throw new HttpException(message, httpStatus);
};
