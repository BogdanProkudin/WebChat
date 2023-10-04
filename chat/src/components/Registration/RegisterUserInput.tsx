import user from '../icons/user.png';
import { IRegisterInput } from './RegisterEmailInput';
import { useAppSelector } from '../../redux/hooks';
import { RootState } from '../../redux/store';
const RegisterUserInput: React.FC<IRegisterInput> = ({ register, errors }) => {
  const usernameRegex: RegExp = /^[a-zA-Z0-9][a-zA-Z0-9_]{3,24}$/;
  const nothing: any = '';
  const BackError = useAppSelector((state: RootState) => state.auth.RegisterError?.userNameError);
  console.log(BackError, 'User');

  return (
    <div>
      <img className="userPhoto" src={user} />
      <input
        {...register('userName', {
          required: 'Поле должно быть заполнено',
          pattern: {
            value: usernameRegex,
            message: 'Некорректный UserName'
          }
        })}
        className="Registr-email-input"
        placeholder={'user'}
      />

      {errors.userName?.message && (
        <span className="wrongUserName">{errors ? errors.userName.message : nothing}</span>
      )}
      {BackError && BackError !== 'Email already taken' ? (
        <span className="wrongUserName">{BackError}</span>
      ) : (
        ''
      )}
    </div>
  );
};
export default RegisterUserInput;
