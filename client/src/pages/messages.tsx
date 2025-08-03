import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import MessageThread from "@/components/message-thread";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, MessageSquare, Video, Users } from "lucide-react";
import { format } from "date-fns";

export default function Messages() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/conversations", selectedConversationId, "messages"],
    enabled: !!selectedConversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const res = await apiRequest("POST", "/api/messages", { conversationId, content });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversationId, "messages"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const scheduleVideoCallMutation = useMutation({
    mutationFn: async ({ conversationId, scheduledDate, agenda }: { 
      conversationId: string; 
      scheduledDate: string; 
      agenda?: string;
    }) => {
      const res = await apiRequest("POST", "/api/video-calls", { 
        conversationId, 
        scheduledDate: new Date(scheduledDate).toISOString(),
        agenda 
      });
      return await res.json();
    },
    onSuccess: (videoCall) => {
      toast({
        title: "Video Call Scheduled",
        description: `Meeting link: ${videoCall.meetingLink}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to schedule call",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredConversations = conversations?.filter((conversation: any) => {
    const searchLower = searchTerm.toLowerCase();
    return conversation.listing?.title?.toLowerCase().includes(searchLower) ||
           conversation.buyer?.firstName?.toLowerCase().includes(searchLower) ||
           conversation.investor?.firstName?.toLowerCase().includes(searchLower);
  });

  const selectedConversation = conversations?.find((c: any) => c.id === selectedConversationId);

  const handleSendMessage = (content: string) => {
    if (selectedConversationId) {
      sendMessageMutation.mutate({ conversationId: selectedConversationId, content });
    }
  };

  const handleScheduleCall = (date: string, agenda?: string) => {
    if (selectedConversationId) {
      scheduleVideoCallMutation.mutate({ 
        conversationId: selectedConversationId, 
        scheduledDate: date,
        agenda 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
          <p className="text-slate-600">
            Communicate securely with investors and buyers through our platform
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
          {/* Conversations Sidebar */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Conversations
                </span>
                <Badge variant="secondary">{filteredConversations?.length || 0}</Badge>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {conversationsLoading ? (
                <div className="space-y-4 p-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : filteredConversations?.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No conversations yet</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Start by browsing opportunities or posting a listing
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredConversations?.map((conversation: any) => (
                    <div
                      key={conversation.id}
                      className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                        selectedConversationId === conversation.id ? 'bg-blue-50 border-r-2 border-primary' : ''
                      }`}
                      onClick={() => setSelectedConversationId(conversation.id)}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {conversation.buyer?.firstName?.[0] || conversation.investor?.firstName?.[0] || "U"}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium text-slate-900 truncate">
                              {conversation.listing?.title || "Investment Discussion"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {format(new Date(conversation.lastMessageAt), "MMM d")}
                            </div>
                          </div>
                          <div className="text-sm text-slate-500 truncate">
                            {conversation.buyer?.firstName} {conversation.buyer?.lastName} • 
                            {conversation.investor?.firstName} {conversation.investor?.lastName}
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-slate-400">
                              {conversation.listing?.marketType?.replace('_', ' ')} • 
                              ${Number(conversation.listing?.amount || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Thread */}
          <div className="lg:col-span-2">
            {selectedConversationId ? (
              <MessageThread
                conversation={selectedConversation}
                messages={messages || []}
                isLoading={messagesLoading}
                onSendMessage={handleSendMessage}
                onScheduleCall={handleScheduleCall}
                isSending={sendMessageMutation.isPending}
                isScheduling={scheduleVideoCallMutation.isPending}
              />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageSquare className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Choose a conversation from the sidebar to start messaging
                  </p>
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center justify-center">
                      <Users className="w-4 h-4 mr-2" />
                      Secure, private communications
                    </div>
                    <div className="flex items-center justify-center">
                      <Video className="w-4 h-4 mr-2" />
                      Video call scheduling available
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
