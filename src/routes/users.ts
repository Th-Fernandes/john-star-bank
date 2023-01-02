import { prisma } from '../lib/prisma';
import express, { Request, Response } from 'express';
import { User } from '@prisma/client';

const router = express.Router();

router.get('/', async ( req:Request, res:Response ) => {
	const { username, password } = req.body;
	let createUser: User;

	try {
		createUser = await prisma.user.create({
			data: {
				username,
				password,
				account: { create: {} }
			}
		});
	} catch (error) {
		return res.status(400).json({message: 'não foi possível efeituar cadastro', error});
	}

	return res.json(createUser);
});

export default router;