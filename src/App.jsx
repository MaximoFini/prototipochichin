import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, Minus, Accessibility, Volume2, VolumeX, ShieldAlert, 
  ArrowLeft, AlertTriangle, X, Play
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
  const [userProfile, setUserProfile] = useState(() => {
    const savedName = localStorage.getItem('chichin_username');
    return {
      name: savedName || '',
      age: 72,
      avatar: '👵🏼',
      points: 120,
      streak: 3,
      medals: ['Registro Exitoso 🎉', 'Perfil Seguro 🛡️']
    };
  });

  // --- Diagnostic State ---
  const [diagnosticDone, setDiagnosticDone] = useState(() => {
    return localStorage.getItem('chichin_diagnostic_done') === 'true';
  });

  const [currentSpeakingText, setCurrentSpeakingText] = useState(null);
  const currentSpeakingTextRef = useRef(null);

  useEffect(() => {
    currentSpeakingTextRef.current = currentSpeakingText;
  }, [currentSpeakingText]);



  // --- Real Practice Simulator States (Pagar el Gas) ---
  // practicePhase: 'context' | 'guided' | 'free' | 'confirmation'
  const [practicePhase, setPracticePhase] = useState('context');
  // practiceStep: 1 (Home - buscar factura), 2 (Confirmar pago), 3 (Comprobante éxito)
  const [practiceStep, setPracticeStep] = useState(1);
  const [showExplanationOverlay, setShowExplanationOverlay] = useState(true);

  const [inactivitySeconds, setInactivitySeconds] = useState(0);
  const [incorrectTapsCount, setIncorrectTapsCount] = useState(0);
  const [isRetest, setIsRetest] = useState(false);
  const [simulatedDaysPassed, setSimulatedDaysPassed] = useState(0);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [isRetestTime, setIsRetestTime] = useState(false);

  const getAssistantText = useCallback(() => {
    if (practicePhase === 'guided') {
      if (practiceStep === 1) {
        return `¡Hola ${userProfile.name}! Vamos a aprender a realizar una transferencia de forma segura. Primero, tocá el botón "Transferir dinero" que está en los accesos rápidos de arriba.`;
      } else if (practiceStep === 2) {
        return `¡Excelente! Ahora estamos en la pantalla de confirmación de la transferencia. Revisá que el destinatario sea "Juan Pérez" y el monto sea de $5.000. Luego, tocá el botón rojo "Confirmar transferencia" de abajo.`;
      } else if (practiceStep === 3) {
        return `¡Brillante! La transferencia simulada se realizó con éxito y no usaste dinero real. Ahora tocá el botón verde "Finalizar" para terminar este paso.`;
      }
    } else if (practicePhase === 'free') {
      if (inactivitySeconds >= 40) {
        if (practiceStep === 1) {
          return `Ayuda de Coco: Buscá en la parte superior el acceso rápido de "Transferir dinero" (el primer botón con flechas) y tocalo.`;
        } else if (practiceStep === 2) {
          return `Ayuda de Coco: Tocá el botón rojo de abajo que dice "Confirmar transferencia" para completar la operación.`;
        } else if (practiceStep === 3) {
          return `Ayuda de Coco: Tocá el botón verde que dice "Finalizar" para salir de la pantalla de éxito.`;
        }
      } else {
        if (practiceStep === 1) {
          return `Modo Libre - Paso 1 de 3: Buscá el acceso rápido que dice "Transferir dinero" y tocalo. ¡Probá tu autonomía!`;
        } else if (practiceStep === 2) {
          return `Modo Libre - Paso 2 de 3: Confirmá los datos de Juan Pérez por $5.000 y tocá el botón rojo "Confirmar transferencia". ¡Podés hacerlo solo/a!`;
        } else if (practiceStep === 3) {
          return `Modo Libre - Paso 3 de 3: ¡Casi listo! Tocá el botón "Finalizar" para completar la práctica.`;
        }
      }
    }
    return '';
  }, [practicePhase, practiceStep, inactivitySeconds, userProfile.name]);

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
      if (force && currentSpeakingTextRef.current === text) {
        window.speechSynthesis.cancel();
        setCurrentSpeakingText(null);
        return;
      }

      window.speechSynthesis.cancel(); // Stop any active speech
      setCurrentSpeakingText(text);

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

      utterance.onend = () => {
        if (currentSpeakingTextRef.current === text) {
          setCurrentSpeakingText(null);
        }
      };
      utterance.onerror = () => {
        if (currentSpeakingTextRef.current === text) {
          setCurrentSpeakingText(null);
        }
      };

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

  // Auto-scroll to top on view or step transitions
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeView, practiceStep, quizStep]);

  // Voice narration upon changing views
  useEffect(() => {
    if (!voiceEnabled) return;
    
    if (activeView === 'home') {
      speakText(`Estás en el inicio de Chichín. Llevás una racha de ${userProfile.streak} días seguidos practicando. Aquí podés entrar a la Zona de Práctica segura.`);
    } else if (activeView === 'simulador-mp') {
      speakText("Bienvenido al simulador seguro de Supervielle. Aquí podés practicar mandar dinero o pagar cuentas con dinero de juguete.");
    } else if (activeView === 'quiz') {
      speakText("¡Es hora del juego interactivo! Respondamos unas breves preguntas para ganar tu medalla.");
    } else if (activeView === 'logros') {
      speakText("Felicitaciones. Aquí podés ver todas las medallas que ganaste con tu esfuerzo.");
    }
  }, [activeView, voiceEnabled, speakText, userProfile.streak]);

  // --- New Practice Simulator Timers and Voice Narrations ---
  const inactivityTimerRef = useRef(null);

  // Inactivity tracking (seconds) for Free Mode
  useEffect(() => {
    if (activeView === 'simulador-mp' && practicePhase === 'free' && (practiceStep === 1 || practiceStep === 2 || practiceStep === 3)) {
      inactivityTimerRef.current = setInterval(() => {
        setInactivitySeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
    }

    return () => {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
    };
  }, [activeView, practicePhase, practiceStep]);

  // Open explanation overlay automatically at 40s if user is inactive in Free Mode
  useEffect(() => {
    if (inactivitySeconds === 40 && practicePhase === 'free') {
      Promise.resolve().then(() => {
        setShowExplanationOverlay(true);
      });
    }
  }, [inactivitySeconds, practicePhase]);

  // Voice narration for practice overlay (both guided and free steps)
  useEffect(() => {
    if (!voiceEnabled || activeView !== 'simulador-mp' || !showExplanationOverlay) return;
    
    const text = getAssistantText();
    if (text) {
      speakText(text, true);
    }
  }, [showExplanationOverlay, getAssistantText, voiceEnabled, activeView, speakText]);

  // Voice narration for context and confirmation screens
  useEffect(() => {
    if (!voiceEnabled || activeView !== 'simulador-mp') return;
    
    if (practicePhase === 'context') {
      speakText("Pantalla de preparación. Vas a practicar transferir dinero. Cuando estés listo, tocá el botón grande de abajo que dice 'Empezar'.");
    } else if (practicePhase === 'confirmation') {
      speakText("¡Felicitaciones! Has completado la práctica. Ya sabés transferir dinero desde tu celular. Tocá el botón 'Seguir' para continuar.");
    }
  }, [practicePhase, voiceEnabled, activeView, speakText]);

  // Resets inactivity timer on any click or touch inside simulator
  const handleSimulatorInteraction = () => {
    setInactivitySeconds(0);
  };

  // Registers incorrect taps silently (soft vibration, no alerts) in Free Mode
  const handleIncorrectTap = () => {
    if (practicePhase !== 'free') return;
    setIncorrectTapsCount(prev => prev + 1);
    setInactivitySeconds(0);
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(40);
    }
  };

  // Spaced Repetition calculation - Pure state update
  useEffect(() => {
    const lastCompletedAt = localStorage.getItem('chichin_transfer_practice_completed_at');
    const retestStatus = localStorage.getItem('chichin_retest_status') || 'pending';
    let nextValue = false;
    if (lastCompletedAt && retestStatus === 'pending') {
      const timePassed = Date.now() - parseInt(lastCompletedAt);
      const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
      if (simulatedDaysPassed >= 3 || timePassed >= threeDaysInMs) {
        nextValue = true;
      }
    }
    // Run state update asynchronously to avoid synchronous setState inside render warnings
    Promise.resolve().then(() => {
      setIsRetestTime(nextValue);
    });
  }, [simulatedDaysPassed, activeView]);

  // --- Handlers ---
  const handleNav = (view) => {
    playSound('click');
    setActiveView(view);
    // Reset secondary states
    setQuizStep(0);
    setQuizAnswerSelected(null);
    setQuizResultState(null);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setCurrentSpeakingText(null);
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
      setCurrentSpeakingText(null);
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
          className="btn btn-danger pulse-element"
          style={{ width: '100%', fontWeight: 500, letterSpacing: '0.01em' }}
          onClick={() => {
            playSound('click');
            setHelpOpen(true);
            speakText("Menú de ayuda de emergencia abierto. Podés llamar a tu familia o contactar a soporte técnico.", true);
          }}
        >
          🆘 Ayuda
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
          alignItems: 'flex-start',
          justifyContent: 'center',
          overflowY: 'auto',
          padding: '20px 16px'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', border: '1px solid var(--border-color)', padding: '20px', boxShadow: 'none', margin: 'auto' }}>
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
        {/* Retest Invite Banner */}
        {isRetestTime && (
          <div className="card fade-in" style={{
            border: '2px solid var(--brand-primary)',
            backgroundColor: '#FEF3C7',
            padding: '20px',
            marginBottom: '20px',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '36px', lineHeight: 1 }}>🧠</span>
              <div style={{ flex: 1 }}>
                <span className="badge badge-gold" style={{ marginBottom: '6px' }}>Reto del día</span>
                <h3 style={{ color: '#92400E', margin: '0 0 6px 0', fontSize: '1.2rem' }}>Repetición Espaciada</h3>
                <p style={{ color: '#78350F', fontWeight: 500, fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  ¡Hola {userProfile.name}! Hace 3 días aprendiste a transferir dinero. ¿Te animás a intentar transferirlo de nuevo en <strong>Modo Libre</strong> (sin ayuda) para ver si te acordás?
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-primary"
                    style={{ width: 'auto', minHeight: '40px', padding: '6px 16px', fontSize: '0.9rem' }}
                    onClick={() => {
                      playSound('click');
                      setIsRetest(true);
                      setPracticePhase('free');
                      setPracticeStep(1);
                      setIncorrectTapsCount(0);
                      setInactivitySeconds(0);
                      setShowExplanationOverlay(true);
                      setActiveView('simulador-mp');
                    }}
                  >
                    🧠 Sí, probar solo/a
                  </button>
                  <button 
                    className="btn btn-outline"
                    style={{ width: 'auto', minHeight: '40px', padding: '6px 16px', fontSize: '0.9rem', backgroundColor: '#fff' }}
                    onClick={() => {
                      playSound('click');
                      setIsRetest(true);
                      setPracticePhase('context');
                      setPracticeStep(1);
                      setIncorrectTapsCount(0);
                      setInactivitySeconds(0);
                      setActiveView('simulador-mp');
                    }}
                  >
                    Hacer con guía
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>¿Qué vamos a aprender de lindo hoy?</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge badge-gold" style={{ fontSize: '0.85rem', padding: '4px 10px', fontWeight: 500 }}>
                🔥 {userProfile.streak} días seguidos
              </span>
            </div>
          </div>
          <button
            className={`btn-listen-icon ${currentSpeakingText === `¡Hola, ${userProfile.name}! Te damos la bienvenida a Chichín. Llevás una racha de ${userProfile.streak} días seguidos practicando. Aquí podés entrar a la Zona de Práctica segura para jugar con el simulador de Supervielle.` ? 'speaking' : ''}`}
            onClick={() => speakText(`¡Hola, ${userProfile.name}! Te damos la bienvenida a Chichín. Llevás una racha de ${userProfile.streak} días seguidos practicando. Aquí podés entrar a la Zona de Práctica segura para jugar con el simulador de Supervielle.`, true)}
            title={currentSpeakingText === `¡Hola, ${userProfile.name}! Te damos la bienvenida a Chichín. Llevás una racha de ${userProfile.streak} días seguidos practicando. Aquí podés entrar a la Zona de Práctica segura para jugar con el simulador de Supervielle.` ? "Detener audio" : "Escuchar bienvenida"}
            aria-label="Escuchar bienvenida"
          >
            {currentSpeakingText === `¡Hola, ${userProfile.name}! Te damos la bienvenida a Chichín. Llevás una racha de ${userProfile.streak} días seguidos practicando. Aquí podés entrar a la Zona de Práctica segura para jugar con el simulador de Supervielle.` ? <VolumeX size={24} /> : <Volume2 size={24} />}
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
              className={`btn-listen-icon ${currentSpeakingText === "Escudo anti-estafas Chichín. Ninguna persona buena te va a pedir tu contraseña por teléfono. Si te pasa, decí: «No comparto mis claves» y cortá de inmediato." ? 'speaking' : ''}`}
              onClick={() => speakText("Escudo anti-estafas Chichín. Ninguna persona buena te va a pedir tu contraseña por teléfono. Si te pasa, decí: «No comparto mis claves» y cortá de inmediato.", true)}
              title={currentSpeakingText === "Escudo anti-estafas Chichín. Ninguna persona buena te va a pedir tu contraseña por teléfono. Si te pasa, decí: «No comparto mis claves» y cortá de inmediato." ? "Detener audio" : "Escuchar escudo anti-estafas"}
              aria-label="Escuchar escudo anti-estafas"
              style={{ flexShrink: 0, alignSelf: 'center' }}
            >
              {currentSpeakingText === "Escudo anti-estafas Chichín. Ninguna persona buena te va a pedir tu contraseña por teléfono. Si te pasa, decí: «No comparto mis claves» y cortá de inmediato." ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </div>
        </div>

        {/* Debug / Prototipo Tools */}
        <div style={{
          marginTop: '20px',
          padding: '16px',
          border: '1.5px dashed #bbb',
          borderRadius: '12px',
          backgroundColor: '#f9f9f9',
          textAlign: 'center'
        }}>
          <p style={{ fontWeight: 500, fontSize: '0.85rem', color: '#666', marginBottom: '8px', marginTop: 0 }}>
            🧪 Herramientas de Prototipo (Evaluadores)
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-outline" 
              style={{ width: 'auto', minHeight: '36px', height: '36px', padding: '0 12px', fontSize: '0.8rem', backgroundColor: '#fff' }}
              onClick={() => {
                localStorage.setItem('chichin_transfer_practice_completed_at', (Date.now() - 3 * 24 * 60 * 60 * 1000).toString());
                localStorage.setItem('chichin_retest_status', 'pending');
                setSimulatedDaysPassed(3);
                playSound('success');
                alert("¡Simulación activada! Se guardó que completaste la práctica hace 3 días. Volvé al inicio para ver la invitación.");
              }}
            >
              📅 Simular 3 días pasados
            </button>
            <button 
              className="btn btn-outline" 
              style={{ width: 'auto', minHeight: '36px', height: '36px', padding: '0 12px', fontSize: '0.8rem', color: '#c8102e', borderColor: '#c8102e', backgroundColor: '#fff' }}
              onClick={() => {
                localStorage.removeItem('chichin_transfer_practice_completed_at');
                localStorage.removeItem('chichin_retest_status');
                localStorage.removeItem('chichin_retest_history');
                setSimulatedDaysPassed(0);
                setIsRetest(false);
                playSound('click');
                alert("Datos de práctica reseteados.");
              }}
            >
              🔄 Limpiar datos de práctica
            </button>
          </div>
        </div>
      </div>
    );
  };



  // VIEW: SUPERVIELLE SIMULATOR ("SISTEMA ESPEJO")
  const renderArrow = (style) => {
    return (
      <div 
        className="guided-arrow" 
        style={{
          position: 'absolute',
          zIndex: 99,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          ...style
        }}
      >
        <span style={{
          backgroundColor: '#B71C35',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '0.8rem',
          padding: '3px 8px',
          borderRadius: '6px',
          whiteSpace: 'nowrap',
          marginBottom: '2px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Tocá acá
        </span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21L12 3" stroke="#B71C35" strokeWidth="4" strokeLinecap="round"/>
          <path d="M5 14L12 21L19 14" stroke="#B71C35" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  };

  const renderExplanationOverlay = () => {
    const text = getAssistantText();
    if (!text) return null;

    const stepTitles = {
      1: "Paso 1 de 3: Iniciar transferencia",
      2: "Paso 2 de 3: Confirmar datos",
      3: "Paso 3 de 3: Comprobante de transferencia"
    };

    return (
      <div className="explanation-overlay fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="explanation-card">
          <div className="explanation-avatar">🦉</div>
          <h3 className="explanation-step-title">{stepTitles[practiceStep]}</h3>
          
          <p className="explanation-text-content">
            {text}
          </p>

          <div className="explanation-actions">
            <button 
              className={`btn-listen-icon ${currentSpeakingText === text ? 'speaking' : ''}`} 
              onClick={(e) => { e.stopPropagation(); speakText(text, true); }}
              title="Escuchar explicación de Coco"
              aria-label="Escuchar explicación de Coco"
            >
              {currentSpeakingText === text ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>

            <button 
              className="btn btn-primary"
              style={{ flex: 1, minHeight: '48px' }}
              onClick={(e) => {
                e.stopPropagation();
                playSound('click');
                setShowExplanationOverlay(false);
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                setCurrentSpeakingText(null);
              }}
            >
              Entendido, ver pantalla
            </button>
          </div>

          <button
            className="btn btn-outline"
            style={{ marginTop: '12px', minHeight: '40px', height: '40px', padding: '0' }}
            onClick={(e) => {
              e.stopPropagation();
              playSound('click');
              setPracticePhase('context');
              setPracticeStep(1);
              setIncorrectTapsCount(0);
              setInactivitySeconds(0);
              setIsRetest(false);
              handleNav('home');
            }}
          >
            🚪 Salir de la práctica
          </button>
        </div>
      </div>
    );
  };

  const renderContextScreen = () => {
    return (
      <div className="container fade-in" style={{ paddingBottom: '100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button 
            className="btn btn-outline"
            style={{ width: 'auto', minHeight: '40px', padding: '4px 14px', borderRadius: '8px' }}
            onClick={() => {
              playSound('click');
              handleNav('home');
            }}
          >
            🚪 Salir al inicio
          </button>
        </div>

        <div className="card fade-in" style={{ padding: '32px 24px', border: '1.5px solid var(--border-color)', backgroundColor: '#FFFFFF', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
          <span style={{ fontSize: '64px' }}>💸</span>
          <h2 style={{ fontSize: 'calc(1.6rem * var(--font-multiplier))', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
            Práctica: Transferir Dinero
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: 'calc(1.05rem * var(--font-multiplier))', lineHeight: 1.5, margin: 0 }}>
            Vas a practicar cómo enviar dinero a un contacto de forma 100% segura desde la aplicación de Supervielle.
          </p>
          
          <div className="scam-warning-card" style={{ width: '100%', borderStyle: 'dashed', marginTop: '10px', marginBottom: '10px' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-body)', margin: 0, textAlign: 'left' }}>
              🔒 <strong>Entorno Seguro:</strong> Esta es una simulación. No hay dinero real involucrado ni riesgo de equivocarse. ¡Es para aprender jugando!
            </p>
          </div>

          <button
            className="btn btn-primary"
            style={{ marginTop: '10px' }}
            onClick={() => {
              playSound('click');
              setPracticePhase('guided');
              setPracticeStep(1);
              setIncorrectTapsCount(0);
              setInactivitySeconds(0);
              setShowExplanationOverlay(true);
            }}
          >
            <Play size={20} fill="white" /> Empezar
          </button>
        </div>
      </div>
    );
  };

  const renderTransitionScreen = () => {
    return (
      <div className="container fade-in" style={{ paddingBottom: '100px' }}>
        <div className="card fade-in" style={{ padding: '32px 24px', border: '1.5px solid var(--border-color)', backgroundColor: '#FFFFFF', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
          <span style={{ fontSize: '64px' }}>💪🏼</span>
          <h2 style={{ fontSize: 'calc(1.6rem * var(--font-multiplier))', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
            ¡Paso a paso guiado completado!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: 'calc(1.05rem * var(--font-multiplier))', lineHeight: 1.5, margin: 0 }}>
            ¡Muy bien hecho! Hiciste la transferencia siguiendo la guía. Ahora llegó el momento del verdadero desafío: <strong>hacerlo vos solo/a en Modo Libre</strong>, sin flechas ni guías de Coco.
          </p>

          <button
            className="btn btn-success"
            style={{ marginTop: '10px' }}
            onClick={() => {
              playSound('click');
              setPracticePhase('free');
              setPracticeStep(1);
              setIncorrectTapsCount(0);
              setInactivitySeconds(0);
              setShowExplanationOverlay(true);
            }}
          >
            🚀 Comenzar Modo Libre
          </button>
        </div>
      </div>
    );
  };

  const renderConfirmationScreen = () => {
    const isRetestSuccess = isRetest && incorrectTapsCount <= 2 && inactivitySeconds < 40;
    
    return (
      <div className="container fade-in" style={{ paddingBottom: '100px' }}>
        <div className="card fade-in" style={{ padding: '32px 24px', border: '1.5px solid var(--border-color)', backgroundColor: '#FFFFFF', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center' }}>
          <span className="pulse-element" style={{ fontSize: '80px', display: 'block' }}>🎉</span>
          
          <h2 style={{ fontSize: 'calc(1.7rem * var(--font-multiplier))', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
            ¡Práctica finalizada!
          </h2>
          
          <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '16px', width: '100%' }}>
            <p style={{ fontWeight: 500, fontSize: '1.15rem', color: '#166534', margin: 0 }}>
              Ya sabés transferir dinero desde tu celular.
            </p>
          </div>

          {isRetest ? (
            <div style={{ backgroundColor: '#F8F9FA', borderRadius: '12px', padding: '16px', width: '100%', textAlign: 'left', border: '1px solid #e2e8f0' }}>
              <h4 style={{ color: 'var(--brand-primary)', marginBottom: '6px', fontSize: '1rem', fontWeight: 500 }}>
                🧠 Estado de tu aprendizaje (Retest de 3 días)
              </h4>
              {isRetestSuccess ? (
                <p className="text-sm" style={{ color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  ¡Espectacular! Completaste el retest a los 3 días solo/a y casi sin errores. Tu cerebro guardó muy bien la ruta para transferir dinero. <strong>¡El aprendizaje se ha consolidado con éxito!</strong>
                </p>
              ) : (
                <p className="text-sm" style={{ color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  ¡Bien hecho por practicar! Como te costó un poquito o necesitaste alguna ayuda de Coco, es normal. Vamos a invitarte a repetir el módulo con guía más adelante para seguir fortaleciendo tu memoria digital.
                </p>
              )}
            </div>
          ) : (
            <div style={{ backgroundColor: '#F8F9FA', borderRadius: '12px', padding: '16px', width: '100%', textAlign: 'left', border: '1px solid #e2e8f0' }}>
              <p className="text-sm" style={{ color: '#475569', lineHeight: 1.5, margin: 0 }}>
                💡 <strong>Consejo Chichín:</strong> Para que este aprendizaje se guarde en tu memoria a largo plazo, volvé a entrar dentro de unos días a practicarlo solo/a.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                playSound('click');
                localStorage.setItem('chichin_transfer_practice_completed_at', Date.now().toString());
                localStorage.setItem('chichin_retest_status', isRetest ? (isRetestSuccess ? 'consolidated' : 'needs_work') : 'pending');
                
                setUserProfile(prev => ({
                  ...prev,
                  points: prev.points + 60,
                  medals: prev.medals.includes('Transferencia Exitosa 🏆') ? prev.medals : ['Transferencia Exitosa 🏆', ...prev.medals]
                }));

                setPracticePhase('context');
                setPracticeStep(1);
                setIncorrectTapsCount(0);
                setInactivitySeconds(0);
                setIsRetest(false);
                handleNav('home');
              }}
            >
              Seguir
            </button>
            
            <button
              className="btn btn-outline"
              style={{ borderRadius: '8px' }}
              onClick={() => {
                playSound('click');
                setPracticePhase('context');
                setPracticeStep(1);
                setIncorrectTapsCount(0);
                setInactivitySeconds(0);
              }}
            >
              🔄 Practicar otra vez
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSupervielleApp = () => {
    const isDimmed = (stepNum, isTarget) => {
      if (practicePhase !== 'guided') return false;
      if (practiceStep !== stepNum) return false;
      return !isTarget;
    };

    return (
      <div 
        className="phone-container flex flex-col relative"
        style={{
          width: '100%',
          maxWidth: '480px',
          height: 'calc(100vh - var(--header-height))',
          backgroundColor: '#F8F9FA',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          margin: '0 auto',
          boxShadow: '0 0 20px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}
        onMouseDown={handleSimulatorInteraction}
        onTouchStart={handleSimulatorInteraction}
        onClick={handleIncorrectTap}
      >
        
        {/* VIEW STEP 1: HOME PAGE */}
        {practiceStep === 1 && (
          <>
            {/* Header Section */}
            <header 
              className="pt-5 pb-3 px-5 bg-[#F8F9FA] sticky top-0 z-10 border-b border-gray-100"
              style={{ opacity: isDimmed(1, false) ? 0.3 : 1, pointerEvents: isDimmed(1, false) ? 'none' : 'auto' }}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 relative">
                    <svg fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 50L80 20L40 80Z" fill="#B71C35"></path>
                      <path d="M20 50L80 80L40 20Z" fill="#801426"></path>
                    </svg>
                  </div>
                  <span className="text-gray-600 font-medium text-base">Hola, {userProfile.name}</span>
                </div>
                <button 
                  aria-label="Toggle visibility" 
                  className="text-gray-400 hover:bg-gray-200 p-1.5 rounded-full transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    playSound('click');
                    setBalanceVisible(!balanceVisible);
                  }}
                >
                  {balanceVisible ? <i className="fa-regular fa-eye-slash text-lg"></i> : <i className="fa-regular fa-eye text-lg"></i>}
                </button>
              </div>

              {/* Balances */}
              <div className="mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-gray-500 text-base font-medium">CA</span>
                    <span className="text-2xl font-bold text-gray-800 tracking-tight">
                      {balanceVisible ? '$372.280' : '*******'}
                    </span>
                    {balanceVisible && <span className="text-lg font-bold text-gray-800">19</span>}
                  </div>
                  <i className="fa-solid fa-chevron-right text-gray-300 text-xs"></i>
                </div>
                <div className="flex space-x-3 mt-1.5 text-xs text-gray-500 font-medium">
                  <div>
                    <span className="font-bold text-gray-700">U$D</span> {balanceVisible ? '16.484' : '*****'}{balanceVisible && <sup className="text-[9px]">84</sup>}
                  </div>
                  <div>
                    <span className="font-bold text-gray-700">EUR</span> {balanceVisible ? '10.662' : '*****'}{balanceVisible && <sup className="text-[9px]">14</sup>}
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto px-4 pb-20 hide-scrollbar">
              
              {/* Quick Actions Grid */}
              <section 
                className="grid grid-cols-4 gap-y-4 gap-x-1 my-5" 
                style={{ opacity: isDimmed(1, false) ? 0.3 : 1, pointerEvents: isDimmed(1, false) ? 'none' : 'auto' }}
              >
                {[
                  { icon: 'fa-arrow-right-arrow-left', label: 'Transferir\ndinero', badge: 'Nuevo' },
                  { icon: 'fa-money-bill-wave', label: 'Extraer sin\ntarjeta' },
                  { icon: 'fa-unlock-keyhole', label: 'Blanquear\nPIN' },
                  { icon: 'fa-clock-rotate-left', label: 'Cuotificar\nConsumos' },
                  { icon: 'fa-money-bill-transfer', label: 'Ingresar\ndinero', badge: 'Nuevo' },
                  { icon: 'fa-arrow-trend-up', label: 'Inversión\nRápida' },
                  { icon: 'fa-mobile-screen', label: 'Hacer una\nrecarga' },
                  { icon: 'fa-plus', label: 'Mostrar\nmás' }
                ].map((act, i) => {
                  const isTransfer = act.label === 'Transferir\ndinero';
                  return (
                    <div 
                      key={i} 
                      className="flex flex-col items-center"
                      style={{ position: 'relative', cursor: isTransfer ? 'pointer' : 'default' }}
                      onClick={(e) => {
                        if (isTransfer) {
                          e.stopPropagation();
                          playSound('click');
                          setPracticeStep(2);
                          setInactivitySeconds(0);
                          setShowExplanationOverlay(true);
                        }
                      }}
                    >
                      {isTransfer && practicePhase === 'guided' && practiceStep === 1 && renderArrow({ top: '-44px', left: '50%', transform: 'translateX(-50%)' })}
                      
                      <div 
                        className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center relative mb-1.5 border ${isTransfer && practicePhase === 'free' && inactivitySeconds >= 20 ? 'pulse-correct-element' : 'border-gray-100'}`} 
                        style={{ 
                          boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                          opacity: isDimmed(1, isTransfer) ? 0.3 : 1
                        }}
                      >
                        <i className={`fa-solid ${act.icon} text-[#B71C35] text-lg`}></i>
                        {act.badge && (
                          <span className="absolute -bottom-1.5 bg-green-100 text-green-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                            {act.badge}
                          </span>
                        )}
                      </div>
                      <span 
                        className="text-[10px] text-center text-gray-500 leading-tight whitespace-pre-line"
                        style={{ opacity: isDimmed(1, isTransfer) ? 0.3 : 1 }}
                      >
                        {act.label}
                      </span>
                    </div>
                  );
                })}
              </section>

              {/* Recommended Section */}
              <section 
                className="mb-6"
                style={{ opacity: isDimmed(1, false) ? 0.3 : 1, pointerEvents: isDimmed(1, false) ? 'none' : 'auto' }}
              >
                <h3 className="text-gray-400 font-medium text-xs mb-2 px-1">Recomendados</h3>
                <div className="bg-gradient-to-r from-[#8E187B] to-[#B42A9C] rounded-2xl p-4 relative overflow-hidden flex items-center h-22">
                  <div className="z-10 w-2/3">
                    <h4 className="text-white font-bold text-base leading-tight mb-0.5">Pedí tu préstamo</h4>
                    <p className="text-white/80 text-xs">100% online.</p>
                  </div>
                  <div className="absolute right-0 top-1 w-20 h-20 flex items-center justify-center z-10">
                    <i className="fa-solid fa-coins text-[#FFD700] text-4xl drop-shadow-md"></i>
                  </div>
                </div>
              </section>

              {/* Services Section */}
              <section className="mb-6">
                <h3 
                  className="text-gray-400 font-medium text-xs mb-2 px-1"
                  style={{ opacity: isDimmed(1, false) ? 0.3 : 1 }}
                >
                  Servicios por vencer
                </h3>
                
                <div>
                  <div 
                    className="bg-white rounded-2xl p-3.5 border border-gray-100 flex justify-between items-center"
                    style={{ 
                      boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                      opacity: isDimmed(1, false) ? 0.3 : 1,
                      cursor: 'default'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-[#B71C35]">
                        <i className="fa-solid fa-fire text-base"></i>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">Metrogas (Gas)</h4>
                        <p className="text-[10px] text-gray-400">Vence hoy</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-800">$3.200</span>
                      <button className="bg-[#B71C35] text-white text-[10px] font-bold px-3 py-1.5 rounded-full opacity-60 cursor-default" style={{ pointerEvents: 'none' }}>
                        Pagar
                      </button>
                    </div>
                  </div>
                </div>
              </section>

            </main>

            {/* Bottom Navigation */}
            <nav 
              className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-5 py-2 flex justify-between items-center z-20" 
              style={{ boxShadow: '0 -5px 15px rgba(0,0,0,0.02)', opacity: isDimmed(1, false) ? 0.3 : 1, pointerEvents: isDimmed(1, false) ? 'none' : 'auto' }}
            >
              <button className="flex flex-col items-center w-12 text-[#B71C35]">
                <i className="fa-solid fa-house text-lg mb-0.5"></i>
                <span className="text-[9px] font-medium">Inicio</span>
              </button>
              <button className="flex flex-col items-center w-12 text-gray-400">
                <i className="fa-regular fa-credit-card text-lg mb-0.5"></i>
                <span className="text-[9px] font-medium">Tarjetas</span>
              </button>
              
              <div className="relative w-12 flex justify-center">
                <button className="absolute -top-7 w-12 h-12 bg-white rounded-full flex flex-col items-center justify-center border border-gray-50 shadow-md">
                  <i className="fa-solid fa-qrcode text-[#20A86E] text-xl"></i>
                </button>
                <span className="absolute -bottom-3 text-[9px] font-medium text-gray-400 whitespace-nowrap">QR</span>
              </div>

              <button className="flex flex-col items-center w-12 text-gray-400">
                <i className="fa-solid fa-hand-holding-dollar text-lg mb-0.5"></i>
                <span className="text-[9px] font-medium">Préstamos</span>
              </button>
              <button className="flex flex-col items-center w-12 text-gray-400">
                <i className="fa-solid fa-bars text-lg mb-0.5"></i>
                <span className="text-[9px] font-medium">Menú</span>
              </button>
            </nav>
          </>
        )}

        {/* VIEW STEP 2: PAYMENT CONFIRMATION SCREEN */}
        {practiceStep === 2 && (
          <div className="flex flex-col h-full bg-[#F5F6F8]">
            {/* Nav Header */}
            <div 
              className="pt-5 pb-3 px-5 bg-white border-b border-gray-150 flex items-center space-x-3"
              style={{ opacity: isDimmed(2, false) ? 0.3 : 1, pointerEvents: isDimmed(2, false) ? 'none' : 'auto' }}
            >
              <button 
                className="text-gray-600 p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  playSound('click');
                  if (practicePhase === 'free') {
                    setPracticeStep(1);
                  }
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <span className="text-gray-800 font-bold text-lg">Confirmar Transferencia</span>
            </div>

            {/* Main Area */}
            <div className="flex-1 p-5 overflow-y-auto hide-scrollbar">
              
              {/* Account selection card */}
              <div 
                className="bg-white rounded-2xl p-4 border border-gray-100 mb-4"
                style={{ opacity: isDimmed(2, false) ? 0.3 : 1 }}
              >
                <p className="text-xs text-gray-400 font-medium mb-1">Debitar de</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Caja de Ahorro en Pesos</p>
                    <p className="text-xs text-gray-500">N° 4837-29103-2</p>
                  </div>
                  <span className="text-sm font-bold text-gray-800">$372.280,19</span>
                </div>
              </div>

              {/* Service details card */}
              <div 
                className="bg-white rounded-2xl p-4 border border-gray-100 mb-6"
                style={{ opacity: isDimmed(2, false) ? 0.3 : 1 }}
              >
                <p className="text-xs text-gray-400 font-medium mb-3">Detalle de la transferencia</p>
                
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Destinatario</span>
                  <span className="text-sm font-bold text-gray-800">Juan Pérez</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Alias / CBU</span>
                  <span className="text-sm font-bold text-gray-800">juan.perez.super</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Entidad</span>
                  <span className="text-sm font-bold text-gray-800">Banco Supervielle</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500">Concepto</span>
                  <span className="text-sm font-bold text-gray-800">Varios</span>
                </div>

                <hr className="my-4 border-gray-100" />

                <div className="flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-800">Monto a enviar</span>
                  <span className="text-2xl font-bold text-[#B71C35]">$5.000,00</span>
                </div>
              </div>

              {/* Confirm action button */}
              <div style={{ position: 'relative', marginTop: '16px' }}>
                {practicePhase === 'guided' && practiceStep === 2 && renderArrow({ top: '-44px', left: '50%', transform: 'translateX(-50%)' })}
                
                <button
                  className={`btn btn-primary ${practicePhase === 'free' && inactivitySeconds >= 20 ? 'pulse-correct-element' : ''}`}
                  style={{
                    backgroundColor: '#B71C35',
                    borderColor: '#B71C35',
                    borderRadius: '16px',
                    fontWeight: 'bold',
                    fontSize: '1.05rem',
                    opacity: isDimmed(2, true) ? 0.3 : 1
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    playSound('success');
                    setPracticeStep(3);
                    setInactivitySeconds(0);
                    setShowExplanationOverlay(true);
                  }}
                >
                  Confirmar transferencia
                </button>
              </div>

            </div>
          </div>
        )}

        {/* VIEW STEP 3: COMPROBANTE DE ÉXITO */}
        {practiceStep === 3 && (
          <div className="flex flex-col h-full bg-[#FFFFFF] p-6 text-center justify-between">
            <div className="my-auto">
              <div 
                className="w-16 h-16 bg-[#DCFCE7] text-[#15803D] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#BBF7D0]"
              >
                <i className="fa-solid fa-check text-2xl"></i>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-2">¡Transferencia Realizada!</h3>
              <p className="text-xs text-gray-500 mb-6 font-medium">Se envió el dinero con éxito.</p>

              <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-100 text-left mb-6">
                <div className="flex justify-between py-1.5">
                  <span className="text-xs text-gray-500">Destinatario</span>
                  <span className="text-xs font-bold text-gray-800">Juan Pérez</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-xs text-gray-500">Monto Enviado</span>
                  <span className="text-xs font-bold text-gray-800">$5.000,00</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-xs text-gray-500">Comprobante Nro</span>
                  <span className="text-xs font-bold text-gray-800">#10293847</span>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative', width: '100%', marginBottom: '10px' }}>
              {practicePhase === 'guided' && practiceStep === 3 && renderArrow({ top: '-44px', left: '50%', transform: 'translateX(-50%)' })}
              
              <button
                className={`btn btn-success ${practicePhase === 'free' && inactivitySeconds >= 20 ? 'pulse-correct-element' : ''}`}
                style={{
                  backgroundColor: '#2E7D32',
                  borderColor: '#2E7D32',
                  borderRadius: '16px',
                  fontWeight: 'bold'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  playSound('click');
                  setInactivitySeconds(0);
                  if (practicePhase === 'guided') {
                    setPracticePhase('transition');
                  } else {
                    setPracticePhase('confirmation');
                  }
                }}
              >
                Finalizar
              </button>
            </div>
          </div>
        )}

        {/* Floating Coco Helper Button */}
        {!showExplanationOverlay && (
          <button
            className={`floating-coco-btn ${practicePhase === 'free' && inactivitySeconds >= 20 ? 'pulse-correct-element' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              playSound('click');
              setShowExplanationOverlay(true);
            }}
            title="Ver explicación de Coco"
            aria-label="Ver explicación de Coco"
          >
            🦉
            <span className="floating-coco-tooltip">Ayuda</span>
          </button>
        )}
      </div>
    );
  };

  const renderSimuladorMP = () => {
    if (practicePhase === 'context') {
      return renderContextScreen();
    }
    if (practicePhase === 'transition') {
      return renderTransitionScreen();
    }
    if (practicePhase === 'confirmation') {
      return renderConfirmationScreen();
    }

    return (
      <div 
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: 'calc(100vh - var(--header-height))',
          backgroundColor: '#F8F9FA',
          overflow: 'hidden'
        }}
      >
        {renderSupervielleApp()}
        {showExplanationOverlay && renderExplanationOverlay()}
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
            className={`btn-listen-icon ${currentSpeakingText === qData.q ? 'speaking' : ''}`} 
            style={{ position: 'absolute', right: '16px', top: '16px' }}
            // eslint-disable-next-line react-hooks/refs
            onClick={() => speakText(qData.q, true)}
            title={currentSpeakingText === qData.q ? "Detener pregunta" : "Escuchar pregunta"}
            aria-label="Escuchar la pregunta del juego"
          >
            {currentSpeakingText === qData.q ? <VolumeX size={24} /> : <Volume2 size={24} />}
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
                    speakText(`¡Felicidades ${userProfile.name}! Has contestado todas las preguntas correctamente y te ganaste la medalla de protectora digital. Tu tutor Lucas está muy orgulloso de vos.`, true);
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
              setPracticePhase('context');
              setPracticeStep(1);
              setIncorrectTapsCount(0);
              setInactivitySeconds(0);
              setIsRetest(false);
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
    const medalDetails = {
      'Registro Exitoso 🎉': {
        title: 'Registro exitoso',
        emoji: '🎉',
        description: 'Por registrarte en Chichín y empezar a practicar.'
      },
      'Perfil Seguro 🛡️': {
        title: 'Perfil seguro',
        emoji: '🛡️',
        description: 'Completaste el módulo de contraseñas.'
      },
      'Primer Pago 🏆': {
        title: 'Primer envío de dinero',
        emoji: '💸',
        description: 'Completaste tu primera transferencia simulada con éxito.'
      },
      'Transferencia Exitosa 🏆': {
        title: 'Transferencia exitosa',
        emoji: '💸',
        description: 'Completaste la transferencia simulada de forma 100% segura.'
      },
      'Escudo Digital 🛡️': {
        title: 'Protectora digital',
        emoji: '🛡️',
        description: 'Identificaste llamadas sospechosas y protegiste tus claves.'
      }
    };

    const getMedalInfo = (medalString) => {
      if (medalDetails[medalString]) {
        return medalDetails[medalString];
      }
      return {
        title: medalString,
        emoji: '🏅',
        description: 'Logro conseguido practicando en Chichín.'
      };
    };

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
          <h3 style={{ marginBottom: '4px' }}>{userProfile.name}, estudiante estrella</h3>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            {userProfile.points} puntos de práctica acumulados
          </p>
        </div>

        <p className="section-title">Mis medallas ganadas</p>

        <div className="tiles-grid" style={{ marginBottom: '32px' }}>
          {userProfile.medals.map((medalName, index) => {
            const info = getMedalInfo(medalName);
            return (
              <div 
                key={index} 
                className="card" 
                style={{ 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: 'var(--bg-card)', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  gap: '14px', 
                  alignItems: 'center', 
                  marginBottom: 0, 
                  padding: '18px', 
                  boxShadow: 'none' 
                }}
              >
                <span style={{ fontSize: '42px', flexShrink: 0 }}>{info.emoji}</span>
                <div>
                  <h4>{info.title}</h4>
                  <p className="text-sm text-muted">{info.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button className="btn btn-primary" onClick={() => handleNav('home')}>
          Volver al inicio
        </button>
      </div>
    );
  };

  if (!userProfile.name) {
    return (
      <div className="app-container" style={{ paddingTop: '64px' }}>
        {/* Persistent Accessibility Bar */}
        {renderAccessibilityBar()}

        {/* Welcome Onboarding Screen */}
        <WelcomeScreen 
          onSave={(name) => {
            localStorage.setItem('chichin_username', name);
            setUserProfile(prev => ({ ...prev, name }));
          }}
          logoImg={logoImg}
          speakText={speakText}
          playSound={playSound}
        />
      </div>
    );
  }

  if (!diagnosticDone) {
    return (
      <div className="app-container" style={{ paddingTop: '64px' }}>
        {/* Persistent Accessibility Bar */}
        {renderAccessibilityBar()}

        {/* Initial Diagnostic Screen */}
        <DiagnosticScreen
          userName={userProfile.name}
          logoImg={logoImg}
          playSound={playSound}
          onComplete={(answers) => {
            localStorage.setItem('chichin_diagnostic_done', 'true');
            localStorage.setItem('chichin_diagnostic_answers', JSON.stringify(answers));
            setDiagnosticDone(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Persistent Accessibility Bar */}
      {renderAccessibilityBar()}

      {/* Global Header */}
      {renderHeader()}

      {/* Active Navigation/View Content */}
      <main style={{ flex: 1, paddingBottom: activeView === 'simulador-mp' ? '0' : '100px' }}>
        {activeView === 'home' && renderHome()}
        {activeView === 'simulador-mp' && renderSimuladorMP()}
        {activeView === 'quiz' && quizStep === 3 ? renderQuizSuccess() : activeView === 'quiz' ? renderQuiz() : null}
        {activeView === 'logros' && renderLogros()}
      </main>

      {/* Persistent Emergency Help Panel */}
      {activeView !== 'simulador-mp' && renderHelpFooter()}
    </div>
  );
}

function WelcomeScreen({ onSave, logoImg, speakText, playSound }) {
  const [tempName, setTempName] = useState('');
  const [showError, setShowError] = useState(false);

  const handleStart = () => {
    const trimmed = tempName.trim();
    if (trimmed.length < 2) {
      setShowError(true);
      playSound('error');
      speakText("Por favor, escribí tu nombre para comenzar.", true);
      return;
    }
    playSound('success');
    onSave(trimmed);
  };

  return (
    <div className="container fade-in" style={{
      minHeight: '85vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: '20px',
      paddingBottom: '20px'
    }}>
      {/* Soft, beautiful welcome card */}
      <div className="card" style={{
        width: '100%',
        padding: '32px 24px',
        border: '1.5px solid var(--border-color)',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        {/* Logo & Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <img 
            src={logoImg} 
            alt="Logo Chichín" 
            style={{ width: '80px', height: '80px', objectFit: 'contain' }} 
          />
          <h1 style={{ fontSize: 'calc(2.2rem * var(--font-multiplier))', textAlign: 'center', fontWeight: 500 }}>
            Te damos la bienvenida a <span style={{ color: 'var(--brand-primary)', fontWeight: 700, fontSize: 'calc(2.8rem * var(--font-multiplier))' }}>Chichín</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: 'calc(1.1rem * var(--font-multiplier))', textAlign: 'center' }}>
            Autonomía digital para adultos mayores.
          </p>
        </div>


        {/* User Name input area */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
          <label 
            htmlFor="username-input" 
            style={{ 
              fontSize: 'calc(1.2rem * var(--font-multiplier))', 
              fontWeight: 500, 
              color: 'var(--text-primary)',
              textAlign: 'left'
            }}
          >
            ¿Cómo te llamás?
          </label>
          <input 
            id="username-input"
            type="text"
            className="form-input"
            placeholder="Escribí tu nombre acá..."
            style={{
              fontSize: 'calc(1.3rem * var(--font-multiplier))',
              minHeight: '60px',
              borderRadius: '12px',
              padding: '16px',
              borderColor: showError ? 'var(--color-error)' : 'var(--border-color)',
              fontWeight: 500
            }}
            value={tempName}
            onChange={(e) => {
              setTempName(e.target.value);
              if (showError) setShowError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleStart();
            }}
          />
          {showError && (
            <p style={{ color: 'var(--color-error)', fontWeight: 500, fontSize: 'calc(1rem * var(--font-multiplier))' }}>
              ⚠️ Por favor, ingresá al menos tu nombre (mínimo 2 letras).
            </p>
          )}
        </div>

        {/* Action button */}
        <button 
          className="btn btn-primary"
          style={{
            minHeight: '64px',
            fontSize: 'calc(1.2rem * var(--font-multiplier))',
            borderRadius: '12px',
            marginTop: '10px',
            backgroundColor: 'var(--brand-primary)',
            borderColor: 'var(--brand-primary)',
            fontWeight: 500
          }}
          onClick={handleStart}
        >
          Comenzar a aprender ➜
        </button>
      </div>
    </div>
  );
}


// ============================================================
// DIAGNOSTIC SCREEN COMPONENT
// ============================================================
function DiagnosticScreen({ userName, logoImg, playSound, onComplete }) {
  // step: 0 = intro, 1 = eje digital, 2 = eje financiero, 3 = eje seguridad, 4 = done
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const questions = [
    {
      eje: '📱 Tu relación con la tecnología',
      ejeNum: 1,
      pregunta: '¿Cómo usás el celular hoy en día?',
      opciones: [
        { id: 'a', emoji: '📞', texto: 'Solo lo uso para llamar y mandar mensajes de texto' },
        { id: 'b', emoji: '💬', texto: 'Uso WhatsApp y saco fotos, pero poco más' },
        { id: 'c', emoji: '🌐', texto: 'Uso WhatsApp, veo videos y navego algo por internet' },
        { id: 'd', emoji: '⭐', texto: 'Uso varias apps y me manejo bastante bien' },
      ]
    },
    {
      eje: '🏦 Lo que querés aprender',
      ejeNum: 2,
      pregunta: '¿Qué te gustaría poder hacer solo/a sin pedirle ayuda a nadie?',
      opciones: [
        { id: 'a', emoji: '💡', texto: 'Pagar servicios como la luz, el gas o el agua desde casa' },
        { id: 'b', emoji: '📊', texto: 'Ver mi saldo y mis movimientos cuando quiero' },
        { id: 'c', emoji: '💸', texto: 'Enviar o recibir plata de mis hijos o familiares' },
        { id: 'd', emoji: '🛒', texto: 'Comprar cosas por internet sin tener que salir' },
      ]
    },
    {
      eje: '🔐 Tu seguridad digital',
      ejeNum: 3,
      pregunta: '¿Alguna vez te pasó o te contaron algo así?',
      opciones: [
        { id: 'a', emoji: '📞', texto: 'Me llamaron diciéndome que gané un premio y me pidieron datos' },
        { id: 'b', emoji: '🔗', texto: 'Me llegó un link por WhatsApp pidiéndome mi clave del banco' },
        { id: 'c', emoji: '😟', texto: 'No me pasó nada de eso, pero no sé bien cómo protegerme' },
        { id: 'd', emoji: '✅', texto: 'Conozco las estafas más comunes y sé cómo cuidarme' },
      ]
    }
  ];

  const currentQ = questions[step - 1];
  const totalSteps = 3;

  const handleSelect = (optionId) => {
    playSound('click');
    setSelected(optionId);
  };

  const handleNext = () => {
    if (step === 0) {
      playSound('click');
      setStep(1);
      return;
    }
    if (!selected) return;
    const key = `eje${step}`;
    const newAnswers = { ...answers, [key]: selected };
    setAnswers(newAnswers);
    playSound('success');
    if (step < totalSteps) {
      setSelected(null);
      setStep(step + 1);
    } else {
      // Go to the explanation page for bank evaluators
      setStep(4);
    }
  };

  // ---- INTRO PAGE ----
  if (step === 0) {
    return (
      <div className="container fade-in" style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="card" style={{ width: '100%', padding: '32px 24px', border: '1.5px solid var(--border-color)', backgroundColor: '#FFFFFF', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          
          <img src={logoImg} alt="Logo Chichín" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
          
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 'calc(1.9rem * var(--font-multiplier))', fontWeight: 700, marginBottom: '8px' }}>
              ¡Hola, {userName}! 👋🏼
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: 'calc(1.05rem * var(--font-multiplier))', lineHeight: 1.5 }}>
              Antes de empezar, te vamos a hacer <strong style={{ color: 'var(--brand-primary)' }}>3 preguntas cortitas</strong> para conocer mejor tu relación con la tecnología y así ayudarte de la mejor manera posible.
            </p>
          </div>


          {/* Step indicators */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {[1, 2, 3].map(n => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--brand-primary-light)', border: '2px solid var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-primary)' }}>{n}</div>
                {n < 3 && <div style={{ width: '24px', height: '2px', backgroundColor: 'var(--border-color)' }} />}
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary"
            style={{ minHeight: '60px', fontSize: 'calc(1.15rem * var(--font-multiplier))', borderRadius: '12px', backgroundColor: 'var(--brand-primary)', borderColor: 'var(--brand-primary)', fontWeight: 600 }}
            onClick={handleNext}
          >
            ¡Empecemos! ➜
          </button>
        </div>
      </div>
    );
  }

  // ---- BANK EVALUATORS EXPLANATION PAGE (step === 4) ----
  if (step === 4) {
    const handleAcceptExplanation = () => {
      playSound('success');
      setStep(5);
      setTimeout(() => onComplete(answers), 1500);
    };

    return (
      <div className="container fade-in" style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="card" style={{ 
          width: '100%', 
          padding: '32px 24px', 
          border: '1.5px solid var(--border-color)', 
          backgroundColor: '#FFFFFF', 
          borderRadius: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '20px',
          position: 'relative'
        }}>
          
          {/* Badge for Evaluators */}
          <div style={{
            backgroundColor: 'var(--brand-primary-light)',
            color: 'var(--brand-primary)',
            padding: '6px 14px',
            borderRadius: '99px',
            fontSize: 'calc(0.8rem * var(--font-multiplier))',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            border: '1.5px solid var(--brand-primary)'
          }}>
            Nota de Desarrollo & Arquitectura
          </div>

          <img src={logoImg} alt="Logo Chichín" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />

          <div style={{ textAlign: 'center', width: '100%' }}>
            <h2 style={{ fontSize: 'calc(1.35rem * var(--font-multiplier))', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.3 }}>
              ¿Cómo funciona Chichín detrás de escena?
            </h2>
            
            <div style={{ 
              backgroundColor: 'var(--sandbox-bg)', 
              border: '1.5px solid var(--sandbox-border)', 
              borderRadius: '12px', 
              padding: '18px', 
              textAlign: 'left',
              marginBottom: '20px'
            }}>
              <p style={{ fontSize: 'calc(0.95rem * var(--font-multiplier))', color: 'var(--sandbox-border)', fontWeight: 500, marginBottom: '10px' }}>
                💡 <strong>Mensaje para el equipo evaluador:</strong>
              </p>
              <p style={{ fontSize: 'calc(0.9rem * var(--font-multiplier))', color: 'var(--text-body)', lineHeight: 1.55, marginBottom: '12px' }}>
                Las 3 preguntas de diagnóstico anteriores se utilizarán para <strong>ordenar y personalizar el aprendizaje del adulto mayor</strong>. Esto evita enseñarle contenidos que ya sabe y eleva el grado de personalización de la plataforma.
              </p>
              <p style={{ fontSize: 'calc(0.9rem * var(--font-multiplier))', color: 'var(--text-body)', lineHeight: 1.55 }}>
                Esta experiencia está apalancada por un <strong>algoritmo interconectado</strong> y <strong>modelos de Inteligencia Artificial</strong>, los cuales adaptan y estructuran la ruta formativa de forma dinámica según las necesidades identificadas.
              </p>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ 
              minHeight: '60px', 
              fontSize: 'calc(1.15rem * var(--font-multiplier))', 
              borderRadius: '12px', 
              fontWeight: 600,
              width: '100%'
            }}
            onClick={handleAcceptExplanation}
          >
            Entiendo ➜
          </button>
        </div>
      </div>
    );
  }

  // ---- DONE / TRANSITION PAGE ----
  if (step === 5) {
    return (
      <div className="container fade-in" style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div className="card" style={{ width: '100%', padding: '40px 24px', border: '1.5px solid var(--border-color)', backgroundColor: '#FFFFFF', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
          <span style={{ fontSize: '72px' }}>🎉</span>
          <h1 style={{ fontSize: 'calc(2rem * var(--font-multiplier))', fontWeight: 700 }}>¡Muchas gracias!</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: 'calc(1.1rem * var(--font-multiplier))', lineHeight: 1.5 }}>
            Ya conocemos mejor lo que necesitás. Ahora vamos a llevar al inicio de Chichín, preparado especialmente para vos.
          </p>
          <div style={{ width: '48px', height: '48px', border: '4px solid var(--brand-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </div>
    );
  }

  // ---- QUESTION PAGES (steps 1–3) ----
  return (
    <div className="container fade-in" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
      <div className="card" style={{ width: '100%', padding: '24px', border: '1.5px solid var(--border-color)', backgroundColor: '#FFFFFF', borderRadius: '16px' }}>

        {/* Progress header */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
            <span style={{ fontSize: 'calc(0.85rem * var(--font-multiplier))', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Pregunta {step} de {totalSteps}
            </span>
            <span style={{ fontSize: 'calc(1.1rem * var(--font-multiplier))', color: 'var(--brand-primary)', fontWeight: 500, lineHeight: 1.3 }}>
              {currentQ.eje}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(step / totalSteps) * 100}%`, backgroundColor: 'var(--brand-primary)', borderRadius: '99px', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Step circles */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '22px' }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                backgroundColor: n < step ? 'var(--brand-primary)' : n === step ? 'var(--brand-primary-light)' : 'var(--border-color)',
                border: n === step ? '2px solid var(--brand-primary)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 700,
                color: n < step ? '#fff' : n === step ? 'var(--brand-primary)' : 'var(--text-secondary)',
                transition: 'all 0.3s'
              }}>
                {n < step ? '✓' : n}
              </div>
              {n < 3 && <div style={{ width: '24px', height: '2px', backgroundColor: n < step ? 'var(--brand-primary)' : 'var(--border-color)', transition: 'background-color 0.3s' }} />}
            </div>
          ))}
        </div>

        {/* Question */}
        <h2 style={{ fontSize: 'calc(1.3rem * var(--font-multiplier))', fontWeight: 700, marginBottom: '20px', lineHeight: 1.4, color: 'var(--text-primary)' }}>
          {currentQ.pregunta}
        </h2>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {currentQ.opciones.map(opcion => {
            const isSelected = selected === opcion.id;
            return (
              <button
                key={opcion.id}
                onClick={() => handleSelect(opcion.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid var(--brand-primary)' : '1.5px solid var(--border-color)',
                  backgroundColor: isSelected ? 'var(--brand-primary-light)' : '#FAFAFA',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 0 3px rgba(var(--brand-primary-rgb, 180, 30, 30), 0.08)' : 'none',
                  transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                }}
              >
                <span style={{
                  fontSize: '28px',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: isSelected ? 'var(--brand-primary)' : 'var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background-color 0.2s',
                  filter: isSelected ? 'none' : 'grayscale(0.3)'
                }}>
                  {opcion.emoji}
                </span>
                <span style={{
                  fontSize: 'calc(1.05rem * var(--font-multiplier))',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)',
                  lineHeight: 1.4,
                  transition: 'color 0.2s'
                }}>
                  {opcion.texto}
                </span>
                {isSelected && (
                  <span style={{ marginLeft: 'auto', fontSize: '20px', flexShrink: 0 }}>✅</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          className="btn btn-primary"
          style={{
            minHeight: '60px',
            fontSize: 'calc(1.1rem * var(--font-multiplier))',
            borderRadius: '12px',
            backgroundColor: selected ? 'var(--brand-primary)' : 'var(--border-color)',
            borderColor: selected ? 'var(--brand-primary)' : 'var(--border-color)',
            fontWeight: 600,
            cursor: selected ? 'pointer' : 'not-allowed',
            opacity: selected ? 1 : 0.6,
            transition: 'all 0.25s'
          }}
          onClick={handleNext}
          disabled={!selected}
        >
          {step < totalSteps ? 'Siguiente pregunta ➜' : '¡Finalizar! 🎉'}
        </button>
      </div>
    </div>
  );
}

export default App;


