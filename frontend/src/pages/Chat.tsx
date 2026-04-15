import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, ArrowLeft, MoreVertical, Paperclip, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { messageService, uploadService } from '../services';
import { useAuthStore } from '../store/authStore';
import type { Message } from '../types';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface PendingAttachment {
  name: string;
  type: string;
  dataUrl: string;
}

const getAttachmentKind = (type: string, url?: string) => {
  const normalizedType = (type || '').toLowerCase();
  const normalizedUrl = (url || '').toLowerCase();

  if (normalizedType.startsWith('image/') || normalizedUrl.includes('/image/upload/') || /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/.test(normalizedUrl)) {
    return 'image';
  }

  if (normalizedType.includes('pdf') || normalizedUrl.includes('.pdf')) {
    return 'pdf';
  }

  if (normalizedType.includes('word') || normalizedType.includes('document') || normalizedUrl.includes('.doc')) {
    return 'doc';
  }

  if (normalizedType.includes('text') || normalizedUrl.includes('.txt')) {
    return 'txt';
  }

  return 'file';
};

export default function Chat() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const queryClient = useQueryClient();

  const [messageText, setMessageText] = useState('');
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch messages
  const { data, isLoading } = useQuery({
    queryKey: ['messages', matchId],
    queryFn: () => messageService.getMessages(matchId!),
    enabled: !!matchId,
  });

  const messages: Message[] = data?.messages || [];

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async ({ content, files }: { content: string; files: PendingAttachment[] }) => {
      let uploadedUrls: string[] = [];
      if (files.length > 0) {
        setUploadProgress(0);
        uploadedUrls = await uploadService.uploadFiles(
          files.map((file) => file.dataUrl),
          (progress) => setUploadProgress(progress)
        );
      }
      return messageService.sendMessage(
        matchId!,
        content,
        uploadedUrls,
        files.map((file) => file.name),
        files.map((file) => file.type)
      );
    },
    onSuccess: () => {
      setMessageText('');
      setAttachments([]);
      setUploadProgress(null);
      queryClient.invalidateQueries({ queryKey: ['messages', matchId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
    onError: (error: any) => {
      setUploadProgress(null);
      toast.error(error.response?.data?.error || 'Error al enviar mensaje');
    },
  });

  // Socket.io setup
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: useAuthStore.getState().token,
      },
    });

    newSocket.on('connect', () => {
      console.log('Socket conectado');
      if (matchId) {
        newSocket.emit('join_room', matchId);
      }
    });

    newSocket.on('new_message', () => {
      queryClient.invalidateQueries({ queryKey: ['messages', matchId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      scrollToBottom();
    });

    // Compatibilidad con el evento emitido por server.ts
    newSocket.on('receive_message', () => {
      queryClient.invalidateQueries({ queryKey: ['messages', matchId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      scrollToBottom();
    });

    newSocket.on('messages_read', (payload) => {
      if (payload.matchId === matchId) {
        queryClient.invalidateQueries({ queryKey: ['messages', matchId] });
        queryClient.invalidateQueries({ queryKey: ['matches'] });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [matchId]);

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (matchId) {
      messageService.markAsRead(matchId).catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    }
  }, [matchId, queryClient]);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}`));
      reader.readAsDataURL(file);
    });

  const handlePickFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) {
      return;
    }

    const files = Array.from(fileList);
    if (attachments.length + files.length > 5) {
      toast.error('Máximo 5 archivos por mensaje');
      event.target.value = '';
      return;
    }

    const allowedMimeTypes = [
      'image/',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    try {
      const preparedFiles = await Promise.all(
        files.map(async (file) => {
          const isAllowed = allowedMimeTypes.some((mimeType) => file.type.startsWith(mimeType) || file.type === mimeType);
          if (!isAllowed) {
            throw new Error(`Formato no permitido: ${file.name}`);
          }

          if (file.size > 10 * 1024 * 1024) {
            throw new Error(`${file.name} excede 10MB`);
          }

          return {
            name: file.name,
            type: file.type,
            dataUrl: await readFileAsDataUrl(file),
          };
        })
      );

      setAttachments((current) => [...current, ...preparedFiles]);
    } catch (error: any) {
      toast.error(error.message || 'No se pudieron adjuntar los archivos');
    } finally {
      event.target.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() || attachments.length > 0) {
      sendMutation.mutate({
        content: messageText.trim(),
        files: attachments,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-soft dark:bg-gray-900">
      {/* Header */}
      <div className="surface-glass border-b border-white/40 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/matches')} className="p-2 -ml-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/70 transition">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h2 className="font-semibold font-heading">Chat</h2>
        </div>
        <button className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/70 transition">
          <MoreVertical size={24} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === userId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="surface-glass border-t border-white/40 dark:border-gray-700 p-4">
        {uploadProgress !== null && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Subiendo adjuntos...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-primary h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((attachment, index) => {
              const attachmentKind = getAttachmentKind(attachment.type);
              const isImage = attachmentKind === 'image';

              return (
                <div key={`${attachment.name}-${index}`} className="relative border border-slate-200 dark:border-gray-700 rounded-xl p-2 bg-white/75 dark:bg-gray-900/85 w-24">
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(index)}
                    className="absolute -top-2 -right-2 bg-error text-white rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                  {isImage ? (
                    <img src={attachment.dataUrl} alt={attachment.name} className="w-16 h-16 object-cover rounded-md" />
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-gradient-to-br from-secondary/20 to-primary/20 flex flex-col items-center justify-center text-gray-700 dark:text-gray-200">
                      <FileText size={20} />
                      <span className="text-[10px] font-semibold uppercase mt-1">{attachmentKind}</span>
                    </div>
                  )}
                  <p className="text-xs mt-1 w-16 truncate" title={attachment.name}>{attachment.name}</p>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.txt,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            multiple
            onChange={handlePickFiles}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-outline p-3"
            title="Adjuntar archivo"
          >
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="input flex-1"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={(!messageText.trim() && attachments.length === 0) || sendMutation.isPending}
            className="btn btn-primary p-3"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const time = new Date(message.sentAt).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-gradient-primary text-white rounded-br-none'
              : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none'
          }`}
        >
          {message.content && <p className="break-words">{message.content}</p>}
          {message.images?.length > 0 && (
            <div className={`grid gap-2 ${message.content ? 'mt-2' : ''}`}>
              {message.images.map((fileUrl, index) => {
                const attachmentName = message.attachmentNames?.[index] || `adjunto-${index + 1}`;
                const attachmentType = message.attachmentTypes?.[index] || '';
                const attachmentKind = getAttachmentKind(attachmentType, fileUrl);

                return attachmentKind === 'image' ? (
                  <a key={`${fileUrl}-${index}`} href={fileUrl} target="_blank" rel="noreferrer">
                    <img src={fileUrl} alt={`Adjunto ${index + 1}`} className="rounded-lg max-h-56 w-full object-cover" />
                  </a>
                ) : (
                  <a
                    key={`${fileUrl}-${index}`}
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={attachmentName}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                      isOwn ? 'bg-white/20' : 'bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-md flex flex-col items-center justify-center ${
                      isOwn ? 'bg-white/20' : 'bg-secondary/15 text-secondary'
                    }`}>
                      <FileText size={16} />
                      <span className="text-[9px] font-bold uppercase">{attachmentKind}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{attachmentName}</p>
                      <p className="text-xs opacity-80">Toca para descargar</p>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
        <div className={`flex items-center gap-1 text-xs text-gray-500 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span>{time}</span>
          {isOwn && (
            <span>{message.isRead ? '✓✓' : '✓'}</span>
          )}
        </div>
      </div>
    </div>
  );
}
