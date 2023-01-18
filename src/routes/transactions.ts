import express, { Request, Response } from 'express';
import { verifyJWT } from '../lib/JWT/verify';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { CashOutService } from '../services/cash-out';
import { db } from '../services/db';
import { JWT } from '../@types/JWT';

const router = express.Router();

router.post('/cash-out', 
	verifyJWT, 
	async (req: Request, res: Response) => {
		const { username, amount } = req.body;
		const { token } = req.cookies;
		const loggedUser = jwt.decode(token) as User;
		const errors: unknown[] = [];

		const cashOutService = new CashOutService({
			reqUsername: loggedUser.username,
			loggedUsername: username,
			amount,
		});

		await cashOutService.verifyIfReqUserExists(username, errors);
		await cashOutService.verifyIfCashOutIsDoingForItself(errors);
		await cashOutService.verifyIfAmountIsEnough(
			loggedUser.accountId,
			amount,
			errors
		);
		await cashOutService.cashOut();

		if (errors.length > 0) return res.status(500).json({ errors });
		return res.json({ message: 'ok' });
	}
);

router.get('/all', verifyJWT , async (req:Request, res:Response) => {
	const { getUserTransactions } = new db();
	const { token } = req.cookies;
	const { username } = jwt.decode(token) as JWT;
	const { filter } = req.params;


	const transactions = await getUserTransactions({
		where: { username }
	});

	return res.json(transactions);
});	

export default router;
