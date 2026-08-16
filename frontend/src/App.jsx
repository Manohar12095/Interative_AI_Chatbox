import { useState, useRef, useCallback, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import ChatArea from './components/chat/ChatArea';
import InputBar from './components/chat/InputBar';
import AiModeOverlay from './components/chat/AiModeOverlay';
import ApiKeyGateModal from './components/modals/ApiKeyGateModal';
import SettingsPanel from './components/modals/SettingsPanel';
import ExportModal from './components/modals/ExportModal';
import ProfilePanel from './components/modals/ProfilePanel';
import ToastContainer from './components/ui/ToastContainer';
import LoginPage from './components/auth/LoginPage';
import { insforge } from './utils/insforge';
import { useSettings } from './hooks/useSettings';
import { useToast } from './hooks/useToast';
import { TOOL_DEFINITIONS } from './utils/constants';
import {
  fetchSessions, createSession, deleteSession, renameSession,
  getSession, clearSession, streamChat, uploadFile, saveMessage, checkBackendHealth, fetchConfig
} from './utils/api';

export default function App() {
  const { toasts, addToast } = useToast();

  // Authentication
  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Sessions
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeSessionName, setActiveSessionName] = useState('New Chat');

  // Messages
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Tools
  const [enabledTools, setEnabledTools] = useState(
    TOOL_DEFINITIONS.map(t => t.id)
  );

  // Panels
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState('general');
  const [exportOpen, setExportOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [aiModeOpen, setAiModeOpen] = useState(false);

  // Topics
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Cloud-synced settings (loaded after auth)
  // Initialized lazily once `session` is available
  const [settingsReady, setSettingsReady] = useState(false);

  // API Key Gate
  const [dismissedApiGate, setDismissedApiGate] = useState(false);

  // File attachment
  const [backendHealth, setBackendHealth] = useState(true);
  const [backendConfig, setBackendConfig] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [fileAnalyses, setFileAnalyses] = useState([]);
  
  // Reply State
  const [replyTo, setReplyTo] = useState(null);

  // Cloud settings hook — depends on session being set
  const { settings, updateSetting, loading: settingsLoading } = useSettings(session);

  // Removed auto-open settings effect to use ApiKeyGateModal instead

  // Load sessions and auth on mount
  useEffect(() => {
    // Check active session
    insforge.auth.getSession().then(({ data: { session } }) => {
      let activeSession = session;
      if (!activeSession) {
        const guestUser = localStorage.getItem('apex_guest_user');
        if (guestUser) {
          activeSession = { user: JSON.parse(guestUser) };
        }
      }
      setSession(activeSession);
      setIsAuthLoading(false);
      if (activeSession) {
        loadSessions(activeSession.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = insforge.auth.onAuthStateChange((_event, session) => {
      let activeSession = session;
      if (!activeSession) {
        const guestUser = localStorage.getItem('apex_guest_user');
        if (guestUser) {
          activeSession = { user: JSON.parse(guestUser) };
        }
      }
      setSession(activeSession);
      if (activeSession) {
        loadSessions(activeSession.user.id);
      } else {
        setSessions([]);
        setMessages([]);
        setActiveSessionId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadSessions = async (userId) => {
    const initBackend = async () => {
      const isHealthy = await checkBackendHealth();
      setBackendHealth(isHealthy);
      if (isHealthy) {
        const config = await fetchConfig();
        setBackendConfig(config);
      }
    };
    initBackend();
    if (!userId) return;
    try {
      const data = await fetchSessions();
      setSessions(data);
      if (data.length > 0 && !activeSessionId) {
        selectSession(data[0].id, data[0].name);
      }
    } catch {
      // Backend might not be running yet
    }
  };

  const selectSession = async (id, name) => {
    setActiveSessionId(id);
    setActiveSessionName(name || 'Chat');
    try {
      const session = await getSession(id);
      setMessages(session.messages || []);
    } catch {
      setMessages([]);
    }
    if (window.innerWidth <= 768) setSidebarOpen(false);
  };

  const handleNewChat = async () => {
    try {
      const session = await createSession('New Chat');
      setSessions(prev => [{ ...session, message_count: 0 }, ...prev]);
      selectSession(session.id, session.name);
      addToast('New chat created', 'success');
    } catch {
      addToast('Failed to create chat', 'error');
    }
  };

  const handleDeleteSession = async (id) => {
    try {
      await deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) {
        const remaining = sessions.filter(s => s.id !== id);
        if (remaining.length > 0) selectSession(remaining[0].id, remaining[0].name);
        else { setActiveSessionId(null); setMessages([]); }
      }
      addToast('Chat deleted', 'info');
    } catch {
      addToast('Failed to delete chat', 'error');
    }
  };

  const handleRenameSession = async (id, newName) => {
    try {
      await renameSession(id, newName);
      setSessions(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
      if (activeSessionId === id) setActiveSessionName(newName);
    } catch {
      addToast('Failed to rename chat', 'error');
    }
  };

  const handleClearMemory = async () => {
    if (!activeSessionId) return;
    try {
      await clearSession(activeSessionId);
      setMessages([]);
      addToast('Memory cleared', 'success');
    } catch {
      addToast('Failed to clear memory', 'error');
    }
  };

  const handleFileAttach = async (files) => {
    try {
      addToast(`Uploading ${files.length} file(s)...`, 'info');
      
      const startIndex = attachedFiles.length;
      
      const newAttached = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        previewUrl: file.type.startsWith('image/') || file.type.startsWith('video/') ? URL.createObjectURL(file) : null
      }));
      
      setAttachedFiles(prev => [...prev, ...newAttached]);
      const newAnalyses = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const stateIndex = startIndex + i;
        
        const result = await uploadFile(file, (progress) => {
          setAttachedFiles(prev => {
            const next = [...prev];
            if (next[stateIndex]) next[stateIndex] = { ...next[stateIndex], progress };
            return next;
          });
        });
        
        setAttachedFiles(prev => {
          const next = [...prev];
          if (next[stateIndex]) {
            next[stateIndex] = { 
              ...next[stateIndex], 
              progress: 100, 
              url: result.url,
              content: result.content
            };
          }
          return next;
        });
        
        newAnalyses.push(`[File: ${file.name}]\n${result.analysis}`);
      }
      
      setFileAnalyses(prev => [...prev, ...newAnalyses]);
      addToast('Files ready', 'success');
    } catch {
      addToast('Failed to upload some files', 'error');
    }
  };

  const handleRemoveFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    setFileAnalyses(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = useCallback(async (text) => {
    if (!text.trim() && fileAnalyses.length === 0) return;
    
    let messageContent = text;
    if (replyTo) {
      messageContent = `> Replying to: "${replyTo.content.substring(0, 100)}..."\n\n${text}`;
      setReplyTo(null);
    }
    
    if (!activeSessionId) {
      try {
        const session = await createSession('New Chat');
        setSessions(prev => [{ ...session, message_count: 0 }, ...prev]);
        setActiveSessionId(session.id);
        setActiveSessionName(session.name);
        await sendMessage(messageContent, session.id);
      } catch {
        addToast('Failed to start chat', 'error');
      }
      return;
    }
    await sendMessage(messageContent, activeSessionId);
  }, [activeSessionId, enabledTools, settings.api_key, fileAnalyses, selectedTopic, replyTo]);

  const sendMessage = async (text, sessionId) => {
    const currentAttachments = [...attachedFiles];

    // Add user message immediately to state
    const userMsg = {
      session_id: sessionId,
      role: 'user',
      content: text || '[File uploaded]',
      timestamp: new Date().toISOString(),
      tool_calls: [],
      tool_results: [],
      attachments: currentAttachments
    };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    // Prepare AI message placeholder
    const aiMsg = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      tool_calls: [],
      tool_results: [],
      isStreaming: true
    };
    setMessages(prev => [...prev, aiMsg]);

    // Save user message to database
    try {
      await saveMessage({
        sessionId,
        role: 'user',
        content: userMsg.content
      });
    } catch (e) {
      console.error('Failed to save user message to DB', e);
    }

    const toolResults = [];
    const toolCalls = [];
    let finalContent = '';

    await streamChat({
      message: text,
      sessionId,
      enabledTools,
      apiKey: settings.api_key || undefined,
      provider: settings.provider || undefined,
      model: settings.model || undefined,
      ollamaUrl: settings.ollama_url || undefined,
      connectionMode: settings.connection_mode || 'serverless',
      fileContext: fileAnalyses.length > 0 ? fileAnalyses.join('\n\n') : undefined,
      topicContext: selectedTopic || undefined,
      history: messages.map(m => ({ role: m.role, content: m.content })),
      onSessionTitle: (title, sid) => {
        // Only update if the session hasn't been manually renamed
        setSessions(prev => prev.map(s =>
          s.id === sid && (s.name === 'New Chat' || !s.name) ? { ...s, name: title } : s
        ));
        if (sid === sessionId && (activeSessionName === 'New Chat' || !activeSessionName)) {
          setActiveSessionName(title);
        }
      },
      onToken: (token) => {
        finalContent += token;
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: last.content + token };
          }
          return updated;
        });
      },
      onToolStart: (data) => {
        toolCalls.push({ name: data.tool, args: data.args });
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              tool_calls: [...last.tool_calls, { name: data.tool, display_name: data.display_name, icon: data.icon }]
            };
          }
          return updated;
        });
      },
      onToolResult: (data) => {
        toolResults.push(data);
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              tool_results: [...last.tool_results, data]
            };
          }
          return updated;
        });
      },
      onDone: async () => {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, isStreaming: false };
          }
          return updated;
        });
        setIsStreaming(false);

        // Save AI message to database
        try {
          await saveMessage({
            sessionId,
            role: 'assistant',
            content: finalContent || 'I apologize, but I couldn\'t generate a response.',
            toolCalls,
            toolResults
          });
        } catch (e) {
          console.error('Failed to save AI message to DB', e);
        }

        // Update session list
        setSessions(prev => prev.map(s =>
          s.id === sessionId ? { ...s, updated_at: new Date().toISOString() } : s
        ));
      },
      onError: (error) => {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              content: `⚠️ Error: ${error}`,
              isStreaming: false
            };
          }
          return updated;
        });
        setIsStreaming(false);
        addToast(error, 'error');
      }
    });

    // Clear file attachment
    setAttachedFiles([]);
    setFileAnalyses([]);
  };

  const handleCompleteApiGate = (key) => {
    if (key) {
      updateSetting('api_key', key);
    }
    setDismissedApiGate(true);
    if (!activeSessionId) handleNewChat();
  };

  const handleLogout = async () => {
    try {
      await insforge.auth.signOut();
    } catch (err) {}
    localStorage.removeItem('apex_guest_user');
    setSession(null);
    setSessions([]);
    setMessages([]);
    setActiveSessionId(null);
  };

  const fontSizeClass = settings.font_size === 'small' ? 'text-sm' : settings.font_size === 'large' ? 'text-lg' : 'text-base';

  if (isAuthLoading) {
    return <div className="h-screen w-screen flex items-center justify-center" style={{ background: '#080C14' }}><div className="w-8 h-8 border-4 border-[#00C6FF] border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!session) {
    return (
      <LoginPage 
        onLogin={(authSession) => {
          if (authSession) {
            setSession(authSession);
            setSettingsOpen(true); // Open settings modal right after login!
            if (authSession.user?.isLocal) {
              localStorage.setItem('apex_guest_user', JSON.stringify(authSession.user));
            } else {
              localStorage.removeItem('apex_guest_user'); // Clean up guest session if real user logs in
            }
          } else {
            const guestUser = { id: 'guest_' + Date.now(), email: 'guest@innetcreation.ai', isLocal: true };
            localStorage.setItem('apex_guest_user', JSON.stringify(guestUser));
            setSession({ user: guestUser });
          }
        }} 
      />
    );
  }

  if (settingsLoading) {
    return <div className="h-screen w-screen flex items-center justify-center" style={{ background: '#080C14' }}><div className="w-8 h-8 border-4 border-[#00C6FF] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${fontSizeClass}`} style={{ background: 'var(--bg-primary)' }}>
      {/* API Key Gate */}
      {(!settingsLoading && session && !settings.api_key && !backendConfig?.has_backend_api_key && !dismissedApiGate) && (
        <ApiKeyGateModal
          onComplete={handleCompleteApiGate}
          onDismiss={() => { setDismissedApiGate(true); if (!activeSessionId) handleNewChat(); }}
        />
      )}

      {/* Toast */}
      <ToastContainer toasts={toasts} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div className="fixed inset-0 bg-black/50 z-40 transition-opacity animate-fade-in" onClick={() => setSidebarOpen(false)} />
      )}


      {/* Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={selectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        settings={settings}
        updateSetting={updateSetting}
        userEmail={session?.user?.email}
        onLogout={handleLogout}
      />

      {/* Main Area */}
      <div
        className="flex flex-col min-w-0 overflow-hidden"
        style={{ flex: '1 1 0%', transition: 'width 0.3s ease' }}
      >
        <TopBar
          sessionName={activeSessionName}
          onRenameSession={(name) => activeSessionId && handleRenameSession(activeSessionId, name)}
          enabledTools={enabledTools}
          onToggleTool={(id) => setEnabledTools(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
          )}
          onClearMemory={handleClearMemory}
          onExport={() => setExportOpen(true)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenSettings={(tab) => { setSettingsInitialTab(tab || 'general'); setSettingsOpen(true); }}
          sidebarOpen={sidebarOpen}
        />

        <ChatArea
          messages={messages}
          isStreaming={isStreaming}
          onSuggestedPrompt={(text) => handleSend(text)}
          onReply={(msg) => setReplyTo(msg)}
          sidebarOpen={sidebarOpen}
        />

        <InputBar
          onSend={handleSend}
          isStreaming={isStreaming}
          onFileAttach={handleFileAttach}
          attachedFiles={attachedFiles}
          onRemoveFile={handleRemoveFile}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          addToast={addToast}
          onAiMode={() => setAiModeOpen(true)}
          settings={settings}
        />
      </div>

      {/* Settings Panel */}
      {settingsOpen && (
        <SettingsPanel
          onClose={() => setSettingsOpen(false)}
          settings={settings}
          updateSetting={updateSetting}
          sessions={sessions}
          backendConfig={backendConfig}
          initialTab={settingsInitialTab}
          enabledTools={enabledTools}
          onToggleTool={(id) => setEnabledTools(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
          )}
          onToggleAll={(enabled) => setEnabledTools(enabled ? TOOL_DEFINITIONS.map(t => t.id) : [])}
          selectedTopic={selectedTopic}
          onSelectTopic={setSelectedTopic}
        />
      )}

      {/* AI Mode Overlay */}
      {aiModeOpen && (
        <AiModeOverlay
          onClose={() => setAiModeOpen(false)}
          onSend={handleSend}
          isStreaming={isStreaming}
          addToast={addToast}
          settings={settings}
          messages={messages}
        />
      )}

      {/* Profile Panel */}
      {profileOpen && (
        <ProfilePanel
          onClose={() => setProfileOpen(false)}
          userEmail={session?.user?.email}
          userMeta={session?.user?.user_metadata}
          onLogout={() => {
            setProfileOpen(false);
            handleLogout();
          }}
        />
      )}

      {/* Export Modal */}
      {exportOpen && (
        <ExportModal
          sessionId={activeSessionId}
          sessionName={activeSessionName}
          onClose={() => setExportOpen(false)}
          addToast={addToast}
        />
      )}
    </div>
  );
}
