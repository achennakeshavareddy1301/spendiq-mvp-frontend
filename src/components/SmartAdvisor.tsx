// src/components/SmartAdvisor.tsx
// AI Financial Advisor Chat Component - Chat with your transaction data

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Sparkles, Loader2, MessageSquare } from "lucide-react";
import { Transaction } from "@/types";
import { startFinancialChat, FinancialChatSession } from "@/services/gemini";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SmartAdvisorProps {
  transactions: Transaction[];
}

// Suggested queries for quick access
const SUGGESTED_QUERIES = [
  { label: "Highest expense?", query: "What's my highest single expense?" },
  { label: "Food spending", query: "Analyze my food and dining spending patterns" },
  { label: "Monthly summary", query: "Give me a summary of my monthly spending" },
  { label: "Savings tips", query: "Where can I cut costs and save money?" },
  { label: "Top vendors", query: "Which vendors am I spending the most at?" },
  { label: "Subscriptions", query: "Do I have any recurring subscriptions?" },
];

export default function SmartAdvisor({ transactions }: SmartAdvisorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your SpendIQ AI Advisor 💰. I've analyzed your transaction history and I'm ready to help you understand your spending patterns, identify savings opportunities, and answer any questions about your finances. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<FinancialChatSession | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chat session when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      const session = startFinancialChat(transactions);
      setChatSession(session);
    }
  }, [transactions]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Generate unique ID for messages
  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Handle sending a message
  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || !chatSession || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage(messageText);
      
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [chatSession, isLoading]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  // Handle suggested query click
  const handleSuggestedQuery = (query: string) => {
    handleSendMessage(query);
  };

  // Format message content with basic markdown-like styling
  const formatMessageContent = (content: string) => {
    // Split by newlines and handle formatting
    return content.split('\n').map((line, index) => {
      // Handle bold text
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <span 
          key={index} 
          dangerouslySetInnerHTML={{ __html: formattedLine }}
          className="block"
        />
      );
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          Smart Financial Advisor
          <Badge variant="secondary" className="ml-auto text-xs">
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-[500px]">
        {/* Suggested Queries */}
        {messages.length <= 1 && (
          <div className="px-4 py-3 border-b border-border/50 bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUERIES.map((suggestion) => (
                <Button
                  key={suggestion.label}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 bg-background/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
                  onClick={() => handleSuggestedQuery(suggestion.query)}
                  disabled={isLoading}
                >
                  {suggestion.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
          <div className="py-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary/70 text-foreground rounded-bl-md"
                  )}
                >
                  {formatMessageContent(message.content)}
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-secondary/70 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Analyzing your data...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-border/50 bg-background/50">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Ask about your spending..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading || !chatSession}
                className="pl-10 bg-secondary/50 border-border focus:border-primary focus:ring-primary"
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || isLoading || !chatSession}
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Powered by Google Gemini • Your data stays private
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
