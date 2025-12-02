"use client";

import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query GetUsers($filter: UserFilterInput, $pagination: PaginationInput) {
    users(filter: $filter, pagination: $pagination) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          _id
          email
          name
          role
          createdAt
          updatedAt
        }
      }
    }
  }
`;

export const REGISTER_USER = gql`
  mutation Register($input: RegisterUserInput!) {
    register(input: $input) {
      _id
      email
      name
      role
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: String!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      _id
      email
      name
      role
      createdAt
      updatedAt
    }
  }
`;



