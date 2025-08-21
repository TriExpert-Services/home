import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chatbot = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate unique session ID when component mounts
  useEffect(() => {
    const generateSessionId = () => {
      // Use crypto.randomUUID() if available, otherwise fallback to timestamp + random
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      // Fallback for older browsers
      return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    };
    
    if (!sessionId) {
      setSessionId(generateSessionId());
    }
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when chat opens for first time
      const welcomeMessage: Message = {
        id: `welcome-${sessionId}-${Date.now()}`,
        text: language === 'es' 
          ? '¡Hola! 👋 Soy el asistente virtual de TriExpert Services. ¿En qué puedo ayudarte hoy?'
          : 'Hello! 👋 I\'m the TriExpert Services virtual assistant. How can I help you today?',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, language, messages.length, sessionId]);

  const sendToN8N = async (message: string): Promise<string> => {
    const webhookUrl = 'https://app.n8n-tech.cloud/webhook/88a9bbfc-0b34-4d81-a948-b6b8332d71cc/chat';
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          language: language,
          timestamp: new Date().toISOString(),
          source: 'website_chat',
          session_id: sessionId,
          user_agent: navigator.userAgent,
          page_url: window.location.href
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle both JSON and text responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle HTML/text response from embedded chat
        const htmlText = await response.text();
        data = htmlText;
      }
      
      // Debug logging
      console.log('N8N Response:', data);
      console.log('Content-Type:', contentType);
      
      // Extract text content from embedded chat HTML
      if (typeof data === 'string') {
        // If it's HTML, extract text content
        if (data.includes('<') && data.includes('>')) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = data;
          
          // Try to find chat message content in common chat widget structures
          const messageSelectors = [
            '.message-content',
            '.chat-message',
            '.bot-message',
            '.message-text',
            '[data-message]',
            'p',
            'span'
          ];
          
          for (const selector of messageSelectors) {
            const messageEl = tempDiv.querySelector(selector);
            if (messageEl && messageEl.textContent && messageEl.textContent.trim()) {
              console.log('Extracted message:', messageEl.textContent.trim());
              return messageEl.textContent.trim();
            }
          }
          
          // Fallback: get all text content and clean it up
          const textContent = tempDiv.textContent || tempDiv.innerText || '';
          const cleanText = textContent
            .replace(/\s+/g, ' ')
            .replace(/[\r\n\t]/g, ' ')
            .trim();
          
          if (cleanText && cleanText.length > 0) {
            console.log('Extracted clean text:', cleanText);
            return cleanText;
          }
        } else {
          // It's plain text
          return data.trim();
        }
      } else if (data.response && typeof data.response === 'string') {
        return data.response;
      } else if (data.message && typeof data.message === 'string') {
        return data.message;
      } else if (data.reply && typeof data.reply === 'string') {
        return data.reply;
      } else if (data.text && typeof data.text === 'string') {
        return data.text;
      } else if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        if (typeof firstItem === 'string') {
          return firstItem;
        } else if (firstItem.response) {
          return firstItem.response;
        } else if (firstItem.message) {
          return firstItem.message;
        } else if (firstItem.reply) {
          return firstItem.reply;
        } else if (firstItem.text) {
          return firstItem.text;
        }
      }
      
      // If we can't parse the response, return it as string
      console.warn('Unknown response format:', data);
      return language === 'es' 
        ? 'Lo siento, hubo un problema al procesar la respuesta. Intenta de nuevo.'
        : 'Sorry, there was an issue processing the response. Please try again.';
        
    } catch (error) {
      console.error('Error sending message to N8N:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${sessionId}-${Date.now()}`,
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const botResponse = await sendToN8N(userMessage.text);
      
      // Simulate typing delay
      setTimeout(() => {
        const botMessage: Message = {
          id: `bot-${sessionId}-${Date.now()}`,
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        setIsLoading(false);
      }, 800);
      
    } catch (error) {
      setTimeout(() => {
        const errorMessage: Message = {
          id: `bot-error-${sessionId}-${Date.now()}`,
          text: language === 'es' 
            ? `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}. Intenta de nuevo o contacta directamente al +1 (813) 710-8860`
            : `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}. Try again or contact directly at +1 (813) 710-8860`,
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
        setIsLoading(false);
      }, 800);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center group ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-110'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white group-hover:animate-pulse" />
        )}
        
        {/* Notification dot */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">TriExpert Assistant</h3>
                <p className="text-xs opacity-90">
                  {language === 'es' ? 'En línea • Responde en minutos' : 'Online • Responds in minutes'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-gray-300'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-3 h-3 text-white" />
                    ) : (
                      <Bot className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                  <div className={`rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-gray-600" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === 'es' ? 'Escribe tu mensaje...' : 'Type your message...'}
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
              <AlertCircle className="w-3 h-3 mr-1" />
              {language === 'es' 
                ? 'Respaldado por IA • Respuestas en tiempo real' 
                : 'Powered by AI • Real-time responses'
              }
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;