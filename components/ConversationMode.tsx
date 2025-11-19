import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { SCENARIOS } from '../constants';
import { ChatMessage } from '../types';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, ContactShadows, RoundedBox, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { GoogleGenAI } from "@google/genai";

// --- 3D AVATAR COMPONENT ---
interface SignerAvatarProps {
  state: 'idle' | 'listening' | 'signing';
  gesture: string;
}

const SignerAvatar: React.FC<SignerAvatarProps> = ({ state, gesture }) => {
  const group = useRef<THREE.Group>(null);
  const leftHand = useRef<THREE.Mesh>(null);
  const rightHand = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Group>(null);
  const leftEye = useRef<THREE.Mesh>(null);
  const rightEye = useRef<THREE.Mesh>(null);

  // Animation State Machine Weights
  const weights = useRef({ idle: 1, listening: 0, signing: 0 });

  // Procedural Animation Logic
  useFrame((ctx, delta) => {
    const t = ctx.clock.getElapsedTime();
    const w = weights.current;

    // 1. UPDATE WEIGHTS
    const blendSpeed = 3 * delta;
    
    const targetIdle = state === 'idle' ? 1 : 0;
    const targetListening = state === 'listening' ? 1 : 0;
    const targetSigning = state === 'signing' ? 1 : 0;

    w.idle = THREE.MathUtils.lerp(w.idle, targetIdle, blendSpeed);
    w.listening = THREE.MathUtils.lerp(w.listening, targetListening, blendSpeed);
    w.signing = THREE.MathUtils.lerp(w.signing, targetSigning, blendSpeed);

    // 2. DEFINE POSES
    
    // --- IDLE ---
    const idleLeftPos = new THREE.Vector3(-1.2, -1.5, 0.2);
    const idleRightPos = new THREE.Vector3(1.2, -1.5, 0.2);
    idleLeftPos.y += Math.sin(t) * 0.05;
    idleRightPos.y += Math.sin(t) * 0.05;
    const idleHeadRot = new THREE.Vector3(0, 0, 0);

    // --- LISTENING ---
    const listenLeftPos = new THREE.Vector3(-1.1, -1.3, 0.4);
    const listenRightPos = new THREE.Vector3(1.1, -1.3, 0.4);
    const listenHeadRot = new THREE.Vector3(0.1, Math.sin(t * 0.5) * 0.1, 0);

    // --- SIGNING ---
    const signLeftPos = new THREE.Vector3(-0.5, -0.5, 0.5);
    const signRightPos = new THREE.Vector3(0.5, -0.5, 0.5);
    const signHeadRot = new THREE.Vector3(Math.sin(t * 4) * 0.05, Math.sin(t * 2) * 0.05, 0);

    if (gesture === 'wave') {
        signRightPos.set(1.5, 0.5 + Math.sin(t * 10) * 0.3, 0.5);
        signRightPos.x += Math.cos(t * 10) * 0.2;
        signLeftPos.copy(idleLeftPos); 
    } else if (gesture === 'explain') {
        signLeftPos.x += Math.sin(t * 5) * 0.4;
        signLeftPos.y += Math.cos(t * 5) * 0.2;
        signRightPos.x -= Math.sin(t * 5) * 0.4;
        signRightPos.y += Math.cos(t * 5) * 0.2;
    } else if (gesture === 'thinking') {
        signRightPos.set(0.4, 0.4, 0.7);
        signRightPos.y += Math.sin(t * 2) * 0.05;
        signLeftPos.set(-0.8, -1.4, 0.4);
    } else if (gesture === 'emphasize') {
        const chop = Math.abs(Math.sin(t * 6));
        signLeftPos.y -= chop * 0.3;
        signRightPos.y -= chop * 0.3;
        signHeadRot.x += chop * 0.1;
    } else {
        signLeftPos.x += Math.sin(t * 3) * 0.3;
        signRightPos.x -= Math.sin(t * 3) * 0.3;
        signLeftPos.y += Math.cos(t * 4) * 0.2;
        signRightPos.y += Math.cos(t * 4.2) * 0.2;
    }

    // 3. BLEND POSES
    const finalLeft = new THREE.Vector3()
        .addScaledVector(idleLeftPos, w.idle)
        .addScaledVector(listenLeftPos, w.listening)
        .addScaledVector(signLeftPos, w.signing);

    const finalRight = new THREE.Vector3()
        .addScaledVector(idleRightPos, w.idle)
        .addScaledVector(listenRightPos, w.listening)
        .addScaledVector(signRightPos, w.signing);

    const finalHeadRot = new THREE.Vector3()
        .addScaledVector(idleHeadRot, w.idle)
        .addScaledVector(listenHeadRot, w.listening)
        .addScaledVector(signHeadRot, w.signing);

    // 4. APPLY
    if (leftHand.current) leftHand.current.position.copy(finalLeft);
    if (rightHand.current) rightHand.current.position.copy(finalRight);
    
    if (head.current) {
        head.current.position.y = 0.5 + Math.sin(t * 2) * 0.02;
        head.current.rotation.set(finalHeadRot.x, finalHeadRot.y, finalHeadRot.z);
    }

    // Eye blinking and interaction
    const blink = Math.abs(Math.sin(t * 0.5)) > 0.98;
    const eyeScaleY = blink ? 0.1 : 1;

    if (leftEye.current) {
        // @ts-ignore
        if(leftEye.current.material && leftEye.current.material.color) {
             const targetColor = state === 'listening' ? new THREE.Color('#0BE6A8') :
                                state === 'signing' ? new THREE.Color('#1174F2') :
                                new THREE.Color('#1E293B');
             // @ts-ignore
             leftEye.current.material.color.lerp(targetColor, 0.05);
        }
        leftEye.current.scale.y = THREE.MathUtils.lerp(leftEye.current.scale.y, eyeScaleY, 0.2);
    }
    if (rightEye.current) {
        // @ts-ignore
        if(rightEye.current.material && rightEye.current.material.color) {
             const targetColor = state === 'listening' ? new THREE.Color('#0BE6A8') :
                                state === 'signing' ? new THREE.Color('#1174F2') :
                                new THREE.Color('#1E293B');
             // @ts-ignore
             rightEye.current.material.color.lerp(targetColor, 0.05);
        }
        rightEye.current.scale.y = THREE.MathUtils.lerp(rightEye.current.scale.y, eyeScaleY, 0.2);
    }
  });

  return (
    <group ref={group}>
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
            {/* HEAD */}
            <group ref={head} position={[0, 0.5, 0]}>
                <RoundedBox args={[1.4, 1.6, 1.2]} radius={0.5} smoothness={4}>
                    <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.1} />
                </RoundedBox>
                <RoundedBox args={[1.1, 0.6, 0.1]} radius={0.1} position={[0, 0.1, 0.56]}>
                    <meshStandardMaterial color="#0F1C2E" roughness={0.2} metalness={0.8} />
                </RoundedBox>
                <Sphere ref={leftEye} args={[0.15, 16, 16]} position={[-0.3, 0.1, 0.6]}>
                    <meshBasicMaterial color="#1174F2" toneMapped={false} />
                </Sphere>
                <Sphere ref={rightEye} args={[0.15, 16, 16]} position={[0.3, 0.1, 0.6]}>
                    <meshBasicMaterial color="#1174F2" toneMapped={false} />
                </Sphere>
                <Cylinder args={[0.02, 0.02, 0.5]} position={[0, 0.9, 0]}>
                     <meshStandardMaterial color="#64748b" />
                </Cylinder>
                <Sphere args={[0.08]} position={[0, 1.15, 0]}>
                     <meshStandardMaterial color={state === 'listening' ? "#0BE6A8" : "#FF4D6D"} emissive={state === 'listening' ? "#0BE6A8" : "#FF4D6D"} emissiveIntensity={0.5} />
                </Sphere>
            </group>

            {/* BODY */}
            <group position={[0, -1.2, 0]}>
                 <RoundedBox args={[1.2, 1.5, 0.8]} radius={0.3} smoothness={4}>
                     <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.5} />
                 </RoundedBox>
                 <Cylinder args={[0.3, 0.3, 0.1]} rotation={[Math.PI/2, 0, 0]} position={[0, 0.2, 0.41]}>
                     <meshStandardMaterial color="#1174F2" emissive="#1174F2" emissiveIntensity={0.5} />
                 </Cylinder>
            </group>

            {/* HANDS */}
            <group ref={leftHand} position={[-1.2, -1.5, 0.2]}>
                 <RoundedBox args={[0.4, 0.5, 0.1]} radius={0.1}>
                     <meshStandardMaterial color="#e2e8f0" />
                 </RoundedBox>
                 <RoundedBox args={[0.15, 0.3, 0.1]} position={[0.25, -0.1, 0]} rotation={[0, 0, 0.5]}>
                     <meshStandardMaterial color="#e2e8f0" />
                 </RoundedBox>
            </group>

            <group ref={rightHand} position={[1.2, -1.5, 0.2]}>
                 <RoundedBox args={[0.4, 0.5, 0.1]} radius={0.1}>
                     <meshStandardMaterial color="#e2e8f0" />
                 </RoundedBox>
                 <RoundedBox args={[0.15, 0.3, 0.1]} position={[-0.25, -0.1, 0]} rotation={[0, 0, -0.5]}>
                     <meshStandardMaterial color="#e2e8f0" />
                 </RoundedBox>
            </group>
        </Float>
        
        <ContactShadows opacity={0.4} scale={10} blur={2.5} far={4} />
    </group>
  );
};

const ConversationMode: React.FC = () => {
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'avatar', text: `Hello! I'm ready to practice ${SCENARIOS[0].name} signs with you.`, timestamp: Date.now() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'signing'>('idle');
  const [activeGesture, setActiveGesture] = useState('generic');
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // Use 'any' to avoid type import issues at runtime if Chat is not exported as value
  const chatSessionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // 1. Initialize Gemini Chat
  useEffect(() => {
    const initChat = () => {
      try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("API Key is missing. Ensure process.env.API_KEY is set.");
            return;
        }

        const ai = new GoogleGenAI({ apiKey });
        const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
             temperature: 1,
             systemInstruction: `You are a helpful 3D avatar named Alex helping a user practice American Sign Language (ASL) in a ${scenario.name} setting.
             Your goal is to keep the conversation engaging, simple, and educational.
             
             CRITICAL INSTRUCTION:
             You MUST start every response with one of the following gesture tags in brackets:
             [WAVE] - For greetings or goodbyes
             [EXPLAIN] - When teaching or describing something
             [THINKING] - When pondering a question
             [EMPHASIZE] - For important points or corrections
             [GENERIC] - For general conversation
             
             Example: "[WAVE] Hello there! Ready to practice?"
             
             After the tag, provide a concise response (max 2-3 sentences).
             `
          }
        });
        chatSessionRef.current = chat;
        
        // Reset messages when scenario changes
        setMessages([{ 
            id: Date.now().toString(), 
            sender: 'avatar', 
            text: `Hello! I'm ready to practice ${scenario.name} signs with you.`, 
            timestamp: Date.now() 
        }]);
      } catch (e) {
        console.error("Failed to init Gemini:", e);
      }
    };
    
    initChat();
  }, [scenario]);

  // 2. Scroll Handling
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, avatarState]);

  // 3. Speech Synthesis Function
  const speak = (text: string) => {
    if (!audioEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => {
        setAvatarState('signing');
    };
    
    utterance.onend = () => {
        setAvatarState('idle');
    };

    utterance.onerror = () => {
        setAvatarState('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  // 4. Send Logic
  const handleSend = async () => {
    if (!inputText.trim() || isProcessing) return;

    const textToSend = inputText;
    setInputText('');
    setIsProcessing(true);
    setAvatarState('idle');

    // User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
       if (!chatSessionRef.current) throw new Error("Chat not initialized");

       const result = await chatSessionRef.current.sendMessage({ message: textToSend });
       const rawResponse = result.text;
       
       // Parse Tag
       let gesture = 'generic';
       let cleanText = rawResponse || "";

       if (rawResponse) {
            const tagMatch = rawResponse.match(/^\[([A-Z]+)\]/);
            if (tagMatch) {
                gesture = tagMatch[1].toLowerCase();
                cleanText = rawResponse.replace(/^\[([A-Z]+)\]\s*/, '');
            }
       }

       setActiveGesture(gesture);
       
       const aiMsg: ChatMessage = {
           id: Date.now().toString(),
           sender: 'avatar',
           text: cleanText,
           timestamp: Date.now(),
           isSigning: true
       };
       setMessages(prev => [...prev, aiMsg]);
       
       // Trigger Voice & Animation
       if (audioEnabled) {
           speak(cleanText);
       } else {
           // If audio disabled, simulate signing duration based on text length
           setAvatarState('signing');
           setTimeout(() => setAvatarState('idle'), Math.min(cleanText.length * 60, 5000));
       }

    } catch (error) {
        console.error("Gemini Error:", error);
        const errorMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'avatar',
            text: "I'm having trouble connecting to my brain right now. Can we try again?",
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsProcessing(false);
    }
  };

  // 5. Speech Recognition
  const toggleRecording = () => {
    if (isRecording) {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
        setAvatarState('idle');
        return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Browser does not support Speech Recognition.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        setIsRecording(true);
        setAvatarState('listening');
    };

    recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result) => result.transcript)
            .join('');
        setInputText(transcript);
    };

    recognition.onerror = (event: any) => {
        console.error("Speech error", event);
        setIsRecording(false);
        setAvatarState('idle');
    };

    recognition.onend = () => {
        setIsRecording(false);
        setAvatarState('idle');
        // Optionally send automatically if desired, but explicit send is often safer for UI
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-6 bg-slate-900 overflow-hidden">
      
      {/* Left: 3D Avatar Stage */}
      <div className="flex-grow-[2] bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-slate-700 relative overflow-hidden shadow-2xl flex flex-col">
         <div className="absolute top-4 left-4 z-10 flex gap-2">
            <div className="bg-black/40 backdrop-blur text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold border border-white/10">
               <span className="text-2xl">{scenario.icon}</span> {scenario.name}
            </div>
         </div>

         {/* 3D Scene Container */}
         <div className="flex-1 relative w-full h-full">
             <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
                <Environment preset="city" />
                <SignerAvatar state={avatarState} gesture={activeGesture} />
             </Canvas>

             {/* Status Text Overlay */}
             <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
                 <div className="inline-block bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/5">
                    <span className="text-slate-400 text-sm font-mono tracking-widest uppercase flex items-center gap-2">
                        {avatarState === 'idle' && 'Waiting for you...'}
                        {avatarState === 'listening' && (
                            <><span className="w-2 h-2 bg-brand-accent rounded-full animate-pulse"/> Listening...</>
                        )}
                        {avatarState === 'signing' && (
                            <><span className="w-2 h-2 bg-brand-blue rounded-full animate-pulse"/> {activeGesture.toUpperCase()} MODE...</>
                        )}
                    </span>
                 </div>
             </div>
         </div>

         {/* Control Bar */}
         <div className="p-4 bg-slate-900/50 backdrop-blur border-t border-slate-800 flex justify-center gap-4 z-10">
            <button 
                className={`p-4 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.4)] scale-110' : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'}`}
                onClick={toggleRecording}
            >
               <Mic className="w-6 h-6" />
            </button>
            <button 
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-4 rounded-full text-white hover:bg-slate-700 border border-slate-700 ${audioEnabled ? 'bg-slate-800' : 'bg-slate-800/50 text-slate-500'}`}
            >
               {audioEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
         </div>
      </div>

      {/* Right: Chat & Context */}
      <div className="flex-1 flex flex-col bg-brand-surface rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          {/* Scenario Selector */}
          <div className="p-4 border-b border-slate-800 overflow-x-auto no-scrollbar">
              <div className="flex gap-2">
                 {SCENARIOS.map(s => (
                     <button 
                        key={s.id}
                        onClick={() => setScenario(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                            scenario.id === s.id ? 'bg-brand-blue text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                     >
                        {s.icon} {s.name}
                     </button>
                 ))}
              </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50" ref={scrollRef}>
              {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-md ${
                          msg.sender === 'user' 
                          ? 'bg-brand-blue text-white rounded-br-none' 
                          : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                      }`}>
                          {msg.text}
                      </div>
                  </div>
              ))}
              {avatarState === 'signing' && (
                  <div className="flex justify-start">
                      <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-700 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                          <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                      </div>
                  </div>
              )}
              {isProcessing && !avatarState && (
                   <div className="flex justify-center py-2">
                      <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
                   </div>
              )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-brand-surface border-t border-slate-800">
             <div className="relative">
                 <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={isRecording ? "Listening..." : "Type a message..."}
                    disabled={isProcessing || isRecording}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-brand-blue placeholder-slate-600 transition-all disabled:opacity-50"
                 />
                 <button 
                    onClick={handleSend}
                    disabled={isProcessing || !inputText.trim()}
                    className="absolute right-2 top-2 p-1.5 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed"
                 >
                     <Send className="w-4 h-4" />
                 </button>
             </div>
          </div>
      </div>
    </div>
  );
};

export default ConversationMode;