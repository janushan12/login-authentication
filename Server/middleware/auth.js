import jwt from 'jsonwebtoken';
import ENV from '../config.js';

/** auth middleware */
export default async function Auth(req, res, next) {
  try {
    //acccess authorize header to validate request
    const token = req.headers.authorization.split(' ')[1];

    //retrive the user details for the logged in user
    const decodedToken = await jwt.verify(token, ENV.JWT_SECRET);

    req.user = decodedToken;

    next();
  } catch (error) {
    res.status(404).json({ error: 'Authentication Failed' });
  }
}

export function localVariables(req, res, next) {
  req.app.locals = {
    OTP: null,
    resetSession: false,
  };
  next();
}
