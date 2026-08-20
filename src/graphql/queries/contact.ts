import { gql } from "@apollo/client";

/**
 * Writing to us.
 *
 * `contactAvailable` is asked before the form is drawn so the page can offer
 * an address instead of a control that fails on submit — the same rule as the
 * map with no token.
 */
export const CONTACT_AVAILABLE = gql`
  query contactAvailable {
    contactAvailable
  }
`;

export const SEND_CONTACT_MESSAGE = gql`
  mutation sendContactMessage($input: ContactMessageInput!) {
    sendContactMessage(input: $input)
  }
`;
