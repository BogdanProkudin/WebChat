import { ChangeEventHandler, Dispatch, SetStateAction } from 'react';
import { FieldErrors, SubmitHandler, useForm } from 'react-hook-form';
import { useAppSelector } from '../../redux/hooks';
type InputProps = {
  placeholder: string;
  register: any;
  errors: FieldErrors;
};
type Inputs = {
  example: string;
  email: string;
};

const Input: React.FC<InputProps> = ({ placeholder, register, errors }) => {
  return (
    <div>
      <input
        {...register('email', {
          required: 'Поле должно быть заполнено'
        })}
        className="email-input"
        placeholder={placeholder}
      />
    </div>
  );
};

export default Input;
