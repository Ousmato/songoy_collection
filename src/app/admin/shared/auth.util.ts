import { LoginResponseDto } from "../model/admin.model";

  //get user from session storage
export function getUserFromSessionStorage():
  LoginResponseDto | null {

  if (typeof window === 'undefined') {
    return null;
  }

  const user = sessionStorage.getItem('user');

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as LoginResponseDto;
  } catch {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    return null;
  }
}