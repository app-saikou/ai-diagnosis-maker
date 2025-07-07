import OpenAI from "openai";
import { Quiz, QuizQuestion, QuizResult } from "../types";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Helper function to clean markdown code blocks from response
const cleanJsonResponse = (response: string): string => {
  // Remove markdown code block markers and any language specifiers
  return response.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
};

export const aiService = {
  getRandomTitle: (language: string = "en"): string => {
    const titles = {
      en: [
        "Why do I always put things off?",
        "What kind of people do I naturally get along with?",
        "How do I act when I'm stressed?",
        "What's my hidden strength that I don't even notice?",
        "How can I make the most of my weekends?",
        "Why do I feel stuck sometimes, and how can I get out of it?",
        "What kind of compliments make me happiest?",
        "How do I usually handle conflicts?",
        "What do I need to feel more confident?",
        "What's my natural decision-making style?",
        "How do I recharge after a long week?",
        "What kind of work environment suits me best?",
        "What's holding me back from chasing my dreams?",
        "What small change could make my life easier?",
        "What motivates me when I'm feeling lazy?",
      ],
      ja: [
        "なんで私はいつも先延ばししちゃうんだろう？",
        "私が自然と仲良くなれる人ってどんな人？",
        "私ってストレスがたまるとどんな行動をする？",
        "私が気づいてない強みってなんだろう？",
        "私にとって最高の休日の過ごし方は？",
        "なんで私ってたまに行き詰まっちゃうんだろう？",
        "どんな言葉をかけられると一番嬉しい？",
        "私ってケンカした時どんなタイプ？",
        "私がもっと自信を持つにはどうしたらいい？",
        "私の決断のクセってどんな感じ？",
        "私が忙しい1週間の後、リフレッシュする方法は？",
        "私に合う働きやすい職場の雰囲気は？",
        "私が夢に向かえない理由って何だろう？",
        "私の毎日がちょっと楽になる方法って？",
        "私がダラダラしちゃう時にやる気が出るコツは？",
      ],
    };

    const availableTitles =
      titles[language as keyof typeof titles] || titles.en;
    return availableTitles[Math.floor(Math.random() * availableTitles.length)];
  },

  generateQuiz: async (title: string, questionCount: number): Promise<Quiz> => {
    const isJapanese =
      /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(
        title
      );
    const language = isJapanese ? "ja" : "en";

    // Generate only questions and options
    const questionsPrompt = isJapanese
      ? `相談内容「${title}」を解決するのに、ぴったりな雑談っぽくカジュアルな質問と“選びたくなるような”リアルで具体的な選択肢を${questionCount}問作ってください。
        - 選択肢には、先頭に最適な絵文字を1つ付けて、半角スペースを開けてから本文を書いてください。
        - 質問も選択肢も、友達との会話みたいに自然で、肩の力が抜けたカジュアルな言葉でお願いします。
        - 無理にフォーマルな表現は使わず、普段しゃべるみたいな口調を意識してください。
        - 必ず以下のJSON形式で返してください（余計な文章はいりません）：
        {
          "questions": [
            {
              "text": "質問文",
              "options": [
                { "text": "選択肢1" },
                { "text": "選択肢2" },
                { "text": "選択肢3" },
                { "text": "選択肢4" }
              ]
            }
          ]
        }`
      : `Write ${questionCount} questions and answer options for a personality quiz called "${title}".
        - Make both the questions and options sound casual, just like a natural conversation between friends.
        - Don't use formal or textbook English—use relaxed, modern language, as if chatting in real life.
        - Each set of options should capture different personalities or everyday "relatable" habits.
        - Return ONLY in this exact JSON format (no extra text):
        {
          "questions": [
            {
              "text": "Question text",
              "options": [
                { "text": "Option 1" },
                { "text": "Option 2" },
                { "text": "Option 3" },
                { "text": "Option 4" }
              ]
            }
          ]
        }`;

    try {
      // Generate questions and options
      const questionsCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: isJapanese
              ? "あなたは相談内容に対しての質問と選択肢を作成するAIアシスタントです。ユーザーの性格や行動パターンを分析するための質問と選択肢を作成できます。"
              : "You are an AI assistant that creates personality quizzes. You can create questions and options that analyze users' personalities and behavior patterns.",
          },
          { role: "user", content: questionsPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const questionsResponse =
        questionsCompletion.choices[0]?.message?.content;

      if (!questionsResponse) {
        throw new Error("Failed to generate quiz content");
      }

      const parsedQuestions = JSON.parse(cleanJsonResponse(questionsResponse));

      // Generate questions with options and temporary points
      const questions = parsedQuestions.questions.map((question: any) => ({
        id: crypto.randomUUID(),
        text: question.text,
        options: question.options.map((option: any) => ({
          id: crypto.randomUUID(),
          text: option.text,
          points: {}, // Points will be assigned when generating results
        })),
      }));

      return {
        id: crypto.randomUUID(),
        title,
        description: isJapanese
          ? `${title}の答えを見つけましょう！`
          : `Find out ${title.toLowerCase()} with this AI-generated personality quiz!`,
        createdAt: new Date().toISOString(),
        createdBy: "user",
        tags: ["ai-generated", "personality"],
        questions,
        results: [], // Results will be generated later
        completions: 0,
        likes: 0,
      };
    } catch (error) {
      console.error("Error generating quiz:", error);
      throw new Error(
        isJapanese
          ? "質問の生成中にエラーが発生しました"
          : "Error generating quiz"
      );
    }
  },

  generateResults: async (
    title: string,
    questions: QuizQuestion[],
    answers: Record<string, string>
  ): Promise<QuizResult[]> => {
    const isJapanese =
      /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(
        title
      );

    // Create a summary of user's answers
    const answerSummary = questions.map((q) => {
      const selectedOption = q.options.find((o) => o.id === answers[q.id]);
      return {
        question: q.text,
        answer: selectedOption?.text || "未回答",
      };
    });

    const resultsPrompt = isJapanese
      ? `ユーザーは「${title}」という相談をしています。その相談に対しての質問にユーザーは以下のように回答しました：

      ユーザーの回答内容：
      ${answerSummary
        .map((a) => `質問：${a.question}\n回答：${a.answer}`)
        .join("\n\n")}

この回答をもとに、今のユーザーの状態・傾向を読み取って、寄り添うような具体的な"答え"や"提案"を1つだけ返してください。
      【相談結果の指針】
      - 必ず「title（結果タイトル）」と「description（説明文）」の両方を含めてください。
      - タイトルでは、回答から読み取れる傾向を踏まえて、「今のあなたにはこういう考えや選択もアリかも」という形を一言で提案してください。
      - 友達との会話みたいに自然で、肩の力が抜けたカジュアルな言葉でお願いします。
      - 無理にフォーマルな表現は使わず、普段しゃべるみたいな口調を意識してください。
      - 回答で選ばれた選択肢をそのまま繰り返すのではなく、そこから性格や傾向を読み取ったうえで、言い換えたり深読みしたりして解釈してください。
      - できれば、具体例(例：時間・タイミング、行動、食べ物・モノ、地名・場所)を出してください。(該当する相談の場合)
      - ユーザーの具体的なアクションにつながるアドバイスをしてください。
      以下のJSON形式で返してください：
      {
        "results": [
          {
            "title": "結果タイトル",
            "description": "説明文"
          }
        ]
      }`
      : `Generate a result for the quiz titled "${title}".  
        Analyze the user's answers below and create the most suitable result:
        
        Answers:
        ${answerSummary
          .map((a) => `Question: ${a.question}\nAnswer: ${a.answer}`)
          .join("\n\n")}
        
        The result should include:
        - Make sure to always include both the "title" and "description" fields in each result.
        - A friendly and slightly humorous title and description, as if it's an encouraging message or a compliment from a good friend.
        - Personality traits and behavioral patterns reflected in the answers.
        - Everyday "relatable" situations or habits typical of this result type.
        - A short, positive piece of advice or encouragement.
        
        Return the result ONLY in the following JSON format:
        {
          "results": [
            {
              "title": "Result title",
              "description": "Description"
            }
          ]
        }`;

    try {
      const resultsCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: isJapanese
              ? "あなたは相談内容に対しての結果を生成するAIアシスタントです。ユーザーの回答を分析して、パーソナライズされた洞察とアドバイスを提供します。"
              : "You are an AI assistant that generates personality quiz results. You analyze user responses to provide personalized insights and advice.",
          },
          { role: "user", content: resultsPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const resultsResponse = resultsCompletion.choices[0]?.message?.content;

      if (!resultsResponse) {
        throw new Error("Failed to generate quiz results");
      }

      const parsedResults = JSON.parse(cleanJsonResponse(resultsResponse));

      return parsedResults.results.map((result: any) => ({
        id: crypto.randomUUID(),
        title: result.title,
        description: result.description,
        imageUrl: null, // 動的に生成されるためnullに設定
      }));
    } catch (error) {
      console.error("Error generating results:", error);
      throw new Error(
        isJapanese
          ? "相談結果の生成中にエラーが発生しました"
          : "Error generating quiz results"
      );
    }
  },
};
