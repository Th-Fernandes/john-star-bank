import { Account, User } from '@prisma/client';
import { prisma } from '../lib/prisma';

interface CashOutConstructor {
  reqUsername: string;
  loggedUsername: string;
  amount: number
}

export class CashOutService {
	reqUsername: string;
	loggedUsername: string;
	amount: number;

	constructor({ reqUsername, loggedUsername, amount }: CashOutConstructor) {
		this.reqUsername = reqUsername;
		this.loggedUsername = loggedUsername;
		this.amount = amount;
	}

	async verifyIfReqUserExists(username: string, errors: unknown[]) {
		try {
			await prisma.user.findUniqueOrThrow({
				where: { username },
			});
		} catch (error) {
			errors.push(error);
		}
	}

	async verifyIfCashOutIsDoingForItself(errors: unknown[]) {
    
		const isUsernamesTheSame = this.reqUsername === this.loggedUsername;

		if (!isUsernamesTheSame) return;
		return errors.push({
			message: 'não é possível depositar para própria conta.',
		});
	}

	async verifyIfAmountIsEnough(
		accountId: string,
		amount: number,
		errors: unknown[]
	) {
		let account: Account | null;

		try {
			account = await prisma.account.findUnique({
				where: { id: accountId },
			});
		} catch (error) {
			errors.push(error);
			return;
		}

		if (account?.balance) {
			const isPossibleToDoCashOut = account?.balance - amount >= 0;

			if (!isPossibleToDoCashOut)
				errors.push({
					message: 'quantia insuficiente para realizar depósitio.',
				});
		}
	}

	async cashOut() {

		async function subtractFromLoggedUser(username: string, value: number) {
			const user = await prisma.user.findUnique({
				where: { id: username}
			}) as User;

			const account = await prisma.account.findUnique({
				where: { id: user.accountId}
			});

			if(user && account) {
				const updateBalance = await prisma.account.update({
					where: { id: user.accountId },
					data: { balance:  account?.balance - value}
				});
			} else {
				console.log('???');
			}
		}

		// await prisma.transaction.create({
		// 	data: {
		// 		value: 20,
		// 		creditedAccountId: '2323',
		// 		debitedAccountId: '121212',
		// 	},
		// });

		subtractFromLoggedUser(this.loggedUsername, this.amount);
	}
}
