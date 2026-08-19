import { gql } from "@apollo/client";

export const CUISINE_TILES = gql`
  query cuisineTiles {
    cuisineTiles {
      category
      label
      url
      thumb_url
      alt
      photographer
      photographer_url
      provider_url
      provider
    }
  }
`;
