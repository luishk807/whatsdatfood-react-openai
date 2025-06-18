import { InterfaceRequestAI } from "types/index";
import axios from "axios";

const backend_url: string | undefined = process.env
  .REACT_APP_BACKEND_URL as string;

export async function getOpenAIResponse({
  restaurant,
  address,
}: InterfaceRequestAI): Promise<any> {
  try {
    const response = await axios({
      method: "get",
      url: `${backend_url}/open-ai/get-menu?restaurant=${restaurant}&address=${address}`,
    });
    return response;
  } catch (err) {
    console.log(err);
  }
}

export async function getOpenAIResturantList({
  restaurant,
}: InterfaceRequestAI): Promise<any> {
  try {
    const response = await axios({
      method: "get",
      url: `${backend_url}/open-ai/get-menu?restaurant=${restaurant}`,
    });
    return response;
  } catch (err) {
    console.log(err);
  }
}
