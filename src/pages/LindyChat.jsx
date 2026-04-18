export default function LindyChat() {
  return (
    <div className="max-w-3xl mx-auto text-center py-16 px-6">
      <div className="rounded-2xl bg-cyber-dark/60 border border-cyber-border p-10">
        <h2 className="text-2xl font-mono text-cyber-green mb-4">
          Lindy AI Appointment Setter
        </h2>
        <p className="text-gray-400 mb-6 font-mono text-sm leading-relaxed">
          Our AI-powered appointment setter is active on this page. Click the
          chat widget in the <span className="text-cyber-green">bottom-right corner</span> to
          start a conversation.
        </p>
        <div className="space-y-3 text-left max-w-md mx-auto text-sm font-mono text-gray-500">
          <p className="text-gray-300 mb-2">Lindy AI can:</p>
          <div className="flex items-center gap-2">
            <span className="text-cyber-green">&#10003;</span>
            <span>Collect lead information conversationally</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-cyber-green">&#10003;</span>
            <span>Capture name, email, phone &amp; company</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-cyber-green">&#10003;</span>
            <span>Save leads to Google Sheets automatically</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-cyber-green">&#10003;</span>
            <span>Send confirmation emails via Gmail</span>
          </div>
        </div>
      </div>
    </div>
  );
}
