import { useState, useEffect } from "react";
import { Bot, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownInitial, setHasShownInitial] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Show initial popup after 2 seconds
    const timer = setTimeout(() => {
      if (!hasShownInitial) {
        setIsOpen(true);
        setMessages([{
          role: 'assistant',
          content: "Hey! I'm your medical AI assistant today. Tell me how you're feeling or ask me anything about your health."
        }]);
        setHasShownInitial(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [hasShownInitial]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMessage = message;
    setMessage("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('medical-ai-chat', {
        body: { messages: [...messages, { role: 'user', content: userMessage }] }
      });

      if (error) {
        console.error('AI Error:', error);
        toast({
          title: "Error",
          description: "Failed to get AI response. Please try again.",
          variant: "destructive",
        });
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting right now. Please try again in a moment."
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message
        }]);
      }
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="h-16 w-16 rounded-full shadow-[0_8px_24px_hsl(var(--primary)/0.4)] hover:shadow-[0_12px_32px_hsl(var(--primary)/0.5)] bg-gradient-to-br from-primary to-accent"
        >
          <Bot className="h-8 w-8" />
        </Button>
      )}

      {isOpen && (
        <Card className="w-[380px] h-[500px] flex flex-col shadow-[0_12px_40px_hsl(var(--primary)/0.2)] border-2 border-primary/20 animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Medical AI Assistant</h3>
                <p className="text-xs text-muted-foreground">Here to help you</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-primary to-accent text-white'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-muted/30">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                placeholder="Ask about symptoms, treatments, or health..."
                className="flex-1 rounded-full bg-background border-primary/20 focus:border-primary"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="rounded-full h-10 w-10"
                disabled={isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AIAssistant;
