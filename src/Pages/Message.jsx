import { useState } from "react";
import { FiSend, FiX } from "react-icons/fi";

const Message = ({ onClose }) => {
    // FIX 1: Changed 'message' to 'messages' (plural) to match the map function below
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello, welcome to Ceylon AutoCar! How can we help you today?",
            sender: "AutoBot"
        }
    ]);
    
    // FIX 2: Changed 'inputMessage' to 'setInput' to match your onChange handler
    const [input, setInput] = useState("");

    const handleSend = (e) => {
        e.preventDefault(); // FIX 3: Was 'e.Default()', which is not valid JavaScript
        if (!input.trim()) return;

        const newMessage = {
            id: Date.now(),
            text: input,
            sender: "user" // Standardized sender name
        };

        setMessages([...messages, newMessage]);
        setInput(""); // Now correctly clears the input

        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: "Thanks for your message! We will reply shortly.",
                    sender: "AutoBot"
                }
            ]);
        }, 1000);
    };

    return (
        <div className="card shadow-lg border-0" style={{ position: 'fixed', bottom: '100px', right: '20px', width: '350px', height: '500px', zIndex: 1050, borderRadius: '15px', overflow: 'hidden' }}>
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
                <h6 className="m-0 fw-bold">Support Chat</h6>
                <button onClick={onClose} className="btn btn-sm btn-dark p-0">
                    <FiX size={20} />
                </button>
            </div>

            <div className="card-body overflow-auto" style={{ backgroundColor: '#EAE7DC', scrollbarWidth: 'none' }}>
                <div className="d-flex flex-column gap-3">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                            <div className={`p-3 rounded-3 shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white text-dark'}`} style={{ maxWidth: '80%', fontSize: '0.9rem' }}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card-footer bg-white p-3 border-top-0">
                <form onSubmit={handleSend} className="d-flex align-items-center gap-2">
                    <input type="text" className="form-control rounded-pill border-0 bg-light px-4" placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} style={{ boxShadow: 'none' }} />
                    <button type="submit" className="btn btn-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                        <FiSend size={18} className="ms-1" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Message;