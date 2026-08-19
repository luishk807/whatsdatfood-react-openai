import { gql } from "@apollo/client";

/**
 * What the paid services cost. Admin only — it reports spend and caller
 * hashes, and the hit rate would tell a stranger how thin the catalogue is.
 */
export const API_USAGE = gql`
  query apiUsage {
    apiUsage {
      today {
        by_operation {
          provider
          operation
          count
          cost_usd
        }
        by_model {
          model
          count
          cost_usd
        }
        total_cost_usd
        searches
        searches_served_locally
        local_hit_rate
      }
      this_month {
        by_operation {
          provider
          operation
          count
          cost_usd
        }
        by_model {
          model
          count
          cost_usd
        }
        total_cost_usd
        searches
        searches_served_locally
        local_hit_rate
      }
      heaviest_callers {
        user_id
        caller
        count
        cost_usd
      }
    }
  }
`;
