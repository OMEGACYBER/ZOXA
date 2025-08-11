const Docs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6 bg-white/70 p-6 rounded-xl">
        <h1 className="text-3xl font-bold">About & Documentation</h1>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">What is ZOXAA?</h2>
          <p>ZOXAA is a voice-first AI companion with emotional intelligence, powered by OpenAI Whisper (STT) and TTS-1-HD (TTS). It adapts tone and pacing to your emotions and supports natural interruptions.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">How conversations work</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Start Call begins a hands-free loop: ZOXAA greets, listens, replies, then listens again.</li>
            <li>Interrupt anytime—she stops and responds to your latest input.</li>
            <li>Anti-hallucination prompt prevents guessing when facts are unknown.</li>
          </ul>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Privacy</h2>
          <p>We minimize data sent to servers and never sell your data. See Privacy for details.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Roadmap</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>True real-time duplex via OpenAI Realtime API</li>
            <li>On-device VAD for precise turn-taking</li>
            <li>Richer prosody control</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Docs;
