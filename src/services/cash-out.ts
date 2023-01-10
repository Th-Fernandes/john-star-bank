import { Account, User } from '@prisma/client';
import { prisma } from '../lib/prisma';

interface CashOutConstructor {
  reqUsername: string;
  loggedUsername: string;
  amount: number;
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
		async function changeBalanceAmount(
			username: string,
			operation: 'sum' | 'subtract',
			value: number
		) {
			const user = (await prisma.user.findUnique({
				where: { username },
			})) as User;

			if (user) {
				const account = await prisma.account.findUnique({
					where: { id: user.accountId },
				});

				if (account) {
					const result = {
						sum: account.balance + value,
						subtract: account.balance - value,
					};

					await prisma.account.update({
						where: { id: account.id },
						data: {
							balance: result[operation],
						},
					});
				}
			}
		}
	
		await changeBalanceAmount(this.loggedUsername, 'subtract', this.amount);
		await changeBalanceAmount(this.reqUsername, 'sum', this.amount);

		// async function registerCashOutOnTransactionModel (amount:number) {
		// 	await prisma.transaction.create({
		// 		data: {
		// 			value: amount,
		// 			creditedAccountId: '2323',
		// 			debitedAccountId: '121212',
		// 		},
		// 	});
		// }
	}
}
