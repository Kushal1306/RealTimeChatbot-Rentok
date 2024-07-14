This repository contains code for the Real-Time Chat Application, which involves the use of Socket.io and agents. The application answers the user query. It also recommends video if required based on the question asked.

Frontend Url: https://chatbot-rentok-rtc.vercel.app
Backend Url: https://realtimechatbot-rentok.onrender.com

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

### Sequence Flow

![alt text](<Untitled diagram-2024-07-14-004021.png>)


### Database Shcemas

#### Users Shcema

````userName:{type:String, required:true, unique:true},
    password:{type:String},
    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    googleId:{
        type:String
    },
    picture: { 
        type: String
    }
````

####    Conversation Schema/chat History

```
sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [chatMessageSchema]
````
````
  where ChatMessage is

   type: {
    type: String,
    required: true,
    enum: ['human', 'ai']
  },
  data: {
    content: {
      type: String,
      required: true
    },
    additional_kwargs: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
````

## API Endpoints

## Users

### Post a User (Signup)
- **Endpoint**: `/user/signup`
- **Request Body** 
````
{
    "firstName":"Kushal",
    "lastName":"Kushal"
    "email":"kalakushal.jain@gmail.com",
    "password":"kushal@789"
}
````
- **Response**
````
{
    "message": "User Signed Up Succesfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Njc3ZTNjYWJiN2JmMzY3YTNkMzkxNzUiLCJyb2xlIjoidXNlciIsImlhdCI6MTcxOTMxNzY2NSwiZXhwIjoxNzIxOTA5NjY1fQ.PHNOy-Cfeyx8U3t2pLXoMv_X3ONwB57iKZ1C8g_aOLA"
}
````
### Post a User (Signin)/
- **Endpoint**: `/user/signin`
- **Request Body** 
```` json object
{
    "email":"kalakushal.jain@gmail.com",
    "password":"kushal@789"
}
````
- **Response**
````
{
    "message": "User Signedin Succesfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Njc3ZTNjYWJiN2JmMzY3YTNkMzkxNzUiLCJyb2xlIjoidXNlciIsImlhdCI6MTcxOTMxNzY2NSwiZXhwIjoxNzIxOTA5NjY1fQ.PHNOy-Cfeyx8U3t2pLXoMv_X3ONwB57iKZ1C8g_aOLA"
}
````

### Below are endpoints related to Socket Server: sending & receiving messages

### For  Initial Handshake (GET)
- **Endpoint**: `/socket.io/?EIO=4&transport=polling`

- **Response**
````
{
    "sid":"D6hjdG2n_faEcDoLAAAE",
    "upgrades":["websocket"],
    "pingInterval":25000,
    "pingTimeout":20000,
    "maxPayload":1000000
}
````

### Authentication (Post)
- **Endpoint**: `/socket.io/?EIO=4&transport=polling sid=<SESSION_ID>`
- **Request Body** 
```` json object
42["auth",{"token":"your_auth_token_here"}]
````
- **Response**
````
{
    "OK"
}
````

### Send a message (Post)
- **Endpoint**: `/socket.io/?EIO=4&transport=polling&sid=<SESSION_ID>
`
- **Request Body** 
```` json object
42[
    "sendMessage",{"text":"Hii"}
]
````
- **Response**
````
"OK"
````

### Receive Message (GET)
- **Endpoint**: `/socket.io/?EIO=4&transport=polling&sid=<SESSION_ID>`

- **Response**
````
42["newMessage",{"text":"How can i assist you?","timestamp":1625097600000}]

````

## Deployment:
-**Frontend Is deployed on vercel**
-**Backend is deployed on render as vercel doesnt support socket.io applications properly**

### Instructions to deploy
-**On Both Platforms Connect the platform to our Git Repository
and we should select a respository and path required**
-**The application will deployed after filling necessarly commands like build and start**
-**we also need to fill .env's**
-**Our application will be deployed and also will be rebuilt
if there are any changes in our repository**


### Topics Explored
1. WebSockets (socket.io)
2. Agent & tools


## Refferences
1.Creating Custom Agents: https://js.langchain.com/v0.1/docs/modules/agents/how_to/custom_agent/

2. https://python.langchain.com/v0.2/docs/integrations/memory/mongodb_chat_message_history/

