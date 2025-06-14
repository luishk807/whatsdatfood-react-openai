import OpenAi from "openai";
import { InterfaceRequestAI } from "types/indeex";

const openAiKey: string | undefined = process.env.REACT_APP_OPENAI;
console.log(openAiKey);
const openai = new OpenAi({
  apiKey: openAiKey,
});
export async function getOpenAIResponse({
  inputText,
}: InterfaceRequestAI): Promise<any> {
  console.log("process.env.REACT_APP_OPENAI", process.env.REACT_APP_OPENAI);
  const response = openai.responses.create({
    model: "gpt-4.1",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: inputText,
          },
        ],
      },
    ],
    text: {
      format: {
        type: "text",
      },
    },
    reasoning: {},
    tools: [],
    temperature: 1,
    max_output_tokens: 100,
    top_p: 1,
    store: true,
  });
  return response;
}
