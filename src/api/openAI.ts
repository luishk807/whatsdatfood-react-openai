import { InterfaceRequestAI } from "types/index";
import axios from "axios";

export async function getOpenAIResponse({
  inputText,
}: InterfaceRequestAI): Promise<any> {
  const backend_url: string | undefined = process.env
    .REACT_APP_BACKEND_URL as string;
  try {
    const response = await axios({
      method: "get",
      url: `${backend_url}/open-ai/get-menu?restaurant=${inputText}`,
    });
    console.log("heeee", response);
    return response;
  } catch (err) {
    console.log(err);
  }
}
