import { FieldErrors } from 'react-hook-form/dist/types/errors';
import email from '../icons/email.png';
import { useAppSelector } from '../../redux/hooks';
import './Registration.scss';
import { RootState } from '../../redux/store';
export interface IRegisterInput {
  register: any;
  errors: FieldErrors;
}

const RegisterEmailInput: React.FC<IRegisterInput> = ({ register, errors }) => {
  const BackError = useAppSelector((state: RootState) => state.auth.RegisterError?.emailError);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const nothing: any = '';

  return (
    <>
      <img className="EmailRegisterPhoto" src={email} />
      <input
        {...register('email', {
          required: 'Поле должно быть заполнено',
          pattern: {
            value: emailRegex,
            message: 'Некорректный email'
          }
        })}
        className="Registr-email-input"
        placeholder={'email'}
      />
      {errors.email?.message && (
        <span className="wrongEmail">{errors ? errors.email.message : nothing}</span>
      )}
      {BackError && BackError !== 'UserName already taken' ? (
        <span className="wrongEmail">{BackError}</span>
      ) : (
        ''
      )}
    </>
  );
};
export default RegisterEmailInput;
