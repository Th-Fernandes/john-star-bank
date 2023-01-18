import { prisma } from '../lib/prisma';

interface UserSearch {
  where: {
    id?: string;
    username?: string;
    password?: string;
    accountId?: string
  }
}

export class db {
	async getUser( { where }: UserSearch ) {
		const user = await prisma.user.findUniqueOrThrow({
			where
		});

		return user;
	}

	async getUserTransactions( { where }: UserSearch ) {
		const userData = await prisma.user.findFirstOrThrow({ where });

		const userTransactions = await prisma.transaction.findMany({
			where: {
				OR: [
					{ debitedAccountId: userData?.accountId },
					{ creditedAccountId: userData.accountId } ,
				]
			},
			select: {
				debitedAccount: {},
				creditedAccount: {},
				createdAt: true
			},
			orderBy: { 
				createdAt: 'desc',
			}
		});

		return userTransactions;
	}
}