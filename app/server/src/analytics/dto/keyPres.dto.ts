import { IsString, Length } from 'class-validator';

export class KeyPressDto {
  @IsString()
  @Length(1, 1)
  key: string;
}
