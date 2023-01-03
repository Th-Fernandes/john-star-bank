import express from 'express';
import users from './routes/users';
import cors from 'cors';

const app = express();
 
app.use(express.json());
app.use(cors());

app.use('/users', users);

app.listen(3333, () => {
	console.log('Server is running. Open it at localhost:3333');
});
  