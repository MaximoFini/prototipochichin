import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, Minus, Accessibility, Volume2, VolumeX, ShieldAlert, 
  ArrowLeft, AlertTriangle, X, Play
} from 'lucide-react';
import './App.css';
import { Analytics } from '@vercel/analytics/react';
import logoImg from './assets/logosinfondochichin.png';
import { situaciones } from './data/situaciones';


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
  // 'home', 'reserva', 'simulador-mp', 'quiz', 'logros', 'escudo'
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
  const [isRetestTime, setIsRetestTime] = useState(false);
  const [recipientInput, setRecipientInput] = useState('maxifinirp');
  const [amountInput, setAmountInput] = useState('1');

  // --- Escudo Anti-estafas States ---
  const [escudoStep, setEscudoStep] = useState('intro'); // 'intro', 'situacion', 'feedback', 'racha'
  const [escudoStreak, setEscudoStreak] = useState(() => {
    const saved = localStorage.getItem('chichin_escudo_streak');
    return saved ? parseInt(saved) : 3; // Initial mock streak
  });
  const [escudoTotalSessions, setEscudoTotalSessions] = useState(() => {
    const saved = localStorage.getItem('chichin_escudo_total_sessions');
    return saved ? parseInt(saved) : 0;
  });
  const [escudoHistory, setEscudoHistory] = useState(() => {
    const saved = localStorage.getItem('chichin_escudo_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [escudoSessionSituations, setEscudoSessionSituations] = useState([]);
  const [escudoCurrentIndex, setEscudoCurrentIndex] = useState(0);
  const [escudoResultState, setEscudoResultState] = useState(null); // 'correct' or 'incorrect'
  const [escudoLastPracticedDate, setEscudoLastPracticedDate] = useState(() => {
    return localStorage.getItem('chichin_escudo_last_practiced_date') || '';
  });

  const getLocalDateString = () => {
    const d = new Date();
    // Offset for Argentina (UTC-3)
    const offset = -3;
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const arDate = new Date(utc + (3600000 * offset));
    const yyyy = arDate.getFullYear();
    const mm = String(arDate.getMonth() + 1).padStart(2, '0');
    const dd = String(arDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getEscudoLevel = (sessions) => {
    if (sessions >= 6) return "Escudo Experto 🏆";
    if (sessions >= 3) return "Escudo Activo 🛡️";
    return "Escudo Básico 🔰";
  };

  const initializeEscudoSession = useCallback(() => {
    // Pick 1 situation at random that hasn't been done yet
    let available = situaciones.filter(s => !escudoHistory.includes(s.id));
    if (available.length === 0) {
      // If all are completed, reset history
      available = situaciones;
      setEscudoHistory([]);
      localStorage.setItem('chichin_escudo_history', JSON.stringify([]));
    }
    const randomIndex = Math.floor(Math.random() * available.length);
    const chosen = available[randomIndex];
    setEscudoSessionSituations([chosen]);
    setEscudoCurrentIndex(0);
    setEscudoResultState(null);
    setEscudoStep('intro');
  }, [escudoHistory]);

  const loadSecondSituation = useCallback(() => {
    let available = situaciones.filter(s => !escudoHistory.includes(s.id) && !escudoSessionSituations.map(x => x.id).includes(s.id));
    if (available.length === 0) {
      available = situaciones.filter(s => !escudoSessionSituations.map(x => x.id).includes(s.id));
    }
    const randomIndex = Math.floor(Math.random() * available.length);
    const chosen = available[randomIndex];
    
    setEscudoSessionSituations(prev => [...prev, chosen]);
    setEscudoCurrentIndex(1);
    setEscudoResultState(null);
    setEscudoStep('situacion');
  }, [escudoHistory, escudoSessionSituations]);

  const completeEscudoSession = useCallback(() => {
    // 1. Calculate new streak
    const todayStr = getLocalDateString();
    let newStreak = escudoStreak;
    
    if (escudoLastPracticedDate === todayStr) {
      // Already practiced today, keep streak
    } else {
      // Find out if they practiced yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      
      if (escudoLastPracticedDate === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1; // reset
      }
    }
    
    // 2. Increment total completed sessions
    const newSessionsCount = escudoTotalSessions + 1;
    
    // 3. Save states
    setEscudoStreak(newStreak);
    setEscudoTotalSessions(newSessionsCount);
    setEscudoLastPracticedDate(todayStr);
    
    localStorage.setItem('chichin_escudo_streak', newStreak.toString());
    localStorage.setItem('chichin_escudo_total_sessions', newSessionsCount.toString());
    localStorage.setItem('chichin_escudo_last_practiced_date', todayStr);
    
    // Sync with userProfile streak
    setUserProfile(prev => {
      const updated = { ...prev, streak: newStreak };
      localStorage.setItem('chichin_user_profile_streak', newStreak.toString());
      return updated;
    });
    
    // Play celebratory sound
    playSound('medal');
    
    // 4. Navigate to racha
    setEscudoStep('racha');
  }, [escudoStreak, escudoLastPracticedDate, escudoTotalSessions]);

  const getAssistantText = useCallback(() => {
    if (practicePhase === 'guided') {
      switch (practiceStep) {
        case 1: return `¡Hola ${userProfile.name}! Vas a practicar cómo transferir dinero. Buscá el botón «Transferir» en tu cuenta y tocalo.`;
        case 2: return `¡Muy bien! Ahora elegí la opción «A un CBU, CVU o Alias» para buscar a quién le vas a transferir.`;
        case 3: return `Perfecto. Ahora buscá el alias del destinatario. Tocá el botón de buscar para continuar.`;
        case 4: return `¡Genial! Aparecieron los datos del destinatario. Verificá que sea correcto y tocá «Continuar».`;
        case 5: return `Ahora ingresá el monto que querés transferir y tocá «Continuar».`;
        case 6: return `Este es el resumen de tu transferencia. Revisá que todo esté bien y tocá «Transferir dinero».`;
        case 7: return `¡Excelente! La transferencia fue exitosa. Esto es solo práctica, no se usó dinero real. Tocá «Finalizar».`;
        default: return '';
      }
    } else if (practicePhase === 'free') {
      if (inactivitySeconds >= 40) {
        switch (practiceStep) {
          case 1: return `Buscá el botón «Transferir» en la tarjeta de tu cuenta y tocalo.`;
          case 2: return `Tocá la opción «A un CBU, CVU o Alias».`;
          case 3: return `Tocá el botón de buscar para encontrar al destinatario.`;
          case 4: return `Tocá el botón «Continuar» en el panel de abajo.`;
          case 5: return `Tocá «Continuar» para avanzar.`;
          case 6: return `Tocá el botón «Transferir dinero» de abajo.`;
          case 7: return `Tocá «Finalizar» para terminar.`;
          default: return '';
        }
      }
      return `Objetivo: Transferí dinero a un contacto.`;
    }
    return '';
  }, [practicePhase, practiceStep, inactivitySeconds, userProfile.name]);

  // --- AI Quiz / Recap States ---
  const [quizStep, setQuizStep] = useState(0); // 0 = Intro, 1 = Pregunta 1, 2 = Pregunta 2, 3 = Éxito final
  const [quizAnswerSelected, setQuizAnswerSelected] = useState(null);
  const [quizResultState, setQuizResultState] = useState(null); // 'correct', 'incorrect', null

  const quizQuestions = [
    {
      q: 'Si te llaman por teléfono y te piden tu contraseña o clave, ¿qué tenés que hacer?',
      options: [
        { text: 'Decírsela para evitar que me cierren la cuenta.', isCorrect: false, feedback: '❌ ¡Cuidado! Nunca digas tus contraseñas por teléfono. Ningún banco te las va a pedir jamás.' },
        { text: 'No dársela a nadie y cortar la llamada de inmediato.', isCorrect: true, feedback: '✅ ¡Excelente! Cortar la llamada es la decisión más segura. ¡Las claves son secretas!' }
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
  }, [activeView, practiceStep, quizStep, escudoStep, escudoCurrentIndex]);

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

  // Voice narration for Escudo Anti-estafas steps
  useEffect(() => {
    if (!voiceEnabled || activeView !== 'escudo') return;

    if (escudoStep === 'intro') {
      const level = getEscudoLevel(escudoTotalSessions);
      speakText(`Práctica de hoy del Escudo Anti-estafas. Llevás una racha de ${escudoStreak} días seguidos practicando y tu nivel actual es ${level}. Tocá el botón grande de abajo que dice Empezar para comenzar.`);
    } else if (escudoStep === 'situacion') {
      const sit = escudoSessionSituations[escudoCurrentIndex];
      if (sit) {
        let textToSpeak;
        if (sit.categoria === 'llamada') {
          textToSpeak = `Llamada telefónica simulada de ${sit.contenido.emisor}. Dice: ${sit.contenido.texto}. ¿Qué hacés vos?`;
        } else if (sit.categoria === 'whatsapp') {
          const msgs = sit.contenido.mensajes.map(m => m.texto).join(". ");
          textToSpeak = `Mensaje de WhatsApp simulado de ${sit.contenido.remitente}. Dice: ${msgs}. ¿Qué hacés vos?`;
        } else {
          textToSpeak = `Mensaje de texto simulado de ${sit.contenido.remitente}. Dice: ${sit.contenido.texto}. ¿Qué hacés vos?`;
        }
        speakText(textToSpeak);
      }
    } else if (escudoStep === 'feedback') {
      const sit = escudoSessionSituations[escudoCurrentIndex];
      if (sit) {
        const resultText = escudoResultState === 'correct' 
          ? `¡Muy bien! ${sit.feedback_correcto}` 
          : `Esta vez te engañaron. ${sit.feedback_incorrecto}`;
        speakText(`${resultText}. La señal de alerta es: ${sit.red_flag_destacada}`);
      }
    } else if (escudoStep === 'racha') {
      const level = getEscudoLevel(escudoTotalSessions);
      speakText(`¡Felicitaciones! Completaste la práctica del día. Llevás una racha de ${escudoStreak} días seguidos. Tu nivel de escudo actual es ${level}. Tocá el botón Volver al inicio para terminar.`);
    }
  }, [activeView, escudoStep, escudoCurrentIndex, escudoSessionSituations, escudoResultState, voiceEnabled, speakText, escudoStreak, escudoTotalSessions]);

  // --- New Practice Simulator Timers and Voice Narrations ---
  const inactivityTimerRef = useRef(null);

  // Inactivity tracking (seconds) for Free Mode
  useEffect(() => {
    if (activeView === 'simulador-mp' && (practicePhase === 'guided' || practicePhase === 'free') && practiceStep >= 1 && practiceStep <= 7) {
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
    if (inactivitySeconds === 40 && (practicePhase === 'guided' || practicePhase === 'free')) {
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
    if (view === 'escudo') {
      initializeEscudoSession();
    }
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
        {/* Anti-Scam Widget (Interactive) */}
        <div 
          className="card card-interactive escudo-home-card" 
          style={{ 
            marginBottom: '40px', 
            border: '1.5px solid var(--brand-primary)',
            backgroundColor: 'var(--brand-primary-light)'
          }}
          onClick={() => handleNav('escudo')}
        >
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '12px' }}>
            <ShieldAlert size={36} style={{ color: 'var(--brand-primary)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '6px', fontSize: 'calc(1.15rem * var(--font-multiplier))' }}>
                Escudo anti-estafas Chichín
              </h3>
              <p className="text-sm" style={{ fontWeight: 500, lineHeight: 1.55, color: 'var(--text-body)' }}>
                Ninguna persona buena te va a pedir tu contraseña por teléfono. Si te pasa, decí: <strong>«No comparto mis claves»</strong> y cortá de inmediato.
              </p>
            </div>
            <button
              className={`btn-listen-icon ${currentSpeakingText === "Escudo anti-estafas Chichín. Ninguna persona buena te va a pedir tu contraseña por teléfono. Si te pasa, decí: «No comparto mis claves» y cortá de inmediato." ? 'speaking' : ''}`}
              onClick={(e) => { 
                e.stopPropagation(); 
                speakText("Escudo anti-estafas Chichín. Ninguna persona buena te va a pedir tu contraseña por teléfono. Si te pasa, decí: «No comparto mis claves» y cortá de inmediato.", true); 
              }}
              title={currentSpeakingText === "Escudo anti-estafas Chichín. Ninguna persona buena te va a pedir tu contraseña por teléfono. Si te pasa, decí: «No comparto mis claves» y cortá de inmediato." ? "Detener audio" : "Escuchar escudo anti-estafas"}
              aria-label="Escuchar escudo anti-estafas"
              style={{ flexShrink: 0, alignSelf: 'center' }}
            >
              {currentSpeakingText === "Escudo anti-estafas Chichín. Ninguna persona buena te va a pedir tu contraseña por teléfono. Si te pasa, decí: «No comparto mis claves» y cortá de inmediato." ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </div>
          <button 
            className="btn btn-primary"
            onClick={(e) => { e.stopPropagation(); handleNav('escudo'); }}
            style={{ width: '100%', minHeight: '48px', fontSize: '1.05rem', fontWeight: 'bold' }}
          >
            🛡️ Practicar hoy
          </button>
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
  const renderArrow = (style, showLabel = true) => {
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
        {showLabel && <span style={{
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
        </span>}
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
      1: "Paso 1 de 7: Inicio",
      2: "Paso 2 de 7: Opciones de transferencia",
      3: "Paso 3 de 7: Buscar destinatario",
      4: "Paso 4 de 7: Confirmar destinatario",
      5: "Paso 5 de 7: Ingresar monto",
      6: "Paso 6 de 7: Resumen",
      7: "Paso 7 de 7: Transferencia exitosa"
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
              setRecipientInput('maxifinirp');
              setAmountInput('1');
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
            ¡Muy bien hecho! Completaste las 7 pantallas de la transferencia con guía. Ahora llegó el momento del verdadero desafío: <strong>hacerlo vos solo/a en Modo Libre</strong>, sin flechas ni guías de Coco.
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
              setRecipientInput('');
              setAmountInput('');
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
                setRecipientInput('maxifinirp');
                setAmountInput('1');
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

    const shouldPulse = (stepNum) => {
      return practiceStep === stepNum && inactivitySeconds >= 20;
    };

    const arrowVisible = practicePhase === 'guided';
    const arrowShowLabel = inactivitySeconds >= 40;

    return (
      <div 
        className="phone-container flex flex-col relative sv-container"
        style={{
          width: '100%',
          maxWidth: '420px',
          height: 'calc(100vh - var(--header-height))',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          margin: '0 auto',
          overflow: 'hidden'
        }}
        onMouseDown={handleSimulatorInteraction}
        onTouchStart={handleSimulatorInteraction}
        onClick={handleIncorrectTap}
      >

        {/* ============ STEP 1: HOME ============ */}
        {practiceStep === 1 && (
          <div className="flex flex-col h-full bg-[#f7f7fb] overflow-hidden relative">
            <header className="sv-header" style={{ opacity: isDimmed(1, false) ? 0.3 : 1, pointerEvents: isDimmed(1, false) ? 'none' : 'auto' }}>
              <div className="sv-header-left">
                {/* Logo */}
                <svg className="sv-logo" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 22h20L12 2zm0 6l5 10H7l5-10z"></path>
                </svg>
                <span className="sv-greeting">Hola, {userProfile.name}</span>
              </div>
              <div className="sv-header-right">
                <button className="sv-chat-whatsapp">
                  Chat <i className="fab fa-whatsapp"></i>
                </button>
                <button className="sv-icon-btn">
                  <i className="far fa-eye text-gray-600"></i>
                </button>
              </div>
            </header>

            <main className="sv-main hide-scrollbar">
              {/* Balance Card */}
              <div className="sv-balance-card">
                <div className="sv-balance-card-header" style={{ opacity: isDimmed(1, false) ? 0.3 : 1 }}>
                  <span className="sv-account-label">CA • 5110-2</span>
                  <button className="sv-share-btn">
                    Alias/CBU <i className="fas fa-share-nodes"></i>
                  </button>
                </div>
                <div className="sv-balance-value-container" style={{ opacity: isDimmed(1, false) ? 0.3 : 1 }}>
                  <h2 className="sv-balance-value">$ 372.280</h2>
                  <div className="sv-percentage-badge">
                    <i className="fas fa-arrow-up"></i> 16%
                  </div>
                </div>
                <div className="sv-balance-actions">
                  {/* TRANSFERIR - TARGET */}
                  <div style={{ position: 'relative' }}>
                    {arrowVisible && practiceStep === 1 && renderArrow({ top: '-48px', left: '50%', transform: 'translateX(-50%)' }, arrowShowLabel)}
                    <button 
                      className={`sv-balance-btn active w-full ${shouldPulse(1) ? 'pulse-correct-element' : ''}`}
                      style={{ border: isDimmed(1, true) ? 'none' : '1px solid #eef0f3' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        playSound('click');
                        setPracticeStep(2);
                        setInactivitySeconds(0);
                        setShowExplanationOverlay(true);
                      }}
                    >
                      Transferir
                    </button>
                  </div>
                  <button className="sv-balance-btn"
                    style={{ opacity: isDimmed(1, false) ? 0.3 : 1, pointerEvents: isDimmed(1, false) ? 'none' : 'auto' }}>
                    Ingresar
                  </button>
                  <button className="sv-balance-btn"
                    style={{ opacity: isDimmed(1, false) ? 0.3 : 1, pointerEvents: isDimmed(1, false) ? 'none' : 'auto' }}>
                    Extraer
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <section className="sv-quick-actions-grid"
                style={{ opacity: isDimmed(1, false) ? 0.3 : 1, pointerEvents: isDimmed(1, false) ? 'none' : 'auto' }}>
                <div className="sv-action-item">
                  <button className="sv-action-btn">
                    <i className="fas fa-mobile-screen"></i>
                  </button>
                  <span className="sv-action-label">Hacer una<br/>recarga</span>
                </div>
                <div className="sv-action-item">
                  <button className="sv-action-btn">
                    <i className="fas fa-arrow-trend-up"></i>
                  </button>
                  <span className="sv-action-label">Inversión<br/>Rápida</span>
                </div>
                <div className="sv-action-item">
                  <button className="sv-action-btn bg-green">
                    <i className="fab fa-whatsapp"></i>
                  </button>
                  <span className="sv-action-label mt-1">Chat</span>
                </div>
                <div className="sv-action-item">
                  <button className="sv-action-btn bg-purple">
                    <span>iOL</span>
                  </button>
                  <span className="sv-action-label">Acciones y<br/>Bonos</span>
                </div>
                <div className="sv-action-item">
                  <button className="sv-action-btn">
                    <i className="fas fa-exchange-alt"></i>
                  </button>
                  <span className="sv-action-label">Transferir<br/>dinero</span>
                </div>
                <div className="sv-action-item">
                  <button className="sv-action-btn bg-yellow">
                    <i className="far fa-handshake"></i>
                  </button>
                  <span className="sv-action-label mt-1">Tienda</span>
                </div>
                <div className="sv-action-item">
                  <button className="sv-action-btn">
                    <i className="fas fa-plus"></i>
                  </button>
                  <span className="sv-action-label mt-1">Mostrar<br/>más</span>
                </div>
              </section>

              {/* Services */}
              <section style={{ opacity: isDimmed(1, false) ? 0.3 : 1 }}>
                <h3 className="sv-section-title">Servicios por vencer</h3>
                <div className="sv-service-card">
                  <div className="sv-service-icon-container">
                    <i className="fas fa-plus"></i>
                  </div>
                  <div>
                    <h4 className="sv-service-title">Hacé un nuevo pago</h4>
                    <p className="sv-service-subtitle">Y recibí avisos para los próximos vencimientos.</p>
                  </div>
                </div>
              </section>
            </main>

            {/* Bottom Nav */}
            <nav className="sv-bottom-nav" style={{ opacity: isDimmed(1, false) ? 0.3 : 1, pointerEvents: 'none' }}>
              <button className="sv-nav-item active">
                <div className="sv-nav-indicator"></div>
                <i className="fas fa-home"></i>
                <span>Inicio</span>
              </button>
              <button className="sv-nav-item">
                <i className="fas fa-wallet"></i>
                <span>Tarjetas</span>
              </button>
              <div className="sv-qr-nav-container">
                <button className="sv-qr-btn">
                  <i className="fas fa-qrcode"></i>
                </button>
                <span className="sv-qr-label">Pago con QR</span>
              </div>
              <button className="sv-nav-item">
                <i className="fas fa-hand-holding-dollar"></i>
                <span>Préstamos</span>
              </button>
              <button className="sv-nav-item">
                <i className="fas fa-th-large"></i>
                <span>Menú</span>
              </button>
            </nav>
          </div>
        )}

        {/* ============ STEP 2: OPTIONS ============ */}
        {practiceStep === 2 && (
          <div className="flex flex-col h-full bg-[#f8f9fc] overflow-hidden relative">
            <header className="sv-header" style={{ opacity: isDimmed(2, false) ? 0.3 : 1 }}>
              <button className="sv-back-btn">
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <h1 className="sv-title">Transferir dinero</h1>
              <button className="sv-back-btn">
                <i className="fa-regular fa-circle-question"></i>
              </button>
            </header>

            <main className="sv-main hide-scrollbar">
              <section className="sv-option-row">
                {/* Option 1: CBU/CVU/Alias - TARGET */}
                <div style={{ position: 'relative' }}>
                  {arrowVisible && practiceStep === 2 && renderArrow({ top: '-48px', left: '50%', transform: 'translateX(-50%)' }, arrowShowLabel)}
                  <button 
                    className={`sv-option-card w-full ${shouldPulse(2) ? 'pulse-correct-element' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      playSound('click');
                      setPracticeStep(3);
                      setInactivitySeconds(0);
                      setShowExplanationOverlay(true);
                    }}
                  >
                    <div className="sv-option-card-left">
                      <div className="sv-option-icon">
                        <i className="fa-solid fa-building-columns"></i>
                      </div>
                      <span className="sv-option-text">A un CBU, CVU o Alias</span>
                    </div>
                    <i className="fa-solid fa-chevron-right text-gray-400"></i>
                  </button>
                </div>

                {/* Option 2: MODO */}
                <button className="sv-option-card modo-card"
                  style={{ opacity: isDimmed(2, false) ? 0.3 : 1, pointerEvents: 'none' }}>
                  <div className="sv-modo-main">
                    <div className="sv-option-card-left">
                      <div className="sv-option-icon modo">M</div>
                      <span className="sv-option-text">A un celular con MODO</span>
                    </div>
                    <i className="fa-solid fa-chevron-right text-gray-400"></i>
                  </div>
                  <div className="sv-modo-badge">Nuevo</div>
                </button>
              </section>

              {/* Favorites contacts empty state */}
              <section style={{ opacity: isDimmed(2, false) ? 0.3 : 1 }}>
                <h2 className="text-[15px] font-medium text-gray-500 mb-4 px-1">Contactos favoritos</h2>
                <div className="sv-empty-state">
                  <div className="sv-empty-state-icon">
                    <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
                      <rect height="12" rx="2" ry="2" width="18" x="3" y="8"></rect>
                      <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"></path>
                      <path d="M12 12v.01"></path>
                      <path d="M12 2v2"></path>
                      <path d="M8 3l1 1"></path>
                      <path d="M16 3l-1 1"></path>
                    </svg>
                  </div>
                  <h3 className="sv-empty-state-title">Aún no tenés contactos favoritos</h3>
                  <p className="sv-empty-state-desc">
                    Desde CBU, CVU o Alias podés elegir a quien querés agregar a tu lista.
                  </p>
                  <button className="sv-outline-btn">
                    Ir a Agenda de contactos
                  </button>
                </div>
              </section>
            </main>

            {/* Bottom Nav */}
            <nav className="sv-bottom-nav" style={{ opacity: isDimmed(2, false) ? 0.3 : 1, pointerEvents: 'none' }}>
              <button className="sv-nav-item">
                <i className="fas fa-home"></i>
                <span>Inicio</span>
              </button>
              <button className="sv-nav-item">
                <i className="fas fa-wallet"></i>
                <span>Tarjetas</span>
              </button>
              <div className="sv-qr-nav-container">
                <button className="sv-qr-btn">
                  <i className="fas fa-qrcode"></i>
                </button>
                <span className="sv-qr-label">Pago con QR</span>
              </div>
              <button className="sv-nav-item">
                <i className="fas fa-hand-holding-dollar"></i>
                <span>Préstamos</span>
              </button>
              <button className="sv-nav-item">
                <i className="fas fa-th-large"></i>
                <span>Menú</span>
              </button>
            </nav>
          </div>
        )}

        {/* ============ STEP 3: SEARCH RECIPIENT ============ */}
        {practiceStep === 3 && (
          <div className="flex flex-col h-full bg-[#f8f9fb] overflow-hidden relative">
            <header className="sv-header" style={{ opacity: isDimmed(3, false) ? 0.3 : 1 }}>
              <button className="sv-back-btn">
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <h1 className="sv-title">¿A quién vas a transferir?</h1>
              <div className="w-8"></div>
            </header>
            
            <main className="sv-main hide-scrollbar">
              {/* Search input + button */}
              <div className="sv-input-container">
                <div className="sv-input-icon">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </div>
                <input 
                  className="sv-input"
                  placeholder="Ingresá nombre, CBU, CVU o Alias"
                  type="text"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  readOnly={practicePhase === 'guided'}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                      if (practicePhase === 'guided' || recipientInput.trim().length > 0) {
                        playSound('click');
                        setPracticeStep(4);
                        setInactivitySeconds(0);
                        setShowExplanationOverlay(true);
                      }
                    }
                  }}
                />
                {/* Search Button - TARGET */}
                <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}>
                  {arrowVisible && practiceStep === 3 && renderArrow({ top: '-48px', right: '0px' }, arrowShowLabel)}
                  <button 
                    className={`sv-search-btn-absolute ${shouldPulse(3) ? 'pulse-correct-element' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (practicePhase === 'free' && !recipientInput.trim()) {
                        setRecipientInput('maxifinirp');
                      }
                      playSound('click');
                      setPracticeStep(4);
                      setInactivitySeconds(0);
                      setShowExplanationOverlay(true);
                    }}
                  >
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </button>
                </div>
              </div>

              {/* Contacts section empty state */}
              <section style={{ opacity: isDimmed(3, false) ? 0.3 : 1 }}>
                <h2 className="text-[15px] font-medium text-gray-500 mb-4 px-1">Agenda de contactos</h2>
                <div className="sv-empty-state">
                  <div className="sv-empty-state-icon">
                    <i className="fa-regular fa-address-book text-2xl"></i>
                  </div>
                  <h3 className="sv-empty-state-title">Aún no tenés contactos guardados</h3>
                  <p className="sv-empty-state-desc">
                    Cuando realices transferencias, vas a poder agendarlos para encontrarlos más fácil acá.
                  </p>
                </div>
              </section>
            </main>
          </div>
        )}

        {/* ============ STEP 4: CONFIRM RECIPIENT ============ */}
        {practiceStep === 4 && (
          <div className="flex flex-col h-full bg-[#f8f9fb] overflow-hidden relative">
            {/* Background page dimmed or semi-transparent */}
            <div className="flex flex-col h-full opacity-40 select-none pointer-events-none">
              <header className="sv-header">
                <button className="sv-back-btn"><i className="fa-solid fa-arrow-left"></i></button>
                <h1 className="sv-title">¿A quién vas a transferir?</h1>
                <div className="w-8"></div>
              </header>
              <main className="sv-main">
                <div className="sv-input-container">
                  <div className="sv-input-icon"><i className="fa-solid fa-magnifying-glass"></i></div>
                  <input className="sv-input" type="text" value={recipientInput || 'maxifinirp'} readOnly />
                </div>
              </main>
            </div>

            {/* Bottom Sheet overlay */}
            <div className="sv-overlay">
              <div className="sv-bottom-sheet">
                <div className="sv-bottom-sheet-drag-handle"></div>
                
                {/* Destinatario Details */}
                <div style={{ opacity: isDimmed(4, false) ? 0.3 : 1 }}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">¿Querés transferir a este contacto?</h3>
                  
                  <div className="bg-[#f8f9fc] rounded-2xl p-4 border border-gray-100 flex items-center gap-4 mb-4">
                    <div className="sv-avatar">
                      <i className="fa-solid fa-user"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{recipientInput || 'maxifinirp'}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">CUIT/CUIL: 20-31000198-7</p>
                      <p className="text-xs text-gray-500">Banco: Banco Supervielle S.A.</p>
                      <p className="text-xs text-gray-500">CVU: 0000003100001987951820</p>
                    </div>
                  </div>

                  {/* Add to contacts Checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer py-1 select-none mb-1">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-[#C21833] border-gray-300 rounded focus:ring-[#C21833]" 
                      defaultChecked 
                    />
                    <span className="text-sm text-gray-700 font-medium">Agregar a mis contactos favoritos</span>
                  </label>
                </div>

                {/* Bottom sheet buttons */}
                <div className="flex flex-col gap-3 mt-2">
                  <div style={{ position: 'relative' }}>
                    {arrowVisible && practiceStep === 4 && renderArrow({ top: '-48px', left: '50%', transform: 'translateX(-50%)' }, arrowShowLabel)}
                    <button 
                      className={`sv-primary-btn ${shouldPulse(4) ? 'pulse-correct-element' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        playSound('click');
                        setPracticeStep(5);
                        setInactivitySeconds(0);
                        setShowExplanationOverlay(true);
                      }}
                    >
                      Continuar
                    </button>
                  </div>
                  <button className="sv-secondary-btn"
                    style={{ opacity: isDimmed(4, false) ? 0.3 : 1, pointerEvents: isDimmed(4, false) ? 'none' : 'auto' }}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ STEP 5: ENTER AMOUNT ============ */}
        {practiceStep === 5 && (
          <div className="flex flex-col h-full bg-[#f8f9fb] overflow-hidden relative">
            <header className="sv-header" style={{ opacity: isDimmed(5, false) ? 0.3 : 1 }}>
              <button className="sv-back-btn">
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: '#8E8E93', margin: 0, textTransform: 'uppercase' }}>CA ARS 178-6215110-2</p>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1C1C1E', margin: '2px 0 0 0' }}>$372.280</p>
              </div>
              <div className="w-8"></div>
            </header>

            <main className="sv-main hide-scrollbar">
              <div className="sv-amount-center-container">
                <h1 className="text-xl font-medium text-gray-800 mb-6" style={{ opacity: isDimmed(5, false) ? 0.3 : 1 }}>
                  ¿Cuánto vas a transferirte?
                </h1>
                
                <div className="sv-amount-display" style={{ opacity: isDimmed(5, false) ? 0.3 : 1 }}>
                  <span className="sv-amount-currency">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="sv-amount-input"
                    value={amountInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setAmountInput(val);
                    }}
                    placeholder="0"
                    readOnly={practicePhase === 'guided'}
                    style={{ border: 'none' }}
                  />
                </div>

                <div className="sv-amount-line" style={{ opacity: isDimmed(5, false) ? 0.3 : 1 }}></div>

                <div className="sv-amount-field-container" style={{ opacity: isDimmed(5, false) ? 0.3 : 1 }}>
                  <label className="sv-amount-label">Referencia (Opcional)</label>
                  <input className="sv-input" style={{ paddingLeft: '16px' }} value="Práctica Chichín" readOnly />
                </div>
              </div>

              {/* Footer buttons */}
              <div style={{ position: 'relative', width: '100%', paddingBottom: '20px' }}>
                {arrowVisible && practiceStep === 5 && renderArrow({ top: '-48px', left: '50%', transform: 'translateX(-50%)' }, arrowShowLabel)}
                <button 
                  className={`sv-primary-btn ${shouldPulse(5) ? 'pulse-correct-element' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    playSound('click');
                    if (practicePhase === 'free' && !amountInput.trim()) {
                      setAmountInput('1');
                    }
                    setPracticeStep(6);
                    setInactivitySeconds(0);
                    setShowExplanationOverlay(true);
                  }}
                >
                  Continuar
                </button>
              </div>
            </main>
          </div>
        )}

        {/* ============ STEP 6: SUMMARY ============ */}
        {practiceStep === 6 && (
          <div className="flex flex-col h-full bg-[#f8f9fb] overflow-hidden relative">
            <header className="sv-header" style={{ opacity: isDimmed(6, false) ? 0.3 : 1 }}>
              <button className="sv-back-btn">
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <h1 className="sv-title">Resumen</h1>
              <button className="sv-back-btn">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </header>

            <main className="sv-main hide-scrollbar">
              <div className="sv-summary-container">
                {/* Destinatario */}
                <div className="sv-summary-row" style={{ opacity: isDimmed(6, false) ? 0.3 : 1 }}>
                  <span className="sv-summary-label">Vas a transferirte a</span>
                  <div className="sv-summary-recipient">
                    <div className="sv-avatar">
                      <i className="fa-solid fa-user"></i>
                    </div>
                    <div>
                      <h4 className="sv-summary-name">{recipientInput || 'maxifinirp'}</h4>
                      <p className="sv-summary-subtext">CVU: 0000003100001987951820</p>
                    </div>
                  </div>
                </div>

                {/* Monto */}
                <div className="sv-summary-row" style={{ opacity: isDimmed(6, false) ? 0.3 : 1 }}>
                  <span className="sv-summary-label">Monto</span>
                  <h3 className="sv-summary-value">$ {amountInput || '1'}</h3>
                </div>

                {/* Concepto */}
                <div className="sv-summary-row" style={{ opacity: isDimmed(6, false) ? 0.3 : 1 }}>
                  <div className="sv-summary-concept-row">
                    <div>
                      <span className="sv-summary-label">Concepto</span>
                      <p className="sv-summary-concept-val">Varios</p>
                    </div>
                    <i className="fa-solid fa-chevron-down text-gray-400"></i>
                  </div>
                </div>

                {/* Desde la cuenta */}
                <div className="sv-summary-row no-border" style={{ opacity: isDimmed(6, false) ? 0.3 : 1 }}>
                  <span className="sv-summary-label">Desde la cuenta</span>
                  <div className="sv-summary-account">
                    <div className="sv-summary-account-logo">
                      <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 6l5 10H7l5-10z"></path></svg>
                    </div>
                    <div>
                      <p className="sv-summary-name" style={{ fontSize: '0.85rem' }}>CA ARS 178-6215110-2</p>
                      <p className="sv-summary-subtext" style={{ fontWeight: 600, color: '#1C1C1E' }}>$372.280</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="absolute bottom-0 left-0 w-full px-5 pb-8 pt-4 bg-gradient-to-t from-[#f8f9fc] via-[#f8f9fc] to-transparent z-10">
                <div className="flex items-center justify-center gap-2 mb-4 text-gray-500" style={{ opacity: isDimmed(6, false) ? 0.3 : 1 }}>
                  <i className="fa-solid fa-circle-info text-sm"></i>
                  <span className="text-[14px] font-medium">Revisá que los datos sean correctos.</span>
                </div>
                <div style={{ position: 'relative' }}>
                  {arrowVisible && practiceStep === 6 && renderArrow({ top: '-48px', left: '50%', transform: 'translateX(-50%)' }, arrowShowLabel)}
                  <button 
                    className={`sv-primary-btn ${shouldPulse(6) ? 'pulse-correct-element' : ''}`}
                    style={{ backgroundColor: '#B2133E' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      playSound('success');
                      setPracticeStep(7);
                      setInactivitySeconds(0);
                      setShowExplanationOverlay(true);
                    }}
                  >
                    Transferir dinero
                  </button>
                </div>
              </div>
            </main>
          </div>
        )}

        {/* ============ STEP 7: SUCCESS ============ */}
        {practiceStep === 7 && (
          <div className="flex flex-col h-full bg-[#f8f9fc] overflow-hidden relative">
            <header className="sv-header" style={{ opacity: isDimmed(7, false) ? 0.3 : 1, borderBottom: 'none' }}>
              <div className="w-8"></div>
              <div className="flex-1"></div>
              <button className="sv-back-btn">
                <i className="fa-solid fa-xmark text-gray-400"></i>
              </button>
            </header>

            <main className="sv-main hide-scrollbar">
              <div className="sv-success-main">
                {/* Green checkmark circle */}
                <div className="sv-success-circle" style={{ opacity: isDimmed(7, false) ? 0.3 : 1 }}>
                  <div className="sv-success-icon-inner">
                    <i className="fa-solid fa-check"></i>
                  </div>
                </div>

                <div className="text-center" style={{ opacity: isDimmed(7, false) ? 0.3 : 1 }}>
                  <h1 className="sv-success-title">
                    Transferiste ${amountInput || '1'} a tu cuenta<br/>{recipientInput || 'maxifinirp'}
                  </h1>
                  <p className="sv-success-subtitle">
                    Podés encontrar esta operación en los<br/>movimientos de tu cuenta.
                  </p>
                </div>

                {/* Add Contact Card */}
                <div className="sv-success-card-action" style={{ opacity: isDimmed(7, false) ? 0.3 : 1 }}>
                  <span>Agendar contacto</span>
                  <i className="fa-solid fa-chevron-right"></i>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="flex flex-col gap-3 px-5 pb-8">
                <div style={{ position: 'relative' }}>
                  {arrowVisible && practiceStep === 7 && renderArrow({ top: '-48px', left: '50%', transform: 'translateX(-50%)' }, arrowShowLabel)}
                  <button 
                    className={`sv-primary-btn ${shouldPulse(7) ? 'pulse-correct-element' : ''}`}
                    style={{ backgroundColor: '#2E7D32' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      playSound('success');
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
                <button className="sv-secondary-btn"
                  style={{ opacity: isDimmed(7, false) ? 0.3 : 1, pointerEvents: isDimmed(7, false) ? 'none' : 'auto' }}>
                  Volver a Transferencias
                </button>
              </div>
            </main>
          </div>
        )}

        {/* Floating Coco Helper Button */}
        {!showExplanationOverlay && (
          <button
            className={`floating-coco-btn ${inactivitySeconds >= 20 ? 'pulse-correct-element' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              playSound('click');
              setInactivitySeconds(0);
              setShowExplanationOverlay(true);
            }}
            title="Ayuda de Coco"
            aria-label="Abrir explicación de Coco"
          >
            🦉
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
        {activeView === 'escudo' && (
          <EscudoView
            escudoStep={escudoStep}
            escudoStreak={escudoStreak}
            escudoTotalSessions={escudoTotalSessions}
            escudoSessionSituations={escudoSessionSituations}
            escudoCurrentIndex={escudoCurrentIndex}
            escudoResultState={escudoResultState}
            currentSpeakingText={currentSpeakingText}
            speakText={speakText}
            playSound={playSound}
            setEscudoStep={setEscudoStep}
            loadSecondSituation={loadSecondSituation}
            completeEscudoSession={completeEscudoSession}
            setEscudoResultState={setEscudoResultState}
            setEscudoHistory={setEscudoHistory}
            escudoHistory={escudoHistory}
            handleNav={handleNav}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            getEscudoLevel={getEscudoLevel}
          />
        )}
      </main>

      {/* Persistent Emergency Help Panel */}
      {activeView !== 'simulador-mp' && activeView !== 'escudo' && renderHelpFooter()}
    </div>
  );
}

function EscudoView({
  escudoStep,
  escudoStreak,
  escudoTotalSessions,
  escudoSessionSituations,
  escudoCurrentIndex,
  escudoResultState,
  currentSpeakingText,
  speakText,
  playSound,
  setEscudoStep,
  loadSecondSituation,
  completeEscudoSession,
  setEscudoResultState,
  setEscudoHistory,
  escudoHistory,
  handleNav,
  userProfile,
  setUserProfile,
  getEscudoLevel
}) {
  const currentSit = escudoSessionSituations[escudoCurrentIndex];

  // Sub-view: INTRO
  const renderIntro = () => {
    if (!currentSit) return <div className="escudo-container"><p>Cargando práctica de hoy...</p></div>;
    
    const categoryEmoji = 
      currentSit.categoria === 'llamada' ? '📞' :
      currentSit.categoria === 'whatsapp' ? '💬' :
      currentSit.categoria === 'sms' ? '✉️' : '🔔';

    const categoryName = 
      currentSit.categoria === 'llamada' ? 'Llamada telefónica' :
      currentSit.categoria === 'whatsapp' ? 'Mensaje de WhatsApp' :
      currentSit.categoria === 'sms' ? 'Mensaje de texto (SMS)' : 'Notificación';

    return (
      <div className="escudo-container fade-in">
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
          <h2>Práctica de hoy</h2>
        </div>

        <div className="card escudo-intro-card">
          <div className="escudo-header-box">
            <span className="escudo-shield-icon">🛡️</span>
          </div>

          <h3 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>¿Preparado/a para proteger tus claves?</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.5, marginBottom: '24px' }}>
            Hoy vas a practicar con una simulación de <strong>{categoryName}</strong>. 
            Mirala con atención y decidí qué hacer.
          </p>

          <div className="card" style={{ 
            backgroundColor: 'var(--brand-primary-light)', 
            borderColor: 'var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            textAlign: 'left',
            marginBottom: '24px'
          }}>
            <span style={{ fontSize: '36px' }}>{categoryEmoji}</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{currentSit.titulo}</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{currentSit.descripcion_breve}</p>
            </div>
          </div>

          <button 
            className="btn btn-primary"
            onClick={() => {
              playSound('click');
              setEscudoStep('situacion');
            }}
            style={{ minHeight: '52px', fontSize: '1.15rem' }}
          >
            🚀 Empezar práctica
          </button>
        </div>
      </div>
    );
  };

  // Sub-view: SITUACION
  const renderSituacion = () => {
    if (!currentSit) return null;

    const renderLlamada = () => (
      <div className="sim-llamada-box">
        <div className="sim-llamada-avatar">📞</div>
        <div className="sim-llamada-caller">{currentSit.contenido.emisor}</div>
        <div className="sim-llamada-status">Llamada activa...</div>
        <div className="sim-llamada-transcript">
          <p className="sim-llamada-transcript-p">
            "{currentSit.contenido.texto}"
          </p>
        </div>
      </div>
    );

    const renderWhatsApp = () => (
      <div className="sim-whatsapp-container">
        <div className="sim-whatsapp-header">
          <div className="sim-whatsapp-avatar">{currentSit.contenido.avatar || '👤'}</div>
          <div className="sim-whatsapp-title">
            <span className="sim-whatsapp-name">{currentSit.contenido.remitente}</span>
            <span className="sim-whatsapp-status">En línea</span>
          </div>
        </div>
        <div className="sim-whatsapp-body">
          {currentSit.contenido.mensajes.map((msg, i) => (
            <div key={i} className="sim-whatsapp-bubble sim-whatsapp-bubble-left">
              {msg.texto}
              <span className="sim-whatsapp-bubble-time">10:14</span>
            </div>
          ))}
        </div>
      </div>
    );

    const renderSMS = () => (
      <div className="sim-sms-container">
        <div className="sim-sms-header">
          Mensaje de: {currentSit.contenido.remitente}
        </div>
        <div className="sim-sms-body">
          <div className="sim-sms-bubble">
            {currentSit.contenido.texto}
          </div>
          <span className="sim-sms-footer">SMS • Recibido hace 1 min</span>
        </div>
      </div>
    );

    const renderNoti = () => (
      <div className="sim-noti-container">
        <div className="sim-noti-icon-box">🔔</div>
        <div className="sim-noti-content">
          <div className="sim-noti-header">
            <span className="sim-noti-appName">{currentSit.contenido.remitente}</span>
            <span className="sim-noti-time">Ahora</span>
          </div>
          <p className="sim-noti-text">{currentSit.contenido.texto}</p>
        </div>
      </div>
    );

    return (
      <div className="escudo-container fade-in">
        {/* Header progress info */}


        <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '20px', color: 'var(--text-primary)' }}>
            Revisá este escenario simulado:
          </h3>

          {/* Simulation mock */}
          {currentSit.contenido.tipo === 'transcripcion_llamada' && renderLlamada()}
          {currentSit.contenido.tipo === 'whatsapp_chat' && renderWhatsApp()}
          {currentSit.contenido.tipo === 'sms_texto' && renderSMS()}
          {currentSit.contenido.tipo === 'notificacion' && renderNoti()}

          {/* Read-out button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <button 
              className={`btn-listen-icon ${currentSpeakingText && (currentSpeakingText.includes("Llamada telefónica") || currentSpeakingText.includes("Mensaje de WhatsApp") || currentSpeakingText.includes("Mensaje de texto")) ? 'speaking' : ''}`}
              onClick={() => {
                let textToSpeak;
                if (currentSit.categoria === 'llamada') {
                  textToSpeak = `Llamada telefónica simulada de ${currentSit.contenido.emisor}. Dice: ${currentSit.contenido.texto}. ¿Qué hacés vos?`;
                } else if (currentSit.categoria === 'whatsapp') {
                  const msgs = currentSit.contenido.mensajes.map(m => m.texto).join(". ");
                  textToSpeak = `Mensaje de WhatsApp simulado de ${currentSit.contenido.remitente}. Dice: ${msgs}. ¿Qué hacés vos?`;
                } else {
                  textToSpeak = `Mensaje de texto simulado de ${currentSit.contenido.remitente}. Dice: ${currentSit.contenido.texto}. ¿Qué hacés vos?`;
                }
                speakText(textToSpeak, true);
              }}
              title="Escuchar la situación completa"
              aria-label="Escuchar la situación completa"
            >
              {currentSpeakingText && (currentSpeakingText.includes("Llamada telefónica") || currentSpeakingText.includes("Mensaje de WhatsApp") || currentSpeakingText.includes("Mensaje de texto")) ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </div>

          <p style={{ 
            fontSize: '1.25rem', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            marginBottom: '20px',
            color: 'var(--text-primary)'
          }}>
            ¿Qué hacés vos?
          </p>

          {/* Two big options buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {currentSit.opciones.map((opt) => (
              <button
                key={opt.id}
                className="btn btn-outline"
                style={{
                  minHeight: '56px',
                  height: 'auto',
                  padding: '16px 20px',
                  fontSize: '1.1rem',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  lineHeight: '1.4',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '10px'
                }}
                onClick={() => {
                  const isCorrect = opt.es_correcto;
                  playSound(isCorrect ? 'success' : 'error');
                  setEscudoResultState(isCorrect ? 'correct' : 'incorrect');
                  
                  // Add situation to history
                  const updatedHistory = [...escudoHistory, currentSit.id];
                  setEscudoHistory(updatedHistory);
                  localStorage.setItem('chichin_escudo_history', JSON.stringify(updatedHistory));

                  setEscudoStep('feedback');
                }}
              >
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--brand-primary-light)',
                  color: 'var(--brand-primary)',
                  fontWeight: 'bold',
                  marginRight: '12px',
                  flexShrink: 0
                }}>
                  {opt.id}
                </span>
                <span style={{ flex: 1 }}>{opt.texto}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Sub-view: FEEDBACK
  const renderFeedback = () => {
    if (!currentSit) return null;

    const isCorrect = escudoResultState === 'correct';

    return (
      <div className="escudo-container fade-in">
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          {/* Visual Icon */}
          <div className={`escudo-feedback-icon-container ${
            isCorrect ? 'escudo-feedback-icon-success' : 'escudo-feedback-icon-error'
          }`}>
            {isCorrect ? '✓' : '✗'}
          </div>

          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: isCorrect ? 'var(--color-success)' : 'var(--color-error)',
            marginBottom: '16px'
          }}>
            {isCorrect ? '¡Muy bien, lo reconociste!' : 'Esta vez te engañaron'}
          </h3>

          <p style={{ 
            fontSize: '1.15rem', 
            lineHeight: 1.55, 
            color: 'var(--text-body)',
            marginBottom: '24px'
          }}>
            {isCorrect ? currentSit.feedback_correcto : currentSit.feedback_incorrecto}
          </p>

          {/* Red Flag instructional card */}
          <div className="red-flag-card-box">
            <div className="red-flag-card-title">
              <AlertTriangle size={20} />
              Señal de alerta:
            </div>
            <p className="red-flag-card-text">
              {currentSit.red_flag_destacada}
            </p>
          </div>

          {/* Divider */}
          <div className="divider" style={{ margin: '24px 0' }} />

          {/* Options to continue */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {escudoCurrentIndex === 0 && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  playSound('click');
                  loadSecondSituation();
                }}
                style={{ minHeight: '52px', fontSize: '1.1rem' }}
              >
                📖 Ver otra situación (+ puntos)
              </button>
            )}

            <button
              className={escudoCurrentIndex === 0 ? "btn btn-outline" : "btn btn-primary"}
              onClick={() => {
                playSound('click');
                completeEscudoSession();
              }}
              style={{ minHeight: '52px', fontSize: '1.1rem' }}
            >
              {escudoCurrentIndex === 0 ? "Listo por hoy" : "Ver mi racha 🛡️"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Sub-view: RACHA / CIERRE
  const renderRacha = () => {
    const shieldLevel = getEscudoLevel(escudoTotalSessions);
    return (
      <div className="escudo-container fade-in">
        <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
          <span style={{ fontSize: '80px', display: 'block', marginBottom: '16px' }}>🛡️</span>
          
          <h2 style={{ fontSize: '1.8rem', color: 'var(--brand-primary)', marginBottom: '4px' }}>
            ¡Escudo Activo!
          </h2>
          <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: 0, marginBottom: '20px' }}>
            Tu nivel: {shieldLevel}
          </p>


          <div className="card" style={{ 
            backgroundColor: 'var(--brand-primary-light)', 
            borderColor: 'var(--brand-primary)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '28px'
          }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '6px' }}>🔥</span>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{escudoStreak} días seguidos</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Practicando tu defensa contra estafas
            </p>
          </div>

          <p style={{ 
            fontSize: '1.15rem', 
            lineHeight: 1.55, 
            color: 'var(--text-body)', 
            marginBottom: '32px',
            fontWeight: 500
          }}>
            ¡Felicitaciones, {userProfile.name || 'estudiante'}, por cuidar tu seguridad digital! Recordá que una pequeña práctica todos los días te ayuda a reaccionar rápido en la vida real.
          </p>

          <button
            className="btn btn-primary"
            onClick={() => {
              playSound('click');
              // Give some rewards
              setUserProfile(prev => ({
                ...prev,
                points: prev.points + 50,
                medals: prev.medals.includes('Escudo Digital 🛡️') ? prev.medals : ['Escudo Digital 🛡️', ...prev.medals]
              }));
              handleNav('home');
            }}
            style={{ minHeight: '52px', fontSize: '1.15rem' }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  };

  switch (escudoStep) {
    case 'intro': return renderIntro();
    case 'situacion': return renderSituacion();
    case 'feedback': return renderFeedback();
    case 'racha': return renderRacha();
    default: return renderIntro();
  }
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
        { id: 'b', emoji: '🔗', texto: 'Me llegó un enlace por WhatsApp pidiéndome mi clave del banco' },
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
      <Analytics />
    </div>
  );
}

export default App;


