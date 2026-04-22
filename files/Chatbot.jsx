// src/pages/Chatbot.jsx
import { useState, useRef, useEffect } from 'react';

const BOT_RESPONSES = {
  emergency:   { text: "I'm treating this as urgent. Activating geo-matching for nearby donors now.\n\nPlease also contact your hospital blood bank directly. Our system is searching for the nearest compatible donors.", chips: ['Track donor status', 'Contact blood bank', 'Report location'] },
  eligibility: { text: "Let's do a quick pre-screening. I'll ask 5 short questions.\n\nFirst: how old are you?", chips: [] },
  diabetes:    { text: "People with well-controlled Type 2 diabetes can usually donate, provided blood sugar is normal on the day and there's no insulin dependency. I recommend our full eligibility checker for a detailed assessment.", chips: ['Open eligibility checker', 'Ask another question'] },
  process:     { text: "Here's what to expect during a donation:\n\n1. Registration & ID check — 5 min\n2. Health screening (Hb, BP, pulse) — 10 min\n3. Blood collection — 8–10 min\n4. Rest & refreshments — 15 min\n\nTotal: about 45 minutes.", chips: ['Book a slot', 'What to eat before?', 'Check eligibility'] },
  default:     { text: "I understand your query. Let me check our blood donation guidelines for you. For complex or urgent medical questions, our health team is available — I'll connect you if needed.", chips: ['Check eligibility', 'Find nearest camp', 'Speak to expert'] },
};

function getResponse(msg) {
  const m = msg.toLowerCase();
  if (/urgent|emergency|critical|need blood|patient|icu|surgery/.test(m)) return { ...BOT_RESPONSES.emergency, intent: 'emergency' };
  if (/eligib|check|can i donate/.test(m))                                 return { ...BOT_RESPONSES.eligibility, intent: 'check_my_eligibility' };
  if (/diabet|sugar|insulin/.test(m))                                      return { ...BOT_RESPONSES.diabetes, intent: 'ask_eligibility_condition' };
  if (/process|how.*work|what happens|procedure/.test(m))                  return { ...BOT_RESPONSES.process, intent: 'ask_donation_process' };
  return { ...BOT_RESPONSES.default, intent: 'general_query' };
}

const INITIAL = [{ role: 'bot', text: "Hello! I'm Rasa, your Blood Bridge AI assistant.\n\nI can help you check donation eligibility, handle emergency blood requests, or answer any questions about the donation process.", intent: null, chips: ['Check eligibility', 'I need blood urgently', 'Donation process'] }];

export default function Chatbot() {
  const [messages, setMessages] = useState(INITIAL);
  const [input, setInput] = useState('');
  const [chips, setChips] = useState(INITIAL[0].chips);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setChips([]);
    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setTimeout(() => {
      const r = getResponse(msg);
      setMessages((prev) => [...prev, { role: 'bot', text: r.text, intent: r.intent, chips: r.chips }]);
      setChips(r.chips);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-bb-cream py-[80px] px-4 md:px-12">
      <div className="max-w-[700px] mx-auto">
        <div className="bg-white rounded-bb-lg border border-bb-ink-10 overflow-hidden shadow-[0_8px_40px_rgba(14,12,13,0.08)]">

          {/* Header */}
          <div className="bg-bb-ink px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-bb-red flex items-center justify-center text-white text-[1rem] flex-shrink-0">🩸</div>
            <div>
              <h4 className="text-white font-serif text-[0.95rem]">Rasa · Blood Bridge AI</h4>
              <p className="text-bb-ink-30 text-[0.78rem]">NLU-powered donation assistant</p>
            </div>
            <div className="ml-auto w-2 h-2 bg-[#2ECC71] rounded-full" />
          </div>

          {/* Messages */}
          <div className="p-5 min-h-[360px] max-h-[420px] overflow-y-auto flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 items-start ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[0.7rem] font-medium flex-shrink-0 ${m.role === 'user' ? 'bg-bb-red-light text-bb-red' : 'bg-bb-ink-10 text-bb-ink-60'}`}>
                  {m.role === 'user' ? 'U' : 'R'}
                </div>
                <div>
                  <div className={`px-3.5 py-2.5 rounded-bb text-[0.88rem] leading-relaxed max-w-[75%] whitespace-pre-line ${m.role === 'user' ? 'bg-bb-red text-white rounded-tr-none' : 'bg-bb-ink-10 text-bb-ink rounded-tl-none'}`}>
                    {m.text}
                  </div>
                  {m.intent && (
                    <div className="mt-1 text-[0.68rem] text-bb-ink-60">
                      Just now{' '}
                      <span className="inline-block bg-bb-cream border border-bb-ink-10 font-mono text-bb-ink-60 px-2 py-0.5 rounded-full text-[0.65rem]">
                        {m.intent} · 91% conf
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick-reply chips */}
          {chips.length > 0 && (
            <div className="px-5 pb-3 flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <button
                  key={c}
                  onClick={() => send(c)}
                  className="bg-bb-cream border border-bb-ink-10 text-bb-ink text-[0.8rem] px-3.5 py-1.5 rounded-full cursor-pointer font-sans hover:bg-bb-red-light hover:text-bb-red hover:border-bb-red-mid transition-all"
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="px-4 py-3.5 border-t border-bb-ink-10 flex gap-2.5 items-center">
            <input
              className="flex-1 bg-bb-cream border border-bb-ink-10 rounded-full px-4 py-2.5 text-[0.88rem] font-sans outline-none transition-colors focus:border-bb-red"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button
              onClick={() => send()}
              className="w-9 h-9 bg-bb-red text-white border-none rounded-full cursor-pointer flex items-center justify-center text-base hover:bg-bb-red-dark transition-colors"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
