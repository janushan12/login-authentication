import { useFormik } from 'formik';
import React, { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Navigate, useNavigate } from 'react-router-dom';
import { resetPassword } from '../helper/helper';
import { resetPasswordValidation } from '../helper/validate';
import { useFetch } from '../hooks/fetchHooks';
import { useAuthStore } from '../store/store';
import styles from '../styles/username.module.css';

export default function Reset() {
  const { username } = useAuthStore((state) => state.auth);
  const navigate = useNavigate();
  const [{ isLoading, apiData, status, serverError }] =
    useFetch('createResetSession');

  useEffect(() => {
    console.log(apiData);
  });

  const formik = useFormik({
    initialValues: {
      password: '',
      confirm_pwd: '',
    },
    validate: resetPasswordValidation,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values) => {
      let resetPromise = resetPassword({ username, password: values.password });
      toast.promise(resetPromise, {
        loading: 'Resetting Password...',
        success: <b>Successfully Resetted Password</b>,
        error: <b>Failed to Reset Password</b>,
      });
      resetPromise.then(() => {
        navigate('/password');
      });
    },
  });

  if (isLoading) return <h1 className="text-2xl font-bold">isLoading</h1>;
  if (serverError)
    return <h1 className="text-xl text-red-500">{serverError.message}</h1>;
  if (status && status !== 201)
    return <Navigate to={'/password'}>replace={true}</Navigate>;

  return (
    <div className="container mx-auto">
      <Toaster position="top-center" reverseOrder={false}></Toaster>
      <div className="flex justify-center items-center h-screen">
        <div className={styles.glass} style={{ width: '50%' }}>
          <div className="title flex flex-col items-center">
            <h5 className="text-5xl font-bold">Reset</h5>
            <span className="py-4 text-xl w-2/3 text-center text-gray-500">
              Enter new password.
            </span>
          </div>
          <form className="py-20" onSubmit={formik.handleSubmit}>
            <div className="textbox flex flex-col items-center gap-6">
              <input
                {...formik.getFieldProps('password')}
                className={styles.textbox}
                type="text"
                placeholder="New Password"
              />
              <input
                {...formik.getFieldProps('confirm_pwd')}
                className={styles.textbox}
                type="text"
                placeholder="Re-Type Password"
              />
              <button className={styles.btn} type="submit">
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
