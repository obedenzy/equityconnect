import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Video, 
  Send, 
  Paperclip, 
  Calendar,
  Shield,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: {
    firstName: string;
    lastName: string;
  };
}

interface Conversation {
  id: string;
  listing?: {
    title: string;
    amount: string;
    marketType: string;
  };
  buyer?: {
    firstName: string;
    lastName: string;
  };
  investor?: {
    firstName: string;
    lastName: string;
  };
}

interface MessageThreadProps {
  conversation: Conversation;
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onScheduleCall: (date: string, agenda?: string) => void;
  isSending: boolean;
  isScheduling: boolean;
}

export default function MessageThread({
  conversation,
  messages,
  isLoading,
  onSendMessage,
  onScheduleCall,
  isSending,
  isScheduling,
}: MessageThreadProps) {
  const { user } = useAuth();
  const [messageContent, setMessageContent] = useState("");
  const [callDate, setCallDate] = useState("");
  const [callTime, setCallTime] = useState("");
  const [callAgenda, setCallAgenda] = useState("");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleSendMessage = () => {
    if (messageContent.trim()) {
      onSendMessage(messageContent);
      setMessageContent("");
    }
  };

  const handleScheduleCall = () => {
    if (callDate && callTime) {
      const scheduledDateTime = `${callDate}T${callTime}`;
      onScheduleCall(scheduledDateTime, callAgenda || undefined);
      setCallDate("");
      setCallTime("");
      setCallAgenda("");
      setIsVideoModalOpen(false);
    }
  };

  const getOtherParty = () => {
    if (user?.role === "buyer") {
      return conversation.investor;
    } else {
      return conversation.buyer;
    }
  };

  const otherParty = getOtherParty();

  if (!conversation) {
    return null;
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Thread Header */}
      <CardHeader className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-financial-blue text-white">
                {otherParty?.firstName?.[0]}{otherParty?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <CardTitle className="text-lg">
                {otherParty?.firstName} {otherParty?.lastName}
              </CardTitle>
              <p className="text-sm text-slate-500">
                Regarding: {conversation.listing?.title}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {conversation.listing?.marketType?.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-slate-500">
                  ${Number(conversation.listing?.amount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-financial-blue text-white hover:bg-blue-800">
                  <Video className="w-4 h-4 mr-2" />
                  Schedule Call
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Video Call</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="call-date">Date</Label>
                      <Input
                        id="call-date"
                        type="date"
                        value={callDate}
                        onChange={(e) => setCallDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="call-time">Time</Label>
                      <Input
                        id="call-time"
                        type="time"
                        value={callTime}
                        onChange={(e) => setCallTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="call-agenda">Agenda (Optional)</Label>
                    <Textarea
                      id="call-agenda"
                      rows={3}
                      placeholder="Brief agenda or topics to discuss..."
                      value={callAgenda}
                      onChange={(e) => setCallAgenda(e.target.value)}
                    />
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-financial-blue mr-2" />
                      <div className="text-sm text-financial-blue">
                        A secure video call link will be generated and shared with both parties.
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <Button 
                      onClick={handleScheduleCall}
                      disabled={!callDate || !callTime || isScheduling}
                      className="bg-financial-blue hover:bg-blue-800"
                    >
                      {isScheduling ? "Scheduling..." : "Schedule Call"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsVideoModalOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline">
              Grant Doc Access
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-500">No messages yet. Start the conversation!</div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwnMessage = message.senderId === user?.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex items-start ${isOwnMessage ? 'justify-end' : ''}`}
                >
                  {!isOwnMessage && (
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback className="bg-financial-blue text-white text-xs">
                        {otherParty?.firstName?.[0]}{otherParty?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : ''}`}>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-financial-blue text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div
                      className={`text-xs text-slate-500 mt-1 ${
                        isOwnMessage ? 'text-right' : ''
                      }`}
                    >
                      {format(new Date(message.createdAt), "MMM d, h:mm a")}
                    </div>
                  </div>
                  
                  {isOwnMessage && (
                    <Avatar className="h-8 w-8 ml-3 order-2">
                      <AvatarFallback className="bg-slate-400 text-white text-xs">
                        You
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Message Input */}
      <div className="p-6 border-t border-slate-200">
        <div className="flex space-x-4">
          <div className="flex-1">
            <Textarea
              rows={3}
              className="resize-none"
              placeholder="Type your message..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleSendMessage}
              disabled={!messageContent.trim() || isSending}
              className="bg-financial-blue hover:bg-blue-800"
            >
              <Send className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
