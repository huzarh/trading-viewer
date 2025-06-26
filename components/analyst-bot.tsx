import { useState, useRef, useEffect } from "react"
import { Bot, X, Send } from "lucide-react"

export default function AnalystBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: "bot", text: "Merhaba! Ben senin Analist Asistanınım. Grafik, teknik analiz veya yatırım hakkında sorularını sorabilirsin." }
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, open])

  const handleSend = () => {
    if (!input.trim()) return
    setMessages((msgs) => [...msgs, { from: "user", text: input }])
    // Dummy bot yanıtı
    setTimeout(() => {
      setMessages((msgs) => [...msgs, { from: "bot", text: "Sorduğun: " + input + "\nBu konuda sana yardımcı olabilirim! Haber,Sayasal,Grafiksel - Analizlerle" }])
    }, 800)
    setInput("")
  }

  return (
    <>
      {/* Sabit bot açma butonu */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-yellow-400 text-yellow-600 rounded-full shadow-lg w-16 h-16 flex items-center justify-center hover:bg-yellow-500 transition-all border-2 border-yellow-500"
        onClick={() => setOpen(true)}
        style={{ display: open ? 'none' : 'flex' }}
        aria-label="Analist Botu Aç"
      >
        <Bot className="h-8 w-8 text-yellow-600" />
      </button>
      {/* Chat penceresi */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 max-w-[95vw] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8">
          <div className="flex items-center justify-between px-4 py-2 border-b bg-primary text-primary-foreground">
            <span className="font-bold text-lg flex items-center gap-2"><Bot className="h-5 w-5" />Analist Bot</span>
            <button onClick={() => setOpen(false)} aria-label="Kapat"><X className="h-5 w-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-muted/30" style={{ minHeight: 220, maxHeight: 320 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`rounded-lg px-3 py-2 max-w-[80%] text-sm 
                  ${msg.from === "user" ? "bg-sky-900 text-white" : "bg-muted text-foreground border"}
                `}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="flex items-center gap-2 border-t px-3 py-2 bg-background" onSubmit={e => { e.preventDefault(); handleSend() }}>
            <input
              className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Sorunu yaz..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              autoFocus
            />
            <button type="submit" className="text-primary hover:text-primary/80" aria-label="Gönder"><Send className="h-5 w-5" /></button>
          </form>
        </div>
      )}
    </>
  )
} 