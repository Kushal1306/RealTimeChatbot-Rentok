This repository contains Fullstack code for Real-Time-Chat Conversation

### Tech Stack & Frameworks Used
- **React.js**
- **Node.js**
- **Express.js**
- **MongoDB as Database**
- **Langchain**
- **Socket.io**

## How to Run Locally

To run the application locally, follow these steps:

- **1. Clone the repository:**

```
git clone https://github.com/Kushal1306/RealTimeChatbot-Rentok.git

```

- **2. Navigate to the backednd directory:**
```
cd backend
```

- **3. Install dependencies using npm:**
```
npm install
```

- **4. Navigate to the frontend directory:**
```
cd frontend
```

- **5. Install dependencies using npm:**
```
npm install
```

- **6 Set up your MongoDB database &  Update the MongoDB URI, Google Client ID, OpenAI API Key & JWT SECRET. in the .env file.**

- **5. Start both frontend & backend server:**
```
npm run dev
```
- **Now the sever will run on specified port locally**

## Explanation
- **When users log in, an authentication token stored in their browser's local storage.**
- **After logging in, users are directed to the chat page. As soon as this page loads, it establishes a webSocket connection with our backend server**
- **We chose WebSockets over regular HTTP methods because they're more efficient for real-time communication. They maintain an open connection, reducing overhead and allowing instant message exchange.**
- **Socket.io is used to handle websocket  communctions between  user and  the server**
- **Once connected, the messages from user are emitted to the socket server and it also listens to any messages from server side.**
- **Conversation chain is intialized for the users with their previous conversation history once they are connected to the server**
- **The conversation chain not only generates responses but also keeps track of the chat history. The context is taken into consideration by LLM.**
- **We use an Agent here with the help of OpenAI Functions agent & Langchain to process user queries and generate responses**
- **The agent is created using AgentExecutor from langchain lib**
- **The agent has access to tools and LLM**
- **Large Language Model is like a brain here, which decides which tool to use based on user input**
- **As of now, we have two tools, they are**
 ##### Video Recommendation tool
1. This tool searches for relevant tutorial videos based on the user's query about Rentok's features or usage
2. We store the details of the video like title and url and their URL In vector store(Memory VectorStore) with embedding(OpenAIEmbeddings) 
3. We find the most similar video
4. If theres any relevant video , it returns its details.
5. If there's video url in the response. The response is parsed. and sent to the client.
6. The video is shown using Iframe in frontend.

#### GreetingTool
1. This tool is to handle greetings like Thank you etc.


### Memory
1. We use BufferMemory also it has access to conversation history related to user (with the help of UserId). 
2. It is connected to MongoDB Database.
3. We store both Users's input and our severs response into the our Database
4. We can also limit the access to no of previous conversation here.



