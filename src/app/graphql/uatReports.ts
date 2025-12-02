"use client";

import { gql } from "@apollo/client";

export const GET_UAT_REPORTS = gql`
  query GetUATReports(
    $filter: UATReportFilterInput
    $sort: UATReportSortInput
    $pagination: PaginationInput
  ) {
    getUATReports(filter: $filter, sort: $sort, pagination: $pagination) {
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
          testIdentity {
            testId
            title
            version
          }
          testEnvironment {
            os
            browser
            device
          }
          stepsToReproduce
          actualResult
          expectedResult
          severityLevel
          status
          domain
          createdBy {
            _id
            name
            email
          }
          createdAt
          updatedAt
        }
      }
    }
  }
`;

export const GET_UAT_REPORT = gql`
  query GetUATReport($id: String!) {
    getUATReport(id: $id) {
      _id
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
      status
      domain
      additionalInfo
      createdBy {
        _id
        name
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_UAT_REPORT = gql`
  mutation CreateUATReport($input: CreateUATReportInput!) {
    createUATReport(input: $input) {
      _id
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
      status
      domain
      additionalInfo
      createdBy {
        _id
        name
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_UAT_REPORT = gql`
  mutation UpdateUATReport($id: String!, $input: UpdateUATReportInput!) {
    updateUATReport(id: $id, input: $input) {
      _id
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
      status
      domain
      additionalInfo
      createdBy {
        _id
        name
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPLOAD_BATCH_REPORTS = gql`
  mutation UploadBatchReports($input: BatchUploadInput!) {
    uploadBatchReports(input: $input) {
      totalProcessed
      successful
      failed
      reports {
        _id
        testIdentity {
          testId
          title
          version
        }
        status
        createdAt
      }
      errors {
        row
        message
        data
      }
    }
  }
`;

export const DELETE_UAT_REPORT = gql`
  mutation DeleteUATReport($id: String!) {
    deleteUATReport(id: $id)
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    getDashboardStats {
      totalReports
      validReports
      invalidReports
      pendingReports
      evaluatingReports
      failedReports
      newReports
      verifyingReports
    }
  }
`;

