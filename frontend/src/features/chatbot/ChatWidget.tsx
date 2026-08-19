import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircleIcon, SendIcon, XIcon } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useLocale } from '@/shared/i18n/LocaleContext';
import { ApiError } from '@/shared/api/client';
import { fetchChatHistory, streamChatReply, type ChatMessage } from '@/features/chatbot/chatbot.api';

interface DisplayMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
}

function toDisplay(messages: ChatMessage[]): DisplayMessage[] {
  return messages.map((m) => ({ id: m.id, role: m.role, content: m.content }));
}

export function ChatWidget() {
  const { user, token } = useAuth();
  const { t, dir } = useLocale();

  const [open, setOpen] = useState(false);
  const [loadedHistory, setLoadedHistory] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || loadedHistory || !token) return;
    fetchChatHistory(token)
      .then((items) => setMessages(toDisplay(items)))
      .catch(() => setError(t('chatbot.errorGeneric')))
      .finally(() => setLoadedHistory(true));
  }, [open, loadedHistory, token, t]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  if (!user || user.role === 'ADMIN' || !token) return null;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setError(null);
    setInput('');
    setSending(true);

    const userMessage: DisplayMessage = { id: `local-${Date.now()}`, role: 'USER', content: text };
    const assistantId = `local-${Date.now()}-assistant`;
    setMessages((prev) => [...prev, userMessage, { id: assistantId, role: 'ASSISTANT', content: '' }]);

    try {
      await streamChatReply(token, text, (chunk) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)),
        );
      });
    } catch (err) {
      setError(err instanceof ApiError ? t('chatbot.errorGeneric') : t('chatbot.errorGeneric'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-[74px] end-5 z-40 flex flex-col items-end gap-3 lg:bottom-5">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex h-[min(560px,75vh)] w-[min(380px,90vw)] flex-col overflow-hidden rounded-card border border-ink-200/70 bg-white shadow-lift"
          >
            <div className="flex items-center justify-between bg-afaaq-blue px-4 py-3.5 text-white">
              <div>
                <p className="font-display text-sm font-bold">{t('chatbot.title')}</p>
                <p className="text-xs text-white/75">{t('chatbot.subtitle')}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('chatbot.closeLabel')}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-white"
              >
                <XIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <div className="rounded-[10px] bg-afaaq-blue-50 px-3.5 py-3 text-[13px] leading-5 text-afaaq-blue">
                  {t('chatbot.emptyState')}
                </div>
              )}
              <div className="flex flex-col gap-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[85%] whitespace-pre-wrap rounded-[14px] px-3.5 py-2.5 text-[13px] leading-5 ${
                      m.role === 'USER'
                        ? 'self-end bg-afaaq-blue text-white'
                        : 'self-start bg-surface text-ink-900'
                    }`}
                  >
                    {m.content || (sending && m.role === 'ASSISTANT' ? '…' : '')}
                  </div>
                ))}
              </div>
              {error && <p className="mt-3 text-xs font-medium text-red-600">{error}</p>}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
              className="flex items-center gap-2 border-t border-ink-200/70 p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chatbot.placeholder')}
                disabled={sending}
                className="h-11 flex-1 rounded-[10px] border border-ink-200 bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-500/70 focus:border-afaaq-blue focus:outline-none focus:ring-4 focus:ring-afaaq-blue/10"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label={t('chatbot.send')}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-afaaq-blue text-white transition-opacity disabled:opacity-40"
              >
                <SendIcon className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t('chatbot.closeLabel') : t('chatbot.openLabel')}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-afaaq-blue text-white shadow-lift transition-transform hover:scale-105"
      >
        {open ? (
          <XIcon className="h-6 w-6" aria-hidden="true" />
        ) : (
          <MessageCircleIcon className="h-6 w-6" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
