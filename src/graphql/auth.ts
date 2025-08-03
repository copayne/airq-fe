import { gql } from '@apollo/client';

// Fragment for user data
export const USER_FRAGMENT = gql`
  fragment UserData on UserObject {
    id
    username
    email
    firstName
    lastName
    fullName
    role
    isActive
    emailVerified
    createdAt
    updatedAt
    lastLogin
  }
`;

// Login mutation
export const LOGIN_USER = gql`
  mutation LoginUser($input: LoginInput!) {
    loginUser(input: $input) {
      success
      message
      token
      user {
        ...UserData
      }
    }
  }
  ${USER_FRAGMENT}
`;

// Register mutation
export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterInput!) {
    registerUser(input: $input) {
      success
      message
      token
      user {
        ...UserData
      }
    }
  }
  ${USER_FRAGMENT}
`;

// Get current user query
export const GET_ME = gql`
  query GetMe {
    me {
      ...UserData
    }
  }
  ${USER_FRAGMENT}
`;

// Get all users query (admin only)
export const GET_USERS = gql`
  query GetUsers {
    users {
      ...UserData
    }
  }
  ${USER_FRAGMENT}
`;

// Get user by ID query (admin only)
export const GET_USER = gql`
  query GetUser($id: Int!) {
    user(id: $id) {
      ...UserData
    }
  }
  ${USER_FRAGMENT}
`;

// Email verification mutation
export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($input: EmailVerificationInput!) {
    verifyEmail(input: $input) {
      success
      message
    }
  }
`;

// Request password reset mutation
export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($input: PasswordResetRequestInput!) {
    requestPasswordReset(input: $input) {
      success
      message
    }
  }
`;

// Reset password mutation
export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: PasswordResetInput!) {
    resetPassword(input: $input) {
      success
      message
    }
  }
`;

// Logout user mutation
export const LOGOUT_USER = gql`
  mutation LogoutUser($input: LogoutInput!) {
    logoutUser(input: $input) {
      success
      message
    }
  }
`;