import { ChatOpenAI } from '@langchain/openai';
import { ConversationChain } from 'langchain/chains';
import { MongoDBChatMessageHistory } from '@langchain/mongodb';
import { BufferMemory } from 'langchain/memory';
import { DynamicTool } from '@langchain/core/tools';
import { ChatPromptTemplate, MessagesPlaceholder, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling";
import { RunnableSequence } from "@langchain/core/runnables";
import { AgentExecutor } from "langchain/agents";
import { formatToOpenAIFunctionMessages } from "langchain/agents/format_scratchpad";
import { OpenAIFunctionsAgentOutputParser } from "langchain/agents/openai/output_parser";
import ConversationModel from '../models/ChatHistory.js';
import Complaints from '../models/Complaints.js';
import {OpenAIEmbeddings} from '@langchain/openai';
import {MemoryVectorStore} from 'langchain/vectorstores/memory';
import { Document } from 'langchain/document';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;


const videos = [
    {
        "title": "How to apply New filters in the Room Section.",
        "url": "https://www.youtube.com/embed/i_KntMuCjoc"
    },
    {
        "title": "How to activate short term stay management in your properties",
        "url": "https://www.youtube.com/embed/AfZ7WTdZ2Z0?si=zbQbsyQsHoY0nl6e"
    },
    {
        "title": "How to make e-stamp agreement on rentOk app | 100% legal agreement",
        "url": "https://www.youtube.com/embed/ag8lvwF0Hcw?si=ckX_fdaRFRJBawqs"
    },
    {
        "title": "How to delete a collection entry",
        "url": "https://www.youtube.com/embed/gEOqgb8MNfc?si=fx3Ov9UfxRC1wrPM"
    },
    {
        "title": "How to edit unpaid due of a tenant on Rentok app",
        "url": "https://www.youtube.com/embed/XV5QA0Vo24g?si=6m9ZWdM5LbnIWNbV"
    },
    {
        "title": "How to check and receive tenant's pending due on Rentok app",
        "url": "https://www.youtube.com/embed/GFTQG2mOKbA?si=fJDVhLCdadiENHn4"
    },
    {
        "title": "How to add dues in Tenants accounts from Rentok App",
        "url": "https://www.youtube.com/embed/5La8ianPazU?si=UdFA3jWNTHnhvqRO"
    },
    {
        "title": "How to upload tenants document manually",
        "url": "https://www.youtube.com/embed/I6ZcpbvUlso?si=H0ADB-cFRf7RHI-c"
    },
    {
        "title": "How to evict a tenant from your property",
        "url": "https://www.youtube.com/embed/k0_YfBG1A58?si=ARgbT1kzhuT9yE7h"
    },
    {
        "title": "How to add security deposit in account",
        "url": "https://www.youtube.com/embed/pZ-JZiKaZBE?si=PJY9AHy3vycoS5fj"
    },
    {
        "title": "How to shift tenant from one property to another",
        "url": "https://www.youtube.com/embed/6q1wTC9gqaI?si=Lx8RTw2hTVfsVphj"
    },
    {
        "title": "How to delete a due from tenant's account",
        "url": "https://www.youtube.com/embed/UAkfj39HXhM?si=hiYn0twSBhv1xzz2"
    },
    {
        "title": "How to receive an unpaid due on Rentok",
        "url": "https://www.youtube.com/embed/II6dfhdVZ2Y?si=j33ELnyIctL4C6yS"
    },
    {
        "title": "How to change a tenant's room",
        "url": "https://www.youtube.com/embed/ZJgW8IYQwSs?si=EGv7imSBbzBUHi82"
    },
    {
        "title": "How to increase or decrease a security deposit",
        "url": "https://www.youtube.com/embed/gm4DB-ZNagU"
    },
    {
        "title": "How to edit an invoice or due",
        "url": "https://www.youtube.com/embed/ciwiCtCH2uw?si=51AKdE8asPiK70qA"
    },
    {
        "title": "How to view all your dues",
        "url": "https://www.youtube.com/embed/59vea8F6TxY?si=-qVE-bxvIAHO_63m"
    },
    {
        "title": "How to receive a partial payment",
        "url":"https://www.youtube.com/embed/amsRS3qLjOs?si=Z1dp1XlKl2OCIKKu"
    },
    {
        "title": "How to navigate in Rentok's home screen",
        "url": "https://www.youtube.com/embed/lMdSxIBWzBA?si=TgK0pAygwc2sR0Os"
    },
    {
        "title": "Demo of Rentok app",
        "url": "https://www.youtube.com/embed/YL3oe4ahh2M?si=gUq6w9gjnuyJSNv7"
    },
    {
        "title": "How to edit multiple rooms",
        "url": "https://www.youtube.com/embed/Kql48cSGcrg?si=HJwc7l-JFAECwjy9"
    }
];


const vectorStore = await MemoryVectorStore.fromDocuments(
    videos.map(video => new Document({ pageContent: video.title, metadata: { url: video.url } })),
    new OpenAIEmbeddings()
);
async function getVideoRecommendation(query) {
    const results = await vectorStore.similaritySearch(query, 1);
    console.log(results);
    if (results.length > 0) {
      const video = results[0];
      return {
        title: video.pageContent,
        url: video.metadata.url
      };
    }
    return null;
  }
  

// Tools
const tools = [
    new DynamicTool({
        name: 'GetVideoRecommendation',
        description: "Use this to get a video recommendation based on the user's query about Rentok features or usage. Returns null if no relevant video is found.",
        func: async (input) => {
          const recommendation = await getVideoRecommendation(input);
          return JSON.stringify(recommendation);
        },
    }),
    new DynamicTool({
        name: 'GreetingAndThanking',
        description: "Use this function ONLY for greetings, farewells, or thanks. Input: either greet the user or thank them based on input",
        func: async (input) => {
          return `Answer them based on ${input}`;
        }
    }),

];

// Model
const model = new ChatOpenAI({
  openAIApiKey: OPENAI_API_KEY,
  model:'gpt-3.5-turbo',
  temperature: 0.2
});

//Promopt Template
const prompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(
        `You are Rentok, an AI assistant.You answer user queries. You assist users on Issues related to Rentok. Follow these guidelines strictly:
        1. Always check for greetings or thanks first using the GreetingAndThanking tool.
        2. If it's not a greeting/thanks and the user asks for guidance or instructions, use the GetVideoRecommendation tool.
           - Donot provide url by your own. Only provide if theres match in recommendation tool
           - Please donot modify url
           - If a video is found, respond with the text provided by the tool, followed by the URL on a new line.
           - If no video is found, provide a general response about how you can help.
        3. For all other queries about Rentok just ask further
        4. Provide concise, friendly responses.
        5. If a tool returns null, fallback to the next appropriate tool or provide a general response syaing how can i help you.
         6. DO NOT mention or offer services related to complaints, tracking issues, or updating statuses unless explicitly added to your capabilities.
        7. Stick strictly to the capabilities provided by your tools and this prompt. Do not invent or assume additional functionalities.
        `
      ),
      new MessagesPlaceholder("chat_history"),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
      new MessagesPlaceholder("agent_scratchpad"),
]);

// Model with functions
const modelWithFunctions = model.bind({
  functions: tools.map((tool) => convertToOpenAIFunction(tool)),
});

// Runnable agent
const runnableAgent = RunnableSequence.from([
  {
    input: (i) => i.input,
    chat_history: (i) => i.chat_history,
    agent_scratchpad: (i) => formatToOpenAIFunctionMessages(i.steps),
  },
  prompt,
  modelWithFunctions,
  new OpenAIFunctionsAgentOutputParser(),
]);

// Agent executor
export const executor = AgentExecutor.fromAgentAndTools({
  agent: runnableAgent,
  tools,
  verbose: true,
});

// Function to create a conversation chain for a user
export const createConversationChain = (userId) => {
  const messageHistory = new MongoDBChatMessageHistory({
    collection: ConversationModel,
    sessionId: userId,
  });

  const memory = new BufferMemory({
    chatHistory: messageHistory,
    returnMessages: true,
    memoryKey: 'chat_history',
    inputKey: 'input',
    outputKey: 'output',
    memorySize: 1,
  });

  return new ConversationChain({
    llm: model,
    memory: memory,
    prompt: prompt,
  });
};