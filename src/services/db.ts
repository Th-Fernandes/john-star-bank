import { prisma } from '../lib/prisma';

export class db {
	async getUser({where}:any) {
		const user = await prisma.user.findUniqueOrThrow({
			where
		});

		return user;
	}

	async getUserTransactions({where}:any) {
		const userData = await prisma.user.findFirstOrThrow({
			where
		});

		const userTransactions = await prisma.transaction.findMany({
			where: {
				OR: [
					{ debitedAccountId: userData?.accountId },
					{ creditedAccountId: userData.accountId } ,
				]
			},
			select: {
				debitedAccount: {},
				creditedAccount: {}
			}
		});

		return userTransactions;
	}
}