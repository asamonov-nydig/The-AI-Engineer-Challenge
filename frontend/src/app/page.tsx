'use client'

import { useState, useEffect } from 'react'
import { Activity, Send, MessageSquare, Loader2, CheckCircle, XCircle, Server } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Types for our API interactions
interface ChatRequest {
  developer_message: string
  user_message: string
  model?: string
  api_key: string
}

interface HealthStatus {
  status: string
  isOnline: boolean
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

export default function Home() {
  // State management
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({ status: 'checking...', isOnline: false })
  const [isHealthChecking, setIsHealthChecking] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [developerMessage, setDeveloperMessage] = useState('You are a helpful AI assistant. Provide clear, concise, and accurate responses.')
  const [userMessage, setUserMessage] = useState('')
  const [model, setModel] = useState('gpt-4o-mini')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000')

  // Check backend health on component mount
  useEffect(() => {
    checkHealth()
  }, [backendUrl])

  const checkHealth = async () => {
    setIsHealthChecking(true)
    try {
      const response = await fetch(`${backendUrl}/api/health`)
      if (response.ok) {
        const data = await response.json()
        setHealthStatus({ status: data.status, isOnline: true })
      } else {
        setHealthStatus({ status: 'error', isOnline: false })
      }
    } catch (error) {
      setHealthStatus({ status: 'offline', isOnline: false })
    } finally {
      setIsHealthChecking(false)
    }
  }

  const sendMessage = async () => {
    if (!userMessage.trim() || !apiKey.trim()) return

    const userMsg: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)
    setStreamingContent('')

    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, assistantMsg])

    try {
      const chatRequest: ChatRequest = {
        developer_message: developerMessage,
        user_message: userMessage,
        model,
        api_key: apiKey
      }

      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(chatRequest)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        let fullContent = ''
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          fullContent += chunk
          setStreamingContent(fullContent)
          
          // Update the last message (assistant's response)
          setMessages(prev => {
            const newMessages = [...prev]
            if (newMessages.length > 0) {
              newMessages[newMessages.length - 1].content = fullContent
            }
            return newMessages
          })
        }
      }
    } catch (error) {
      const errorMsg: ChatMessage = {
        role: 'system',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev.slice(0, -1), errorMsg])
    } finally {
      setIsLoading(false)
      setUserMessage('')
      setStreamingContent('')
    }
  }

  const clearChat = () => {
    setMessages([])
    setStreamingContent('')
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="glass-effect p-6 rounded-2xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-ai-blue to-ai-purple rounded-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">LLM Chat Interface</h1>
                <p className="text-gray-600">Connect to your FastAPI backend and chat with AI</p>
              </div>
            </div>
            
            {/* Health Status */}
            <div className="flex items-center space-x-3">
              <button
                onClick={checkHealth}
                disabled={isHealthChecking}
                className="btn-primary flex items-center space-x-2"
              >
                {isHealthChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Activity className="h-4 w-4" />
                )}
                <span>Check Health</span>
              </button>
              
              <div className={`status-indicator ${healthStatus.isOnline ? 'status-online' : 'status-offline'}`}>
                {healthStatus.isOnline ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Backend: {healthStatus.status}
              </div>
            </div>
          </div>

          {/* Backend URL Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Server className="h-4 w-4 inline mr-2" />
              Backend URL
            </label>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ai-blue focus:border-transparent"
              placeholder="http://localhost:8000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <div className="glass-effect p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Configuration</h2>
              
              {/* API Key */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ai-blue focus:border-transparent"
                  placeholder="sk-..."
                />
              </div>

              {/* Model Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ai-blue focus:border-transparent"
                >
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>

              {/* Developer Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System/Developer Message
                </label>
                <textarea
                  value={developerMessage}
                  onChange={(e) => setDeveloperMessage(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ai-blue focus:border-transparent resize-none"
                  placeholder="Set the AI's behavior and personality..."
                />
              </div>

              <button
                onClick={clearChat}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear Chat
              </button>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="glass-effect p-6 rounded-2xl h-[600px] flex flex-col">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Chat</h2>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-20">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Start a conversation by typing a message below</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`chat-bubble ${message.role === 'user' ? 'user' : message.role === 'system' ? 'assistant' : 'assistant'}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          message.role === 'user' 
                            ? 'bg-ai-blue text-white' 
                            : message.role === 'system'
                            ? 'bg-red-500 text-white'
                            : 'bg-ai-purple text-white'
                        }`}>
                          {message.role === 'user' ? '👤' : message.role === 'system' ? '⚠️' : '🤖'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium capitalize">
                              {message.role === 'system' ? 'Error' : message.role}
                            </span>
                            <span className="text-xs text-gray-500">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="prose prose-sm max-w-none">
                            {message.role === 'system' ? (
                              <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800">
                                {message.content}
                              </div>
                            ) : (
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                              </ReactMarkdown>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Streaming indicator */}
                {isLoading && (
                  <div className="chat-bubble assistant">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-ai-purple text-white">
                        🤖
                      </div>
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-ai-purple" />
                        <span className="text-ai-purple">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ai-blue focus:border-transparent"
                  placeholder="Type your message here..."
                  disabled={isLoading || !healthStatus.isOnline}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !userMessage.trim() || !apiKey.trim() || !healthStatus.isOnline}
                  className="btn-primary flex items-center space-x-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
