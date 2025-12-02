"use client";

import { gql } from "@apollo/client";

export const EVALUATE_REPORT = gql`
  mutation EvaluateReport($id: String!) {
    evaluateReport(id: $id) {
      _id
      reportId
      totalScore
      scorePercentage
      validationStatus
      evaluatedAt
    }
  }
`;

export const EVALUATE_BATCH_REPORTS = gql`
  mutation EvaluateBatchReports($ids: [String!]!) {
    evaluateBatchReports(ids: $ids) {
      _id
      reportId
      totalScore
      scorePercentage
      validationStatus
      evaluatedAt
    }
  }
`;

export const GET_EVALUATION = gql`
  query GetEvaluation($reportId: String!) {
    getEvaluation(reportId: $reportId) {
      _id
      reportId
      totalScore
      maxScore
      scorePercentage
      validationStatus
      evaluatedAt
      evaluatedBy {
        _id
        name
        email
      }
      report {
        _id
        testIdentity {
          testId
          title
          version
        }
        severityLevel
      }
    }
  }
`;

export const GET_EVALUATION_HISTORY = gql`
  query GetEvaluationHistory(
    $reportId: String!
    $pagination: PaginationInput
  ) {
    getEvaluationHistory(reportId: $reportId, pagination: $pagination) {
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
          reportId
          totalScore
          maxScore
          scorePercentage
          validationStatus
          evaluatedAt
          evaluatedBy {
            _id
            name
            email
          }
          report {
            _id
            testIdentity {
              testId
              title
              version
            }
            severityLevel
          }
        }
      }
    }
  }
`;


