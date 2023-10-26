import axios from 'axios';
import jwt_decode from 'jwt-decode';

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/** Make API Requests */

/**To get username from Token */
export const getUsername = async () => {
  const token = localStorage.getItem('token');
  if (!token) return Promise.reject('Cannot find token');
  let decode = jwt_decode(token);
  return decode;
};

/** authenticate function */
export const authenticate = async (username) => {
  try {
    return await axios.post('/api/authenticate', { username });
  } catch (error) {
    return { error: "username doesn't exist...!" };
  }
};

/** get User details */
export const getUser = async ({ username }) => {
  try {
    let userDetails = await axios.get(`/api/users/${username}`);
    return { userDetails };
  } catch (error) {
    return { error: "Password doesn't match...!" };
  }
};

/** register user function */
export const registerUser = async (credentials) => {
  try {
    let {
      data: { msg },
      status,
    } = await axios.post('/api/register', credentials);

    let { username, email } = credentials;

    /** send email */
    if (status === 201) {
      await axios.post('/api/registerMail', {
        username,
        userEmail: email,
        text: msg,
      });
    }
    return Promise.resolve(msg);
  } catch (error) {
    return Promise.reject({ error });
  }
};

/** login function */
export const verifyPassword = async ({ username, password }) => {
  try {
    if (username) {
      let response = await axios.post('/api/login', { username, password });
      return Promise.resolve(response);
    }
  } catch (error) {
    return Promise.reject({ error: "Password doesn't match...!" });
  }
};

/** update user function */
export const updateProfile = async (userData) => {
  try {
    const token = await localStorage.getItem('token');
    const data = await axios.put('/api/updateuser', userData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return Promise.resolve({ data });
  } catch (error) {
    console.error('Error updating profile:', error);
    return Promise.reject({ error: "Couldn't update profile...!" });
  }
};

/** generate OTP */
export const generateOTP = async (username) => {
  try {
    const {
      data: { code },
      status,
    } = await axios.get('/api/generateOTP', { params: { username } });

    // send mail with the OTP
    if (status === 201) {
      let {
        data: { email },
      } = await getUser({ username });
      let msg = `Your one time Password is :${code}`;
      await axios.post('/api/registerMail', {
        username,
        userEmail: email,
        text: msg,
        subject: 'Password recovery OTP',
      });
    }
    return Promise.resolve(code);
  } catch (error) {
    console.log('Error:', error);
    return Promise.reject({ error });
  }
};

/**Verify OTP */
export const verifyOTP = async ({ username, code }) => {
  try {
    const { data, status } = await axios.get('/api/verifyOTP', {
      params: { username, code },
    });
    return { data, status };
  } catch (error) {
    return Promise.reject(error);
  }
};

/**Reset Password */
export const resetPassword = async ({ username, password }) => {
  try {
    const { data, status } = await axios.put('/api/resetPassword', {
      username,
      password,
    });
    return Promise.resolve({ data, status });
  } catch (error) {
    return Promise.reject({ error });
  }
};
