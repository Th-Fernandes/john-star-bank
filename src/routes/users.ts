import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { User } from '@prisma/client';
import { validateUserData } from '../models/user';
import bcrypt from 'bcrypt';
import { generateJWT } from '../lib/jsonWebToken';

const router = express.Router();

router.post('/signUp', async (req: Request, res: Response) => {
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

router.post('/signIn', async (req: Request, res: Response) => {
	const { username, password } = req.body;

	const findUserByUsername = await prisma.user.findUnique({ where: {username}}) as User;
	
	function checkIfUserExists() {
		const hasUserWithReqUsername = findUserByUsername != null;

		if(!hasUserWithReqUsername) return res
			.status(400)
			.json({ message: 'username inválido. Tente novamente' });	
	}	

	async function generateJWTIfPasswordMatch() {
		const isPasswordMatched = await bcrypt.compare(password, findUserByUsername.password);

		if(!isPasswordMatched) return res
			.status(400)
			.json({message: 'senha não coincide com o username. Tente novamente'});

		const token = generateJWT(findUserByUsername);
		console.log(token);
		
		res.cookie('token', token , { maxAge:  1000 * 60 * 24 /* 1 dia em miliseg*/, httpOnly: true, sameSite: 'strict' });
		return res.json({token}).send();
	}

	checkIfUserExists();
	generateJWTIfPasswordMatch();
});

export default router;
