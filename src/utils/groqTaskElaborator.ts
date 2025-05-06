import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function elaborateTaskWithGroq(task: string): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a task planning expert. Your role is to break down tasks into clear, actionable steps and provide detailed guidance.",
        },
        {
          role: "user",
          content: `Please elaborate on the following task to make it more detailed and actionable:
          Task: ${task}
          act as you are the employee who has worked on this task, and your updating the status with more details and elaboration
          Format the response in a small sentence. Keep it concise and not more than 100 words.`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    return (
      completion.choices[0]?.message?.content || "No elaboration generated"
    );
  } catch (error) {
    console.error("Error elaborating task with Groq:", error);
    throw new Error("Failed to elaborate task with Groq");
  }
}
