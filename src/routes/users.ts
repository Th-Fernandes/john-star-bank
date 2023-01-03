import { prisma } from '../lib/prisma';
import express, { Request, Response } from 'express';
import { User } from '@prisma/client';
import { z } from 'zod';
import { validateUserData } from '../models/user';

const router = express.Router();

router.get('/signIn', async (req: Request, res: Response) => {
	const { username, password } = req.body;
	const { isUserValid, error } = validateUserData(username, password);
	let createdUser: User | false = false;

	if (!isUserValid) return res.status(400).json(error);

	async function createUserOnDb() {
		try {
			createdUser = await prisma.user.create({
				data: { username, password, account: { create: {} } },
			});
		} catch (error) {
			return res
				.status(400)
				.json({ message: 'não foi possível efeituar cadastro', error });
		}
		return res.json(createdUser);
	}

	await createUserOnDb();
});

export default router;
