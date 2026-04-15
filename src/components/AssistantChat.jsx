import { useState, useCallback, useRef, useEffect } from 'react';
import { streamAssistantChat } from '../services/assistantApi';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const initialMessage = {
  id: 1,
  text: "Hi! I'm an AI assistant powered by Claude with live web search. Ask me anything — I can look up current information for you.",
  sender: 'ai',
  timestamp: new Date(),
};

function AgentStatus({ status, toolCall }) {
  if (status === 'idle') return null;

  const indicators = {
    thinking: {
      icon: (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ),
      text: 'Claude is thinking...',
    },
    searching: {
      icon: (
        <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      text: `Searching: "${toolCall?.input?.query || '...'}"`,
    },
    processing: {
      icon: (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ),
      text: 'Processing search results...',
    },
  };

  const indicator = indicators[status];
  if (!indicator) return null;

  return (
    <div className="flex justify-start mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-cyber-gray/60 border border-cyber-border text-cyber-green rounded-2xl rounded-bl-md px-5 py-3 shadow-cyber backdrop-blur-sm flex items-center gap-3">
        {indicator.icon}
        <span className="text-sm font-mono">{indicator.text}</span>
      </div>
    </div>
  );
}

export default function AssistantChat() {
  const [messages, setMessages] = useState([initialMessage]);
  const [conversationId, setConversationId] = useState(null);
  const [agentStatus, setAgentStatus] = useState('idle');
  const [currentToolCall, setCurrentToolCall] = useState(null);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, agentStatus]);

  const handleSend = useCallback(
    (text) => {
      if (!text.trim()) return;
      setError(null);

      const userMsg = {
        id: Date.now(),
        text: text.trim(),
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setAgentStatus('thinking');

      const { abort } = streamAssistantChat(text.trim(), conversationId, (event) => {
        switch (event.event) {
          case 'thinking':
            setAgentStatus('thinking');
            break;

          case 'tool_call':
            setAgentStatus('searching');
            setCurrentToolCall(event.data);
            break;

          case 'tool_result':
            setAgentStatus('processing');
            break;

          case 'message': {
            const aiMsg = {
              id: Date.now() + 1,
              text: event.data.text,
              sender: 'ai',
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMsg]);
            if (event.data.conversation_id) {
              setConversationId(event.data.conversation_id);
            }
            setAgentStatus('idle');
            setCurrentToolCall(null);
            break;
          }

          case 'done':
            setAgentStatus('idle');
            setCurrentToolCall(null);
            if (event.data.conversation_id) {
              setConversationId(event.data.conversation_id);
            }
            break;

          case 'error':
            setError(event.data.message || 'Something went wrong.');
            setAgentStatus('idle');
            setCurrentToolCall(null);
            break;

          default:
            break;
        }
      });

      abortRef.current = abort;
    },
    [conversationId]
  );

  const handleClear = useCallback(() => {
    if (abortRef.current) abortRef.current();
    setMessages([initialMessage]);
    setConversationId(null);
    setError(null);
    setAgentStatus('idle');
    setCurrentToolCall(null);
  }, []);

  const isLoading = agentStatus !== 'idle';

  return (
    <div className="flex flex-col max-w-3xl mx-auto rounded-2xl bg-gradient-to-br from-cyber-dark/60 to-cyber-darker/60 backdrop-blur-2xl border border-cyber-border shadow-cyber-lg min-h-[600px] max-h-[85vh] overflow-hidden relative group hover:border-cyber-border-hover transition-all duration-500">
      <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyber-green opacity-30 rounded-tl-2xl transition-opacity duration-300 group-hover:opacity-60" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-cyber-green opacity-30 rounded-br-2xl transition-opacity duration-300 group-hover:opacity-60" />
      <div className="absolute -inset-[1px] bg-gradient-to-br from-cyber-green/10 to-cyber-green-dark/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

      <ChatHeader title="AI Assistant" />

      {error && (
        <div className="px-5 py-3 bg-red-900/30 border-b border-red-800/50 text-red-300 text-sm flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-200 transition-colors p-1 hover:bg-red-900/30 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-gradient-to-b from-cyber-darker/40 to-cyber-black/40 backdrop-blur-md relative">
        <div className="absolute inset-0 shadow-inner-glow pointer-events-none" />
        <div className="space-y-2 relative z-10">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} text={msg.text} sender={msg.sender} timestamp={msg.timestamp} />
          ))}
          <AgentStatus status={agentStatus} toolCall={currentToolCall} />
        </div>
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center justify-between px-5 py-2 bg-cyber-darker/50 border-t border-cyber-border/50 backdrop-blur-sm">
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-gray-500 hover:text-cyber-green transition-all duration-300 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-cyber-gray/30 group"
        >
          <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Clear conversation
        </button>
        <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
          <div className="w-1.5 h-1.5 bg-cyber-green rounded-full animate-pulse" />
          <span>Anthropic Claude + Web Search</span>
        </div>
      </div>

      <ChatInput onSend={handleSend} disabled={isLoading} placeholder="Ask me anything..." />
    </div>
  );
}
