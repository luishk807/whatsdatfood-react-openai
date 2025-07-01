import { RequestAIInterface } from "interfaces";
import axios from "axios";

import { BACKEND_URL } from "customConstants";
export async function getOpenAIResponse({
  restaurant,
  address,
}: RequestAIInterface): Promise<any> {
  try {
    const response = await axios({
      method: "get",
      url: `${BACKEND_URL}/open-ai/get-menu?restaurant=${restaurant}&address=${address}`,
    });
    return response;
  } catch (err) {
    console.log(err);
  }
}

export async function getOpenAIResturantList({
  restaurant,
}: RequestAIInterface): Promise<any> {
  try {
    const response = await axios({
      method: "get",
      url: `${BACKEND_URL}/open-ai/get-menu?restaurant=${restaurant}`,
    });
    return response;
  } catch (err) {
    console.log(err);
  }
}
