import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ActivityFeedDto {
  @IsEnum(['transaction', 'payment'])
  @IsNotEmpty()
  activityType: string;

  @IsString()
  @IsNotEmpty()
  creator: string; // Using string to represent ObjectId

  @IsString()
  @IsNotEmpty()
  group: string; // Using string to represent ObjectId

  @IsString()
  @IsOptional()
  relatedId?: string; // Using string to represent ObjectId, optional

  @IsEnum(['Transaction', 'Payment'])
  @IsOptional()
  onModel?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
