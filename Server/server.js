import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import connect from './database/conn.js';
import router from './router/route.js';
//import UserModel from '../Server/model/User.model.js';

const app = express();

/** middleware */
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by'); //less hackers know about our stack

const port = 8080;

/** HTTP GET Request */
app.get('/', (req, res) => {
  res.status(201).json('Home GET Request');
});

/** api routes */
app.use('/api', router);

/** Start server only when we have valid connection*/
connect()
  .then(() => {
    try {
      app.listen(port, () => {
        console.log(`Server connected to http://localhost:${port}`);
      });
    } catch (error) {
      console.log('Cannot connect to the server');
    }
  })
  .catch((error) => {
    console.log(`${error} Cannot connect to database`);
  });
