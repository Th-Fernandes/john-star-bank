import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';

export function generateJWT(payload: User) {

  
	const token = jwt.sign(payload, 'johnStarBank');

	return token;
}