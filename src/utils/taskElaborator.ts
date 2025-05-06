import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function elaborateTask(task: string): Promise<string> {
  try {
    const prompt = `Please elaborate on the following task to make it more detailed and actionable:
    Title: ${task}
    
    Please provide a detailed breakdown of:
    1. Specific steps to complete the task
    2. Required resources or dependencies
    3. Potential challenges and solutions
    4. Success criteria
    
    Format the response in a clear, structured way. not more than 100 words`;

    const params: Anthropic.MessageCreateParams = {
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
      model: "claude-3-sonnet-20240229",
    };

    const message: Anthropic.Message = await client.messages.create(params);
    const content = message.content[0];
    if ("text" in content) {
      return content.text;
    }
    throw new Error("Unexpected response format from API");
  } catch (error) {
    console.error("Error elaborating task:", error);
    throw new Error("Failed to elaborate task");
  }
}
