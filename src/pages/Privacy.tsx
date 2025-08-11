const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6 bg-white/70 p-6 rounded-xl">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-gray-700">We care about your privacy. This policy explains what data we collect and how we use it.</p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
          <li>We collect account info (email, display name) for authentication.</li>
          <li>Voice data is sent to OpenAI Whisper for transcription and discarded after processing.</li>
          <li>We store minimal conversation metadata to improve service quality. You can request deletion.</li>
          <li>We never sell your data.</li>
        </ul>
      </div>
    </div>
  );
};

export default Privacy;
