'use client'
import { useState } from 'react';
import { useSocket } from '../context/SocketProvider'
import styles from './page.module.css'

export default function Page(){
  const { sendMessage, messages } = useSocket();
  const [message, setMessage] = useState('')
  return(
    <div className={styles.messages}>
      <h1>Messages</h1>
      <div className={styles.show_messages}>
        {messages.map(message => <li>{message}</li>)}
      </div>
      <div className={styles.send_section}>
        <input value={message} onChange={e=>setMessage(e.target.value)} type="text" placeholder="Type something" autoFocus />
        <button onClick={(e)=>sendMessage(message)}>{">"}</button>
      </div>
    </div>
  )
}