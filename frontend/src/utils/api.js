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
export async function streamChat({ message, sessionId, enabledTools, apiKey, provider, model, connectionMode, fileContext, topicContext, history = [], onToken, onToolStart, onToolResult, onDone, onError }) {
  if (connectionMode === 'serverless') {
    return runClientSideAgent({
      message,
      enabledTools,
      apiKey,
      provider: provider || 'groq',
      model,
      fileContext,
      topicContext,
      history,
      onToken,
      onToolStart,
      onToolResult,
      onDone,
      onError
    });
  }

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
        provider: provider || undefined,
        model: model || undefined,
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

// ── Client-Side Serverless Agent & Tool Loop ────────────────────────

async function runClientSideAgent({ message, enabledTools, apiKey, provider, model, fileContext, topicContext, history, onToken, onToolStart, onToolResult, onDone, onError }) {
  if (!apiKey) {
    onError?.(`No API key configured for ${provider.toUpperCase()}. Please set it in Settings.`);
    return;
  }

  const sysPrompt = `You are RAHONAM — a premium agentic AI assistant. Always be helpful, concise, and accurate. Format responses with Markdown.`;
  const messages = [{ role: 'system', content: sysPrompt }];
  
  if (history && history.length > 0) {
    history.slice(-20).forEach(h => {
      messages.push({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content });
    });
  }

  let fullInput = message;
  if (fileContext) {
    fullInput = `[File uploaded]\nFile analysis:\n${fileContext}\n\nUser question: ${message || 'Describe and analyse this file.'}`;
  }
  messages.push({ role: 'user', content: fullInput });

  const clientTools = getClientToolsMetadata(enabledTools);

  try {
    let iteration = 0;
    let finished = false;

    while (iteration < 5 && !finished) {
      iteration++;
      let responseData;

      if (provider === 'gemini') {
        responseData = await callGeminiDirect(apiKey, model, messages, clientTools);
      } else if (provider === 'openai') {
        responseData = await callOpenAIDirect(apiKey, model || 'gpt-4o-mini', messages, clientTools);
      } else {
        responseData = await callGroqDirect(apiKey, model || 'llama-3.3-70b-versatile', messages, clientTools);
      }

      if (responseData.tool_calls && responseData.tool_calls.length > 0) {
        messages.push({
          role: 'assistant',
          content: responseData.content || null,
          tool_calls: responseData.tool_calls
        });

        for (const tc of responseData.tool_calls) {
          const toolName = tc.function.name;
          const toolArgs = JSON.parse(tc.function.arguments || '{}');
          
          onToolStart?.({
            tool: toolName,
            display_name: getToolDisplayName(toolName),
            icon: getToolIcon(toolName),
            args: toolArgs
          });

          let result = '';
          try {
            result = await executeClientTool(toolName, toolArgs);
          } catch (err) {
            result = `Tool error: ${err.message}`;
          }

          onToolResult?.({
            tool: toolName,
            display_name: getToolDisplayName(toolName),
            icon: getToolIcon(toolName),
            result: result
          });

          messages.push({
            role: 'tool',
            tool_call_id: tc.id,
            name: toolName,
            content: result
          });
        }
      } else {
        if (responseData.stream) {
          const reader = responseData.stream.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              if (trimmed.startsWith('data: ')) {
                const dataStr = trimmed.slice(6);
                if (dataStr === '[DONE]') continue;
                try {
                  const data = JSON.parse(dataStr);
                  const text = data.choices?.[0]?.delta?.content;
                  if (text) onToken?.(text);
                } catch(e){}
              }
            }
          }
        } else if (responseData.content) {
          const words = responseData.content.split(' ');
          for (let i = 0; i < words.length; i++) {
            onToken?.((i > 0 ? ' ' : '') + words[i]);
            await new Promise(r => setTimeout(r, 10));
          }
        }
        finished = true;
      }
    }
    onDone?.();
  } catch (err) {
    onError?.(`Client Error: ${err.message}`);
  }
}

async function callGroqDirect(apiKey, model, messages, tools) {
  const payload = {
    model: model,
    messages: messages,
    temperature: 0.7,
    max_tokens: 2048
  };
  
  if (tools && tools.length > 0) {
    payload.tools = tools;
    payload.tool_choice = 'auto';
  }

  const useStream = !tools || tools.length === 0;
  if (useStream) {
    payload.stream = true;
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error: ${errText || res.statusText}`);
  }

  if (useStream) {
    return { stream: res.body };
  } else {
    const data = await res.json();
    const message = data.choices?.[0]?.message;
    return {
      content: message?.content,
      tool_calls: message?.tool_calls
    };
  }
}

async function callOpenAIDirect(apiKey, model, messages, tools) {
  const payload = {
    model: model,
    messages: messages,
    temperature: 0.7,
    max_tokens: 2048
  };
  
  if (tools && tools.length > 0) {
    payload.tools = tools;
    payload.tool_choice = 'auto';
  }

  const useStream = !tools || tools.length === 0;
  if (useStream) {
    payload.stream = true;
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error: ${errText || res.statusText}`);
  }

  if (useStream) {
    return { stream: res.body };
  } else {
    const data = await res.json();
    const message = data.choices?.[0]?.message;
    return {
      content: message?.content,
      tool_calls: message?.tool_calls
    };
  }
}

async function callGeminiDirect(apiKey, model, messages, tools) {
  const geminiMessages = messages.map(m => {
    let role = 'user';
    if (m.role === 'assistant' || m.role === 'model') role = 'model';
    if (m.role === 'system') role = 'user';
    return {
      role: role,
      parts: [{ text: m.content || '' }]
    };
  });

  const payload = {
    contents: geminiMessages,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048
    }
  };

  const sysMsg = messages.find(m => m.role === 'system');
  if (sysMsg) {
    payload.systemInstruction = {
      parts: [{ text: sysMsg.content }]
    };
  }

  const modelName = model || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error: ${errText || res.statusText}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const contentText = candidate?.content?.parts?.[0]?.text || '';
  
  return {
    content: contentText,
    tool_calls: null
  };
}

function getClientToolsMetadata(enabledTools) {
  const tools = [];
  const activeIds = enabledTools || [];

  if (activeIds.includes('get_weather')) {
    tools.push({
      type: 'function',
      function: {
        name: 'get_weather',
        description: 'Get current real-time weather for any city worldwide.',
        parameters: {
          type: 'object',
          properties: {
            city: { type: 'string', description: 'The name of the city (e.g. Tokyo, Paris)' }
          },
          required: ['city']
        }
      }
    });
  }

  if (activeIds.includes('calculator')) {
    tools.push({
      type: 'function',
      function: {
        name: 'calculator',
        description: 'Evaluate math expressions, basic calculations.',
        parameters: {
          type: 'object',
          properties: {
            expression: { type: 'string', description: 'Math expression to compute (e.g. 144 * 2, math.sqrt(25))' }
          },
          required: ['expression']
        }
      }
    });
  }

  if (activeIds.includes('convert_currency')) {
    tools.push({
      type: 'function',
      function: {
        name: 'convert_currency',
        description: 'Convert between currencies using live exchange rates.',
        parameters: {
          type: 'object',
          properties: {
            amount: { type: 'number', description: 'Amount of money' },
            from_currency: { type: 'string', description: '3-letter currency code (e.g. USD)' },
            to_currency: { type: 'string', description: '3-letter currency code (e.g. EUR)' }
          },
          required: ['amount', 'from_currency', 'to_currency']
        }
      }
    });
  }

  if (activeIds.includes('wikipedia_search')) {
    tools.push({
      type: 'function',
      function: {
        name: 'wikipedia_search',
        description: 'Get Wikipedia article summaries for a given topic.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' }
          },
          required: ['query']
        }
      }
    });
  }

  if (activeIds.includes('generate_qr_code')) {
    tools.push({
      type: 'function',
      function: {
        name: 'generate_qr_code',
        description: 'Generate a QR code image URL for a text or link.',
        parameters: {
          type: 'object',
          properties: {
            data: { type: 'string', description: 'Text or URL to generate QR code for' }
          },
          required: ['data']
        }
      }
    });
  }

  if (activeIds.includes('get_datetime')) {
    tools.push({
      type: 'function',
      function: {
        name: 'get_datetime',
        description: 'Get current timezone date and time.',
        parameters: {
          type: 'object',
          properties: {
            timezone: { type: 'string', description: 'Timezone name (e.g. UTC, America/New_York)' }
          }
        }
      }
    });
  }

  if (activeIds.includes('define_word')) {
    tools.push({
      type: 'function',
      function: {
        name: 'define_word',
        description: 'Get definition, synonyms, examples for a word.',
        parameters: {
          type: 'object',
          properties: {
            word: { type: 'string', description: 'Word to define' }
          },
          required: ['word']
        }
      }
    });
  }

  if (activeIds.includes('get_ip_info')) {
    tools.push({
      type: 'function',
      function: {
        name: 'get_ip_info',
        description: 'Get location information for an IP address.',
        parameters: {
          type: 'object',
          properties: {
            ip: { type: 'string', description: 'Optional IP address' }
          }
        }
      }
    });
  }

  if (activeIds.includes('get_joke_or_trivia')) {
    tools.push({
      type: 'function',
      function: {
        name: 'get_joke_or_trivia',
        description: 'Get a funny programming joke or trivia fact.',
        parameters: {
          type: 'object',
          properties: {
            category: { type: 'string', description: 'joke or trivia' }
          }
        }
      }
    });
  }

  return tools;
}

async function executeClientTool(name, args) {
  if (name === 'get_weather') {
    const city = args.city || 'London';
    const res = await fetch(`https://wttr.in/${city}?format=j1`);
    if (!res.ok) return `Could not get weather for ${city}`;
    const data = await res.json();
    const current = data.current_condition?.[0] || {};
    return JSON.stringify({
      city,
      temp_c: current.temp_C,
      temp_f: current.temp_F,
      condition: current.weatherDesc?.[0]?.value,
      humidity: `${current.humidity}%`,
      wind: `${current.windspeedKmph} km/h`,
      feels_like: `${current.FeelsLikeC}°C`
    });
  }

  if (name === 'calculator') {
    const expression = args.expression;
    try {
      const cleanExpr = expression.replace(/[^0-9+\-*/().\s]/g, '');
      const result = Function(`"use strict"; return (${cleanExpr})`)();
      return `Result: ${result}`;
    } catch(e) {
      return `Math error: ${e.message}`;
    }
  }

  if (name === 'convert_currency') {
    const { amount, from_currency, to_currency } = args;
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${from_currency.toUpperCase()}`);
    if (!res.ok) return `Could not convert currency.`;
    const data = await res.json();
    const rate = data.rates[to_currency.toUpperCase()];
    if (rate) {
      return `${amount} ${from_currency.toUpperCase()} = ${(amount * rate).toFixed(4)} ${to_currency.toUpperCase()}`;
    }
    return `Currency ${to_currency} not found.`;
  }

  if (name === 'wikipedia_search') {
    const query = args.query;
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrnamespace=0&gsrlimit=1&prop=extracts&exintro&explaintext&exsentences=3&gsrsearch=${encodeURIComponent(query)}`);
    if (!res.ok) return `Wikipedia query failed.`;
    const data = await res.json();
    const pages = data.query?.pages || {};
    const pageId = Object.keys(pages)[0];
    if (pageId && pageId !== '-1') {
      return pages[pageId].extract;
    }
    return `No Wikipedia article found for ${query}.`;
  }

  if (name === 'generate_qr_code') {
    const data = args.data;
    return `QR Code generated successfully. Image URL: https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data)}`;
  }

  if (name === 'get_datetime') {
    const date = new Date();
    return `Current Date & Time (UTC): ${date.toUTCString()}`;
  }

  if (name === 'define_word') {
    const word = args.word;
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!res.ok) return `Word definition not found.`;
    const data = await res.json();
    const meaning = data[0]?.meanings?.[0]?.definitions?.[0]?.definition || 'No definition found';
    return `Definition of ${word}: ${meaning}`;
  }

  if (name === 'get_ip_info') {
    const res = await fetch(`https://ipapi.co/json/`);
    if (!res.ok) return `Could not lookup IP info.`;
    const data = await res.json();
    return JSON.stringify({
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
      org: data.org
    });
  }

  if (name === 'get_joke_or_trivia') {
    const jokes = [
      "Why do programmers wear glasses? Because they can't C#.",
      "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
      "There are 10 types of people in the world: those who understand binary, and those who don't.",
      "What is a programmer's favorite hangout place? Foo Bar."
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  return `Tool ${name} is not supported in client-side serverless mode.`;
}

function getToolDisplayName(name) {
  const map = {
    get_weather: 'Weather',
    calculator: 'Calculator',
    convert_currency: 'Currency',
    wikipedia_search: 'Wikipedia',
    generate_qr_code: 'QR Code',
    get_datetime: 'DateTime',
    define_word: 'Dictionary',
    get_ip_info: 'IP Lookup',
    get_joke_or_trivia: 'Jokes'
  };
  return map[name] || name;
}

function getToolIcon(name) {
  const map = {
    get_weather: '🌦',
    calculator: '🧮',
    convert_currency: '💱',
    wikipedia_search: '🌐',
    generate_qr_code: '📌',
    get_datetime: '🕐',
    define_word: '📚',
    get_ip_info: '🌐',
    get_joke_or_trivia: '😄'
  };
  return map[name] || '🔧';
}
