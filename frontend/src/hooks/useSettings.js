import { useState, useEffect, useCallback } from 'react';
import { insforge } from '../utils/insforge';

const DEFAULT_SETTINGS = {
  theme: 'dark',
  font_size: 'medium',
  provider: 'groq',
  connection_mode: 'serverless',
  api_key: '',
  model: 'llama-3.1-8b-instant',
  tts_voice: 'en-GB-MaisieNeural'
};

export function useSettings(session) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load settings on mount or session change
  useEffect(() => {
    const loadSettings = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      try {
        if (session.user.id === 'guest' || session.user.id?.startsWith('local_') || session.user.isLocal) {
          const localSettings = JSON.parse(localStorage.getItem(`apex_settings_${session.user.id}`) || 'null');
          if (localSettings) {
            setSettings({ ...DEFAULT_SETTINGS, ...localSettings });
          }
          return;
        }

        const { data, error } = await insforge
          .from('user_settings')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching settings:', error);
        } else if (data) {
          setSettings({
            theme: data.theme || 'dark',
            font_size: data.font_size || 'medium',
            provider: data.provider || 'groq',
            connection_mode: data.connection_mode || 'serverless',
            api_key: data.api_key || '',
            model: data.model || 'llama-3.1-8b-instant',
            tts_voice: data.tts_voice || 'en-GB-MaisieNeural'
          });
        } else {
          // No settings exist yet, insert defaults
          await insforge.from('user_settings').insert([{
            user_id: session.user.id,
            ...DEFAULT_SETTINGS
          }]);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [session]);

  // Apply theme to document when settings.theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Update specific setting and sync to DB
  const updateSetting = useCallback(async (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    if (!session?.user?.id) return;

    if (session.user.id === 'guest' || session.user.id?.startsWith('local_') || session.user.isLocal) {
      const current = JSON.parse(localStorage.getItem(`apex_settings_${session.user.id}`) || '{}');
      current[key] = value;
      localStorage.setItem(`apex_settings_${session.user.id}`, JSON.stringify(current));
      return;
    }

    try {
      await insforge
        .from('user_settings')
        .update({ [key]: value, updated_at: new Date().toISOString() })
        .eq('user_id', session.user.id);
    } catch (err) {
      console.error(`Failed to sync setting ${key}`, err);
    }
  }, [session]);

  return { settings, updateSetting, loading };
}
