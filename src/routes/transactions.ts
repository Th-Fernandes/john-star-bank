import express, { Request, Response } from 'express';
import { verifyJWT } from '../lib/JWT/verify';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { CashOutService } from '../services/cash-out';

const router = express.Router();

router.post('/cash-out', verifyJWT, async (req: Request, res: Response) => {
	const { username, amount } = req.body;
	const { token } = req.cookies;
	const loggedUser = jwt.decode(token) as User;
	const errors: unknown[] = [];

	const cashOutService = new CashOutService({
		loggedUsername: username,
		reqUsername: loggedUser.username,
		amount
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
});

export default router;
