import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { askAdvisorQuestion } from "@/services/aiAdvisor";
import type { AdvisorInput, AdvisorChatMessage } from "@/services/aiAdvisor";

interface AdvisorChatProps {
  advisorInput: AdvisorInput;
  analysisId?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "How can I save more this month?",
  "Am I ready for retirement?",
  "Where should I invest my savings?",
  "Which category should I cut first?",
  "How much SIP can I afford safely?",
];

const buildHistory = (messages: Message[]): AdvisorChatMessage[] =>
  messages.map((message) => ({ role: message.role, content: message.content }));

export default function AdvisorChat({ advisorInput, analysisId }: AdvisorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I can turn your statement into actionable financial decisions. Ask me about savings, SIPs, or retirement readiness.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!scrollAreaRef.current) return;
    const container = scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading) return;

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
        const history = buildHistory([...messages, userMessage]);
        const response = await askAdvisorQuestion(
          advisorInput,
          history,
          userMessage.content,
          analysisId
        );

        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: "Sorry, I could not fetch that advice. Please try again in a moment.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [advisorInput, isLoading, messages]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <div className="rounded-lg bg-primary/10 p-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          Advisor Chat
          <Badge variant="secondary" className="ml-auto text-xs">
            Context-Aware
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-[520px]">
        {messages.length <= 1 && (
          <div className="px-4 py-3 border-b border-border/50 bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 bg-background/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
                  onClick={() => handleSendMessage(question)}
                  disabled={isLoading}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

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
                  {message.content}
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center">
                    <User className="h-4 w-4 text-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Ask about SIPs, savings, or investments..."
            className="bg-background/60 border-border"
          />
          <Button type="submit" disabled={isLoading} variant="hero">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
