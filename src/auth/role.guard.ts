import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GroupService } from 'src/group/group.service';
import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly groupService: GroupService,
    private readonly transactionService: TransactionService, 
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const groupId = request.params.id || request.query.id;
  
    if (!groupId) {
      throw new ForbiddenException('Group ID is required.');
    }
  
    const group = await this.groupService.findGroupById(groupId);
    if (!group) {
      throw new ForbiddenException('Group not found.');
    }
  
    const isMember = group.members.some(memberId => memberId.toString() === user.id.toString());
  
    if (!isMember) {
      throw new ForbiddenException('You are not authorized to perform this action.');
    }
  
    const transactionId = request.params.id;
    if (transactionId && (request.method === 'PUT' || request.method === 'DELETE')) {
      const transaction = await this.transactionService.getTransaction(transactionId);
  
      if (!transaction) {
        throw new ForbiddenException('Transaction not found.');
      }

      // Check if the user is the creator of the transaction
      if (transaction.creator.toString() !== user.id.toString()) {
        throw new ForbiddenException('You are not authorized to edit or delete this transaction.');
      }
    }
  
    return true;
  }
}