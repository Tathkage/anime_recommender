export interface UserLoginData {
    email: string;
    password: string;
}
  
export interface UserSignupData {
    username: string;
    email: string;
    password: string;
}

export interface User {
    username: string;
    email: string;
}
  
export interface UpdateUserData {
    username?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
}