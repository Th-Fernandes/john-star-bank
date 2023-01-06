import express, { Request, Response } from 'express';
import { verifyJWT } from '../lib/JWT/verify';
import jwt from 'jsonwebtoken';
import { Account, User } from '@prisma/client';
import { prisma } from '../lib/prisma';
const router = express.Router();

router.get('/balance', verifyJWT, async (req: Request, res: Response) => {
	const { token } = req.cookies;
	const { accountId } = jwt.decode(token) as User;
	let account: Account | null;

	try {
		account = await prisma.account.findUnique({
			where: { id: accountId },
		});
	} 
	catch(error) {
		return res.status(500).json({error});
	}

	return res.json({ balance: account?.balance });
});

export default router;
