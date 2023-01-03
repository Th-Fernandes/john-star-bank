import { z } from 'zod';

export function validateUserData(username: string, password:string) {
	const user = z.object({
		username: z
			.string()
			.min(3, { message: 'nome do usuário deve possuir ao menos 3 caracteres' })
			.max(30, {
				message: 'nome do usuário deve possuir no máximo 30 caracteres',
			}),
		password: z
			.string()
			.regex(/(?=.*[A-Z]{1})(?=.*[a-zA-Z0-9]{8})/g),
		// 8 caracteres e ao menos um sendo letra maiúscula
	});

	try { user.parse({ username, password });} 
	catch (error) { return error; }
}
