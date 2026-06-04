import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Minus, Accessibility, Volume2, VolumeX, ShieldAlert, 
  ArrowLeft, Send, CheckCircle2, 
  AlertTriangle, X, Play, BookOpen, CreditCard
} from 'lucide-react';
import './App.css';
import logoImg from './assets/logosinfondochichin.png';


// Synthetic sound generator using Web Audio API
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      // Pleasant rising success chime
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      osc.start();
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'error') {
      // Lower, buzzer warning sound
      osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.start();
      osc.frequency.setValueAtTime(220.00, ctx.currentTime + 0.1); // A3
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'click') {
      // Subtle organic button click
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'medal') {
      // Grand celebratory chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.type = 'sine';
      osc2.type = 'sine';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain2.gain.setValueAtTime(0.1, ctx.currentTime);
      
      osc.start();
      osc2.start();
      
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2);
      osc2.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.2); // C6
      
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.stop(ctx.currentTime + 0.5);
      osc2.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {
    console.log("Audio Context blocked or not supported in this browser.", e);
  }
};

function App() {
  // --- View States ---
  // 'home', 'reserva', 'simulador-mp', 'quiz', 'logros'
  const [activeView, setActiveView] = useState('home');
  
  // --- Accessibility States ---
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1.0); // 1.0 = Normal, 1.2 = Grande, 1.4 = Muy Grande
  const [highContrast, setHighContrast] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // --- Profile / Achievements ---
  const [userProfile, setUserProfile] = useState({
    name: 'Elsa',
    age: 72,
    avatar: '👵🏼',
    points: 120,
    medals: ['Registro Exitoso 🎉', 'Perfil Seguro 🛡️']
  });



  // --- Simulator Supervielle ("Chichín-Supervielle") States ---
  // 'mp-home', 'mp-send-select', 'mp-send-amount', 'mp-send-confirm', 'mp-send-success', 'mp-bill-select', 'mp-bill-scan', 'mp-bill-confirm', 'mp-bill-success'
  const [simStep, setSimStep] = useState('mp-home');
  const [balance, setBalance] = useState(45000);
  const [transferTarget, setTransferTarget] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  
  const simulationContacts = [
    { name: 'Lucas (Tutor Chichín)', phone: '11-3456-7890', avatar: '👨🏽‍🎓', initial: 'L' },
    { name: 'María (Hija)', phone: '11-9876-5432', avatar: '👩🏻‍💼', initial: 'M' },
    { name: 'Farmacia del Barrio', phone: '11-4444-5555', avatar: '🏥', initial: 'F' }
  ];

  const bills = [
    { id: 'edesur', name: 'Edesur (Luz)', amount: 4850, code: '2837492837482937' },
    { id: 'metrogas', name: 'Metrogas (Gas)', amount: 3200, code: '9182739182739182' },
    { id: 'aysa', name: 'AySA (Agua)', amount: 1500, code: '5566778899001122' }
  ];

  // --- AI Quiz / Recap States ---
  const [quizStep, setQuizStep] = useState(0); // 0 = Intro, 1 = Pregunta 1, 2 = Pregunta 2, 3 = Éxito final
  const [quizAnswerSelected, setQuizAnswerSelected] = useState(null);
  const [quizResultState, setQuizResultState] = useState(null); // 'correct', 'incorrect', null

  const quizQuestions = [
    {
      q: 'Si recibís una llamada o mensaje de alguien que dice ser de Supervielle y te pide una "clave de seguridad" o código de verificación, ¿qué tenés que hacer?',
      options: [
        { text: 'Pasarle el código rápido para evitar que me cierren la cuenta.', isCorrect: false, feedback: '❌ ¡Cuidado! Ninguna aplicación real ni banco te pedirá jamás tus contraseñas o códigos por llamada o mensaje. ¡Nunca los compartas!' },
        { text: 'Cortar de inmediato la llamada y avisar a mi tutor o familia.', isCorrect: true, feedback: '✅ ¡Excelente! Cortar la comunicación y buscar ayuda es la decisión más segura. ¡Muy bien protegido!' }
      ]
    },
    {
      q: '¿Cómo podés estar 100% seguro/a de que estás practicando sin riesgo en Chichín y no usando tu dinero real?',
      options: [
        { text: 'Porque el simulador tiene un marco punteado verde brillante que dice "ZONA DE PRÁCTICA - DINERO FICTICIO".', isCorrect: true, feedback: '✅ ¡Exacto! Ese marco de seguridad te garantiza que todo es un juego seguro y no hay tarjetas ni dinero real involucrado.' },
        { text: 'Porque tengo que ingresar mi tarjeta de crédito de verdad.', isCorrect: false, feedback: '❌ ¡No! En Chichín NUNCA te pediremos ingresar tarjetas de crédito ni dinero real. Si ves eso, ¡avisanos!' }
      ]
    }
  ];

  // --- Audio / Voice Synthesis Helper ---
  const speakText = useCallback((text, force = false) => {
    if (!force && !voiceEnabled) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any active speech
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Select the most natural voice dynamically
      const voices = window.speechSynthesis.getVoices();
      const spanishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('es'));
      
      if (spanishVoices.length > 0) {
        // Filter for Argentine Spanish voices first
        const arVoices = spanishVoices.filter(v => v.lang.toLowerCase().includes('ar'));
        
        // Find a natural sounding Argentine voice (Microsoft Natural, Google, Apple/Siri)
        const bestArVoice = arVoices.find(v => v.name.toLowerCase().includes('natural')) ||
                            arVoices.find(v => 
                              v.name.toLowerCase().includes('google') || 
                              v.name.toLowerCase().includes('microsoft') || 
                              v.name.toLowerCase().includes('apple') || 
                              v.name.toLowerCase().includes('siri')
                            ) ||
                            arVoices[0];
                            
        if (bestArVoice) {
          utterance.voice = bestArVoice;
          utterance.lang = bestArVoice.lang;
        } else {
          // If no Argentine voice, look for other natural Spanish voices
          const bestEsVoice = spanishVoices.find(v => v.name.toLowerCase().includes('natural')) ||
                              spanishVoices.find(v => 
                                v.name.toLowerCase().includes('google') || 
                                v.name.toLowerCase().includes('microsoft') || 
                                v.name.toLowerCase().includes('apple') || 
                                v.name.toLowerCase().includes('siri')
                              ) ||
                              spanishVoices[0];
          utterance.voice = bestEsVoice;
          utterance.lang = bestEsVoice.lang;
        }
      } else {
        // Fallback lang if no voice array is populated yet
        utterance.lang = 'es-AR';
      }

      utterance.rate = 0.9; // Friendly, clear pacing that doesn't sound overly stretched
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, [voiceEnabled]);

  // --- Side Effects for Accessibility ---
  useEffect(() => {
    document.documentElement.style.setProperty('--font-multiplier', fontSizeMultiplier);
  }, [fontSizeMultiplier]);

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Voice narration upon changing views
  useEffect(() => {
    if (!voiceEnabled) return;
    
    if (activeView === 'home') {
      speakText("Estás en el inicio de Chichín. Aquí podés entrar a la Zona de Práctica segura.");
    } else if (activeView === 'simulador-mp') {
      speakText("Bienvenido al simulador seguro de Supervielle. Aquí podés practicar mandar dinero o pagar cuentas con dinero de juguete.");
    } else if (activeView === 'quiz') {
      speakText("¡Es hora del juego interactivo! Respondamos unas breves preguntas para ganar tu medalla.");
    } else if (activeView === 'logros') {
      speakText("Felicitaciones. Aquí podés ver todas las medallas que ganaste con tu esfuerzo.");
    }
  }, [activeView, voiceEnabled, speakText]);

  // Assist speech during Simulator transitions
  useEffect(() => {
    if (!voiceEnabled || activeView !== 'simulador-mp') return;
    
    if (simStep === 'mp-home') {
      speakText("Estamos en el inicio de Supervielle ficticio. Tocá el botón grande de enviar dinero, o pagar servicios.");
    } else if (simStep === 'mp-send-select') {
      speakText("Paso dos. Seleccioná a quién le querés mandar dinero ficticio tocando su nombre.");
    } else if (simStep === 'mp-send-amount') {
      speakText("Paso tres. Escribí el monto usando el teclado de abajo y luego tocá el botón Siguiente.");
    } else if (simStep === 'mp-send-confirm') {
      speakText("Paso cuatro. Revisá los datos. Si está todo correcto, tocá el botón azul grande que dice Confirmar Transferencia.");
    } else if (simStep === 'mp-send-success') {
      speakText("¡Felicitaciones! Dinero ficticio enviado con éxito. Tocá el botón de hacer juego de repaso.");
    }
  }, [simStep, voiceEnabled, activeView, speakText]);

  // --- Handlers ---
  const handleNav = (view) => {
    playSound('click');
    setActiveView(view);
    // Reset secondary states
    setQuizStep(0);
    setQuizAnswerSelected(null);
    setQuizResultState(null);
  };

  const toggleContrast = () => {
    playSound('click');
    setHighContrast(!highContrast);
  };

  const toggleVoice = () => {
    playSound('click');
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);
    if (newState) {
      setTimeout(() => {
        speakText("Asistente de voz activado. Te guiaré paso a paso por toda la aplicación.", true);
      }, 200);
    } else {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
  };

  const changeFontSize = (direction) => {
    playSound('click');
    if (direction === 'up' && fontSizeMultiplier < 1.4) {
      setFontSizeMultiplier(prev => parseFloat((prev + 0.15).toFixed(2)));
    } else if (direction === 'down' && fontSizeMultiplier > 0.85) {
      setFontSizeMultiplier(prev => parseFloat((prev - 0.15).toFixed(2)));
    } else if (direction === 'reset') {
      setFontSizeMultiplier(1.0);
    }
  };

  // --- Render Functions ---

  // Persistent Header
  const renderHeader = () => (
    <header className="senior-header">
      <div className="senior-logo" onClick={() => handleNav('home')} role="button" aria-label="Ir al inicio">
        <img className="logo-icon-img" src={logoImg} alt="Logo Chichín" />
        <span className="logo-text">Chi<span>chín</span></span>
      </div>
      <button
        className="badge badge-gold"
        onClick={() => handleNav('logros')}
        title="Ver mis medallas"
        style={{ cursor: 'pointer' }}
      >
        🏆 <strong>{userProfile.points}</strong> pts
      </button>
    </header>
  );

  // Persistent Accessibility Floating Panel
  const renderAccessibilityBar = () => (
    <div className="accessibility-bar" aria-label="Controles de accesibilidad" role="toolbar">
      <button
        className="accessibility-btn"
        onClick={() => changeFontSize('down')}
        title="Reducir letra"
        aria-label="Reducir tamaño de letra"
      >
        <Minus size={16} /><span style={{ fontSize: '11px', lineHeight: 1 }}>A</span>
      </button>
      <button
        className="accessibility-btn"
        onClick={() => changeFontSize('up')}
        title="Agrandar letra"
        aria-label="Agrandar tamaño de letra"
      >
        <Plus size={16} /><span style={{ fontSize: '15px', lineHeight: 1 }}>A</span>
      </button>
      <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)', margin: '0 2px' }} aria-hidden="true" />
      <button
        className={`accessibility-btn ${highContrast ? 'active' : ''}`}
        onClick={toggleContrast}
        title={highContrast ? 'Desactivar alto contraste' : 'Activar alto contraste'}
        aria-pressed={highContrast}
      >
        <Accessibility size={18} />
      </button>
      <button
        className={`accessibility-btn ${voiceEnabled ? 'active' : ''}`}
        onClick={toggleVoice}
        title={voiceEnabled ? 'Desactivar voz' : 'Activar asistente de voz'}
        aria-pressed={voiceEnabled}
      >
        {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
    </div>
  );

  // Persistent Bottom Emergency Help Bar
  const renderHelpFooter = () => (
    <>
      <div className="help-footer">
        <button
          className="btn btn-ghost"
          style={{ flex: 1, border: '1px solid var(--border-color)', borderRadius: '8px', gap: '6px' }}
          onClick={() => {
            playSound('click');
            handleNav('home');
          }}
        >
          🏠 <span style={{ fontWeight: 500 }}>Inicio</span>
        </button>
        <button
          className="btn btn-danger pulse-element"
          style={{ flex: 2, fontWeight: 500, letterSpacing: '0.01em' }}
          onClick={() => {
            playSound('click');
            setHelpOpen(true);
            speakText("Menú de ayuda de emergencia abierto. Podés llamar a tu familia o contactar a soporte técnico.", true);
          }}
        >
          🆘 PEDIR AYUDA
        </button>
      </div>

      {/* Emergency Modal */}
      {helpOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', border: '1px solid var(--border-color)', padding: '20px', boxShadow: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={26} /> Zona de Auxilio
              </h2>
              <button
                onClick={() => {
                  playSound('click');
                  setHelpOpen(false);
                  if (voiceEnabled) window.speechSynthesis.cancel();
                }}
                style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-primary)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontWeight: 500, marginBottom: '18px', lineHeight: 1.5 }}>
              ¿Qué problema tenés, {userProfile.name}? ¡No te preocupés, estamos con vos!
            </p>

            <div className="tiles-grid" style={{ marginBottom: '20px' }}>
              <div
                className="card card-interactive"
                style={{ textAlign: 'center', border: '1px solid var(--border-color)', padding: '16px', marginBottom: 0 }}
                onClick={() => {
                  playSound('success');
                  alert("Simulando llamada a tu familia... 📞 ¡Enseguida se van a comunicar con vos!");
                  setHelpOpen(false);
                }}
              >
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>👪</span>
                <h4>Llamar a Familia</h4>
                <p className="text-sm text-muted">Tus seres queridos</p>
              </div>

              <div
                className="card card-interactive"
                style={{ textAlign: 'center', border: '1px solid var(--border-color)', padding: '16px', marginBottom: 0 }}
                onClick={() => {
                  playSound('success');
                  alert("Llamando a soporte técnico de Chichín al 0800-CHICHIN... 📞");
                  setHelpOpen(false);
                }}
              >
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>📞</span>
                <h4>Llamar a Soporte</h4>
                <p className="text-sm text-muted">0800 gratuito</p>
              </div>
            </div>

            <div className="scam-warning-card" style={{ marginTop: 0 }}>
              <h4 style={{ color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <AlertTriangle size={18} /> ¡Recordá siempre!
              </h4>
              <p className="text-sm" style={{ fontWeight: 500, lineHeight: 1.55 }}>
                Ningún tutor ni banco te va a pedir tu contraseña. Si alguien te la pide, ¡es una estafa!
              </p>
            </div>

            <button
              className="btn btn-outline"
              style={{ marginTop: '16px' }}
              onClick={() => {
                playSound('click');
                setHelpOpen(false);
              }}
            >
              Cerrar y Volver
            </button>
          </div>
        </div>
      )}
    </>
  );

  // VIEW: HOME PAGE
  const renderHome = () => {
    return (
      <div className="container fade-in">
        {/* Welcome Hero Block */}
        <div style={{
          backgroundColor: 'var(--brand-primary-light)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          boxShadow: 'none'
        }}>
          <span style={{ fontSize: '60px', lineHeight: 1 }}>{userProfile.avatar}</span>
          <div style={{ flex: 1 }}>
            <h1 style={{ marginBottom: '4px' }}>¡Hola, {userProfile.name}! 👋🏼</h1>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>¿Qué vamos a aprender de lindo hoy?</p>
          </div>
          <button
            className="btn-listen-icon"
            onClick={() => speakText(`¡Hola, ${userProfile.name}! Te damos la bienvenida a Chichín. Aquí podés entrar a la Zona de Práctica segura para jugar con el simulador de Supervielle.`, true)}
            title="Escuchar bienvenida"
            aria-label="Escuchar bienvenida"
          >
            <Volume2 size={24} />
          </button>
        </div>

        {/* Practice CTA — Mirror System */}
        <div
          className="card card-interactive pulse-element"
          style={{
            backgroundColor: 'var(--brand-primary-light)',
            border: '1.5px solid var(--brand-primary)',
            boxShadow: 'none',
            marginBottom: '20px'
          }}
          onClick={() => handleNav('simulador-mp')}
        >
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '44px', lineHeight: 1 }}>📱</span>
            <div>
              <span className="badge badge-green" style={{ marginBottom: '6px' }}>¡100% seguro!</span>
              <h2 style={{ color: 'var(--text-primary)' }}>Zona de práctica</h2>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '16px', lineHeight: 1.5 }}>
            Simulador de Supervielle con dinero de juguete. ¡Aprendé sin miedo a equivocarte!
          </p>
          <button
            className="btn btn-success"
            onClick={(e) => { e.stopPropagation(); handleNav('simulador-mp'); }}
            style={{ pointerEvents: 'none' }}
          >
            <Play size={22} fill="white" /> ¡Entrar a practicar!
          </button>
        </div>
        {/* Anti-Scam Widget */}
        <div className="scam-warning-card" style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <ShieldAlert size={32} style={{ color: 'var(--brand-primary)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '6px', fontSize: 'calc(1.1rem * var(--font-multiplier))' }}>Escudo anti-estafas Chichín</h3>
              <p className="text-sm" style={{ fontWeight: 500, lineHeight: 1.55 }}>
                Ninguna persona buena te va a pedir tu contraseña por teléfono. Si te pasa, decí: <strong>«No comparto mis claves»</strong> y cortá de inmediato.
              </p>
            </div>
            <button
              className="btn-listen-icon"
              onClick={() => speakText("Escudo anti-estafas Chichín. Ninguna persona buena te va a pedir tu contraseña por teléfono. Si te pasa, decí: «No comparto mis claves» y cortá de inmediato.", true)}
              title="Escuchar escudo anti-estafas"
              aria-label="Escuchar escudo anti-estafas"
              style={{ flexShrink: 0, alignSelf: 'center' }}
            >
              <Volume2 size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  };



  // VIEW: SUPERVIELLE SIMULATOR ("SISTEMA ESPEJO")
  const renderSimuladorMP = () => {
    return (
      <div className="container" style={{ paddingBottom: '100px' }}>
        {/* Frame / Dashed Container */}
        <div className="sandbox-container">
          {/* Top safety banner */}
          <div className="sandbox-banner">
            <ShieldAlert size={24} /> Zona de práctica • Dinero de juguete
          </div>

          {/* Virtual Assistant Coco Widget */}
          {renderCocoAssistant()}

          {/* BACK TO MAIN PORTAL CTA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            {simStep !== 'mp-home' ? (
              <button 
                className="btn btn-outline"
                style={{ 
                  width: 'auto', 
                  minHeight: '44px', 
                  padding: '4px 14px', 
                  fontSize: '0.95rem',
                  borderColor: 'var(--border-color)',
                  borderWidth: '1px',
                  borderRadius: '8px'
                }}
                onClick={() => {
                  playSound('click');
                  setSimStep('mp-home');
                }}
              >
                ← Volver al menú Supervielle
              </button>
            ) : (
              <button 
                className="btn btn-outline"
                style={{ 
                  width: 'auto', 
                  minHeight: '44px', 
                  padding: '4px 14px', 
                  fontSize: '0.95rem',
                  borderColor: 'var(--brand-primary)',
                  borderWidth: '1px',
                  borderRadius: '8px'
                }}
                onClick={() => {
                  playSound('click');
                  handleNav('home');
                }}
              >
                🚪 Salir del simulador
              </button>
            )}
            <span style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--color-success)' }}>
              Saldo ficticio: ${balance.toLocaleString('es-AR')}
            </span>
          </div>

          {/* INNER SANDBOX: THE SUPERVIELLE CLONE */}
          <div style={{
            backgroundColor: 'var(--brand-primary)', // Supervielle Red
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: 'none',
            border: '1px solid var(--brand-primary-hover)'
          }}>
            
            {/* Supervielle Clone Top Nav */}
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ backgroundColor: '#fff', color: 'var(--brand-primary)', fontWeight: 500, padding: '4px 8px', borderRadius: '8px', fontSize: '1.15rem', fontFamily: 'sans-serif', fontStyle: 'italic' }}>
                  chichín
                </span>
                <span style={{ color: '#fff', fontWeight: 500, fontSize: '1.1rem' }}>supervielle</span>
              </div>
              <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 500, backgroundColor: 'var(--brand-primary-hover)', padding: '4px 8px', borderRadius: '4px' }}>
                Hola, Elsa 👵🏼
              </div>
            </div>

            {/* MP MAIN VIEW */}
            {simStep === 'mp-home' && (
              <div style={{ backgroundColor: '#f5f5f5', padding: '16px' }}>
                {/* Simulated Account Balance card */}
                <div style={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  marginBottom: '16px', 
                  boxShadow: 'none',
                  border: '1px solid #e0e0e0'
                }}>
                  <p style={{ color: '#666', fontSize: '0.9rem', fontWeight: 500 }}>Dinero disponible</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <h3 style={{ fontSize: '2rem', color: '#333', fontFamily: 'sans-serif', fontWeight: 500 }}>
                      ${balance.toLocaleString('es-AR')}
                    </h3>
                    <span style={{ color: 'var(--brand-primary)', fontWeight: 500, fontSize: '0.9rem' }}>Ver detalles ➜</span>
                  </div>
                </div>

                {/* Simulated Quick Action Circular Buttons */}
                <div style={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  marginBottom: '16px', 
                  display: 'flex', 
                  justifyContent: 'space-around',
                  boxShadow: 'none',
                  border: '1px solid #e0e0e0'
                }}>
                  <div 
                    style={{ textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                    onClick={() => {
                      playSound('click');
                      setSimStep('mp-send-select');
                    }}
                  >
                    <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--brand-primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', color: 'var(--brand-primary)', justifyContent: 'center' }}>
                      <Send size={28} />
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#333' }}>Enviar<br/>dinero</span>
                  </div>

                  <div 
                    style={{ textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                    onClick={() => {
                      playSound('click');
                      setSimStep('mp-bill-select');
                    }}
                  >
                    <div style={{ width: '60px', height: '60px', backgroundColor: '#e8f5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', color: '#4caf50', justifyContent: 'center' }}>
                      <BookOpen size={28} />
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#333' }}>Pagar<br/>cuentas</span>
                  </div>

                  <div 
                    style={{ textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', opacity: 0.5 }}
                    onClick={() => {
                      playSound('error');
                      alert("Este botón está deshabilitado en este paso del prototipo. ¡Focalicemos en Enviar Dinero o Pagar Cuentas!");
                    }}
                  >
                    <div style={{ width: '60px', height: '60px', backgroundColor: '#fff3e0', borderRadius: '50%', display: 'flex', alignItems: 'center', color: '#ff9800', justifyContent: 'center' }}>
                      <CreditCard size={28} />
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#333' }}>Cargar<br/>SUBE</span>
                  </div>
                </div>

                {/* Simulated Recent Activity */}
                <div style={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  boxShadow: 'none',
                  border: '1px solid #e0e0e0'
                }}>
                  <h4 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '12px', fontFamily: 'sans-serif', fontWeight: 500 }}>Tu actividad reciente</h4>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '24px', backgroundColor: '#f0f0f0', padding: '6px', borderRadius: '50%' }}>💼</span>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: '0.95rem', color: '#333' }}>Pago a Edesur</p>
                        <p className="text-sm" style={{ color: '#888' }}>24 de Mayo</p>
                      </div>
                    </div>
                    <span style={{ fontWeight: 500, color: '#d32f2f' }}>-$3.400</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '24px', backgroundColor: 'var(--brand-primary-light)', padding: '6px', borderRadius: '50%' }}>👵🏼</span>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: '0.95rem', color: '#333' }}>Tu Jubilación</p>
                        <p className="text-sm" style={{ color: '#888' }}>20 de Mayo</p>
                      </div>
                    </div>
                    <span style={{ fontWeight: 500, color: '#388e3c' }}>+$180.000</span>
                  </div>
                </div>
              </div>
            )}

            {/* MP SUBVIEW: SEND MONEY - CONTACT SELECT */}
            {simStep === 'mp-send-select' && (
              <div style={{ backgroundColor: '#fff', padding: '16px', minHeight: '300px' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#333', marginBottom: '16px', fontWeight: 500 }}>¿A quién querés enviarle dinero?</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {simulationContacts.map((contact, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid var(--brand-primary)',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onClick={() => {
                        playSound('click');
                        setTransferTarget(contact);
                        setSimStep('mp-send-amount');
                      }}
                    >
                      <span style={{ 
                        fontSize: '32px', 
                        width: '50px', 
                        height: '50px', 
                        backgroundColor: '#f0f4f8', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {contact.avatar}
                      </span>
                      <div>
                        <p style={{ fontWeight: 500, color: '#333', fontSize: '1.1rem' }}>{contact.name}</p>
                        <p className="text-sm" style={{ color: '#666' }}>Celular: {contact.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MP SUBVIEW: SEND MONEY - CHOOSE AMOUNT */}
            {simStep === 'mp-send-amount' && (
              <div style={{ backgroundColor: '#fff', padding: '16px', minHeight: '300px', textAlign: 'center' }}>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '48px' }}>{transferTarget.avatar}</span>
                  <h4 style={{ fontWeight: 500, fontSize: '1.2rem', color: '#333', marginTop: '6px' }}>Enviar dinero a {transferTarget.name}</h4>
                  <p className="text-sm" style={{ color: '#666' }}>Saldo ficticio disponible: ${balance.toLocaleString('es-AR')}</p>
                </div>

                <div style={{ 
                  margin: '24px 0', 
                  borderBottom: '1px solid var(--brand-primary)',
                  paddingBottom: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 500, color: '#333' }}>$</span>
                  <input 
                    type="number"
                    style={{ 
                      fontSize: '2.5rem', 
                      fontWeight: 500, 
                      width: '180px', 
                      border: 'none', 
                      outline: 'none',
                      textAlign: 'left',
                      color: '#333'
                    }}
                    placeholder="0"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                  />
                </div>

                <div className="tiles-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', maxWidth: '300px', margin: '0 auto 20px auto' }}>
                  {[1000, 5000, 10000].map((quickAmount) => (
                    <button 
                      key={quickAmount}
                      className="btn btn-outline"
                      style={{ minHeight: '44px', padding: '8px 12px', fontSize: '1rem', borderStyle: 'solid', borderColor: 'var(--brand-primary)', borderRadius: '8px' }}
                      onClick={() => {
                        playSound('click');
                        setTransferAmount(quickAmount.toString());
                      }}
                    >
                      +${quickAmount.toLocaleString('es-AR')}
                    </button>
                  ))}
                </div>

                <button 
                  className="btn btn-primary"
                  disabled={!transferAmount || parseFloat(transferAmount) <= 0 || parseFloat(transferAmount) > balance}
                  onClick={() => {
                    playSound('click');
                    if (parseFloat(transferAmount) > balance) {
                      playSound('error');
                      alert("No podés transferir más de tu saldo disponible ficticio.");
                    } else {
                      setSimStep('mp-send-confirm');
                    }
                  }}
                >
                  Siguiente ➜
                </button>
              </div>
            )}

            {/* MP SUBVIEW: SEND MONEY - CONFIRM */}
            {simStep === 'mp-send-confirm' && (
              <div style={{ backgroundColor: '#fff', padding: '16px', minHeight: '300px' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#333', marginBottom: '16px', textAlign: 'center', fontWeight: 500 }}>¿Está todo correcto?</h3>

                <div className="card" style={{ border: '1px solid var(--brand-primary)', backgroundColor: 'var(--brand-primary-light)', marginBottom: '24px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    <div style={{ textAlign: 'center' }}>
                      <p className="text-sm" style={{ color: '#666', fontWeight: 500 }}>Vas a enviar</p>
                      <h4 style={{ fontSize: '2.5rem', color: '#333', fontWeight: 500, fontFamily: 'sans-serif' }}>
                        ${parseFloat(transferAmount).toLocaleString('es-AR')}
                      </h4>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '32px' }}>{transferTarget.avatar}</span>
                      <div>
                        <p className="text-sm" style={{ color: '#666', fontWeight: 500 }}>Destinatario</p>
                        <p style={{ fontWeight: 500, fontSize: '1.1rem', color: '#333' }}>{transferTarget.name}</p>
                        <p className="text-sm" style={{ color: '#666' }}>Celular: {transferTarget.phone}</p>
                      </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '32px' }}>💼</span>
                      <div>
                        <p className="text-sm" style={{ color: '#666', fontWeight: 500 }}>Medio de pago</p>
                        <p style={{ fontWeight: 500, fontSize: '1.1rem', color: '#333' }}>Saldo ficticio de Supervielle</p>
                      </div>
                    </div>

                  </div>
                </div>

                <button 
                  className="btn btn-primary"
                  style={{ backgroundColor: 'var(--brand-primary)', borderColor: 'var(--brand-primary-hover)', borderRadius: '8px' }}
                  onClick={() => {
                    playSound('success');
                    setBalance(prev => prev - parseFloat(transferAmount));
                    setSimStep('mp-send-success');
                  }}
                >
                  <CheckCircle2 size={24} /> Confirmar transferencia
                </button>
              </div>
            )}

            {/* MP SUBVIEW: SEND MONEY - SUCCESS */}
            {simStep === 'mp-send-success' && (
              <div style={{ backgroundColor: 'var(--brand-primary)', padding: '32px 16px', minHeight: '300px', textAlign: 'center', color: 'var(--text-on-brand)', borderRadius: '12px' }}>
                <span className="pulse-element" style={{ fontSize: '72px', display: 'block', marginBottom: '16px' }}>🎉</span>
                
                <h3 style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: '12px', color: 'var(--text-on-brand)' }}>¡Transferencia ficticia exitosa!</h3>
                <p style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: 500 }}>
                  Le enviaste ${parseFloat(transferAmount).toLocaleString('es-AR')} a {transferTarget.name} sin arriesgar un solo peso real.
                </p>

                <div className="card" style={{ color: 'var(--text-primary)', border: 'none', textAlign: 'left', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '12px', boxShadow: 'none' }}>
                  <h4 style={{ color: 'var(--brand-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🏆 ¡Logro desbloqueado!
                  </h4>
                  <p style={{ fontWeight: 500, marginTop: '6px' }}>Primer envío de práctica 📱</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Completaste con éxito tu primera práctica del sistema espejo.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                  <button 
                    className="btn btn-success"
                    style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', borderColor: 'white', borderStyle: 'solid', borderRadius: '8px' }}
                    onClick={() => {
                      playSound('click');
                      // Add points to profile
                      setUserProfile(prev => ({
                        ...prev,
                        points: prev.points + 50,
                        medals: prev.medals.includes('Primer Pago 🏆') ? prev.medals : ['Primer Pago 🏆', ...prev.medals]
                      }));
                      // Go to Quiz Recap view
                      setActiveView('quiz');
                      setQuizStep(1);
                    }}
                  >
                    🏆 ¡Hacer juego de repaso!
                  </button>

                  <button 
                    className="btn btn-outline"
                    style={{ 
                      backgroundColor: 'transparent',
                      color: 'var(--text-on-brand)', 
                      borderColor: 'var(--text-on-brand)', 
                      borderRadius: '8px' 
                    }}
                    onClick={() => {
                      playSound('click');
                      setTransferAmount('');
                      setTransferTarget(null);
                      setBalance(45000);
                      setSimStep('mp-home');
                    }}
                  >
                    🔄 Volver a practicar
                  </button>
                </div>
              </div>
            )}

            {/* MP SUBVIEW: BILL SELECT */}
            {simStep === 'mp-bill-select' && (
              <div style={{ backgroundColor: '#fff', padding: '16px', minHeight: '300px' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#333', marginBottom: '16px', fontWeight: 500 }}>¿Qué servicio querés pagar?</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {bills.map((bill) => (
                    <div 
                      key={bill.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid #4caf50',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onClick={() => {
                        playSound('click');
                        setSelectedBill(bill);
                        setSimStep('mp-bill-scan');
                        speakText("Paso dos. Escaneo de factura ficticia. Hacé clic en la imagen de la factura para simular que le sacás una foto con tu cámara.");
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 500, color: '#333', fontSize: '1.1rem' }}>{bill.name}</p>
                        <p className="text-sm" style={{ color: '#666' }}>Código: {bill.code}</p>
                      </div>
                      <span style={{ fontWeight: 500, color: '#2e7d32', fontSize: '1.15rem' }}>
                        ${bill.amount.toLocaleString('es-AR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MP SUBVIEW: BILL SCAN */}
            {simStep === 'mp-bill-scan' && (
              <div style={{ backgroundColor: '#fff', padding: '16px', minHeight: '300px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#333', marginBottom: '12px', fontWeight: 500 }}>Paso 2: escaneando factura</h3>
                <p className="text-sm" style={{ color: '#666', marginBottom: '16px' }}>Apuntá la cámara al código de barras simulado de abajo.</p>

                {/* Simulated Camera Viewfinder with Bill barcode */}
                <div 
                  className="pulse-element"
                  style={{
                    border: '1px solid var(--brand-primary)',
                    borderRadius: '12px',
                    padding: '24px 16px',
                    backgroundColor: '#fafafa',
                    maxWidth: '320px',
                    margin: '0 auto 20px auto',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    playSound('success');
                    setSimStep('mp-bill-confirm');
                  }}
                >
                  {/* Visual scanning overlay line */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '10%',
                    right: '10%',
                    height: '4px',
                    backgroundColor: '#C8102E',
                  }}></div>

                  <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    📃 Factura de {selectedBill.name}
                  </p>
                  
                  {/* Fictional Barcode visual */}
                  <div style={{
                    height: '60px',
                    backgroundColor: '#111',
                    margin: '12px 20px',
                    backgroundImage: 'repeating-linear-gradient(90deg, #111, #111 2px, #fff 2px, #fff 6px, #111 6px, #111 10px)'
                  }}></div>

                  <p className="text-sm" style={{ fontWeight: 500, color: 'var(--brand-primary)' }}>
                    👉🏼 ¡Hacé clic en la factura para escanear!
                  </p>
                </div>

                <p className="text-sm" style={{ fontStyle: 'italic', color: '#888' }}>
                  Chichín te ayuda: en una app real, sostendrías tu teléfono firme frente al código de barras de tu papel de factura.
                </p>
              </div>
            )}

            {/* MP SUBVIEW: BILL CONFIRM */}
            {simStep === 'mp-bill-confirm' && (
              <div style={{ backgroundColor: '#fff', padding: '16px', minHeight: '300px' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#333', marginBottom: '16px', textAlign: 'center', fontWeight: 500 }}>¿Confirmar pago del servicio?</h3>

                <div className="card" style={{ border: '1px solid #4caf50', backgroundColor: '#f6fbf7', marginBottom: '24px', borderRadius: '12px', boxShadow: 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    <div style={{ textAlign: 'center' }}>
                      <p className="text-sm" style={{ color: '#666', fontWeight: 500 }}>Monto a pagar</p>
                      <h4 style={{ fontSize: '2.5rem', color: '#2e7d32', fontWeight: 500, fontFamily: 'sans-serif' }}>
                        ${selectedBill.amount.toLocaleString('es-AR')}
                      </h4>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0' }} />

                    <div>
                      <p className="text-sm" style={{ color: '#666', fontWeight: 500 }}>Servicio</p>
                      <p style={{ fontWeight: 500, fontSize: '1.1rem', color: '#333' }}>{selectedBill.name}</p>
                      <p className="text-sm" style={{ color: '#666' }}>Nro. factura: {selectedBill.code}</p>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0' }} />

                    <div>
                      <p className="text-sm" style={{ color: '#666', fontWeight: 500 }}>Medio de pago</p>
                      <p style={{ fontWeight: 500, fontSize: '1.1rem', color: '#333' }}>Saldo ficticio de Supervielle</p>
                    </div>

                  </div>
                </div>

                <button 
                  className="btn btn-success"
                  style={{ backgroundColor: '#4caf50', borderColor: '#388e3c', borderRadius: '8px' }}
                  onClick={() => {
                    playSound('success');
                    setBalance(prev => prev - selectedBill.amount);
                    setSimStep('mp-bill-success');
                  }}
                >
                  <CheckCircle2 size={24} /> Confirmar pago ficticio
                </button>
              </div>
            )}

            {/* MP SUBVIEW: BILL SUCCESS */}
            {simStep === 'mp-bill-success' && (
              <div style={{ backgroundColor: 'var(--color-success)', padding: '32px 16px', minHeight: '300px', textAlign: 'center', color: 'var(--text-on-brand)', borderRadius: '12px' }}>
                <span className="pulse-element" style={{ fontSize: '72px', display: 'block', marginBottom: '16px' }}>🎉</span>
                
                <h3 style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: '12px', color: 'var(--text-on-brand)' }}>¡Pago ficticio exitoso!</h3>
                <p style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: 500 }}>
                  Pagaste la factura de {selectedBill.name} por ${selectedBill.amount.toLocaleString('es-AR')} con dinero simulado sin arriesgar nada.
                </p>

                <div className="card" style={{ color: 'var(--text-primary)', border: 'none', textAlign: 'left', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '12px', boxShadow: 'none' }}>
                  <h4 style={{ color: 'var(--color-success)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🏆 ¡Logro desbloqueado!
                  </h4>
                  <p style={{ fontWeight: 500, marginTop: '6px' }}>Administrador de cuentas 🛡️</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Escaneaste y pagaste una factura simulada correctamente.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                  <button 
                    className="btn btn-success"
                    style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', borderColor: 'white', borderStyle: 'solid', borderRadius: '8px' }}
                    onClick={() => {
                      playSound('click');
                      // Add points to profile
                      setUserProfile(prev => ({
                        ...prev,
                        points: prev.points + 50,
                        medals: prev.medals.includes('Servicio Pagado 🏆') ? prev.medals : ['Servicio Pagado 🏆', ...prev.medals]
                      }));
                      // Go to Quiz Recap view
                      setActiveView('quiz');
                      setQuizStep(1);
                    }}
                  >
                    🏆 ¡Hacer juego de repaso!
                  </button>

                  <button 
                    className="btn btn-outline"
                    style={{ 
                      backgroundColor: 'transparent',
                      color: 'var(--text-on-brand)', 
                      borderColor: 'var(--text-on-brand)', 
                      borderRadius: '8px' 
                    }}
                    onClick={() => {
                      playSound('click');
                      setSelectedBill(null);
                      setBalance(45000);
                      setSimStep('mp-home');
                    }}
                  >
                    🔄 Volver a practicar
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  };

  // VIRTUAL ASSISTANT COCO IN SIMULATOR
  const renderCocoAssistant = () => {
    let assistantText = '';
    
    if (simStep === 'mp-home') {
      assistantText = `¡Hola ${userProfile.name}! Soy Coco, tu asistente. Hoy vamos a practicar usar Supervielle de forma 100% segura. Tocá el botón grande que dice "Enviar Dinero" para aprender a mandar plata de juguete.`;
    } else if (simStep === 'mp-send-select') {
      assistantText = `¡Muy bien! Ahora elegí de la lista de abajo a quién querés mandarle el dinero ficticio. Tocá la tarjeta de "Lucas (Tutor Chichín)".`;
    } else if (simStep === 'mp-send-amount') {
      assistantText = `¡Genial! Escribí con el teclado la cantidad que le vas a transferir (por ejemplo: 5.000) o usá los botones rápidos para sumar montos. Luego tocá "Siguiente".`;
    } else if (simStep === 'mp-send-confirm') {
      assistantText = `¡Paso de seguridad muy importante! Revisá el nombre de Lucas y el monto ficticio. Si coincide con lo que querías hacer, tocá el botón verde "Confirmar Transferencia".`;
    } else if (simStep === 'mp-send-success') {
      assistantText = `¡Brillante! Lograste transferir dinero de práctica sin riesgo real. Ahora hagamos un pequeño juego divertido para fijar lo que aprendimos y ganar tu medalla.`;
    } else if (simStep === 'mp-bill-select') {
      assistantText = `¡Hola Elsa! Vamos a aprender a pagar facturas de luz o gas. Elegí cuál servicio de la lista querés pagar con tu dinero simulado de Chichín.`;
    } else if (simStep === 'mp-bill-scan') {
      assistantText = `¡Hagamos magia! Hacé clic arriba en la tarjeta de la factura para simular que le sacás una foto con tu cámara. ¡Verás cómo la app escanea el código de barras!`;
    } else if (simStep === 'mp-bill-confirm') {
      assistantText = `¡Paso de seguridad! Revisá que el servicio de ${selectedBill?.name} y el importe sean correctos. Luego confirmá el pago ficticio.`;
    } else if (simStep === 'mp-bill-success') {
      assistantText = `¡Excelente trabajo! Pagaste tu servicio de forma 100% segura. ¡Hagamos nuestro juego de preguntas!`;
    }

    return (
      <div className="assistant-bubble" style={{ borderLeftWidth: '4px', position: 'relative' }}>
        <div className="assistant-avatar">🦉</div>
        <div style={{ flex: 1, paddingRight: '48px' }}>
          <p style={{ fontWeight: 500, color: 'var(--brand-primary)', fontSize: '0.92rem', letterSpacing: '0.01em' }}>
            Coco - tu asistente de práctica
          </p>
          <p className="assistant-text" style={{ marginTop: '4px', fontSize: '1.05rem' }}>
            {assistantText}
          </p>
        </div>
        <button 
          className="btn-listen-icon" 
          style={{ position: 'absolute', right: '16px', top: '16px' }}
          onClick={() => speakText(assistantText, true)}
          title="Escuchar explicación de Coco"
          aria-label="Escuchar explicación de Coco"
        >
          <Volume2 size={24} />
        </button>
      </div>
    );
  };

  // VIEW: AI QUIZ / RECAP VIEW (CUESTIONARIO LÚDICO)
  const renderQuiz = () => {
    // Current question index is quizStep - 1 (since 0 was intro or not used)
    const currentQIndex = quizStep - 1;
    const qData = quizQuestions[currentQIndex];

    if (!qData) return null;

    return (
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-primary)', fontSize: '1.8rem' }}>
          🎯 Juego de seguridad digital ({quizStep} de 2)
        </h2>

        {/* Coco Assistant says the question */}
        <div className="assistant-bubble" style={{ borderLeftColor: 'var(--brand-primary)', borderLeftWidth: '4px', marginBottom: '24px', position: 'relative' }}>
          <div className="assistant-avatar">🦉</div>
          <div style={{ flex: 1, paddingRight: '48px' }}>
            <p style={{ fontWeight: 500, color: 'var(--brand-primary)', fontSize: '0.95rem' }}>Coco pregunta:</p>
            <p className="assistant-text" style={{ fontSize: '1.15rem', marginTop: '4px', fontWeight: 500 }}>
              {qData.q}
            </p>
          </div>
          <button 
            className="btn-listen-icon" 
            style={{ position: 'absolute', right: '16px', top: '16px' }}
            onClick={() => speakText(qData.q, true)}
            title="Escuchar pregunta"
            aria-label="Escuchar la pregunta del juego"
          >
            <Volume2 size={24} />
          </button>
        </div>

        {/* Answer Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {qData.options.map((opt, idx) => {
            const isSelected = quizAnswerSelected === idx;
            
            // Border color logic based on result evaluation
            let borderStyle = '1px solid var(--border-color)';
            let bgStyle = 'var(--bg-card)';
            if (isSelected) {
              if (quizResultState === 'correct') {
                borderStyle = '2px solid var(--color-success)';
                bgStyle = '#f0fdf4';
              } else if (quizResultState === 'incorrect') {
                borderStyle = '2px solid var(--color-error)';
                bgStyle = '#fdf2f2';
              } else {
                borderStyle = '2px solid var(--brand-primary)';
                bgStyle = 'var(--brand-primary-light)';
              }
            }

            return (
              <button 
                key={idx}
                className="btn btn-outline"
                style={{ 
                  border: borderStyle,
                  backgroundColor: bgStyle,
                  color: 'var(--text-primary)',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  padding: '16px 20px',
                  height: 'auto',
                  lineHeight: '1.3',
                  borderRadius: '8px'
                }}
                disabled={quizResultState === 'correct'}
                onClick={() => {
                  playSound('click');
                  setQuizAnswerSelected(idx);
                  
                  if (opt.isCorrect) {
                    playSound('success');
                    setQuizResultState('correct');
                    speakText(opt.feedback, true);
                  } else {
                    playSound('error');
                    setQuizResultState('incorrect');
                    speakText(opt.feedback, true);
                  }
                }}
              >
                <span style={{ fontSize: '24px', marginRight: '12px' }}>
                  {idx === 0 ? '🅰️' : '🅱️'}
                </span>
                <span style={{ fontWeight: 500 }}>{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Evaluation feedback card */}
        {quizResultState && (
          <div className="card text-lg" style={{ 
            marginTop: '24px',
            border: `1px solid ${quizResultState === 'correct' ? 'var(--color-success)' : 'var(--color-error)'}`,
            backgroundColor: quizResultState === 'correct' ? '#f0fdf4' : '#fdf2f2',
            borderRadius: '12px'
          }}>
            <p style={{ fontWeight: 500 }}>
              {qData.options[quizAnswerSelected].feedback}
            </p>
            
            {quizResultState === 'correct' && (
              <button 
                className="btn btn-success" 
                style={{ marginTop: '16px' }}
                onClick={() => {
                  playSound('click');
                  if (quizStep < quizQuestions.length) {
                    setQuizStep(prev => prev + 1);
                    setQuizAnswerSelected(null);
                    setQuizResultState(null);
                  } else {
                    // Complete quiz success!
                    playSound('medal');
                    setQuizStep(3); // Go to final quiz success view
                    speakText("¡Felicidades Elsa! Has contestado todas las preguntas correctamente y te ganaste la medalla de protectora digital. Tu tutor Lucas está muy orgulloso de vos.", true);
                  }
                }}
              >
                {quizStep < quizQuestions.length ? 'Siguiente pregunta ➜' : '¡Ver mi medalla! 🏆'}
              </button>
            )}
            
            {quizResultState === 'incorrect' && (
              <button 
                className="btn btn-danger" 
                style={{ marginTop: '16px' }}
                onClick={() => {
                  playSound('click');
                  setQuizAnswerSelected(null);
                  setQuizResultState(null);
                }}
              >
                🔄 Volver a intentar
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // VIEW: QUIZ SUCCESS & CONGRATULATIONS
  const renderQuizSuccess = () => {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '32px 20px' }}>
        <span className="pulse-element" style={{ fontSize: '96px', display: 'block', marginBottom: '16px' }}>🏆</span>
        
        <h1 style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '12px' }}>
          ¡Felicitaciones, {userProfile.name}!
        </h1>
        <p className="text-xl" style={{ fontWeight: 500, marginBottom: '24px' }}>
          ¡Has ganado la medalla de **"Escudo de seguridad Chichín"**! 🛡️
        </p>

        <div className="card" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--brand-primary-light)', padding: '24px', textAlign: 'left', maxWidth: '440px', margin: '0 auto 24px auto', borderRadius: '12px', boxShadow: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <span style={{ fontSize: '48px' }}>🛡️</span>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Medalla: protectora digital</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Por saber identificar llamadas sospechosas y claves.</p>
            </div>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500, color: 'var(--brand-primary)' }}>Puntos ganados:</span>
            <span className="badge badge-gold" style={{ fontSize: '1.1rem' }}>+100 puntos ✨</span>
          </div>
        </div>


        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
          <button 
            className="btn btn-primary"
            onClick={() => {
              playSound('click');
              // Add medal to profile
              setUserProfile(prev => ({
                ...prev,
                points: prev.points + 100,
                medals: prev.medals.includes('Escudo Digital 🛡️') ? prev.medals : ['Escudo Digital 🛡️', ...prev.medals]
              }));
              handleNav('home');
            }}
          >
            Volver a pantalla de inicio
          </button>

          <button 
            className="btn btn-outline"
            style={{ borderRadius: '8px' }}
            onClick={() => {
              playSound('click');
              // Add medal to profile
              setUserProfile(prev => ({
                ...prev,
                points: prev.points + 100,
                medals: prev.medals.includes('Escudo Digital 🛡️') ? prev.medals : ['Escudo Digital 🛡️', ...prev.medals]
              }));
              // Reset simulation and navigate back to simulator
              setTransferAmount('');
              setTransferTarget(null);
              setSelectedBill(null);
              setBalance(45000);
              setSimStep('mp-home');
              setActiveView('simulador-mp');
            }}
          >
            🔄 Volver a practicar
          </button>
        </div>
      </div>
    );
  };

  // VIEW: ACHIEVEMENTS / MEDALS
  const renderLogros = () => {
    return (
      <div className="container fade-in">
        {/* Header navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            onClick={() => handleNav('home')}
          >
            <ArrowLeft size={22} />
          </button>
          <h2>Mis medallas y logros</h2>
        </div>

        <div className="card" style={{
          backgroundColor: 'var(--brand-primary-light)',
          border: '1px solid var(--border-color)',
          textAlign: 'center',
          marginBottom: '24px',
          boxShadow: 'none',
          borderRadius: '12px'
        }}>
          <span style={{ fontSize: '56px', display: 'block', marginBottom: '10px' }}>🏆</span>
          <h3 style={{ marginBottom: '4px' }}>Elsa la estudiante estrella</h3>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            {userProfile.points} puntos de práctica acumulados
          </p>
        </div>

        <p className="section-title">Mis medallas ganadas</p>

        <div className="tiles-grid" style={{ marginBottom: '32px' }}>
          <div className="card" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', borderRadius: '12px', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: 0, padding: '18px', boxShadow: 'none' }}>
            <span style={{ fontSize: '42px', flexShrink: 0 }}>🏅</span>
            <div>
              <h4>Registro exitoso</h4>
              <p className="text-sm text-muted">Por registrarte en Chichín y empezar a practicar.</p>
            </div>
          </div>

          <div className="card" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', borderRadius: '12px', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: 0, padding: '18px', boxShadow: 'none' }}>
            <span style={{ fontSize: '42px', flexShrink: 0 }}>🛡️</span>
            <div>
              <h4>Perfil seguro</h4>
              <p className="text-sm text-muted">Completaste el módulo de contraseñas.</p>
            </div>
          </div>

          <div className="card" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', borderRadius: '12px', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: 0, padding: '18px', boxShadow: 'none' }}>
            <span style={{ fontSize: '42px', flexShrink: 0 }}>💸</span>
            <div>
              <h4>Supervielle</h4>
              <p className="text-sm text-muted">Tu primera transferencia simulada.</p>
            </div>
          </div>

          {/* Locked medal */}
          <div className="card" style={{ border: '1.5px dashed var(--border-color)', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: 0, opacity: 0.5, padding: '18px', borderRadius: '12px', boxShadow: 'none' }}>
            <span style={{ fontSize: '42px', filter: 'grayscale(1)', flexShrink: 0 }}>🏦</span>
            <div>
              <h4>Experta en banco</h4>
              <p className="text-sm text-muted">Completá el juego de Home Banking.</p>
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => handleNav('home')}>
          Volver al inicio
        </button>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Persistent Accessibility Bar */}
      {renderAccessibilityBar()}

      {/* Global Header */}
      {renderHeader()}

      {/* Active Navigation/View Content */}
      <main style={{ flex: 1, paddingBottom: '100px' }}>
        {activeView === 'home' && renderHome()}
        {activeView === 'simulador-mp' && renderSimuladorMP()}
        {activeView === 'quiz' && quizStep === 3 ? renderQuizSuccess() : activeView === 'quiz' ? renderQuiz() : null}
        {activeView === 'logros' && renderLogros()}
      </main>

      {/* Persistent Emergency Help Panel */}
      {renderHelpFooter()}
    </div>
  );
}

export default App;
