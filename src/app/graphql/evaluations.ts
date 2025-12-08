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
      reportType
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
        reportType
        testIdentity {
          testId
          title
          version
        }
        testEnvironment {
          os
          browser
          device
          additionalInfo
        }
        stepsToReproduce
        actualResult
        expectedResult
        supportingEvidence {
          type
          url
          description
        }
        severityLevel
        domain
        additionalInfo
        status
        createdAt
        updatedAt
      }
      attributeScores {
        attribute
        score
        maxScore
        weight
        weightedScore
        passed
      }
      feedback {
        attribute
        message
        level
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
          reportType
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
            reportType
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


