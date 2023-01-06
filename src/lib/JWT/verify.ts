import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export function verifyJWT(req: Request, res: Response, next: NextFunction) {
	const { token } = req.cookies;

	if (!token)
		return res
			.status(401)
			.json({ auth: false, message: 'Nenhum token provido.' });

	jwt.verify(token, 'johnStarBank', (err: Error | null) => {
		if (err)
			return res
				.status(500)
				.json({ auth: false, message: 'Falha ao autenticar token' });
		next();
	});
}
