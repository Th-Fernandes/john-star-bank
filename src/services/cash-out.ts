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
		const users:User[] = [];

		async function changeBalanceAmount(
			username: string,
			operation: 'sum' | 'subtract' ,
			value: number
		) {
			try {
				const user = await prisma.user.findUniqueOrThrow({
					where: { username },
					include: { account: {} }
				}); 
				users.push(user as User);		

				const result = {
					sum: user.account.balance + value,
					subtract: user.account.balance - value,
				};

				await prisma.account.update({
					where: { id: user.account.id },
					data: { balance: result[operation] }
				});
			} catch(err) {
				console.error(err);
			}
		}
	
		async function registerCashOutOnTransactionModel (amount:number) {
			await prisma.transaction.create({
				data: {
					value: amount,
					creditedAccountId: users[0].accountId,
					debitedAccountId: users[1].accountId,
				},
			});
		}

		await changeBalanceAmount(this.loggedUsername, 'subtract', this.amount);
		await changeBalanceAmount(this.reqUsername, 'sum', this.amount);
		await registerCashOutOnTransactionModel(this.amount);
	}
}