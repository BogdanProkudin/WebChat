import { UserModel } from '../Models/userModel';
export const isEmailTaken = async (email: string) => {
  try {
    const user = await UserModel.findOne({ email });
    console.log(user ? true : false);
    return user ? true : false;
  } catch (error) {
    console.log(error);
    throw new Error('Error checking email availability');
  }
};

export const isUserNameTaken = async (userName: string) => {
  try {
    const user = await UserModel.findOne({ userName });
    console.log(user ? true : false);
    return user ? true : false;
  } catch (error) {
    console.log(error);
    throw new Error('Error checking userName availability');
  }
};
