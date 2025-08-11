const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6 bg-white/70 p-6 rounded-xl">
        <h1 className="text-3xl font-bold">Terms & Conditions</h1>
        <p className="text-sm text-gray-700">By creating an account or using ZOXAA, you agree to these Terms.</p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
          <li>ZOXAA is not a medical provider. For emergencies, contact local services.</li>
          <li>Do not upload illegal content or violate others' rights.</li>
          <li>We may change these terms with notice. Continued use implies acceptance.</li>
          <li>Your data is handled per the Privacy Policy.</li>
        </ul>
      </div>
    </div>
  );
};

export default Terms;
