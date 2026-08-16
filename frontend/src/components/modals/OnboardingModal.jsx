import { useState } from 'react';
import { Key, Wrench, MessageSquare, ChevronRight, SkipForward } from 'lucide-react';
import { TOOL_DEFINITIONS } from '../../utils/constants';

export default function OnboardingModal({ onComplete, onSkip }) {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState('');

  const steps = [
    {
      icon: <Key size={32} />,
      title: 'Enter your Groq API Key',
      description: 'IN NET CREATION uses Groq\'s ultra-fast LLaMA 3.3 70B model. Get a free key at console.groq.com',
    },
    {
      icon: <Wrench size={32} />,
      title: 'Your Powerful Toolkit',
      description: '15+ live tools are ready to go — weather, search, stocks, calculators, and more.',
    },
    {
      icon: <MessageSquare size={32} />,
      title: 'Start Chatting',
      description: 'You\'re all set! Ask IN NET CREATION anything and watch the magic happen.',
    }
  ];

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else onComplete(apiKey);
  };

  return (
    <div className="onboarding-overlay animate-fade-in">
      <div className="glass-card max-w-md w-full mx-4 p-8 animate-scale-pop">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="IN NET CREATION" className="w-16 h-16 rounded-2xl mx-auto mb-4 object-contain animate-glow-pulse" />
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            Welcome to IN NET CREATION
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Reversed Creation — created by Manohar
          </p>
        </div>

        {/* Step content */}
        <div className="text-center mb-8 animate-fade-in" key={step}>
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
               style={{ background: 'var(--bg-card)', color: 'var(--accent)' }}>
            {steps[step].icon}
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            {steps[step].title}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {steps[step].description}
          </p>
        </div>

        {/* Step-specific content */}
        {step === 0 && (
          <div className="mb-6">
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="gsk_xxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/40"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
              id="onboarding-api-key"
            />
            <p className="text-[10px] mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
              Optional — you can also set this later in Settings. A default key is already configured.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="mb-6 grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
            {TOOL_DEFINITIONS.slice(0, 9).map(t => (
              <div key={t.id} className="glass-card p-2.5 text-center">
                <span className="text-xl">{t.icon}</span>
                <p className="text-[10px] mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>{t.name}</p>
              </div>
            ))}
          </div>
        )}

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full transition-all" style={{
              background: i === step ? 'var(--accent)' : 'var(--bg-card)',
              transform: i === step ? 'scale(1.3)' : 'scale(1)'
            }} />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button onClick={onSkip} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
                  style={{ color: 'var(--text-muted)' }}>
            <SkipForward size={14} className="inline mr-1" /> Skip
          </button>
          <button onClick={handleNext} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 flex items-center justify-center gap-1"
                  style={{ background: 'var(--accent-gradient)' }}>
            {step === 2 ? 'Get Started' : 'Next'} <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
