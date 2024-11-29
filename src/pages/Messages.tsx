import React, { useState, useEffect, useRef } from 'react';
import { Send, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Message, ChatUser, sendMessage, subscribeToMessages, getUserChats } from '../services/chatService';
import LoadingSpinner from '../components/LoadingSpinner';

function Messages() {
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chats, setChats] = useState<ChatUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    setIsLoading(true);
    try {
      const userChats = await getUserChats('current-user-id');
      setChats(userChats);
    } catch (error) {
      toast.error('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !newMessage.trim()) return;

    try {
      await sendMessage('current-user-id', selectedChat.id, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {!selectedChat ? (
        // Chat List View
        <div className="flex-1 overflow-hidden">
          <div className="p-4 border-b border-cyan-500/20">
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-cyan-500/20 rounded-lg text-cyan-100 placeholder-cyan-300/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 text-cyan-500/50 w-5 h-5" />
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-180px)]">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className="p-4 border-b border-cyan-500/20 hover:bg-cyan-500/10 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-cyan-100">{chat.name}</h3>
                    <p className="text-sm text-cyan-300/70 truncate">
                      {chat.lastMessage || (chat.lastSeen && `Last seen ${format(chat.lastSeen, 'PP')}`)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Chat View
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-cyan-500/20">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="text-cyan-400 hover:text-cyan-300"
              >
                ←
              </button>
              <img
                src={selectedChat.avatar}
                alt={selectedChat.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-cyan-100">{selectedChat.name}</h3>
                <p className="text-sm text-cyan-300/70">
                  {selectedChat.lastSeen && `Last seen ${format(selectedChat.lastSeen, 'PP')}`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === 'current-user-id' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-lg ${
                    message.senderId === 'current-user-id'
                      ? 'bg-cyan-500 text-gray-900'
                      : 'bg-white/10 text-cyan-100'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderId === 'current-user-id' ? 'text-gray-800' : 'text-cyan-300/70'
                  }`}>
                    {format(message.timestamp.toDate(), 'p')}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-cyan-500/20">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-white/5 border border-cyan-500/20 rounded-lg text-cyan-100 placeholder-cyan-300/30"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-4 bg-cyan-500 text-gray-900 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Messages;