import Welcome from '../Registration/Welcome';
import Input from './Input';
import { editUser } from '../../redux/slices/AddUser';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import PasswordInput from './PasswordInput';
import email from '../icons/email.png';
import lock from '../icons/lock.png';
import SignButton from './SignButton';
import './SignUp.scss';

import { Link } from 'react-router-dom';
import SignUpWelcome from './WelcomeSignUp';
import { useState } from 'react';
import { userLogin } from '../../redux/slices/Auth';
import { useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Inputs } from '../Registration/Registration';
type UserDataProps = {
  email: string;
  password: string;
};

const Sign: React.FC = ({}) => {
  const dispatch = useAppDispatch();
  const [LoginError, setLoginError] = useState<string | undefined>('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm<UserDataProps>({ mode: 'onBlur' });
  const onSubmit: SubmitHandler<Record<string, string>> = async data => {
    const response = await dispatch(userLogin(data));

    //сообщение об ошибке
    if (response.payload?.message === 'Неверная почта или пароль') {
      setLoginError(response.payload?.message);
    }
    //если токен был получен
    if (response.payload?.token !== undefined) {
      setLoginError('');
      console.log(response.payload.user, 'LLLOLLL');

      localStorage.setItem('CurrentUser', JSON.stringify(response.payload.user));

      navigate('/Chat');
    }
    //если токен не был получен
    if (response.payload?.token === undefined) {
      localStorage.removeItem('token');
    }
  };

  console.log(token, 'SignUp');

  return (
    <div className="bg-color">
      <div className="window">
        <div className="Signrow">
          <SignUpWelcome />
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="InputParents">
              <img className="emailPhoto" src={email} />
              <Input register={register} errors={errors} placeholder="email address" />
              <img className="lock-Image" src={lock} />
              <PasswordInput register={register} errors={errors} />
            </div>
            {LoginError && <span className="SignUpBackError">{LoginError}</span>}
            <SignButton />
            <span className="SignUpText">
              Register here?
              <Link className="SignUpLink" to={'/registration'}>
                <span>Sign Up</span>
              </Link>
            </span>
          </form>
        </div>
      </div>
    </div>
  );
};

export { Sign };
