import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const tiers = [
  { price: 9, name: "Starter", features: [
    "Basic text chat",
    "5 voice replies/day",
    "Standard Nova voice",
    "Basic memory (session)"
  ]},
  { price: 19, name: "Plus", features: [
    "Unlimited text chat",
    "200 voice replies/month",
    "HD Nova voice + prosody",
    "Emotion-adaptive responses",
    "Conversation history"
  ]},
  { price: 39, name: "Pro", features: [
    "Unlimited text chat",
    "Unlimited voice replies",
    "HD Nova voice + emotions",
    "Interruptions + VAD",
    "Priority speed",
    "Advanced memory & goals"
  ]},
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Pricing</h1>
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <Card key={t.name} className="p-6 bg-white/80">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">{t.name}</h2>
                <div className="text-4xl font-bold">${t.price}<span className="text-base text-gray-500">/mo</span></div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {t.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <div className="mt-6">
                <Button className="w-full" variant="default">Choose {t.name}</Button>
              </div>
            </Card>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">Payments not enabled yet. Plans are indicative.</p>
      </div>
    </div>
  );
};

export default Pricing;
