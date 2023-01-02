import express, { Request, Response } from 'express';

const app = express();

app.get('/', (req: Request, res: Response) => {
	return res.send('Hello World!');
});

app.listen(3333, () => {
	console.log('Server is running. Open it at localhost:3333');
});
