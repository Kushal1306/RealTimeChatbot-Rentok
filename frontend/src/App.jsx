import { useState } from 'react'
import Signin from './pages/Signin'
import Signup from './pages/Signup'
import Chat from './pages/Chat';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

import './App.css'

function App() {
  return (
   <GoogleOAuthProvider clientId='429662574743-5mk97ee1rdt2uvrk4mk6isggtko1mef7.apps.googleusercontent.com'>
    <Router>
      <Routes>
      <Route path='/' element={<Signin/>}/>
      <Route path='/signin' element={<Signin/>} />
      <Route path='/signup' element={<Signup/>} />
      <Route path='/chat' element={<Chat/>}/>
      </Routes>
    </Router>
   </GoogleOAuthProvider>
  )
}

export default App
