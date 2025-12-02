"use client";

import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        _id
        email
        name
        role
        createdAt
        updatedAt
      }
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      _id
      email
      name
      role
      createdAt
      updatedAt
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($token: String!) {
    refreshToken(token: $token) {
      accessToken
      refreshToken
      user {
        _id
        email
        name
        role
        createdAt
        updatedAt
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const PUBLIC_REGISTER_MUTATION = gql`
  mutation PublicRegister($input: PublicRegisterInput!) {
    publicRegister(input: $input) {
      accessToken
      refreshToken
      user {
        _id
        email
        name
        role
        createdAt
        updatedAt
      }
    }
  }
`;


