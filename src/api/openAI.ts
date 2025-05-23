import OpenAi from "openai";

interface InterfaceRequestAI {
  inputText: string;
}

const openai = new OpenAi({
  apiKey: process.env.OPENAI_KEY,
});
export async function getOpenAIResponse({
  inputText,
}: InterfaceRequestAI): Promise<any> {
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
