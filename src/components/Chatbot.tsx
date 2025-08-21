import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chatbot = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => {
    return crypto?.randomUUID?.() || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      // Add welcome message when opening for first time
      const welcomeMessage: Message = {
        id: `bot_${Date.now()}`,
        text: language === 'es' 
          ? '¡Hola! Soy el asistente de TriExpert Services. ¿En qué puedo ayudarte hoy?' 
          : 'Hello! I\'m the TriExpert Services assistant. How can I help you today?',
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare data for N8N webhook
      const requestData = {
        message: userMessage.text,
        session_id: sessionId,
        language: language,
        timestamp: new Date().toISOString(),
        source: 'website_chat',
        user_agent: navigator.userAgent,
        page_url: window.location.href
      };

      console.log('Sending to N8N:', requestData);

      const response = await fetch('https://app.n8n-tech.cloud/webhook/triexpert-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.text();
      console.log('Raw N8N response:', responseData);

      let botResponseText = '';

      try {
        // Try to parse as JSON first
        const jsonData = JSON.parse(responseData);
        console.log('Parsed JSON:', jsonData);
        
        // Extract response from various possible formats
        botResponseText = jsonData.response || 
                         jsonData.message || 
                         jsonData.reply || 
                         jsonData.text || 
                         jsonData.answer ||
                         JSON.stringify(jsonData);
      } catch (parseError) {
        // If not JSON, treat as plain text
        botResponseText = responseData;
      }

      // Clean up the response
      botResponseText = botResponseText.trim();
      
      if (!botResponseText) {
        botResponseText = language === 'es' 
          ? 'Lo siento, no pude generar una respuesta. Por favor intenta de nuevo.' 
          : 'Sorry, I couldn\'t generate a response. Please try again.';
      }

      console.log('Final bot response:', botResponseText);

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        text: botResponseText,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: `bot_error_${Date.now()}`,
        text: language === 'es' 
          ? 'Lo siento, hubo un error de conexión. Por favor contacta directamente: support@triexpertservice.com' 
          : 'Sorry, there was a connection error. Please contact us directly: support@triexpertservice.com',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
        title={isOpen ? 'Close chat' : 'Open chat'}
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
        <div className="fixed bottom-24 right-6 z-40 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">TriExpert Assistant</h3>
                <p className="text-xs opacity-90">
                  {language === 'es' ? 'En línea • Powered by AI' : 'Online • Powered by AI'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isUser
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border rounded-bl-none shadow-sm'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {!message.isUser && (
                        <Bot className="w-4 h-4 mt-1 text-blue-500 flex-shrink-0" />
                      )}
                      {message.isUser && (
                        <User className="w-4 h-4 mt-1 text-white flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.isUser ? 'text-blue-200' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 border rounded-lg rounded-bl-none shadow-sm px-4 py-2 max-w-xs">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-blue-500" />
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {language === 'es' ? 'Escribiendo...' : 'Typing...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 bg-white flex-shrink-0">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === 'es' ? 'Escribe tu mensaje...' : 'Type your message...'}
                disabled={isLoading}
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-2 rounded-full hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            {/* Footer */}
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-400">
                {language === 'es' 
                  ? 'Powered by TriExpert AI • ' 
                  : 'Powered by TriExpert AI • '
                }
                <span className="text-green-500">●</span> Online
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;