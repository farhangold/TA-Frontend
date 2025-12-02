"use client";

import { gql } from "@apollo/client";

export const GET_AUDIT_LOGS = gql`
  query GetAuditLogs($filter: AuditLogFilterInput, $pagination: PaginationInput) {
    getAuditLogs(filter: $filter, pagination: $pagination) {
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
          user {
            _id
            name
            email
          }
          action
          entity
          entityId
          changes
          ipAddress
          userAgent
          timestamp
        }
      }
    }
  }
`;



