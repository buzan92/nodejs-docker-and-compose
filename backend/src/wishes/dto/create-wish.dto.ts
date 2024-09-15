import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsUrl,
  Length,
  Min,
} from 'class-validator';

export class CreateWishDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 250)
  public name: string;

  @IsNotEmpty()
  @IsUrl()
  public link: string;

  @IsNotEmpty()
  @IsUrl()
  public image: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  price: number;

  @IsNotEmpty()
  @IsString()
  @Length(1, 1024)
  public description: string;
}
