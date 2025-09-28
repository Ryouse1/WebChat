import { useEffect, useState } from 'react';
import { auth, db, loginAnon } from '../lib/firebase';
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import ChatRoom from '../components/ChatRoom';
import InputBox from '../components/InputBox';

export default function Home() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, u => {
      if (u) setUser(u);
      else loginAnon();
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt'));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    await addDoc(collection(db, 'messages'), {
      uid: user?.uid || 'anon',
      text,
      createdAt: serverTimestamp()
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <h1 className="text-xl font-bold p-4 bg-blue-500 text-white">匿名チャット</h1>
      <ChatRoom messages={messages} />
      <InputBox onSend={sendMessage} />
    </div>
  );
}
