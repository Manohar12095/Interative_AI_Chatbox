/**
 * API helper functions for APEX using InsForge DB
 */
import { API_BASE } from './constants';
import { insforge } from './insforge';

const getGuestData = (userId = 'guest') => JSON.parse(localStorage.getItem(`apex_data_${userId}`) || '{"sessions": [], "messages": []}');
const setGuestData = (userId, data) => localStorage.setItem(`apex_data_${userId}`, JSON.stringify(data));
const generateId = () => Math.random().toString(36).substring(2, 15);

export async function fetchSessions() {
  let user;
  const { data: { session } } = await insforge.auth.getSession();
  if (session?.user) user = session.user;
  else {
    const guestUser = localStorage.getItem('apex_guest_user');
    if (guestUser) user = JSON.parse(guestUser);
  }
  if (!user) throw new Error('Not authenticated');

  if (user.id === 'guest' || user.id?.startsWith('local_') || user.isLocal) {
    const { sessions } = getGuestData(user.id);
    return sessions.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).map(s => ({ ...s, message_count: 0 }));
  }

  const { data, error } = await insforge
    .from('chat_sessions')
    .select('id, name, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data.map(s => ({ ...s, message_count: 0 }));
}

export async function createSession(name = 'New Chat') {
  let user;
  const { data: { session } } = await insforge.auth.getSession();
  if (session?.user) user = session.user;
  else {
    const guestUser = localStorage.getItem('apex_guest_user');
    if (guestUser) user = JSON.parse(guestUser);
  }
  if (!user) throw new Error('Not authenticated');

  if (user.id === 'guest' || user.id?.startsWith('local_') || user.isLocal) {
    const data = getGuestData(user.id);
    const newSession = {
      id: generateId(),
      user_id: user.id,
      name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    data.sessions.push(newSession);
    setGuestData(user.id, data);
    return newSession;
  }

  const { data, error } = await insforge
    .from('chat_sessions')
    .insert([{ user_id: user.id, name }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSession(id) {
  let user;
  const guestUser = localStorage.getItem('apex_guest_user');
  if (guestUser) user = JSON.parse(guestUser);
  
  if (user && (user.id === 'guest' || user.id?.startsWith('local_') || user.isLocal)) {
    const data = getGuestData(user.id);
    data.sessions = data.sessions.filter(s => s.id !== id);
    data.messages = data.messages.filter(m => m.session_id !== id);
    setGuestData(user.id, data);
    return { success: true };
  }

  const { error } = await insforge
    .from('chat_sessions')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return { success: true };
}

export async function renameSession(id, name) {
  let user;
  const guestUser = localStorage.getItem('apex_guest_user');
  if (guestUser) user = JSON.parse(guestUser);

  if (user && (user.id === 'guest' || user.id?.startsWith('local_') || user.isLocal)) {
    const data = getGuestData(user.id);
    const session = data.sessions.find(s => s.id === id);
    if (session) {
      session.name = name;
      session.updated_at = new Date().toISOString();
      setGuestData(user.id, data);
      return session;
    }
    throw new Error('Session not found');
  }

  const { data, error } = await insforge
    .from('chat_sessions')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getSession(id) {
  let user;
  const guestUser = localStorage.getItem('apex_guest_user');
  if (guestUser) user = JSON.parse(guestUser);

  if (user && (user.id === 'guest' || user.id?.startsWith('local_') || user.isLocal)) {
    const data = getGuestData(user.id);
    const session = data.sessions.find(s => s.id === id);
    if (!session) throw new Error('Session not found');
    const messages = data.messages.filter(m => m.session_id === id).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return { ...session, messages };
  }

  const { data: session, error: sessionError } = await insforge
    .from('chat_sessions')
    .select('*')
    .eq('id', id)
    .single();
  if (sessionError) throw sessionError;

  const { data: messages, error: messagesError } = await insforge
    .from('chat_messages')
    .select('*')
    .eq('session_id', id)
    .order('created_at', { ascending: true });
  if (messagesError) throw messagesError;

  return { ...session, messages: messages || [] };
}

export async function clearSession(id) {
  let user;
  const guestUser = localStorage.getItem('apex_guest_user');
  if (guestUser) user = JSON.parse(guestUser);

  if (user && (user.id === 'guest' || user.id?.startsWith('local_') || user.isLocal)) {
    const data = getGuestData(user.id);
    data.messages = data.messages.filter(m => m.session_id !== id);
    setGuestData(user.id, data);
    return { success: true };
  }

  const { error } = await insforge
    .from('chat_messages')
    .delete()
    .eq('session_id', id);
  if (error) throw error;
  return { success: true };
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to upload file');
  return res.json();
}

export async function exportChat(sessionId, format = 'txt', includeTimestamps = true, includeToolResults = true) {
  const res = await fetch(`${API_BASE}/export/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ format, include_timestamps: includeTimestamps, include_tool_results: includeToolResults })
  });
  if (!res.ok) throw new Error('Failed to export chat');
  return res.text();
}

/**
 * Stream chat response via SSE using fetch + ReadableStream
 * Robust SSE parser with connection error recovery
 */
export async function streamChat({ message, sessionId, enabledTools, apiKey, fileContext, topicContext, history = [], onToken, onToolStart, onToolResult, onDone, onError }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min timeout

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
        enabled_tools: enabledTools,
        api_key: apiKey || undefined,
        file_context: fileContext || undefined,
        topic_context: topicContext || undefined,
        history: history // Pass history to stateless backend
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      throw new Error(`Server error (${res.status}): ${errorText}`);
    }

    if (!res.body) {
      throw new Error('No response body — streaming not supported');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let receivedAny = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        try {
          const data = JSON.parse(trimmed.slice(6));
          receivedAny = true;

          switch (data.type) {
            case 'token':
              onToken?.(data.content);
              break;
            case 'tool_start':
              onToolStart?.(data);
              break;
            case 'tool_result':
              onToolResult?.(data);
              break;
            case 'done':
              clearTimeout(timeoutId);
              onDone?.();
              return;
            case 'error':
              clearTimeout(timeoutId);
              onError?.(data.content);
              return;
          }
        } catch (e) {
          // Skip malformed JSON lines
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim().startsWith('data: ')) {
      try {
        const data = JSON.parse(buffer.trim().slice(6));
        if (data.type === 'token') onToken?.(data.content);
        if (data.type === 'done') { onDone?.(); return; }
        if (data.type === 'error') { onError?.(data.content); return; }
      } catch (e) { /* skip */ }
    }

    // If stream ended without a 'done' event but we received tokens, still call done
    if (receivedAny) {
      onDone?.();
    } else {
      onError?.('Connection closed without response');
    }

  } catch (e) {
    if (e.name === 'AbortError') {
      onError?.('Request timed out. Please try again.');
    } else {
      onError?.(`Connection error: ${e.message}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function saveMessage({ sessionId, role, content, toolCalls = [], toolResults = [] }) {
  let user;
  const guestUser = localStorage.getItem('apex_guest_user');
  if (guestUser) user = JSON.parse(guestUser);

  if (user && (user.id === 'guest' || user.id?.startsWith('local_') || user.isLocal)) {
    const data = getGuestData(user.id);
    const newMsg = {
      id: generateId(),
      session_id: sessionId,
      role,
      content,
      tool_calls: toolCalls,
      tool_results: toolResults,
      created_at: new Date().toISOString()
    };
    data.messages.push(newMsg);
    setGuestData(user.id, data);
    return newMsg;
  }

  const { data, error } = await insforge
    .from('chat_messages')
    .insert([{
      session_id: sessionId,
      role,
      content,
      tool_calls: toolCalls,
      tool_results: toolResults
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}
