import { prisma } from '../lib/prisma';
import express, { Request, Response } from 'express';
import { User } from '@prisma/client';
import { validateUserData } from '../models/user';
import bcrypt from 'bcrypt';

const router = express.Router();

router.get('/signIn', async (req: Request, res: Response) => {
	const { username, password } = req.body;
	const { isUserValid, error } = validateUserData(username, password);

	if (!isUserValid) return res.status(400).json(error);

	async function createUserOnDb() {
		let createdUser: User | false = false;

		bcrypt.hash(password, 10 , async (err, hash) => {
			try {
				createdUser = await prisma.user.create({
					data: { username, password: hash, account: { create: {} } },
				});
			} catch (error) {
				return res
					.status(400)
					.json({ message: 'não foi possível efeituar cadastro', error });
			}
			return res.json(createdUser);
		});
	}

	await createUserOnDb();
});

export default router;
