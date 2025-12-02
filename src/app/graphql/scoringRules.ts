"use client";

import { gql } from "@apollo/client";

export const GET_SCORING_RULES = gql`
  query GetScoringRules {
    getScoringRules {
      _id
      attribute
      description
      criteria
      weight
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_SCORING_RULE = gql`
  query GetScoringRule($attribute: AttributeType!) {
    getScoringRule(attribute: $attribute) {
      _id
      attribute
      description
      criteria
      weight
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_VALIDATION_CONFIG = gql`
  query GetValidationConfig {
    getValidationConfig {
      _id
      threshold
      updatedBy {
        _id
        name
        email
      }
      updatedAt
    }
  }
`;

export const UPDATE_SCORING_RULE = gql`
  mutation UpdateScoringRule($input: UpdateScoringRuleInput!) {
    updateScoringRule(input: $input) {
      _id
      attribute
      description
      criteria
      weight
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const TOGGLE_SCORING_RULE = gql`
  mutation ToggleScoringRule($attribute: AttributeType!, $isActive: Boolean!) {
    toggleScoringRule(attribute: $attribute, isActive: $isActive) {
      _id
      attribute
      description
      criteria
      weight
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_VALIDATION_THRESHOLD = gql`
  mutation UpdateValidationThreshold($threshold: Float!) {
    updateValidationThreshold(threshold: $threshold) {
      _id
      threshold
      updatedBy {
        _id
        name
        email
      }
      updatedAt
    }
  }
`;

export const RESET_SCORING_RULES_TO_DEFAULT = gql`
  mutation ResetScoringRulesToDefault {
    resetScoringRulesToDefault {
      _id
      attribute
      description
      criteria
      weight
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_RULE_CONFIG_HISTORY = gql`
  query GetRuleConfigHistory($pagination: PaginationInput) {
    getRuleConfigHistory(pagination: $pagination) {
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
          type
          attribute
          changes
          changedBy {
            _id
            name
            email
          }
          reason
          changedAt
        }
      }
    }
  }
`;

