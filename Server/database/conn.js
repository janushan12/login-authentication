import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import ENV from '../config.js';

async function connect() {
  const mongod = await MongoMemoryServer.create();
  const getUri = mongod.getUri();

  //const db = await mongoose.connect(getUri);
  const db = await mongoose.connect(ENV.ATLAS_URI);
  console.log('Database Connected');
  /**Find value of getUri (DB) */
  console.log(getUri);
  return db;
}

export default connect;
