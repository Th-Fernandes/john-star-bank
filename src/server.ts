import express from 'express';
import users from './routes/users';
import account from './routes/account';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
 
app.use(cookieParser());
app.use(cors());
app.use(express.json());

app.use('/users', users);
app.use('/account', account);

app.listen(3333, () => {
	console.log('Server is running. Open it at localhost:3333');
});
  