import { useMutation } from '@apollo/client';
import { useAuth } from '~/context/AuthContext';
import {
  CHANGE_PASSWORD,
  LOGIN_USER,
  LOGOUT_USER,
  REGISTER_USER,
  REQUEST_PASSWORD_RESET,
  RESET_PASSWORD,
  UPDATE_PROFILE,
  VERIFY_EMAIL
} from '~/graphql/auth';
import type {
  AuthPayload,
  BaseResponse,
  ChangePasswordInput,
  EmailVerificationInput,
  LoginInput,
  PasswordResetInput,
  PasswordResetRequestInput,
  RegisterInput,
  UpdateProfileInput
} from '~/types/auth';

interface LoginMutationData {
  loginUser: AuthPayload;
}

interface RegisterMutationData {
  registerUser: AuthPayload;
}

export function useLogin() {
  const { login, setError, setLoading } = useAuth();
  
  const [loginMutation, { loading, error }] = useMutation<LoginMutationData>(LOGIN_USER, {
    onCompleted: (data) => {
      const { success, message, token, user } = data.loginUser;

      if (success && token && user) {
        login(token, user);
      } else {
        setError(message || 'Login failed');
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
      setError(error.message);
    },
  });

  const loginUser = async (input: LoginInput) => {
    setLoading(true);
    try {
    
      await loginMutation({
        variables: { input }
      });
    } catch (error) {
      // Error handling is done in onError
      console.error('Login mutation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loginUser,
    loading,
    error,
  };
}

export function useRegister() {
  const { login, setError, setLoading } = useAuth();
  
  const [registerMutation, { loading, error }] = useMutation<RegisterMutationData>(REGISTER_USER, {
    onCompleted: (data) => {
      const { success, message, token, user } = data.registerUser;
      
      if (success && token && user) {
        login(token, user);
      } else {
        setError(message || 'Registration failed');
      }
    },
    onError: (error) => {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    },
  });

  const registerUser = async (input: RegisterInput) => {
    setLoading(true);
    try {
      await registerMutation({
        variables: { input }
      });
    } catch (error) {
      // Error handling is done in onError
      console.error('Registration mutation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    registerUser,
    loading,
    error,
  };
}

export function useVerifyEmail() {
  const { setError, setLoading } = useAuth();
  
  const [verifyEmailMutation, { loading, error }] = useMutation<{ verifyEmail: BaseResponse }>(VERIFY_EMAIL, {
    onCompleted: (data) => {
      const { success, message } = data.verifyEmail;
      
      if (!success) {
        setError(message || 'Email verification failed');
      }
    },
    onError: (error) => {
      console.error('Email verification error:', error);
      setError(error.message || 'Email verification failed. Please try again.');
    },
  });

  const verifyEmail = async (input: EmailVerificationInput) => {
    setLoading(true);
    try {
      const result = await verifyEmailMutation({
        variables: { input }
      });
      return result.data?.verifyEmail;
    } catch (error) {
      console.error('Email verification mutation error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    verifyEmail,
    loading,
    error,
  };
}

export function useRequestPasswordReset() {
  const { setError, setLoading } = useAuth();
  
  const [requestPasswordResetMutation, { loading, error }] = useMutation<{ requestPasswordReset: BaseResponse }>(REQUEST_PASSWORD_RESET, {
    onCompleted: (data) => {
      const { success, message } = data.requestPasswordReset;
      
      if (!success) {
        setError(message || 'Password reset request failed');
      }
    },
    onError: (error) => {
      console.error('Password reset request error:', error);
      setError(error.message || 'Password reset request failed. Please try again.');
    },
  });

  const requestPasswordReset = async (input: PasswordResetRequestInput) => {
    setLoading(true);
    try {
      const result = await requestPasswordResetMutation({
        variables: { input }
      });
      return result.data?.requestPasswordReset;
    } catch (error) {
      console.error('Password reset request mutation error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    requestPasswordReset,
    loading,
    error,
  };
}

export function useResetPassword() {
  const { setError, setLoading } = useAuth();
  
  const [resetPasswordMutation, { loading, error }] = useMutation<{ resetPassword: BaseResponse }>(RESET_PASSWORD, {
    onCompleted: (data) => {
      const { success, message } = data.resetPassword;
      
      if (!success) {
        setError(message || 'Password reset failed');
      }
    },
    onError: (error) => {
      console.error('Password reset error:', error);
      setError(error.message || 'Password reset failed. Please try again.');
    },
  });

  const resetPassword = async (input: PasswordResetInput) => {
    setLoading(true);
    try {
      const result = await resetPasswordMutation({
        variables: { input }
      });
      return result.data?.resetPassword;
    } catch (error) {
      console.error('Password reset mutation error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    resetPassword,
    loading,
    error,
  };
}

export function useUpdateProfile() {
  const { updateUser, setError, setLoading } = useAuth();

  const [updateProfileMutation, { loading, error }] = useMutation<{ updateProfile: AuthPayload }>(UPDATE_PROFILE, {
    onCompleted: (data) => {
      const { success, message, user } = data.updateProfile;
      if (success && user) {
        updateUser(user);
      } else if (!success) {
        setError(message || 'Profile update failed');
      }
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      setError(error.message || 'Profile update failed. Please try again.');
    },
  });

  const updateProfile = async (input: UpdateProfileInput) => {
    setLoading(true);
    try {
      const result = await updateProfileMutation({ variables: { input } });
      return result.data?.updateProfile;
    } catch (error) {
      console.error('Profile update mutation error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error };
}

export function useChangePassword() {
  const { setError, setLoading } = useAuth();

  const [changePasswordMutation, { loading, error }] = useMutation<{ changePassword: BaseResponse }>(CHANGE_PASSWORD, {
    onCompleted: (data) => {
      const { success, message } = data.changePassword;
      if (!success) {
        setError(message || 'Password change failed');
      }
    },
    onError: (error) => {
      console.error('Password change error:', error);
      setError(error.message || 'Password change failed. Please try again.');
    },
  });

  const changePassword = async (input: ChangePasswordInput) => {
    setLoading(true);
    try {
      const result = await changePasswordMutation({ variables: { input } });
      return result.data?.changePassword;
    } catch (error) {
      console.error('Password change mutation error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading, error };
}

export function useLogout() {
  const { logout, setLoading, token } = useAuth();
  
  const [logoutMutation, { loading, error }] = useMutation<{ logoutUser: BaseResponse }>(LOGOUT_USER, {
    onCompleted: (data) => {
      const { success } = data.logoutUser;
      
      if (success) {
        logout();
      }
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Still perform logout even if server request fails
      logout();
    },
  });

  const logoutUser = async () => {
    if (!token) {
      logout();
      return;
    }

    setLoading(true);
    try {
      await logoutMutation({
        variables: { input: { token } }
      });
    } catch (error) {
      console.error('Logout mutation error:', error);
      // Still perform logout even if mutation fails
      logout();
    } finally {
      setLoading(false);
    }
  };

  return {
    logoutUser,
    loading,
    error,
  };
}