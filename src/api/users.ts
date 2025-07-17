import { BACKEND_GRAPHQL_URL } from "@/customConstants";
import { _get } from "@/utils";
import { userRatingPayload, CreateUserInputType } from "@/types/users";

export const addUser = async (
  payload: CreateUserInputType,
): Promise<CreateUserInputType> => {
  const query = `#graphql
    mutation addUser($payload: CreateUserInput!) {
      addUser(input: $payload) {
        first_name
        last_name
        phone
        email
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
  const data = _get(json, "data.addUser");
  console.log("data", data);

  return resp as unknown as CreateUserInputType;
};
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
