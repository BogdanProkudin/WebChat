import Welcome from './Welcome';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';

import { Link } from 'react-router-dom';
import axios from 'axios';
import user from '../icons/user.png';
import { useForm, SubmitHandler, UseFormHandleSubmit } from 'react-hook-form';
import './Registration.scss';
import RegisterPasswordInput from './RegisterPasswordInput';
import RegisterButton from './RegisterButton';
import RegisterEmailInput from './RegisterEmailInput';
import RegisterUserInput from './RegisterUserInput';
import { fetchUserData } from '../../redux/slices/Auth';
import { useNavigate } from 'react-router-dom';
export type Inputs = {
  example: string;
  email: string;
};

const Registration: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,

    formState: { errors }
  } = useForm<Inputs>({ mode: 'onBlur' });
  const onSubmit: SubmitHandler<Record<string, any>> = async data => {
    console.log(data);

    const response = await dispatch(fetchUserData(data));

    if (response.meta.requestStatus !== 'rejected') {
      localStorage.setItem('CurrentUser', JSON.stringify(data));
      navigate('/Registration/ProfileImage');
    }
  };

  const token = localStorage.getItem('token');
  console.log(token, 'Register');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="bg-color">
        <div className="Register-window">
          <div className="row">
            <Welcome />

            <div>
              <RegisterEmailInput errors={errors} register={register} />
            </div>

            <div>
              <RegisterUserInput register={register} errors={errors} />
            </div>

            <div>
              <RegisterPasswordInput register={register} errors={errors} />
            </div>

            <RegisterButton
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              type="submit"
              errors={errors}
            />

            <span className="registerText">
              Already have an account?
              <Link className="SignUpLink" to={'/SignUp'}>
                <span>Sign in</span>
              </Link>
            </span>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Registration;
