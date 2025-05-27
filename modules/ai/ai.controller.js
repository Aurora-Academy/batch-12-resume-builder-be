const openai = require("../../utils/openai");
const { systemPrompt } = require("./ai.prompt");

const generateText = async ({ query }) => {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL,
      messages: [
        systemPrompt,
        {
          role: "user",
          content: query,
        },
      ],
    });
    return completion.choices[0].message;
  } catch (e) {
    console.log({ e });
    throw new Error(e);
  }
};

module.exports = { generateText };
