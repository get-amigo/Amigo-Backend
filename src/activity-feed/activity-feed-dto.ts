import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ActivityFeedDto {

  @IsString()
  @IsNotEmpty()
  _id: string; // Using string to represent ObjectId

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

  @IsString()
  @IsOptional()
  replyTo?: string;

  @IsString()
  @IsOptional()
  replyingMessage?: string;
}