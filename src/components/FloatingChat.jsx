import React, { useState } from 'react';
import { BsChatDotsFill, BsX, BsSendFill } from 'react-icons/bs';

const FloatingChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! Welcome to Ceylon AutoCar. How can I help you rent a car today?", isBot: true }
    ]);
    const [inputValue, setInputValue] = useState("");

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Add User Message
        const userMsg = { id: Date.now(), text: inputValue, isBot: false };
        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");

        // Simulate Bot Reply
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, text: "Thank you! An agent will be with you shortly.", isBot: true }
            ]);
        }, 1000);
    };

    return (
        <>
            {
                !isOpen && (
                    <button
                        onClick={toggleChat}
                        className="btn shadow-lg d-flex align-items-center justify-content-center"
                        style={{
                            position: 'fixed',
                            bottom: '30px',
                            right: '30px',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: '#ffc107',
                            color: 'white',
                            border: 'none',
                            zIndex: 9999
                        }}
                    >
                        <BsChatDotsFill size={24} />
                    </button>
                )}

            {isOpen && (
                <div
                    className="card shadow-lg border-0"
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        right: '30px',
                        width: '350px',
                        height: '500px',
                        zIndex: 9999,
                        borderRadius: '15px',
                        overflow: 'hidden',
                        fontFamily: 'Poppins, sans-serif'
                    }}
                >
                    {/* header */}
                    <div className="card-header text-white d-flex justify-content-between align-items-center py-3" style={{ backgroundColor: '#212529' }}>
                        <div>
                            <h6 className="m-0 fw-bold">Ceylon AutoCar</h6>
                            <small style={{ fontSize: '0.75rem', opacity: 0.8 }}>Online Support</small>
                        </div>
                        <button onClick={toggleChat} className="btn btn-sm text-white">
                            <BsX size={28} />
                        </button>
                    </div>

                    {/* Chat Body */}
                    <div className="card-body overflow-auto" style={{ backgroundColor: '#f4f4f9' }}>
                        <div className="d-flex flex-column gap-3">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`d-flex ${msg.isBot ? 'justify-content-start' : 'justify-content-end'}`}
                                >
                                    <div
                                        className="p-3 shadow-sm"
                                        style={{
                                            maxWidth: '75%',
                                            borderRadius: '15px',
                                            borderBottomLeftRadius: msg.isBot ? '0' : '15px',
                                            borderBottomRightRadius: msg.isBot ? '15px' : '0',
                                            backgroundColor: msg.isBot ? 'white' : '#e74c3c', // Red for User
                                            color: msg.isBot ? 'black' : 'white',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Input */}
                    <div className="card-footer bg-white p-3 border-0">
                        <form onSubmit={handleSend} className="d-flex gap-2">

                            <input type="text" className="form-control rounded-pill bg-light border-0"
                                placeholder="Type a message..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />

                            <button type="submit" className="btn btn-dark rounded-circle d-flex align-items-center justify-content-center"
                                style={
                                    {
                                        width: '40px',
                                        height: '40px'
                                    }
                                } >

                                <BsSendFill size={16} />

                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default FloatingChat;