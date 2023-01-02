import { prisma } from '../lib/prisma';
import express, { Request, Response } from 'express';
import { User } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();

router.get('/signIn', async ( req:Request, res:Response ) => {
	const { username, password } = req.body;

	function validateUserData() {
		const user = z.object({
			username: z.string()
				.min(3, {message: 'nome do usuário deve possuir ao menos 3 caracteres'})
				.max(30, {message: 'nome do usuário deve possuir no máximo 30 caracteres'}), 
			password: z.string()
		});
  
		try {
			user.parse({username, password});
		} catch (error) {
			return res.status(400).json({error});
		}
	}

	validateUserData();

	let createdUser: User | false = false;

	async function createUserOnDb() {
		try {
			createdUser = await prisma.user.create({
				data: {
					username,
					password,
					account: { create: {} }
				}
			});
		} catch (error) {
			return res.status(400).json({message: 'não foi possível efeituar cadastro', error});
		}
	}

	await createUserOnDb();

	return res.json(createdUser);
});

export default router;