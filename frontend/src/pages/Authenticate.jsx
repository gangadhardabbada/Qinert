import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getApiBaseUrl } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Stop, CaretDown, CaretUp, CheckCircle, CircleNotch, XCircle, Copy, Fingerprint, LockKey, Terminal, ChartLine, Eye, Lightning, ShieldCheck, DownloadSimple, Check, EnvelopeSimple, Key, UserFocus, FileText } from '@phosphor-icons/react';

const STAGES = [
  { id: 1, name: "Generate Quantum Challenge", desc: "Creates a high-entropy random challenge using a quantum circuit.\n\nPurpose: Prevent replay attacks." },
  { id: 2, name: "Build Circuit", desc: "Constructs the BB84 quantum circuit required for verification using the Qiskit framework.\n\nPurpose: Encode classical state into quantum superpositions." },
  { id: 3, name: "Run Qiskit", desc: "Dispatches the compiled quantum circuit to the Aer Simulator backend for execution.\n\nPurpose: Perform physical quantum computation." },
  { id: 4, name: "Measure", desc: "Retrieves classical measurement outcomes from the quantum execution by collapsing the wavefunction.\n\nPurpose: Extract raw quantum bits." },
  { id: 5, name: "Generate Session Key", desc: "Applies classical post-processing (e.g., privacy amplification) to derive a highly secure session key.\n\nPurpose: Establish symmetric encryption key." },
  { id: 6, name: "Verify Challenge", desc: "Uses the derived quantum key to cryptographically sign and verify the initial challenge.\n\nPurpose: Prove identity without exposing the key." },
  { id: 7, name: "JWT", desc: "Issues the final JSON Web Token encapsulating the authenticated session state.\n\nPurpose: Grant standardized secure access." }
];

export default function Authenticate() {
  const [flowState, setFlowState] = useState('identity_setup'); // identity_setup, otp_verify, quantum_execution, summary
  
  // Identity State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [tempToken, setTempToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const otpRefs = useRef([]);

  // Quantum Execution State
  const [status, setStatus] = useState('idle'); // idle, running, completed, error
  const [stageStatuses, setStageStatuses] = useState({});
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [expandedStage, setExpandedStage] = useState(null);
  const [measurementsStream, setMeasurementsStream] = useState("");
  
  const wsRef = useRef(null);
  const terminalRef = useRef(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Timer Effect
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email || timer > 0) return;
    
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (res.ok) {
        setTimer(60);
        setFlowState('otp_verify');
      } else {
        if (res.status === 429) {
          setAuthError('Too many requests. Please wait before trying again.');
        } else {
          setAuthError(data.detail || 'Failed to send OTP.');
        }
      }
    } catch (err) {
      setAuthError('Network error connecting to backend.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) return;
    
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString })
      });
      const data = await res.json();
      
      if (res.ok) {
        setTempToken(data.tempToken);
        setFlowState('quantum_execution');
      } else {
        setAuthError(data.detail || 'Invalid OTP.');
        setOtp(['', '', '', '', '', '']); // clear on fail
        otpRefs.current[0].focus();
      }
    } catch (err) {
      setAuthError('Network error connecting to backend.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleStartQuantum = useCallback(() => {
    if (status === 'running' || !tempToken) return;
    setStatus('running');
    setLogs([]);
    setMetrics({});
    setMeasurementsStream("");
    
    const initialStages = {};
    STAGES.forEach(s => initialStages[s.id] = 'Waiting');
    setStageStatuses(initialStages);

    const wsUrl = getApiBaseUrl().replace(/^http/, 'ws') + `/api/v1/qonsole/execute?token=${tempToken}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'log') {
        setLogs(prev => [...prev, { time: data.timestamp, msg: data.message }]);
      } else if (data.type === 'stage_update') {
        setStageStatuses(prev => ({ ...prev, [data.stage]: data.status }));
      } else if (data.type === 'metric_update') {
        setMetrics(prev => ({ ...prev, [data.metric]: data.value }));
      } else if (data.type === 'measurement_stream') {
        setMeasurementsStream(prev => (prev + data.bits).slice(-120));
      } else if (data.type === 'complete') {
        setStatus('completed');
        ws.close();
        setTimeout(() => setFlowState('summary'), 1500); // Transition to summary after 1.5s
      } else if (data.type === 'error') {
        setStatus('error');
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `ERROR: ${data.message}`, isError: true }]);
        ws.close();
      }
    };

    ws.onerror = () => {
      setStatus('error');
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `WebSocket Connection Error`, isError: true }]);
    };
  }, [status, tempToken]);

  // Auto-start quantum execution when entering phase 3
  useEffect(() => {
    let currentWs = null;
    if (flowState === 'quantum_execution' && status === 'idle' && tempToken) {
      handleStartQuantum();
      currentWs = wsRef.current;
    }
    return () => {
      // In strict mode, if it unmounts immediately, we close the socket to prevent leaks
      if (currentWs && (currentWs.readyState === WebSocket.OPEN || currentWs.readyState === WebSocket.CONNECTING)) {
        currentWs.close();
        wsRef.current = null;
        setStatus('idle');
      }
    };
  }, [flowState, status, tempToken, handleStartQuantum]);

  const handleTerminate = useCallback(() => {
    if (wsRef.current) wsRef.current.close();
    setStatus('idle');
    const initialStages = {};
    STAGES.forEach(s => initialStages[s.id] = 'Waiting');
    setStageStatuses(initialStages);
  }, []);

  const downloadCertificate = () => {
    const cert = {
      timestamp: new Date().toISOString(),
      identity: email,
      otp_verified: true,
      quantum_challenge: metrics.challenge || {},
      session_key: metrics.session_key || {},
      quantum_stats: metrics.quantum_stats || {},
      jwt: metrics.jwt || {}
    };
    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qonsole-cert-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (st) => {
    switch (st) {
      case 'Running': return 'text-[#3B82F6]';
      case 'Completed': return 'text-[#22C55E]';
      case 'Failed': return 'text-[#EF4444]';
      default: return 'text-[#A1A1AA]';
    }
  };

  const getStatusIcon = (st) => {
    switch (st) {
      case 'Running': return <CircleNotch className="animate-spin text-[#3B82F6]" size={20} />;
      case 'Completed': return <CheckCircle className="text-[#22C55E]" size={20} />;
      case 'Failed': return <XCircle className="text-[#EF4444]" size={20} />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-[#A1A1AA]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans selection:bg-[#3B82F6]/30 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#111827]/50 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Lightning size={28} className="text-[#3B82F6]" weight="bold" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Qonsole</h1>
            <p className="text-xs text-[#A1A1AA] font-mono hidden md:block">Real-Time Quantum Verification Engine</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 flex flex-col items-center justify-center w-full max-w-[1600px] mx-auto">
        
        {/* PHASE 1: IDENTITY SETUP */}
        {flowState === 'identity_setup' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <div className="bg-[#18181B] border border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="text-[#A1A1AA] text-xs font-bold uppercase tracking-widest mb-4">Step 1</div>
              <div className="flex items-center gap-3 mb-6">
                <UserFocus size={32} className="text-[#3B82F6]" />
                <h2 className="text-2xl font-bold tracking-tight">Identity Verification</h2>
              </div>
              <p className="text-[#A1A1AA] text-sm mb-8">Confirm your identity before initiating the secure quantum session.</p>
              
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Email Address</label>
                  <div className="relative">
                    <EnvelopeSimple size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                    <input 
                      type="email" 
                      required
                      disabled={authLoading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                    />
                  </div>
                </div>

                {authError && <div className="text-[#EF4444] text-sm bg-[#EF4444]/10 border border-[#EF4444]/30 p-3 rounded">{authError}</div>}

                <button disabled={authLoading || !email} type="submit" className="w-full bg-[#FAFAFA] text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                  {authLoading && <CircleNotch className="animate-spin" size={18} />}
                  {authLoading ? "Sending..." : "Send Verification Code"}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* PHASE 2: OTP VERIFY */}
        {flowState === 'otp_verify' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
            <div className="bg-[#18181B] border border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="text-[#A1A1AA] text-xs font-bold uppercase tracking-widest mb-4">Step 2</div>
              <div className="flex items-center gap-3 mb-6">
                <Key size={32} className="text-[#3B82F6]" />
                <h2 className="text-2xl font-bold tracking-tight">Enter OTP</h2>
              </div>
              <div className="flex items-center gap-2 text-[#22C55E] text-sm mb-6 bg-[#22C55E]/10 border border-[#22C55E]/20 p-3 rounded">
                <CheckCircle size={18} />
                <span>Verification code sent to <strong>{email}</strong></span>
              </div>
              
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <div className="flex gap-2 justify-between">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpRefs.current[index] = el)}
                        type="text"
                        maxLength="1"
                        value={digit}
                        disabled={authLoading}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 bg-[#111827] border border-white/10 rounded-lg text-white text-center text-xl font-bold focus:outline-none focus:border-[#3B82F6] transition-colors"
                      />
                    ))}
                  </div>
                </div>
                
                {authError && <div className="text-[#EF4444] text-sm bg-[#EF4444]/10 border border-[#EF4444]/30 p-3 rounded">{authError}</div>}

                <div className="flex flex-col gap-3">
                  <button disabled={authLoading || otp.join('').length !== 6} type="submit" className="w-full bg-[#3B82F6] text-white font-semibold py-3 rounded-lg hover:bg-[#3B82F6]/90 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50 flex items-center justify-center gap-2">
                    {authLoading && <CircleNotch className="animate-spin" size={18} />}
                    Verify OTP
                  </button>
                  <div className="flex justify-between items-center text-sm">
                    <button type="button" onClick={() => setFlowState('identity_setup')} className="text-[#A1A1AA] hover:text-white transition-colors">
                      Back
                    </button>
                    <button type="button" onClick={handleSendOtp} disabled={timer > 0 || authLoading} className="text-[#3B82F6] hover:text-white transition-colors disabled:opacity-50 disabled:hover:text-[#3B82F6]">
                      {timer > 0 ? `Resend Code (${timer}s)` : 'Resend Code'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* PHASE 3: QUANTUM EXECUTION */}
        {flowState === 'quantum_execution' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex-1 flex flex-col gap-6">
            
            <div className="flex justify-between items-end">
              <h2 className="text-2xl font-bold">Quantum Session Dashboard</h2>
              <div className="flex items-center gap-4">
                {/* Trust Card Miniature */}
                <div className="hidden md:flex bg-[#111827] border border-white/10 rounded-lg p-2 px-4 gap-6 text-xs font-mono text-[#A1A1AA]">
                  <div className="flex items-center gap-2"><CheckCircle weight="fill" className="text-[#22C55E]" /> Quantum Randomness</div>
                  <div className="flex items-center gap-2"><CheckCircle weight="fill" className="text-[#22C55E]" /> Replay Protection</div>
                  <div className="flex items-center gap-2"><CheckCircle weight="fill" className="text-[#22C55E]" /> Session Integrity</div>
                </div>

                {status === 'running' ? (
                  <button onClick={handleTerminate} className="flex items-center gap-2 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 px-6 py-2.5 rounded-lg transition-all font-semibold">
                    <Stop weight="fill" /> Terminate
                  </button>
                ) : (
                  <button onClick={handleStartQuantum} className="flex items-center gap-2 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] px-6 py-2.5 rounded-lg transition-all font-semibold">
                    <Play weight="fill" /> {status === 'completed' ? 'Re-Execute' : 'Start Quantum Session'}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
              {/* Left Panel: Layers & Circuit */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#A1A1AA] mb-4 flex items-center gap-2">
                    <ShieldCheck size={18} /> Security Layers
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Layer 1 */}
                    <div className="border border-white/10 bg-[#111827] rounded-lg p-4 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#22C55E]"></div>
                      <div className="text-xs uppercase text-[#A1A1AA] font-bold mb-1">Layer 1: Identity</div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm truncate max-w-[200px]">{email}</span>
                        <span className="text-[#22C55E] flex items-center gap-1 text-sm font-medium"><CheckCircle /> Verified</span>
                      </div>
                    </div>
                    {/* Layer 2 */}
                    <div className="border border-[#3B82F6]/30 bg-[#3B82F6]/5 rounded-lg p-4 relative overflow-hidden">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${status === 'running' ? 'bg-[#3B82F6] animate-pulse' : status === 'completed' ? 'bg-[#22C55E]' : 'bg-[#A1A1AA]'}`}></div>
                      <div className="text-xs uppercase text-[#3B82F6] font-bold mb-1">Layer 2: Quantum Session</div>
                      <div className="text-sm text-[#A1A1AA]">
                        {status === 'running' ? 'Executing pipeline...' : status === 'completed' ? 'Challenge passed' : 'Awaiting execution'}
                      </div>
                    </div>
                    {/* Layer 3 */}
                    <div className="border border-white/10 bg-[#111827] rounded-lg p-4 relative overflow-hidden">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${status === 'completed' ? 'bg-[#22C55E]' : 'bg-transparent'}`}></div>
                      <div className="text-xs uppercase text-[#A1A1AA] font-bold mb-1">Layer 3: Authenticated</div>
                      <div className="text-sm text-[#A1A1AA]">
                        {status === 'completed' ? 'JWT Issued' : 'Pending...'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 shadow-lg flex-1">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#A1A1AA] mb-6 flex items-center gap-2">
                    <ChartLine size={18} /> Live Circuit
                  </h3>
                  
                  {/* Animated Circuit Visual */}
                  <div className="font-mono text-sm space-y-5 overflow-x-auto relative min-h-[160px]">
                    {/* Q0 */}
                    <div className="flex items-center text-[#A1A1AA] whitespace-nowrap">
                      <span className="w-6">q0</span><div className="h-px bg-white/20 w-4 mx-2" />
                      <motion.div animate={status === 'running' ? { scale: [1, 1.1, 1], borderColor: '#3B82F6' } : {}} transition={{ repeat: Infinity, duration: 1.5 }} className="w-8 h-8 flex items-center justify-center bg-[#3B82F6]/20 border border-white/10 rounded text-[#3B82F6]">H</motion.div>
                      <div className="h-px bg-white/20 w-4 mx-2" />
                      <motion.div animate={status === 'running' ? { scale: [1, 1.2, 1], backgroundColor: 'rgba(59,130,246,0.3)' } : {}} transition={{ repeat: Infinity, duration: 1.2 }} className="w-3 h-3 rounded-full bg-[#3B82F6] mx-[10px] relative z-10"></motion.div>
                      <div className="h-px bg-white/20 w-4 mx-2" />
                      <motion.div animate={status === 'running' || status === 'completed' ? { opacity: 1 } : { opacity: 0.5 }} className="w-8 h-8 flex items-center justify-center bg-[#22C55E]/20 border border-[#22C55E]/50 rounded text-[#22C55E]">M</motion.div>
                      <div className="h-px bg-white/20 flex-1 mx-2 min-w-[2rem]" />
                    </div>

                    {/* Q1 */}
                    <div className="flex items-center text-[#A1A1AA] whitespace-nowrap relative">
                      <div className="absolute left-[88px] -top-[30px] bottom-[16px] w-px bg-[#3B82F6] z-0"></div>
                      <span className="w-6">q1</span><div className="h-px bg-white/20 w-4 mx-2" />
                      <div className="w-8 h-8 mx-2 border-none"></div>
                      <motion.div animate={status === 'running' ? { rotate: 180 } : {}} transition={{ repeat: Infinity, duration: 2 }} className="w-8 h-8 flex items-center justify-center border border-[#3B82F6] rounded-full text-[#3B82F6] bg-[#111827] z-10 mx-1">X</motion.div>
                      <div className="h-px bg-white/20 w-4 mx-2" />
                      <motion.div animate={status === 'running' || status === 'completed' ? { opacity: 1 } : { opacity: 0.5 }} className="w-8 h-8 flex items-center justify-center bg-[#22C55E]/20 border border-[#22C55E]/50 rounded text-[#22C55E]">M</motion.div>
                      <div className="h-px bg-white/20 flex-1 mx-2 min-w-[2rem]" />
                    </div>

                    {/* Q2 */}
                    <div className="flex items-center text-[#A1A1AA] whitespace-nowrap">
                      <span className="w-6">q2</span><div className="h-px bg-white/20 w-4 mx-2" />
                      <motion.div animate={status === 'running' ? { scale: [1, 1.1, 1] } : {}} transition={{ repeat: Infinity, duration: 1.8 }} className="w-8 h-8 flex items-center justify-center bg-[#F59E0B]/20 border border-[#F59E0B]/50 rounded text-[#F59E0B]">X</motion.div>
                      <div className="h-px bg-white/20 w-4 mx-2" />
                      <div className="w-8 h-8 mx-1 border-none"></div>
                      <div className="h-px bg-white/20 w-4 mx-2" />
                      <motion.div animate={status === 'running' || status === 'completed' ? { opacity: 1 } : { opacity: 0.5 }} className="w-8 h-8 flex items-center justify-center bg-[#22C55E]/20 border border-[#22C55E]/50 rounded text-[#22C55E]">M</motion.div>
                      <div className="h-px bg-white/20 flex-1 mx-2 min-w-[2rem]" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Center Panel: Pipeline */}
              <div className="lg:col-span-4 bg-[#18181B] border border-white/5 rounded-2xl p-6 shadow-lg h-full">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#A1A1AA] mb-6 flex items-center gap-2">
                  <Eye size={18} /> Execution Pipeline
                </h3>
                
                <div className="relative">
                  <div className="absolute left-[19px] top-4 bottom-8 w-px bg-white/10 z-0"></div>
                  <div className="space-y-5 relative z-10">
                    {STAGES.map((stage, idx) => {
                      const stageStatus = stageStatuses[stage.id] || 'Waiting';
                      const isExpanded = expandedStage === stage.id;
                      return (
                        <motion.div key={stage.id} className="flex gap-4">
                          <div className="mt-1 bg-[#18181B]">{getStatusIcon(stageStatus)}</div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center cursor-pointer hover:bg-white/5 p-2 -ml-2 rounded-lg transition-colors" onClick={() => setExpandedStage(isExpanded ? null : stage.id)}>
                              <span className={`font-medium text-sm ${getStatusColor(stageStatus)}`}>{stage.id}. {stage.name}</span>
                              <span className="text-[#A1A1AA]">{isExpanded ? <CaretUp size={14} /> : <CaretDown size={14} />}</span>
                            </div>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden text-xs text-[#A1A1AA] mt-2 whitespace-pre-wrap pl-2 border-l-2 border-[#3B82F6]/30">
                                  {stage.desc}
                                  <div className="mt-2 font-mono text-[#FAFAFA]">Status: {stageStatus}</div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Right Panel: Terminal */}
              <div className="lg:col-span-4 bg-[#111827] border border-white/5 rounded-2xl shadow-lg h-full flex flex-col overflow-hidden font-mono text-sm relative">
                <div className="bg-[#18181B] px-4 py-3 border-b border-white/5 flex items-center gap-2 shadow-sm">
                  <Terminal size={18} className="text-[#A1A1AA]" />
                  <span className="text-[#A1A1AA] text-xs uppercase tracking-widest">Live Console</span>
                  <div className="ml-auto flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]/80"></div>
                  </div>
                </div>
                
                <div ref={terminalRef} className="flex-1 p-4 overflow-y-auto space-y-2">
                  <div className="text-[#A1A1AA]">Qonsole v2.0 initializing...</div>
                  {logs.map((log, i) => (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex gap-3 ${log.isError ? 'text-[#EF4444]' : 'text-[#FAFAFA]'}`}>
                      <span className="text-[#A1A1AA] shrink-0">{log.time}</span>
                      <span className="break-all">{log.msg}</span>
                    </motion.div>
                  ))}
                  {status === 'running' && (
                    <div className="flex gap-3 text-[#A1A1AA] animate-pulse">
                      <span>{new Date().toLocaleTimeString()}</span>
                      <span>_</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Section: Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
              
              <div className="bg-[#18181B] border border-white/5 rounded-2xl p-5 shadow-lg group">
                <h3 className="text-xs text-[#A1A1AA] uppercase tracking-widest mb-4">Quantum Challenge</h3>
                {metrics.challenge ? (
                  <div className="space-y-3 font-mono text-sm">
                    <div><span className="text-[#A1A1AA]">ID: </span>{metrics.challenge.id}</div>
                    <div><span className="text-[#A1A1AA]">Entropy: </span><span className="text-[#22C55E]">{metrics.challenge.entropy}%</span></div>
                    <div className="truncate"><span className="text-[#A1A1AA]">Seed: </span>{metrics.challenge.seed}</div>
                  </div>
                ) : <div className="text-[#A1A1AA] text-sm font-mono mt-8">Waiting for generation...</div>}
              </div>

              <div className="bg-[#18181B] border border-white/5 rounded-2xl p-5 shadow-lg group">
                <h3 className="text-xs text-[#A1A1AA] uppercase tracking-widest mb-4 flex items-center justify-between">
                  Derived Session Key <Fingerprint size={16} />
                </h3>
                {metrics.session_key ? (
                  <div className="space-y-3 font-mono text-sm">
                    <div className="text-xs text-white/40 break-all">{metrics.session_key.fingerprint}</div>
                    <div className="flex justify-between items-end mt-4">
                      <div><span className="text-[#A1A1AA]">Alg: </span>{metrics.session_key.algorithm}</div>
                      <div className="text-[#22C55E] flex items-center gap-1"><LockKey size={14}/> SECURE</div>
                    </div>
                  </div>
                ) : <div className="text-[#A1A1AA] text-sm font-mono mt-8">Pending derivation...</div>}
              </div>

              <div className="bg-[#18181B] border border-white/5 rounded-2xl p-5 shadow-lg">
                <h3 className="text-xs text-[#A1A1AA] uppercase tracking-widest mb-4">Quantum Statistics</h3>
                {metrics.quantum_stats ? (
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-mono">
                    <div className="text-[#A1A1AA]">Qubits: <span className="text-white">{metrics.quantum_stats.qubits}</span></div>
                    <div className="text-[#A1A1AA]">Shots: <span className="text-white">{metrics.quantum_stats.shots}</span></div>
                    <div className="text-[#A1A1AA]">Depth: <span className="text-white">{metrics.quantum_stats.depth}</span></div>
                    <div className="text-[#A1A1AA]">Fidelity: <span className="text-[#22C55E]">{metrics.quantum_stats.fidelity}%</span></div>
                    <div className="text-[#A1A1AA] col-span-2">Time: <span className="text-white">{metrics.quantum_stats.execution_time_ms} ms</span></div>
                    <div className="text-[#A1A1AA] col-span-2">Backend: <span className="text-[#3B82F6]">{metrics.quantum_stats.backend}</span></div>
                  </div>
                ) : <div className="text-[#A1A1AA] text-sm font-mono mt-8">Pending execution...</div>}
              </div>

              <div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#18181B] border border-[#3B82F6]/30 rounded-2xl p-5 shadow-lg relative">
                <h3 className="text-xs text-white font-bold uppercase tracking-widest mb-3">Why Quantum Verification?</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Unlike conventional authentication, every session includes a newly generated quantum-derived challenge.
                  Each authentication generates fresh entropy, reducing predictability and strengthening resistance to replay attacks.
                  No secret quantum information is stored after verification.
                </p>
              </div>

            </div>
          </motion.div>
        )}

        {/* PHASE 4: SUCCESS SUMMARY */}
        {flowState === 'summary' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl text-center">
            <div className="bg-[#18181B] border border-white/10 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#22C55E] via-[#3B82F6] to-[#22C55E]"></div>
              
              <div className="w-20 h-20 bg-[#22C55E]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <Check size={40} className="text-[#22C55E]" weight="bold" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Authentication Successful</h2>
              <p className="text-[#A1A1AA] mb-10">Your secure session has been established and verified.</p>
              
              <div className="bg-[#111827] rounded-xl p-6 text-left mb-8 border border-white/5 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3"><UserFocus size={20} className="text-[#A1A1AA]" /> <span className="font-medium text-[#A1A1AA]">Identity</span></div>
                  <span className="font-mono text-sm">{email}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3"><Key size={20} className="text-[#A1A1AA]" /> <span className="font-medium text-[#A1A1AA]">Email Verification</span></div>
                  <span className="text-[#22C55E] text-sm font-bold flex items-center gap-1"><CheckCircle weight="fill" /> Verified</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3"><ShieldCheck size={20} className="text-[#A1A1AA]" /> <span className="font-medium text-[#A1A1AA]">Quantum Verification</span></div>
                  <span className="text-[#22C55E] text-sm font-bold flex items-center gap-1"><CheckCircle weight="fill" /> Passed</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3"><ChartLine size={20} className="text-[#A1A1AA]" /> <span className="font-medium text-[#A1A1AA]">Execution Time</span></div>
                  <span className="font-mono text-sm">{metrics.quantum_stats?.execution_time_ms} ms</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3"><Lightning size={20} className="text-[#A1A1AA]" /> <span className="font-medium text-[#A1A1AA]">Entropy</span></div>
                  <span className="font-mono text-sm text-[#22C55E]">{metrics.quantum_stats?.entropy}%</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3"><Fingerprint size={20} className="text-[#A1A1AA]" /> <span className="font-medium text-[#A1A1AA]">Session ID</span></div>
                  <span className="text-[#A1A1AA] text-sm font-mono tracking-widest">{metrics.jwt?.session_id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3"><FileText size={20} className="text-[#A1A1AA]" /> <span className="font-medium text-[#A1A1AA]">JWT</span></div>
                  <span className="text-[#3B82F6] text-sm font-mono flex items-center gap-1">Issued</span>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={() => { setFlowState('identity_setup'); setTempToken(null); setOtp(['','','','','','']); }} className="px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors font-medium">
                  Go to Dashboard
                </button>
                <button onClick={() => navigator.clipboard.writeText(metrics.jwt?.session_id)} className="px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors font-medium">
                  Copy Session ID
                </button>
                <button onClick={downloadCertificate} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#FAFAFA] text-black hover:bg-gray-200 transition-colors font-bold shadow-lg">
                  <DownloadSimple weight="bold" /> Download Session Report
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
}
