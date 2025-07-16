import { BACKEND_GRAPHQL_URL } from "@/customConstants";
import { _get } from "@/utils";
import { userRatingPayload } from "@/types/users";

export const addUserRating = async (
  payload: userRatingPayload,
): Promise<userRatingPayload> => {
  const query = `#graphql
        mutation addUserRating($payload: userRatingPayload) {
            addUserRating(input: $payload){
                id
                rating
            }
        }
    `;

  const resp = await fetch(`${BACKEND_GRAPHQL_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: {
        payload,
      },
    }),
  });
  const json = await resp.json();
  const data = _get(json, "data.addUserRating");

  console.log(data);
  return resp as unknown as userRatingPayload;
};
