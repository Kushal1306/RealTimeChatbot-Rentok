import React, { useState, useEffect, useRef } from 'react';
import { User, Send, Speech } from 'lucide-react';
import rentok from '../assets/rentok.jpg'
import { io } from 'socket.io-client';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [listening, setListening] = useState(false);
  const [Loading,setLoading]=useState(false);
  const chatContainer = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    socket.current = io('http://localhost:3000', {
      auth: {
        token: token,
      },
    });

    socket.current.on('receiveMessage', (message) => {
      console.log("the received message is:", message);
      let formattedMessage;

      if (message.type === 'text') {
        formattedMessage = { 
          user: 'Bot', 
          type: 'text', 
          text: message.text 
        };
      } else if (message.type === 'video') {
        formattedMessage = { 
          user: 'Bot', 
          type: 'video', 
          title: message.title, 
          url: message.url 
        };
      } else {
        formattedMessage = { 
          user: 'Bot', 
          type: 'text', 
          text: 'Unsupported message type' 
        };
      }
      setLoading(false);
      setMessages(prevMessages => [...prevMessages, formattedMessage]);
    });

    socket.current.on('error', (error) => {
      console.log(error);
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceTranscript(transcript);
      };
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event);
        setListening(false);
      };
      recognitionInstance.onend = () => {
        setListening(false);
      };
      setRecognition(recognitionInstance);
    } else {
      console.error('Speech Recognition API not supported in this browser.');
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleVoiceTranscript = (transcript) => {
    const newMessage = { user: 'You', type: 'text', text: transcript };
    setMessages([...messages, newMessage]);
    socket.current.emit('sendMessage', newMessage.text);
  };

  const handleSend = () => {
    if (input.trim()) {
      const newMessage = { user: 'You', type: 'text', text: input };
      setMessages([...messages, newMessage]);
      setInput('');
      setLoading(true);
      socket.current.emit('sendMessage', newMessage.text);
    }
  };

  const handleVoiceInput = () => {
    if (recognition && !listening) {
      recognition.start();
      setListening(true);
    }
  };

  const scrollToBottom = () => {
    chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
  };
  const handleKeyDown=(e)=>{
    if(e.key==='Enter' && !e.shiftKey){
      e.preventDefault();
      handleSend();
    }
  }

  const renderMessage = (msg, index) => {
    const isUser = msg.user === 'You';
    const messageClass = isUser
      ? 'bg-blue-500 text-white'
      : 'bg-white shadow-md';

    return (
      <div key={index} className={`flex items-start ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <img src={rentok} alt="Bot" className="w-10 h-10 rounded-full mr-3" />
        )}
        <div className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-3 ${messageClass}`}>
          {msg.type === 'text' && <p>{msg.text}</p>}
          {msg.type === 'video' && (
            <div>
              <p className="mb-2">{msg.title}</p>
              <iframe
                width="100%"
                height="315"
                src={msg.url}
                title={msg.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
        {isUser && (
          <div className="w-10 h-10 bg-gray-300 rounded-full ml-3 flex items-center justify-center">
            <User size={24} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div ref={chatContainer} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => renderMessage(msg, index))}
        {Loading && (
          <div className="flex items-start mb-4">
            <img src={rentok} alt="Bot" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 flex-shrink-0" />
            <div className="bg-white shadow-md rounded-lg p-2 sm:p-3">
              <p className="text-sm sm:text-base">Loading Response..</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 bg-white border-t flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your query here"
          className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Send size={24}/>
        </button>
        <button
          onClick={handleVoiceInput}
          className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {listening ? 'Listening' : <Speech/>}
        </button>
      </div>
    </div>
  );
};

export default Chat;

// import React, { useState, useEffect , useRef } from 'react';
// import { User,Send,Speech } from 'lucide-react';
// import rentok from '../assets/rentok.jpg'
// import {io} from 'socket.io-client';
// const Chat = () => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [recognition, setRecognition] = useState(null);
//   const [listening, setListening] = useState(false);
//   const chatContainer=useRef(null);
//   const socket=useRef(null);

//   useEffect(()=>{
//     const token=localStorage.getItem("token");
//     socket.current=io('http://localhost:3000',{
//       auth:{
//         token:token,
//       },
//     });

//     socket.current.on('receiveMessage',(message)=>{
//       console.log("the received message is:",message);
//       const response = { user: 'Bot', text: '' };
//       response.text=message;
//       setMessages(prevMessages=>[...prevMessages,response]);
//     });
//     socket.current.on('error',(error)=>{
//       console.log(error);
//     });
//     return ()=>{
//       if(socket.current){
//         socket.current.disconnect();
//       }
//     };

//   },[]);

//   useEffect(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (SpeechRecognition) {
//       const recognitionInstance = new SpeechRecognition();
//       recognitionInstance.continuous = false;
//       recognitionInstance.interimResults = false;
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.onresult = (event) => {
//         const transcript = event.results[0][0].transcript;
//         handleVoiceTranscript(transcript);
//       };
//       recognitionInstance.onerror = (event) => {
//         console.error('Speech recognition error', event);
//         setListening(false);
//       };
//       recognitionInstance.onend = () => {
//         setListening(false);
//       };
//       setRecognition(recognitionInstance);
//     } else {
//       console.error('Speech Recognition API not supported in this browser.');
//     }
//   }, []);

//   useEffect(()=>{
//     scrollToBottom();
//   },[messages]);

//   const handleVoiceTranscript = (transcript) => {
//     const newMessage = { user: 'You', text: transcript };
//     setMessages([...messages, newMessage]);
//     // Simulate assistant response (replace this with actual API call)
//     const response = { user: 'Bot', text: 'This is the assistant\'s reply to your voice input.' };
//     setMessages(prevMessages => [...prevMessages, response]);
//   };

//   const handleSend = () => {
//     if (input.trim()) {
//       const newMessage = { user: 'You', text: input };
//       setMessages([...messages, newMessage]);
//       setInput('');
//       // Simulate assistant response (replace this with actual API call)
//       // const response = { user: 'Bot', text: 'This is the assistant\'s reply.' };
//       socket.current.emit('sendMessage',newMessage.text);
      
//       // setMessages(prevMessages => [...prevMessages, response]);
//     }
//   };

//   const handleVoiceInput = () => {
//     if (recognition && !listening) {
//       recognition.start();
//       setListening(true);
//     }
//   };

//   const scrollToBottom=()=>{
//     chatContainer.current.scrollTop=chatContainer.current.scrollHeight;

//   }

//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       <div ref={chatContainer} className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((msg, index) => (
//           <div key={index} className={`flex items-start ${msg.user === 'You' ? 'justify-end' : 'justify-start'}`}>
//             {msg.user === 'Bot' && (
//               <img src={rentok} alt="Bot" className="w-10 h-10 rounded-full mr-3" />
//             )}
//             <div className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-3 ${
//               msg.user === 'You' ? 'bg-blue-500 text-white' : 'bg-white shadow-md'
//             }`}>
//               <p>{msg.text}</p>
//             </div>
//             {msg.user === 'You' && (
//               <div className="w-10 h-10 bg-gray-300 rounded-full ml-3 flex items-center justify-center">
//                 <User size={24} />
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//       <div className="p-4 bg-white border-t flex items-center">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Type your query here"
//           className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         <button
//           onClick={handleSend}
//           className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <Send size={24}/>
//         </button>
//         <button
//           onClick={handleVoiceInput}
//           className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           {listening ? 'Listening' :  <Speech/>}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Chat;