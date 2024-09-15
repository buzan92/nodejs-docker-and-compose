import {
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  @IsString()
  @Length(3)
  public password: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 30)
  public username: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  public about: string;

  @IsOptional()
  @IsUrl()
  public avatar: string;
}
