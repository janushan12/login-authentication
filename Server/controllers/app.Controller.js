import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import ENV from '../config.js';
import UserModel from '../model/User.model.js';

/** middleware for verify user */
export async function verifyUser(req, res, next) {
  try {
    const { username } = req.method == 'GET' ? req.query : req.body;

    // Check the user existance
    let exist = await UserModel.findOne({ username });
    if (!exist) return res.status(404).send({ error: 'Cannot find User' });
    next();
  } catch (error) {
    return res.status(404).send({ error: 'Authentication Error' });
  }
}

/** POST: http://localhost:8080/api/register
 * @param:{
    "username":"example123",
    "password":"admin123",
    "email":"janu@gmail.com",
    "firstname":"anusha",
    "lastname":"kugan",
    "mobile":"0114528931",
    "address":"chavakaccheri",
    "profile":""
  }
*/
export async function register(req, res) {
  try {
    const { username, password, email, profile } = req.body;

    // Check the existing user
    let checkExist = await UserModel.find({
      $or: [{ username: username }, { email: email }],
    });
    if (checkExist && checkExist.length > 0)
      return res.status(501).send({ error: 'username or email already exist' });

    // Hash Password
    if (password) {
      bcrypt
        .hash(password, 10)
        .then((hashedPassword) => {
          // Create new user
          const user = new UserModel({
            username,
            password: hashedPassword,
            profile: profile || '',
            email,
          });
          // Save to database and send response back with token
          user
            .save()
            .then((result) =>
              res.status(201).send({ msg: 'User Register Successfully.' })
            )
            .catch((error) => res.status(500).send({ error }));
        })
        .catch((error) => {
          console.log('Error in hashing password', error);
        });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
}

/** POST: http://localhost:8080/api/login
 * @param: {
    "username":"example123",
    "password":"admin123"
 } 
*/
// export async function login(req, res) {
//   const { username, password } = req.body;

//   try {
//     UserModel.findOne({ username })
//       .then((user) => {
//         bcrypt
//           .compare(password, user.password)
//           .then((passwordCheck) => {
//             if (!passwordCheck)
//               return res
//                 .status(401)
//                 .json({ error: 'Wrong credentials provided!' });

//             //Create jwt token
//             const token = jwt.sign(
//               {
//                 userId: user._id,
//                 username: user.username,
//               },
//               ENV.JWT_SECRET,
//               { expiresIn: '24h' }
//             );

//             return res.status(200).send({
//               msg: 'Login Successful...!',
//               username: user.username,
//               token,
//             });
//           })
//           .catch((error) => {
//             return res.status(400).send({ error: "Password doesn't match." });
//           });
//       })
//       .catch((error) => {
//         return res.status(404).send({ error: 'Username not found.' });
//       });
//   } catch (error) {
//     return res.status(500).send({ error });
//   }
// }

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Step 1: Retrieve user by username
    const user = await UserModel.findOne({ username });

    if (!user) {
      // User not found
      return res.status(404).json({ error: 'User not found' });
    }

    // Step 2: Compare hashed passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    // create jwt token
    const jwtSecret = ENV.JWT_SECRET;
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    if (passwordMatch) {
      // Passwords match, user is authenticated
      return res
        .status(200)
        .json({ message: 'Login successful', username: user.username, token });
    } else {
      // Passwords don't match, authentication failed
      return res.status(401).json({ error: 'Authentication failed' });
    }
  } catch (error) {
    // Handle errors
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/** GET: http://localhost:8080/api/user/example123 */
// export async function getUser(req, res) {
//   const { username } = req.params;

//   try {
//     if (!username) return res.status(501).send({ error: 'Invalid Username' });

//     UserModel.findOne({ username }, (err, user) => {
//       if (err || !user)
//         return res.status(500).send({ error: 'Couldnot find the user' });
//       return res.status(200).send(user);
//     });
//   } catch (error) {
//     return res.status(404).send({ error: 'Canonot find User datails' });
//   }
// }

export async function getUser(req, res) {
  try {
    const { username } = req.params;

    //find user by username
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User doesn't exist" });
    }

    /** remove password from user */
    // mongoose return unnecessary data with object so convert it into json
    const { password, ...rest } = Object.assign({}, user.toJSON());

    return res.status(200).json({ rest });
  } catch (error) {
    // Handle Errors
    console.log('Error in getting users', error);
    return res.status(500).json({ error: 'Internal Server Errors' });
  }
}

/** PUT: http://localhost:8080/api/updateuser
 * @param: {
 "header" : "<token>"
 }
 body: {
  firstname: '',
  address: '',
  profile: ''
}
 */
export async function updateuser(req, res) {
  try {
    //const id = req.query.id;
    const { userId } = req.user;

    if (!userId) {
      return res.status(401).send({ error: 'User Not Found' });
    }

    const body = req.body;

    //update the data
    const updateUser = await UserModel.updateOne({ _id: userId }, body);

    return res.status(201).send('Update Successful');
  } catch (error) {
    return res.status(401).send({ error: 'Internal Server Error' });
  }
}

/** GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req, res) {
  req.app.locals.OTP = await otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  res.status(201).send({ code: req.app.locals.OTP });
}

/** GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req, res) {
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; //reset the OTP value
    req.app.locals.resetSession = true;
    return res.status(200).send({ status: 'Verified' });
  }
  return res.status(403).send({ status: 'Invalid OTP' });
}

// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res) {
  if (req.app.locals.resetSession) {
    return res.status(201).send({ flag: req.app.locals.resetSession });
  }
  return res.status(403).send({ msg: 'Access denied' });
}

// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
export async function resetPassword(req, res) {
  try {
    if (!req.app.locals.resetSession)
      return res.status(440).send({ error: 'Session expired!' });

    const { username, password } = req.body;

    // Check if the user with provided username exists
    const user = await UserModel.findOne({ username });

    if (!user) return res.status(404).send({ error: 'User not found' });

    //hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    //update the user's password in the database
    await UserModel.updateOne({ username }, { password: hashedPassword });

    return res.status(200).send({ msg: 'Password reset successfully' });
  } catch (error) {
    return res.status(401).send({ error: 'Internal server error' });
  }
}
