import React, { useState, useEffect } from 'react';
import { 
  Plus, Minus, Accessibility, Volume2, VolumeX, ShieldAlert, Award, 
  MapPin, Calendar, Clock, Star, ArrowLeft, Send, CheckCircle2, 
  AlertTriangle, Phone, HelpCircle, X, ChevronRight, Play, BookOpen, CreditCard, RefreshCw
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
    medals: ['Primera Clase 🏅', 'Perfil Seguro 🛡️']
  });

  // --- Booking Class States ---
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState('Mercado Pago');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  const topics = [
    { name: 'Mercado Pago 📱', desc: 'Pagar cuentas, mandar dinero y cobrar de forma segura.' },
    { name: 'Home Banking / Bancos 🏦', desc: 'Ver tu jubilación, hacer transferencias y cuidar tus claves.' },
    { name: 'Trámites ANSES / PAMI 📄', desc: 'Consultar turnos, recetas de medicamentos y constancias.' },
    { name: 'WhatsApp y Llamadas 💬', desc: 'Enviar audios, fotos y hacer videollamadas con tu familia.' },
  ];

  const tutors = [
    { 
      id: 1, 
      name: 'Lucas', 
      avatar: '👨🏽‍🎓', 
      study: 'Ingeniería en Sistemas (UBA)', 
      place: 'Café Martínez (Belgrano)',
      address: 'Av. Cabildo 2230', 
      rating: 5.0, 
      reviews: 24,
      desc: 'Muy paciente y le gusta hablar de fútbol. ¡Excelente profesor!' 
    },
    { 
      id: 2, 
      name: 'Sofía', 
      avatar: '👩🏼‍🎓', 
      study: 'Psicología (UBA)', 
      place: 'Biblioteca Popular Leopoldo Lugones', 
      address: 'Pampa 2215',
      rating: 4.9, 
      reviews: 18,
      desc: 'Súper cariñosa, habla pausado y claro. Trae facturas para compartir.' 
    }
  ];

  const times = [
    'Hoy a las 16:30 ☕',
    'Mañana a las 10:30 🥐',
    'Este Sábado a las 11:00 ☀️',
    'Este Sábado a las 15:30 🍰'
  ];

  const [activeBookings, setActiveBookings] = useState([
    {
      topic: 'Mercado Pago 📱',
      tutor: tutors[0],
      time: 'Hoy a las 16:30 ☕',
      status: 'Confirmada'
    }
  ]);

  // --- Simulator Mercado Pago ("Chichín-Pago") States ---
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
      q: 'Si recibís una llamada o mensaje de alguien que dice ser de Mercado Pago y te pide una "clave de seguridad" o código de verificación, ¿qué tenés que hacer?',
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
  const speakText = (text, force = false) => {
    if (!force && !voiceEnabled) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any active speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-AR'; // Argentine Spanish accent
      utterance.rate = 0.85; // Calming, slightly slower pace
      window.speechSynthesis.speak(utterance);
    }
  };

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
      speakText("Estás en el inicio de Chichín. Aquí podés ver tus clases programadas, buscar una nueva clase o entrar a la Zona de Práctica.");
    } else if (activeView === 'reserva') {
      speakText("Comenzando la reserva. Paso 1: Tocá el botón del tema que te gustaría aprender hoy.");
    } else if (activeView === 'simulador-mp') {
      speakText("Bienvenido al simulador seguro de Mercado Pago. Aquí podés practicar mandar dinero o pagar cuentas con dinero de juguete.");
    } else if (activeView === 'quiz') {
      speakText("¡Es hora del juego interactivo! Respondamos unas breves preguntas para ganar tu medalla.");
    } else if (activeView === 'logros') {
      speakText("Felicitaciones. Aquí podés ver todas las medallas que ganaste con tu esfuerzo.");
    }
  }, [activeView, voiceEnabled]);

  // Assist speech during Simulator transitions
  useEffect(() => {
    if (!voiceEnabled || activeView !== 'simulador-mp') return;
    
    if (simStep === 'mp-home') {
      speakText("Estamos en el inicio de Mercado Pago ficticio. Tocá el botón grande de enviar dinero, o pagar servicios.");
    } else if (simStep === 'mp-send-select') {
      speakText("Paso dos. Seleccioná a quién le querés mandar dinero ficticio tocando su nombre.");
    } else if (simStep === 'mp-send-amount') {
      speakText("Paso tres. Escribí el monto usando el teclado de abajo y luego tocá el botón Siguiente.");
    } else if (simStep === 'mp-send-confirm') {
      speakText("Paso cuatro. Revisá los datos. Si está todo correcto, tocá el botón azul grande que dice Confirmar Transferencia.");
    } else if (simStep === 'mp-send-success') {
      speakText("¡Felicitaciones! Dinero ficticio enviado con éxito. Tocá el botón de hacer juego de repaso.");
    }
  }, [simStep, voiceEnabled, activeView]);

  // --- Handlers ---
  const handleNav = (view) => {
    playSound('click');
    setActiveView(view);
    // Reset secondary states
    setBookingStep(1);
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
        style={{ cursor: 'pointer', border: '1.5px solid hsl(43,100%,72%)', padding: '8px 16px', fontSize: 'calc(0.9rem * var(--font-multiplier))' }}
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
          style={{ flex: 1, border: '1.5px solid var(--border-strong)', borderRadius: 'var(--radius-md)', gap: '6px' }}
          onClick={() => {
            playSound('click');
            handleNav('home');
          }}
        >
          🏠 <span style={{ fontWeight: 700 }}>Inicio</span>
        </button>
        <button
          className="btn btn-danger pulse-element"
          style={{ flex: 2, fontWeight: 800, letterSpacing: '0.04em' }}
          onClick={() => {
            playSound('click');
            setHelpOpen(true);
            speakText("Menú de ayuda de emergencia abierto. Podés llamar a Lucas o contactar a soporte técnico.", true);
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
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', border: '2px solid var(--color-error)', padding: '28px', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={26} /> Zona de Auxilio
              </h2>
              <button
                onClick={() => {
                  playSound('click');
                  setHelpOpen(false);
                  if (voiceEnabled) window.speechSynthesis.cancel();
                }}
                style={{ background: 'none', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-primary)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontWeight: 600, marginBottom: '18px', lineHeight: 1.5 }}>
              ¿Qué problema tenés, {userProfile.name}? ¡No te preocupés, estamos con vos!
            </p>

            <div className="tiles-grid" style={{ marginBottom: '20px' }}>
              <div
                className="card card-interactive"
                style={{ textAlign: 'center', border: '2px solid var(--brand-primary)', padding: '18px', marginBottom: 0 }}
                onClick={() => {
                  playSound('success');
                  alert("Simulando llamada a tu tutor Lucas... 📞 ¡Enseguida te va a hablar por teléfono!");
                  setHelpOpen(false);
                }}
              >
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>👨🏽‍🎓</span>
                <h4>Llamar a Lucas</h4>
                <p className="text-sm text-muted">Tu tutor de hoy</p>
              </div>

              <div
                className="card card-interactive"
                style={{ textAlign: 'center', border: '2px solid var(--brand-secondary)', padding: '18px', marginBottom: 0 }}
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
              <h4 style={{ color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
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
          background: 'linear-gradient(135deg, var(--brand-primary-light), hsl(204, 90%, 96%))',
          border: '1.5px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '22px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontSize: '60px', lineHeight: 1 }}>{userProfile.avatar}</span>
          <div style={{ flex: 1 }}>
            <h1 style={{ marginBottom: '4px' }}>¡Hola, {userProfile.name}! 👋🏼</h1>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>¿Qué vamos a aprender de lindo hoy?</p>
            <button
              style={{
                marginTop: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: '1.5px solid var(--brand-secondary)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                cursor: 'pointer',
                color: 'var(--brand-secondary)',
                fontWeight: 700,
                fontSize: 'calc(0.88rem * var(--font-multiplier))'
              }}
              onClick={() => speakText(`Hola Elsa. Tenés una clase confirmada para hoy a las 16 30 con tu tutor Lucas en Café Martínez. También podés entrar a la zona de práctica segura para jugar con el simulador de Mercado Pago.`, true)}
            >
              <Volume2 size={16} /> Escuchar por voz
            </button>
          </div>
        </div>

        {/* Practice CTA — Mirror System */}
        <div
          className="card card-interactive pulse-element"
          style={{
            background: 'linear-gradient(135deg, var(--color-success-light), hsl(145, 65%, 98%))',
            border: '2px solid hsl(145, 65%, 68%)',
            boxShadow: 'var(--shadow-green)',
            marginBottom: '20px'
          }}
          onClick={() => handleNav('simulador-mp')}
        >
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '44px', lineHeight: 1 }}>🎮</span>
            <div>
              <span className="badge badge-green" style={{ marginBottom: '6px' }}>¡100% Seguro!</span>
              <h2 style={{ color: 'var(--text-primary)' }}>Zona de Práctica</h2>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '16px', lineHeight: 1.5 }}>
            Simulador de Mercado Pago con dinero de juguete. ¡Aprendé sin miedo a equivocarte!
          </p>
          <button
            className="btn btn-success"
            onClick={(e) => { e.stopPropagation(); handleNav('simulador-mp'); }}
            style={{ pointerEvents: 'none' }}
          >
            <Play size={22} fill="white" /> ¡Entrar a Practicar!
          </button>
        </div>

        {/* Section: Next Classes */}
        <p className="section-title">📅 Mi Clase Programada</p>
        
        {activeBookings.length > 0 ? (
          activeBookings.map((booking, idx) => (
            <div className="card card-accent-blue" key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <h3>{booking.topic}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-secondary)', fontWeight: 700, marginTop: '6px' }}>
                    <Clock size={16} />
                    <span className="text-sm">{booking.time}</span>
                  </div>
                </div>
                <span className="badge badge-blue">{booking.status}</span>
              </div>

              <hr className="divider" />

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '40px', backgroundColor: 'var(--bg-muted)', padding: '6px', borderRadius: 'var(--radius-sm)', lineHeight: 1 }}>
                  {booking.tutor.avatar}
                </span>
                <div>
                  <p style={{ fontWeight: 700 }}>Tutor: {booking.tutor.name}</p>
                  <p className="text-sm text-muted">{booking.tutor.study}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', backgroundColor: 'var(--bg-muted)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border-color)' }}>
                <MapPin size={18} style={{ color: 'var(--brand-accent)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 'calc(1rem * var(--font-multiplier))' }}>{booking.tutor.place}</p>
                  <p className="text-sm text-muted">{booking.tutor.address} · Buscá la mesa con el cartel Chichín 👵🏼</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ fontWeight: 700, marginBottom: '16px' }}>No tenés ninguna clase agendada por el momento.</p>
            <button className="btn btn-secondary" onClick={() => handleNav('reserva')}>
              Agendar mi Primera Clase
            </button>
          </div>
        )}

        {activeBookings.length > 0 && (
          <button
            className="btn btn-secondary"
            style={{ marginBottom: '24px' }}
            onClick={() => handleNav('reserva')}
          >
            <Plus size={20} /> Reservar Otra Clase
          </button>
        )}

        {/* Anti-Scam Widget */}
        <div className="scam-warning-card" style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <ShieldAlert size={32} style={{ color: 'var(--color-error)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ color: 'var(--color-error)', marginBottom: '6px', fontSize: 'calc(1.1rem * var(--font-multiplier))' }}>Escudo Anti-Estafas Chichín</h3>
              <p className="text-sm" style={{ fontWeight: 500, lineHeight: 1.55 }}>
                Ninguna persona buena te va a pedir tu contraseña por teléfono. Si te pasa, decí: <strong>«No comparto mis claves»</strong> y cortá de inmediato.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // VIEW: BOOKING CLASS FLOW (PASO A PASO)
  const renderReserva = () => {
    return (
      <div className="container fade-in">
        {/* Header navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <button
            style={{
              background: 'none',
              border: '1.5px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            onClick={() => {
              if (bookingStep > 1) {
                playSound('click');
                setBookingStep(prev => prev - 1);
              } else {
                handleNav('home');
              }
            }}
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h2 style={{ lineHeight: 1.1 }}>Reservar Clase</h2>
            <p className="text-sm text-muted">Paso {bookingStep} de 4</p>
          </div>
        </div>

        {/* Step progress bar */}
        <div className="step-tracker" style={{ marginTop: '14px' }}>
          <div className="step-tracker-bar" style={{ width: `${(bookingStep / 4) * 100}%` }}></div>
        </div>

        {/* STEP 1: SELECT TOPIC */}
        {bookingStep === 1 && (
          <div>
            <p className="section-title">Paso 1: ¿Qué querés aprender?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topics.map((t, idx) => {
                const isSelected = selectedTopic === t.name;
                return (
                  <div
                    key={idx}
                    className="card card-interactive"
                    style={{
                      borderColor: isSelected ? 'var(--brand-primary)' : 'var(--border-color)',
                      borderWidth: isSelected ? '2px' : '1.5px',
                      backgroundColor: isSelected ? 'var(--brand-primary-light)' : 'var(--bg-card)',
                      marginBottom: 0,
                      padding: '18px 20px'
                    }}
                    onClick={() => {
                      playSound('click');
                      setSelectedTopic(t.name);
                      speakText(`Elegiste ${t.name}. ${t.desc} Tocá el botón de abajo para seguir.`, true);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ marginBottom: '4px' }}>{t.name}</h4>
                        <p className="text-sm text-muted">{t.desc}</p>
                      </div>
                      {isSelected && <CheckCircle2 size={24} style={{ color: 'var(--brand-primary)', flexShrink: 0, marginLeft: '12px' }} />}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '24px' }}
              onClick={() => {
                playSound('click');
                setBookingStep(2);
                speakText("Paso dos. Seleccioná con quién y dónde te gustaría encontrarte. Tenemos dos tutores recomendados cerca de tu casa.");
              }}
            >
              Elegir Lugar y Profesor ➜
            </button>
          </div>
        )}

        {/* STEP 2: SELECT TUTOR & CAFE */}
        {bookingStep === 2 && (
          <div>
            <h3 style={{ marginBottom: '16px' }}>Paso 2: ¿Dónde y con quién?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {tutors.map((t) => {
                const isSelected = selectedTutor?.id === t.id;
                return (
                  <div 
                    key={t.id}
                    className="card card-interactive"
                    style={{ 
                      borderColor: isSelected ? 'var(--brand-primary)' : 'var(--border-color)',
                      borderWidth: isSelected ? '4px' : '3px',
                      backgroundColor: isSelected ? 'hsl(38, 100%, 97%)' : 'var(--bg-card)',
                      marginBottom: 0
                    }}
                    onClick={() => {
                      playSound('click');
                      setSelectedTutor(t);
                      speakText(`Elegiste a ${t.name} en el ${t.place}. ${t.desc} Tocá el botón de abajo para seguir.`, true);
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '50px', backgroundColor: 'var(--bg-primary)', padding: '6px', borderRadius: '50%' }}>
                        {t.avatar}
                      </span>
                      <div>
                        <h4 style={{ fontSize: '1.25rem' }}>Tutor/a: {t.name}</h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t.study}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          <Star size={16} fill="hsl(45, 100%, 50%)" stroke="hsl(45, 100%, 45%)" />
                          <span style={{ fontWeight: 'bold' }}>{t.rating.toFixed(1)}</span>
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>({t.reviews} opiniones)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <p style={{ fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        📍 {t.place}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{t.address}</p>
                    </div>

                    <p className="text-sm" style={{ fontStyle: 'italic', marginTop: '12px', color: 'var(--text-secondary)', borderLeft: '4px solid var(--brand-primary)', paddingLeft: '8px' }}>
                      "{t.desc}"
                    </p>
                  </div>
                );
              })}
            </div>

            <button 
              className="btn btn-primary" 
              style={{ marginTop: '24px' }}
              disabled={!selectedTutor}
              onClick={() => {
                if (selectedTutor) {
                  playSound('click');
                  setBookingStep(3);
                  speakText("Paso tres. Seleccioná el día y horario que te quede más cómodo.");
                } else {
                  playSound('error');
                  alert("Por favor, selecciona un profesor de la lista tocándolo.");
                }
              }}
            >
              Elegir Horario ➜
            </button>
          </div>
        )}

        {/* STEP 3: SELECT TIME */}
        {bookingStep === 3 && (
          <div>
            <h3 style={{ marginBottom: '16px' }}>Paso 3: ¿Cuándo te queda cómodo?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {times.map((t, idx) => {
                const isSelected = selectedTime === t;
                return (
                  <button 
                    key={idx}
                    className="btn btn-outline"
                    style={{ 
                      borderColor: isSelected ? 'var(--brand-primary)' : 'var(--border-color)',
                      borderWidth: isSelected ? '4px' : '3px',
                      backgroundColor: isSelected ? 'hsl(38, 100%, 97%)' : 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      justifyContent: 'flex-start',
                      paddingLeft: '24px'
                    }}
                    onClick={() => {
                      playSound('click');
                      setSelectedTime(t);
                      speakText(`Elegiste el horario ${t}. Tocá el botón de abajo para confirmar.`, true);
                    }}
                  >
                    <Calendar size={24} style={{ marginRight: '8px', color: 'var(--brand-secondary)' }} /> {t}
                  </button>
                );
              })}
            </div>

            <button 
              className="btn btn-primary" 
              style={{ marginTop: '24px' }}
              disabled={!selectedTime}
              onClick={() => {
                if (selectedTime) {
                  playSound('click');
                  setBookingStep(4);
                  speakText(`¡Paso cuatro final! Vamos a repasar. Tu clase de ${selectedTopic} con ${selectedTutor.name} será el ${selectedTime} en el ${selectedTutor.place}. Tocá el botón gigante verde para confirmar.`);
                } else {
                  playSound('error');
                  alert("Por favor, selecciona un horario.");
                }
              }}
            >
              Revisar y Confirmar ➜
            </button>
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM */}
        {bookingStep === 4 && (
          <div>
            <h3 style={{ marginBottom: '16px' }}>Paso 4: Confirmar los datos</h3>
            
            <div className="card" style={{ border: '3px solid var(--brand-primary)', backgroundColor: '#fffdf5' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '64px' }}>🎉</span>
                <h4 style={{ fontSize: '1.4rem', color: 'var(--brand-secondary)', fontWeight: 'bold' }}>¡Falta un solo paso!</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>¿Qué vas a aprender?</p>
                  <p style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>{selectedTopic}</p>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

                <div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>¿Cuándo?</p>
                  <p style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--brand-secondary)' }}>{selectedTime}</p>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

                <div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>¿Con quién?</p>
                  <p style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>{selectedTutor.name} {selectedTutor.avatar}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedTutor.study}</p>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

                <div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>¿Dónde?</p>
                  <p style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>{selectedTutor.place}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedTutor.address}</p>
                </div>
              </div>
            </div>

            <div className="card" style={{ border: '3px solid var(--color-success)', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', backgroundColor: '#f0fdf4' }}>
              <span style={{ fontSize: '32px' }}>☕</span>
              <p className="text-sm" style={{ fontWeight: '600', color: '#166534' }}>
                ¡El café del encuentro está pagado! Chichín te invita un café con medialunas para vos y tu tutor mientras estudian.
              </p>
            </div>

            <button 
              className="btn btn-success" 
              onClick={() => {
                playSound('success');
                // Add booking to list
                const newBooking = {
                  topic: selectedTopic,
                  tutor: selectedTutor,
                  time: selectedTime,
                  status: 'Confirmada'
                };
                setActiveBookings([newBooking, ...activeBookings]);
                
                // Show congratulations modal via simple browser alert, then send home
                alert(`¡Clase reservada con éxito, Elsa! 👵🏼☕\nLucas te espera el ${selectedTime} en ${selectedTutor.place}. Te enviamos un recordatorio por WhatsApp.`);
                handleNav('home');
              }}
            >
              <CheckCircle2 size={24} /> ¡Confirmar Reserva!
            </button>
          </div>
        )}
      </div>
    );
  };

  // VIEW: MERCADO PAGO SIMULATOR ("SISTEMA ESPEJO")
  const renderSimuladorMP = () => {
    return (
      <div className="container" style={{ paddingBottom: '120px' }}>
        {/* Frame / Dashed Container */}
        <div className="sandbox-container">
          {/* Top safety banner */}
          <div className="sandbox-banner">
            <ShieldAlert size={24} /> Zona de Práctica • Dinero de Juguete
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
                  borderColor: 'var(--brand-secondary)',
                  borderWidth: '2px'
                }}
                onClick={() => {
                  playSound('click');
                  setSimStep('mp-home');
                }}
              >
                ← Volver al Menú MP
              </button>
            ) : (
              <button 
                className="btn btn-outline"
                style={{ 
                  width: 'auto', 
                  minHeight: '44px', 
                  padding: '4px 14px', 
                  fontSize: '0.95rem',
                  borderColor: 'var(--color-error)',
                  borderWidth: '2px'
                }}
                onClick={() => {
                  playSound('click');
                  handleNav('home');
                }}
              >
                🚪 Salir del Simulador
              </button>
            )}
            <span style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--color-success)' }}>
              Saldo Ficticio: ${balance.toLocaleString('es-AR')}
            </span>
          </div>

          {/* INNER SANDBOX: THE MERCADO PAGO CLONE */}
          <div style={{
            backgroundColor: '#00b1ea', // Mercado Pago corporate blue
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
            border: '3px solid #009ad0'
          }}>
            
            {/* MP Clone Top Nav */}
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ backgroundColor: '#fff', color: '#00b1ea', fontWeight: '900', padding: '6px 10px', borderRadius: '8px', fontSize: '1.25rem', fontFamily: 'sans-serif', fontStyle: 'italic' }}>
                  chichín
                </span>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>pago</span>
              </div>
              <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', backgroundColor: '#0097c9', padding: '4px 8px', borderRadius: '4px' }}>
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
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  border: '1px solid #e0e0e0'
                }}>
                  <p style={{ color: '#666', fontSize: '0.9rem', fontWeight: '600' }}>Dinero disponible</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <h3 style={{ fontSize: '2rem', color: '#333', fontFamily: 'sans-serif' }}>
                      ${balance.toLocaleString('es-AR')}
                    </h3>
                    <span style={{ color: '#00b1ea', fontWeight: 'bold', fontSize: '0.9rem' }}>Ver detalles ➜</span>
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
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  border: '1px solid #e0e0e0'
                }}>
                  <div 
                    style={{ textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                    onClick={() => {
                      playSound('click');
                      setSimStep('mp-send-select');
                    }}
                  >
                    <div style={{ width: '60px', height: '60px', backgroundColor: '#e1f5fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContents: 'center', color: '#00b1ea', justifyContent: 'center' }}>
                      <Send size={28} />
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#333' }}>Enviar<br/>Dinero</span>
                  </div>

                  <div 
                    style={{ textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                    onClick={() => {
                      playSound('click');
                      setSimStep('mp-bill-select');
                    }}
                  >
                    <div style={{ width: '60px', height: '60px', backgroundColor: '#e8f5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContents: 'center', color: '#4caf50', justifyContent: 'center' }}>
                      <BookOpen size={28} />
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#333' }}>Pagar<br/>Cuentas</span>
                  </div>

                  <div 
                    style={{ textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', opacity: 0.5 }}
                    onClick={() => {
                      playSound('error');
                      alert("Este botón está deshabilitado en este paso del prototipo. ¡Focalicemos en Enviar Dinero o Pagar Cuentas!");
                    }}
                  >
                    <div style={{ width: '60px', height: '60px', backgroundColor: '#fff3e0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContents: 'center', color: '#ff9800', justifyContent: 'center' }}>
                      <CreditCard size={28} />
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#333' }}>Cargar<br/>SUBE</span>
                  </div>
                </div>

                {/* Simulated Recent Activity */}
                <div style={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  border: '1px solid #e0e0e0'
                }}>
                  <h4 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '12px', fontFamily: 'sans-serif' }}>Tu actividad reciente</h4>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '24px', backgroundColor: '#f0f0f0', padding: '6px', borderRadius: '50%' }}>💼</span>
                      <div>
                        <p style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#333' }}>Pago a Edesur</p>
                        <p className="text-sm" style={{ color: '#888' }}>24 de Mayo</p>
                      </div>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>-$3.400</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '24px', backgroundColor: '#e1f5fe', padding: '6px', borderRadius: '50%' }}>👵🏼</span>
                      <div>
                        <p style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#333' }}>Tu Jubilación</p>
                        <p className="text-sm" style={{ color: '#888' }}>20 de Mayo</p>
                      </div>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#388e3c' }}>+$180.000</span>
                  </div>
                </div>
              </div>
            )}

            {/* MP SUBVIEW: SEND MONEY - CONTACT SELECT */}
            {simStep === 'mp-send-select' && (
              <div style={{ backgroundColor: '#fff', padding: '16px', minHeight: '300px' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#333', marginBottom: '16px' }}>¿A quién querés enviarle dinero?</h3>
                
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
                        border: '2px solid #00b1ea',
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
                        <p style={{ fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>{contact.name}</p>
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
                  <h4 style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333', marginTop: '6px' }}>Enviar dinero a {transferTarget.name}</h4>
                  <p className="text-sm" style={{ color: '#666' }}>Saldo ficticio disponible: ${balance.toLocaleString('es-AR')}</p>
                </div>

                <div style={{ 
                  margin: '24px 0', 
                  borderBottom: '3px solid #00b1ea',
                  paddingBottom: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333' }}>$</span>
                  <input 
                    type="number"
                    style={{ 
                      fontSize: '2.5rem', 
                      fontWeight: 'bold', 
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
                      style={{ minHeight: '44px', padding: '8px 12px', fontSize: '1rem', borderStyle: 'solid', borderColor: '#00b1ea' }}
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
                <h3 style={{ fontSize: '1.25rem', color: '#333', marginBottom: '16px', textAlign: 'center' }}>¿Está todo correcto?</h3>

                <div className="card" style={{ border: '2px solid #00b1ea', backgroundColor: '#f9fbfd', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    <div style={{ textAlign: 'center' }}>
                      <p className="text-sm" style={{ color: '#666', fontWeight: 'bold' }}>VAS A ENVIAR</p>
                      <h4 style={{ fontSize: '2.5rem', color: '#333', fontWeight: '900', fontFamily: 'sans-serif' }}>
                        ${parseFloat(transferAmount).toLocaleString('es-AR')}
                      </h4>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '32px' }}>{transferTarget.avatar}</span>
                      <div>
                        <p className="text-sm" style={{ color: '#666', fontWeight: 'bold' }}>DESTINATARIO</p>
                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#333' }}>{transferTarget.name}</p>
                        <p className="text-sm" style={{ color: '#666' }}>Celular: {transferTarget.phone}</p>
                      </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '32px' }}>💼</span>
                      <div>
                        <p className="text-sm" style={{ color: '#666', fontWeight: 'bold' }}>MEDIO DE PAGO</p>
                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#333' }}>Saldo Ficticio de Chichín-Pago</p>
                      </div>
                    </div>

                  </div>
                </div>

                <button 
                  className="btn btn-primary"
                  style={{ backgroundColor: '#00b1ea', borderColor: '#009ad0' }}
                  onClick={() => {
                    playSound('success');
                    setBalance(prev => prev - parseFloat(transferAmount));
                    setSimStep('mp-send-success');
                  }}
                >
                  <CheckCircle2 size={24} /> Confirmar Transferencia
                </button>
              </div>
            )}

            {/* MP SUBVIEW: SEND MONEY - SUCCESS */}
            {simStep === 'mp-send-success' && (
              <div style={{ backgroundColor: '#00b1ea', padding: '32px 16px', minHeight: '300px', textAlign: 'center', color: '#fff' }}>
                <span className="pulse-element" style={{ fontSize: '72px', display: 'block', marginBottom: '16px' }}>🎉</span>
                
                <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '12px' }}>¡Transferencia Ficticia Exitosa!</h3>
                <p style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: 'bold' }}>
                  Le enviaste ${parseFloat(transferAmount).toLocaleString('es-AR')} a {transferTarget.name} sin arriesgar un solo peso real.
                </p>

                <div className="card" style={{ color: 'var(--text-primary)', border: 'none', textAlign: 'left', backgroundColor: 'rgba(255,255,255,0.95)' }}>
                  <h4 style={{ color: 'var(--brand-secondary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🏆 ¡Logro Desbloqueado!
                  </h4>
                  <p style={{ fontWeight: 'bold', marginTop: '6px' }}>Primer Envío de Práctica 📱</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Completaste con éxito tu primera práctica del Sistema Espejo.</p>
                </div>

                <button 
                  className="btn btn-success"
                  style={{ marginTop: '24px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'white', borderStyle: 'solid' }}
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
                  🏆 ¡Hacer Juego de Repaso!
                </button>
              </div>
            )}

            {/* MP SUBVIEW: BILL SELECT */}
            {simStep === 'mp-bill-select' && (
              <div style={{ backgroundColor: '#fff', padding: '16px', minHeight: '300px' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#333', marginBottom: '16px' }}>¿Qué servicio querés pagar?</h3>

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
                        border: '2px solid #4caf50',
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
                        <p style={{ fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>{bill.name}</p>
                        <p className="text-sm" style={{ color: '#666' }}>Código: {bill.code}</p>
                      </div>
                      <span style={{ fontWeight: 'bold', color: '#2e7d32', fontSize: '1.15rem' }}>
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
                <h3 style={{ fontSize: '1.25rem', color: '#333', marginBottom: '12px' }}>Paso 2: Escaneando factura</h3>
                <p className="text-sm" style={{ color: '#666', marginBottom: '16px' }}>Apuntá la cámara al código de barras simulado de abajo.</p>

                {/* Simulated Camera Viewfinder with Bill barcode */}
                <div 
                  className="pulse-element"
                  style={{
                    border: '4px solid var(--brand-primary)',
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
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.9)',
                  }}></div>

                  <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    📃 FACTURA DE {selectedBill.name.toUpperCase()}
                  </p>
                  
                  {/* Fictional Barcode visual */}
                  <div style={{
                    height: '60px',
                    backgroundColor: '#111',
                    margin: '12px 20px',
                    backgroundImage: 'repeating-linear-gradient(90deg, #111, #111 2px, #fff 2px, #fff 6px, #111 6px, #111 10px)'
                  }}></div>

                  <p className="text-sm" style={{ fontWeight: 'bold', color: 'var(--brand-secondary)' }}>
                    👉🏼 ¡Hacé Clic en la Factura para Escanear!
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
                <h3 style={{ fontSize: '1.25rem', color: '#333', marginBottom: '16px', textAlign: 'center' }}>¿Confirmar pago del servicio?</h3>

                <div className="card" style={{ border: '2px solid #4caf50', backgroundColor: '#f6fbf7', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    <div style={{ textAlign: 'center' }}>
                      <p className="text-sm" style={{ color: '#666', fontWeight: 'bold' }}>MONTO A PAGAR</p>
                      <h4 style={{ fontSize: '2.5rem', color: '#2e7d32', fontWeight: '900', fontFamily: 'sans-serif' }}>
                        ${selectedBill.amount.toLocaleString('es-AR')}
                      </h4>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0' }} />

                    <div>
                      <p className="text-sm" style={{ color: '#666', fontWeight: 'bold' }}>SERVICIO</p>
                      <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#333' }}>{selectedBill.name}</p>
                      <p className="text-sm" style={{ color: '#666' }}>Nro. Factura: {selectedBill.code}</p>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0' }} />

                    <div>
                      <p className="text-sm" style={{ color: '#666', fontWeight: 'bold' }}>MEDIO DE PAGO</p>
                      <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#333' }}>Saldo Ficticio de Chichín-Pago</p>
                    </div>

                  </div>
                </div>

                <button 
                  className="btn btn-success"
                  style={{ backgroundColor: '#4caf50', borderColor: '#388e3c' }}
                  onClick={() => {
                    playSound('success');
                    setBalance(prev => prev - selectedBill.amount);
                    setSimStep('mp-bill-success');
                  }}
                >
                  <CheckCircle2 size={24} /> Confirmar Pago Ficticio
                </button>
              </div>
            )}

            {/* MP SUBVIEW: BILL SUCCESS */}
            {simStep === 'mp-bill-success' && (
              <div style={{ backgroundColor: '#4caf50', padding: '32px 16px', minHeight: '300px', textAlign: 'center', color: '#fff' }}>
                <span className="pulse-element" style={{ fontSize: '72px', display: 'block', marginBottom: '16px' }}>🎉</span>
                
                <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '12px' }}>¡Pago Ficticio Exitoso!</h3>
                <p style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: 'bold' }}>
                  Pagaste la factura de {selectedBill.name} por ${selectedBill.amount.toLocaleString('es-AR')} con dinero simulado sin arriesgar nada.
                </p>

                <div className="card" style={{ color: 'var(--text-primary)', border: 'none', textAlign: 'left', backgroundColor: 'rgba(255,255,255,0.95)' }}>
                  <h4 style={{ color: 'var(--color-success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🏆 ¡Logro Desbloqueado!
                  </h4>
                  <p style={{ fontWeight: 'bold', marginTop: '6px' }}>Administrador de Cuentas 🛡️</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Escaneaste y pagaste una factura simulada correctamente.</p>
                </div>

                <button 
                  className="btn btn-success"
                  style={{ marginTop: '24px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'white', borderStyle: 'solid' }}
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
                  🏆 ¡Hacer Juego de Repaso!
                </button>
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
      assistantText = `¡Hola ${userProfile.name}! Soy Coco, tu asistente. Hoy vamos a practicar usar Mercado Pago de forma 100% segura. Tocá el botón grande que dice "Enviar Dinero" para aprender a mandar plata de juguete.`;
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
      <div className="assistant-bubble" style={{ borderLeftWidth: '8px' }}>
        <div className="assistant-avatar">🦉</div>
        <div>
          <p style={{ fontWeight: '800', color: 'var(--brand-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Coco - Tu Asistente de Práctica
          </p>
          <p className="assistant-text" style={{ marginTop: '4px', fontSize: '1.05rem' }}>
            {assistantText}
          </p>
          <button 
            className="btn btn-outline text-sm" 
            style={{ 
              marginTop: '10px', 
              minHeight: 'auto', 
              padding: '4px 10px', 
              width: 'auto', 
              display: 'inline-flex',
              borderColor: 'var(--brand-secondary)'
            }}
            onClick={() => speakText(assistantText, true)}
          >
            🔊 Escuchar a Coco
          </button>
        </div>
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
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--brand-secondary)', fontSize: '1.8rem' }}>
          🎯 Juego de Seguridad Digital ({quizStep} de 2)
        </h2>

        {/* Coco Assistant says the question */}
        <div className="assistant-bubble" style={{ borderLeftColor: 'var(--brand-primary)', borderLeftWidth: '8px', marginBottom: '24px' }}>
          <div className="assistant-avatar">🦉</div>
          <div>
            <p style={{ fontWeight: '800', color: 'var(--brand-primary)', fontSize: '0.95rem' }}>COCO PREGUNTA:</p>
            <p className="assistant-text" style={{ fontSize: '1.15rem', marginTop: '4px', fontWeight: 'bold' }}>
              {qData.q}
            </p>
            <button 
              className="btn btn-outline text-sm" 
              style={{ 
                marginTop: '10px', 
                minHeight: 'auto', 
                padding: '4px 10px', 
                width: 'auto', 
                borderColor: 'var(--brand-primary)'
              }}
              onClick={() => speakText(qData.q, true)}
            >
              🔊 Escuchar Pregunta
            </button>
          </div>
        </div>

        {/* Answer Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {qData.options.map((opt, idx) => {
            const isSelected = quizAnswerSelected === idx;
            
            // Border color logic based on result evaluation
            let borderStyle = '3px solid var(--border-color)';
            let bgStyle = 'var(--bg-card)';
            if (isSelected) {
              if (quizResultState === 'correct') {
                borderStyle = '4px solid var(--color-success)';
                bgStyle = '#f0fdf4';
              } else if (quizResultState === 'incorrect') {
                borderStyle = '4px solid var(--color-error)';
                bgStyle = '#fdf2f2';
              } else {
                borderStyle = '4px solid var(--brand-primary)';
                bgStyle = '#fffdf5';
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
                  lineHeight: '1.3'
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
                <span style={{ fontWeight: '700' }}>{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Evaluation feedback card */}
        {quizResultState && (
          <div className="card text-lg" style={{ 
            marginTop: '24px',
            border: `3px solid ${quizResultState === 'correct' ? 'var(--color-success)' : 'var(--color-error)'}`,
            backgroundColor: quizResultState === 'correct' ? '#f0fdf4' : '#fdf2f2'
          }}>
            <p style={{ fontWeight: 'bold' }}>
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
                {quizStep < quizQuestions.length ? 'Siguiente Pregunta ➜' : '¡Ver Mi Medalla! 🏆'}
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
                🔄 Volver a Intentar
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
        
        <h1 style={{ color: 'var(--brand-secondary)', fontWeight: '900', marginBottom: '12px' }}>
          ¡Felicitaciones, {userProfile.name}!
        </h1>
        <p className="text-xl" style={{ fontWeight: 'bold', marginBottom: '24px' }}>
          ¡Has ganado la medalla de **"Escudo de Seguridad Chichín"**! 🛡️
        </p>

        <div className="card" style={{ border: '3px solid var(--brand-primary)', backgroundColor: '#fffdf5', padding: '24px', textAlign: 'left', maxWidth: '440px', margin: '0 auto 24px auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <span style={{ fontSize: '48px' }}>🛡️</span>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Medalla: Protectora Digital</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Por saber identificar llamadas sospechosas y claves.</p>
            </div>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--brand-secondary)' }}>Puntos ganados:</span>
            <span className="badge badge-gold" style={{ fontSize: '1.1rem' }}>+100 Puntos ✨</span>
          </div>
        </div>

        {/* Dynamic Coach Encouragement */}
        <div className="assistant-bubble" style={{ borderLeftColor: 'var(--brand-secondary)', borderLeftWidth: '8px', textAlign: 'left', maxWidth: '440px', margin: '0 auto 32px auto' }}>
          <span style={{ fontSize: '44px' }}>👨🏽‍🎓</span>
          <div>
            <h4 style={{ fontWeight: 'bold' }}>Lucas (Tu tutor) dice:</h4>
            <p className="text-sm" style={{ fontStyle: 'italic', marginTop: '4px' }}>
              "¡Impresionante Elsa! Contesto todo perfecto a la primera. Estoy ansioso por vernos en nuestra clase del café para enseñarte más trucos de Mercado Pago. ¡Sos una genia!"
            </p>
          </div>
        </div>

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
          Volver a Pantalla de Inicio
        </button>
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
              border: '1.5px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
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
          <h2>Mis Medallas y Logros</h2>
        </div>

        <div className="card" style={{
          background: 'linear-gradient(135deg, var(--brand-primary-light), hsl(204, 90%, 96%))',
          border: '1.5px solid var(--border-color)',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <span style={{ fontSize: '56px', display: 'block', marginBottom: '10px' }}>🏆</span>
          <h3 style={{ marginBottom: '4px' }}>Elsa la Estudiante Estrella</h3>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            {userProfile.points} puntos de práctica acumulados
          </p>
        </div>

        <p className="section-title">Mis medallas ganadas</p>

        <div className="tiles-grid" style={{ marginBottom: '32px' }}>
          <div className="card" style={{ border: '2px solid hsl(43,100%,72%)', background: 'linear-gradient(135deg, hsl(43,100%,96%), hsl(43,100%,92%))', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: 0, padding: '18px' }}>
            <span style={{ fontSize: '42px', flexShrink: 0 }}>🏅</span>
            <div>
              <h4>Clase Inicial</h4>
              <p className="text-sm text-muted">Por registrarte y empezar a estudiar.</p>
            </div>
          </div>

          <div className="card" style={{ border: '2px solid hsl(204,90%,78%)', background: 'linear-gradient(135deg, hsl(204,90%,96%), hsl(204,90%,92%))', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: 0, padding: '18px' }}>
            <span style={{ fontSize: '42px', flexShrink: 0 }}>🛡️</span>
            <div>
              <h4>Perfil Seguro</h4>
              <p className="text-sm text-muted">Completaste el módulo de contraseñas.</p>
            </div>
          </div>

          <div className="card" style={{ border: '2px solid hsl(145,65%,72%)', background: 'linear-gradient(135deg, hsl(145,65%,96%), hsl(145,65%,92%))', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: 0, padding: '18px' }}>
            <span style={{ fontSize: '42px', flexShrink: 0 }}>💸</span>
            <div>
              <h4>Mercado Pago</h4>
              <p className="text-sm text-muted">Tu primera transferencia simulada.</p>
            </div>
          </div>

          {/* Locked medal */}
          <div className="card" style={{ border: '1.5px dashed var(--border-color)', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: 0, opacity: 0.5, padding: '18px' }}>
            <span style={{ fontSize: '42px', filter: 'grayscale(1)', flexShrink: 0 }}>🏦</span>
            <div>
              <h4>Experta en Banco</h4>
              <p className="text-sm text-muted">Reservá una clase de Home Banking.</p>
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => handleNav('home')}>
          Volver al Inicio
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
        {activeView === 'reserva' && renderReserva()}
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
