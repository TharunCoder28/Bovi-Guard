import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Cpu, 
  AlertTriangle, 
  HelpCircle, 
  Compass, 
  LineChart, 
  Flame, 
  CheckCircle, 
  XCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  ChevronRight, 
  BarChart3, 
  Coins, 
  Layers, 
  HardDrive, 
  WifiOff, 
  MapPin, 
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  Info,
  Camera,
  Download,
  Trash2,
  Copy,
  RefreshCw,
  Search,
  Check,
  Siren,
  Terminal,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  ChevronDown,
  Eye,
  Settings,
  Shield,
  Clock,
  ExternalLink,
  Plus,
  Images,
  X
} from 'lucide-react';
import { Snapshot, saveSnapshot, getAllSnapshots, deleteSnapshot, clearAllSnapshots } from './utils/db';
import { 
  JUDGE_METRICS, 
  BRUTAL_WEAKNESSES, 
  STRATEGIC_UPGRADES, 
  JUDGE_QUESTIONS, 
  TIRUVANNAMALAI_PILOT_SPOTS, 
  PILOT_KPIS, 
  SIXTY_SECOND_PITCH 
} from './data';

// Definition for simulated log entries to look like SQLite row entries
interface LogEntry {
  id: string;
  timestamp: string;
  cameraId: string;
  location: string;
  confidence: number;
  luxLevel: number;
  lowLightCompensated: boolean;
  status: 'PENDING' | 'MITIGATED' | 'FALSE_POSITIVE_BLOCKED';
  actionTaken: string;
  snapshotDataUrl: string; // inline base64 or custom SVG string represent cattle outline
}

// Technical components data structure
interface TechComponent {
  filename: string;
  language: string;
  description: string;
  code: string;
}

interface CorridorConfig {
  lat: string;
  lng: string;
  alt: string;
  x: number;
  y: number;
  info: string;
  cameras: number;
  danger: string;
}

const CITIES_DATA: Record<string, {
  tag: string;
  corridors: Record<string, CorridorConfig>;
  svgElements: React.ReactNode;
}> = {
  "Tiruvannamalai": {
    tag: "Sacred Pilgrimage & Heavy Bus Corridor",
    corridors: {
      "NH-77 Highway Corridor (Chengam Road)": {
        lat: "12.2272° N", lng: "79.0283° E", alt: "172m", x: 35, y: 72, info: "NH-77 Chengam Road SW", cameras: 65, danger: "CRITICAL"
      },
      "Girivalam Path Outer Ring": {
        lat: "12.2341° N", lng: "79.0478° E", alt: "194m", x: 45, y: 35, info: "Girivalam Path West", cameras: 45, danger: "CRITICAL"
      },
      "Pondy-Krishnagiri Highway (SH-9 intersection)": {
        lat: "12.2482° N", lng: "79.0831° E", alt: "168m", x: 120, y: 25, info: "SH-9 Junction Northeast", cameras: 30, danger: "HIGH"
      },
      "Annamalaiyar Temple Periphery Routes": {
        lat: "12.2311° N", lng: "79.0676° E", alt: "175m", x: 95, y: 52, info: "Temple Periphery East", cameras: 20, danger: "MEDIUM"
      }
    },
    svgElements: (
      <>
        <polygon points="62,56 75,25 88,56" fill="rgba(251, 191, 36, 0.15)" stroke="rgba(251, 191, 36, 0.4)" strokeWidth="1" />
        <text x="75" y="44" textAnchor="middle" fill="#fbbf24" fontSize="6" fontWeight="bold" opacity="0.8">ANNAMALAI</text>
        <path d="M 10 85 Q 40 70 75 50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="1,1" />
        <path d="M 140 20 Q 110 40 75 50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="1,1" />
        <ellipse cx="75" cy="48" rx="28" ry="18" fill="none" stroke="rgba(34, 211, 238, 0.25)" strokeWidth="1" strokeDasharray="3,3" />
      </>
    )
  },
  "Madurai": {
    tag: "Southern Transit Hub & Temple Junctions",
    corridors: {
      "Mattuthavani Heavy Transport Corridor": {
        lat: "9.9427° N", lng: "78.1561° E", alt: "136m", x: 125, y: 35, info: "Mattuthavani Bypass", cameras: 80, danger: "CRITICAL"
      },
      "Alagar Kovil Temple Access Road": {
        lat: "9.9723° N", lng: "78.1884° E", alt: "152m", x: 45, y: 25, info: "Alagar Kovil Road North", cameras: 35, danger: "HIGH"
      },
      "Madurai Ring Road NH-45B Bypass": {
        lat: "9.9142° N", lng: "78.1633° E", alt: "131m", x: 80, y: 75, info: "NH-45B East Outer", cameras: 50, danger: "CRITICAL"
      },
      "Meenakshi Amman West Masi Street": {
        lat: "9.9194° N", lng: "78.1189° E", alt: "140m", x: 40, y: 55, info: "West Masi Ring Corridor", cameras: 22, danger: "MEDIUM"
      }
    },
    svgElements: (
      <>
        <polygon points="65,58 75,20 85,58" fill="rgba(251, 191, 36, 0.15)" stroke="rgba(251, 191, 36, 0.4)" strokeWidth="1" />
        <line x1="68" y1="48" x2="82" y2="48" stroke="rgba(251, 191, 36, 0.4)" strokeWidth="1" />
        <line x1="71" y1="38" x2="79" y2="38" stroke="rgba(251, 191, 36, 0.4)" strokeWidth="1" />
        <line x1="73" y1="28" x2="77" y2="28" stroke="rgba(251, 191, 36, 0.3)" strokeWidth="1" />
        <line x1="75" y1="20" x2="75" y2="12" stroke="#fbbf24" strokeWidth="1" />
        <text x="75" y="66" textAnchor="middle" fill="#fbbf24" fontSize="6" fontWeight="bold" opacity="0.8">TEMPLE GOPURAM</text>
        <line x1="10" y1="10" x2="140" y2="80" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2,2" />
        <line x1="10" y1="80" x2="140" y2="10" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2,2" />
        <circle cx="75" cy="48" r="40" fill="none" stroke="rgba(34, 211, 238, 0.25)" strokeWidth="1" strokeDasharray="3,3" />
      </>
    )
  },
  "Coimbatore": {
    tag: "Western Ghats Foothills & Industrial Bypass",
    corridors: {
      "NH-948 Pollachi Highway": {
        lat: "10.9125° N", lng: "76.9610° E", alt: "412m", x: 130, y: 72, info: "Pollachi Highway South", cameras: 75, danger: "CRITICAL"
      },
      "Marudhamalai Western Foothills Road": {
        lat: "11.0210° N", lng: "76.8845° E", alt: "460m", x: 25, y: 25, info: "Marudhamalai Ascent Zone", cameras: 40, danger: "HIGH"
      },
      "Avinashi Road Express Corridor": {
        lat: "11.0114° N", lng: "77.0125° E", alt: "398m", x: 95, y: 42, info: "Avinashi Road Arterial", cameras: 90, danger: "CRITICAL"
      },
      "L&T Bypass Tollway intersection": {
        lat: "10.9421° N", lng: "77.0344° E", alt: "372m", x: 110, y: 62, info: "L&T Bypass Junction", cameras: 30, danger: "HIGH"
      }
    },
    svgElements: (
      <>
        <polygon points="5,60 25,25 45,60" fill="rgba(251, 191, 36, 0.1)" stroke="rgba(251, 191, 36, 0.2)" strokeWidth="1" />
        <polygon points="25,60 45,15 65,60" fill="rgba(251, 191, 36, 0.15)" stroke="rgba(251, 191, 36, 0.3)" strokeWidth="1" />
        <polygon points="45,60 60,35 75,60" fill="rgba(251, 191, 36, 0.1)" stroke="rgba(251, 191, 36, 0.2)" strokeWidth="1" />
        <text x="38" y="70" textAnchor="middle" fill="#fbbf24" fontSize="6" fontWeight="bold" opacity="0.8">WESTERN GHATS</text>
        <path d="M 5 15 L 145 75" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <circle cx="110" cy="62" r="8" fill="none" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="1.5" />
      </>
    )
  },
  "Kanchipuram": {
    tag: "Northern Agricultural Corridors & Silk Capitals",
    corridors: {
      "NH-48 Chennai-Bangalore Expressway": {
        lat: "12.8341° N", lng: "79.7036° E", alt: "83m", x: 115, y: 22, info: "NH-48 Golden Quadrilateral", cameras: 95, danger: "CRITICAL"
      },
      "Kanchi-Vandavasi Highway (SH-116)": {
        lat: "12.7915° N", lng: "79.6782° E", alt: "89m", x: 55, y: 68, info: "SH-116 Agricultural Belt", cameras: 45, danger: "CRITICAL"
      },
      "Vaikunda Perumal Sannidhi Street": {
        lat: "12.8390° N", lng: "79.7092° E", alt: "81m", x: 45, y: 35, info: "Temple Heritage Loop", cameras: 18, danger: "MEDIUM"
      },
      "SH-58 Chengalpattu Trunk Road": {
        lat: "12.8122° N", lng: "79.7423° E", alt: "84m", x: 105, y: 55, info: "SH-58 Trunk Way", cameras: 38, danger: "HIGH"
      }
    },
    svgElements: (
      <>
        <line x1="20" y1="15" x2="20" y2="75" stroke="rgba(251, 191, 36, 0.25)" strokeWidth="0.5" />
        <line x1="40" y1="15" x2="40" y2="75" stroke="rgba(251, 191, 36, 0.2)" strokeWidth="0.5" />
        <line x1="60" y1="15" x2="60" y2="75" stroke="rgba(251, 191, 36, 0.15)" strokeWidth="0.5" />
        <line x1="15" y1="30" x2="65" y2="30" stroke="rgba(251, 191, 36, 0.15)" strokeWidth="0.5" />
        <line x1="15" y1="50" x2="65" y2="50" stroke="rgba(251, 191, 36, 0.2)" strokeWidth="0.5" />
        <text x="40" y="24" textAnchor="middle" fill="#fbbf24" fontSize="5" fontWeight="bold" opacity="0.8">SILK WEAVING</text>
        <path d="M 5 50 C 40 40, 110 60, 145 20" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      </>
    )
  }
};


export default function App() {
  // Navigation tabs
  const [activeSection, setActiveSection] = useState<'dashboard' | 'logs' | 'code' | 'arguments' | 'gallery'>('dashboard');
  
  // Audio control settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Custom camera selection state
  const [cameraSource, setCameraSource] = useState<'simulation' | 'webcam'>('simulation');
  const [selectedCity, setSelectedCity] = useState<string>("Tiruvannamalai");
  const [selectedCorridor, setSelectedCorridor] = useState<string>("NH-77 Highway Corridor (Chengam Road)");
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(true);

  // Dynamically calculate CORRIDOR_GPS_DATA of the active city
  const CORRIDOR_GPS_DATA: Record<string, CorridorConfig> = useMemo(() => {
    return CITIES_DATA[selectedCity]?.corridors || CITIES_DATA["Tiruvannamalai"].corridors;
  }, [selectedCity]);
  
  // WebRTC Stream configurations and status
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const [luxValue, setLuxValue] = useState<number>(14); // starts dark representing NH-77 night conditions
  const [fpsVal, setFpsVal] = useState<number>(30);
  const [sysLatency, setSysLatency] = useState<number>(12); // in ms
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Filter systems & configuration values
  const [confThreshold, setConfThreshold] = useState<number>(75); // Slider control
  const [gaitVelocityFilter, setGaitVelocityFilter] = useState<boolean>(true);
  const [temporalConsensus, setTemporalConsensus] = useState<boolean>(true);
  const [lowLightCorrection, setLowLightCorrection] = useState<boolean>(true);
  
  // Simulation tracking loops
  const [isCattleActiveInSim, setIsCattleActiveInSim] = useState<boolean>(false);
  const [activeAlert, setActiveAlert] = useState<boolean>(false);
  const [currentBovineConfidence, setCurrentBovineConfidence] = useState<number>(0);
  const [activeAlertLogEntry, setActiveAlertLogEntry] = useState<LogEntry | null>(null);

  // IndexedDB snapshots / Gallery persistent storage
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const hasSavedSnapshotForCurrentEventRef = useRef<boolean>(false);

  const refreshSnapshotsList = async () => {
    try {
      const data = await getAllSnapshots();
      setSnapshots(data);
    } catch (err) {
      console.error('Failed to retrieve snapshots from IndexedDB:', err);
    }
  };

  useEffect(() => {
    refreshSnapshotsList();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedModalSnapshot(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerSnapshotCapture = async (confidence: number, bovineDisplayLabel: string) => {
    const canvas = feedCanvasRef.current;
    if (!canvas) return;
    try {
      // Keep bounding box visual details on canvas
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const newSnapshot: Snapshot = {
        timestamp: new Date().toISOString(),
        city: selectedCity,
        corridor: selectedCorridor,
        confidence: parseFloat(confidence.toFixed(1)),
        label: bovineDisplayLabel,
        imageData: dataUrl
      };
      await saveSnapshot(newSnapshot);
      await refreshSnapshotsList();
      console.log('Automated high-confidence snapshot saved to IndexedDB:', newSnapshot.label);
    } catch (err) {
      console.error('Failed to auto-save snapshot:', err);
    }
  };

  // Gallery search query filter state
  const [gallerySearch, setGallerySearch] = useState<string>('');
  const [selectedModalSnapshot, setSelectedModalSnapshot] = useState<Snapshot | null>(null);

  // Boviguard AI Feature 1: Multimodal Snapshot Threat Analysis
  const [analyzingSnapshotId, setAnalyzingSnapshotId] = useState<number | null>(null);
  const [snapshotAnalyses, setSnapshotAnalyses] = useState<Record<number, {
    breedClassification: string;
    riskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    riskExplanation: string;
    sceneAudit: string;
    recommendedAction: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('boviguard_snapshot_analyses');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('boviguard_snapshot_analyses', JSON.stringify(snapshotAnalyses));
  }, [snapshotAnalyses]);

  const analyzeSnapshotWithAI = async (snap: Snapshot) => {
    if (!snap.id) return;
    setAnalyzingSnapshotId(snap.id);
    try {
      const response = await fetch('/api/ai/analyze-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snap)
      });
      if (!response.ok) {
        throw new Error('Inference failure or server connection error');
      }
      const result = await response.json();
      setSnapshotAnalyses(prev => ({
        ...prev,
        [snap.id!]: result
      }));
    } catch (err: any) {
      console.error('Boviguard AI Multi-modal Analysis failed:', err);
      alert('Boviguard AI analysis failed to resolve. Please verify your GEMINI_API_KEY environment configuration.');
    } finally {
      setAnalyzingSnapshotId(null);
    }
  };

  // Boviguard AI Feature 2: High-Performance Pitch Defense Copilot
  const [customObjection, setCustomObjection] = useState<string>('');
  const [copilotFocus, setCopilotFocus] = useState<string>('Edge computing YOLOv8 nodes');
  const [copilotState, setCopilotState] = useState<string>('Tamil Nadu');
  const [isGeneratingPitch, setIsGeneratingPitch] = useState<boolean>(false);
  const [pitchAdvisorResult, setPitchAdvisorResult] = useState<{
    hook: string;
    technicalDissection: string;
    localImpact: string;
    fiscalMath: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('boviguard_pitch_advisor_result');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (pitchAdvisorResult) {
      localStorage.setItem('boviguard_pitch_advisor_result', JSON.stringify(pitchAdvisorResult));
    } else {
      localStorage.removeItem('boviguard_pitch_advisor_result');
    }
  }, [pitchAdvisorResult]);

  const [activeCopilotTab, setActiveCopilotTab] = useState<'hook' | 'tech' | 'local' | 'fiscal'>('hook');

  const generateAIPitchStrategy = async () => {
    if (!customObjection.trim()) {
      alert("Please enter a custom objection, select a template, or click a prefilled prompt first.");
      return;
    }
    setIsGeneratingPitch(true);
    try {
      const response = await fetch('/api/ai/pitch-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customQuestion: customObjection,
          selectedFocus: copilotFocus,
          selectedState: copilotState,
        })
      });
      if (!response.ok) {
        throw new Error('Inference failure or server-side error');
      }
      const result = await response.json();
      setPitchAdvisorResult(result);
      setActiveCopilotTab('hook');
    } catch (err) {
      console.error('Boviguard AI Pitch Advisor failed:', err);
      alert('AI Pitch Advisor failed. Please ensure GEMINI_API_KEY is properly set up.');
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const filteredSnapshots = useMemo(() => {
    if (!gallerySearch) return snapshots;
    const query = gallerySearch.toLowerCase();
    return snapshots.filter(snap => 
      snap.city.toLowerCase().includes(query) ||
      snap.corridor.toLowerCase().includes(query) ||
      snap.label.toLowerCase().includes(query) ||
      snap.confidence.toString().includes(query)
    );
  }, [snapshots, gallerySearch]);
  
  // SQLite data table simulation persisted via LocalStorage
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('boviguard_sqlite_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // default fallback below
      }
    }
    // Pre-seeded records
    return [
      {
        id: "BG-20260618-0922",
        timestamp: "2026-06-18 21:44:12",
        cameraId: "CAM-SH77-CHENGAM-01",
        location: "NH-77 Highway Corridor (Chengam Road)",
        confidence: 94.2,
        luxLevel: 4.8,
        lowLightCompensated: true,
        status: 'MITIGATED',
        actionTaken: "Bovine retina glow matched. LED Road studs strobe triggered over LoRa (868MHz). Fast truck decelerated from 92km/h to 35km/h.",
        snapshotDataUrl: "eyes"
      },
      {
        id: "BG-20260618-0925",
        timestamp: "2026-06-18 22:15:40",
        cameraId: "CAM-GIRI-OUTER-03",
        location: "Girivalam Path Outer Ring",
        confidence: 88.7,
        luxLevel: 28.5,
        lowLightCompensated: false,
        status: 'MITIGATED',
        actionTaken: "Bovine cluster detected on pedestrian verge. Local municipal cattle-impound dispatch warned. Alert injected to Google Maps GIS.",
        snapshotDataUrl: "bovine_spotted"
      },
      {
        id: "BG-20260618-0929",
        timestamp: "2026-06-18 22:38:05",
        cameraId: "CAM-SH9-PONDY-02",
        location: "Pondy-Krishnagiri Highway (SH-9 intersection)",
        confidence: 62.1,
        luxLevel: 15.2,
        lowLightCompensated: true,
        status: 'FALSE_POSITIVE_BLOCKED',
        actionTaken: "High-gait object detected. Temporal speed exceeded 18 km/h. Candidate object classified as stray dog. Audio trigger suppressed.",
        snapshotDataUrl: "dog_shadow"
      }
    ];
  });

  // Save logs changes
  useEffect(() => {
    localStorage.setItem('boviguard_sqlite_logs', JSON.stringify(logs));
  }, [logs]);

  // Audio Sirens using Web Audio API (Fully offline-survivable synthesizer)
  let audioCtxRef = useRef<AudioContext | null>(null);
  
  const playSirenSynthesizer = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      // Sweep effect (siren mimicry)
      osc1.frequency.setValueAtTime(950, audioCtx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.35);

      osc2.frequency.setValueAtTime(300, audioCtx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.35);

      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start();
      osc2.start();

      osc1.stop(audioCtx.currentTime + 0.4);
      osc2.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn("Wave Synthesis blocked by browser policies", e);
    }
  };

  // Canvas-based simulation render for road feed
  const feedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [simulationSpeedMultiplier, setSimulationSpeedMultiplier] = useState<number>(1.2);
  
  // Refs for high performance 60fps canvas animation metrics (prevents excessive state re-renders)
  const bovineXRef = useRef<number>(310);
  const bovineYRef = useRef<number>(160);
  const bovineDirectionRef = useRef<number>(1);
  const simCarsRef = useRef<Array<{x: number; speed: number; lane: number; type: string}>>([
    { x: 30, speed: 4.5, lane: 1, type: "Truck" },
    { x: 280, speed: 6.0, lane: 2, type: "Motorcycle" }
  ]);

  // State-transition guard refs to avoid redundant/infinite setState loops
  const lastIsCattleActiveInSim = useRef<boolean>(false);
  const lastCurrentBovineConfidence = useRef<number>(0);

  // New refs supporting real-time webcam computer vision frame processing
  const frameCounterRef = useRef<number>(0);
  const prevGridLuminanceRef = useRef<number[]>([]);
  const webcamLockPointRef = useRef<{x: number; y: number} | null>(null);

  // Handle active camera simulation & real-time webcam analyzer loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = feedCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas update scale
    const render = () => {
      const isSimulation = cameraSource === 'simulation';
      const isWebcam = cameraSource === 'webcam' && webcamActive && webcamVideoRef.current;

      if (isSimulation) {
        // --- DRAW SIMULATION HIGHWAY SCENE ---
        // Background road canvas
        ctx.fillStyle = luxValue < 15 ? '#111215' : '#22252a'; // Night vs daylight road color
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Night shadows noise
        if (luxValue < 10) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
          for (let i = 0; i < 8; i++) {
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
          }
        }

        // Draw road lane markings
        ctx.strokeStyle = '#e4e3e0';
        ctx.lineWidth = 4;
        ctx.setLineDash([15, 15]);
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw highway side barriers
        ctx.strokeStyle = '#141414';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(0, 25);
        ctx.lineTo(canvas.width, 25);
        ctx.moveTo(0, canvas.height - 25);
        ctx.lineTo(canvas.width, canvas.height - 25);
        ctx.stroke();

        // Draw nearby landscape markers representing rural surroundings
        ctx.fillStyle = '#141414';
        ctx.beginPath();
        ctx.arc(350, -40, 100, 0, Math.PI);
        ctx.fill();

        // Update and Draw vehicle objects
        const calculatedThreshold = confThreshold;
        
        const revisedCars = simCarsRef.current.map(car => {
          let newX = car.x + (car.speed * simulationSpeedMultiplier);
          if (newX > canvas.width + 100) {
            newX = -100; // warp around
          }
          
          // Draw car representation
          ctx.fillStyle = car.type === 'Truck' ? '#334155' : '#dc2626';
          const carY = car.lane === 1 ? 55 : 125;
          ctx.fillRect(newX, carY, car.type === 'Truck' ? 70 : 35, 20);

          // Vehicle Headlights glow projection at night
          if (luxValue < 30) {
            const glowGradient = ctx.createLinearGradient(newX + (car.type === 'Truck' ? 70 : 35), carY + 10, newX + 230, carY + 10);
            glowGradient.addColorStop(0, 'rgba(251, 191, 36, 0.65)');
            glowGradient.addColorStop(1, 'rgba(251, 191, 36, 0.0)');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.moveTo(newX + (car.type === 'Truck' ? 70 : 35), carY);
            ctx.lineTo(newX + 220, carY - 20);
            ctx.lineTo(newX + 220, carY + 40);
            ctx.closePath();
            ctx.fill();
          }

          // Inside tire markings
          ctx.fillStyle = '#000';
          ctx.fillRect(newX + 5, carY - 3, 8, 3);
          ctx.fillRect(newX + (car.type === 'Truck' ? 55 : 25), carY - 3, 8, 3);
          ctx.fillRect(newX + 5, carY + 20, 8, 3);
          ctx.fillRect(newX + (car.type === 'Truck' ? 55 : 25), carY + 20, 8, 3);

          return { ...car, x: newX };
        });
        simCarsRef.current = revisedCars;

        // Simulation cattle movement (Wandering cow onto road)
        let nextX = bovineXRef.current + (0.35 * bovineDirectionRef.current);
        if (nextX > 440) {
          bovineDirectionRef.current = -1;
        } else if (nextX < 140) {
          bovineDirectionRef.current = 1;
        }
        bovineXRef.current = nextX;

        // Custom appearance per city
        let bovineColor = '#b45309';
        let bovineLabel = 'bovine (Kangayam)';
        if (selectedCity === 'Madurai') {
          bovineColor = '#1f2937';
          bovineLabel = 'bull (Jallikattu)';
        } else if (selectedCity === 'Coimbatore') {
          bovineColor = '#4b5563';
          bovineLabel = 'bovine (Alambadi)';
        } else if (selectedCity === 'Kanchipuram') {
          bovineColor = '#e5e5e0';
          bovineLabel = 'bovine (Umblachery)';
        }

        // Draw wandering cow
        const bodyWidth = 42;
        const bodyHeight = 26;
        const currentBovineY = bovineYRef.current;
        ctx.fillStyle = bovineColor;
        ctx.fillRect(nextX, currentBovineY, bodyWidth, bodyHeight);
        
        // Cow head
        ctx.fillRect(nextX + (bovineDirectionRef.current > 0 ? bodyWidth : -10), currentBovineY - 6, 12, 14);
        // Horns representation
        ctx.fillStyle = selectedCity === 'Madurai' ? '#b45309' : '#141414'; // Jallikattu bull has larger sharper brown horns
        const hornHeight = selectedCity === 'Madurai' ? 12 : 8;
        const hornY = currentBovineY - hornHeight - 6;
        ctx.fillRect(nextX + (bovineDirectionRef.current > 0 ? bodyWidth + 6 : -8), hornY, 2, hornHeight);
        // Legs representation
        ctx.fillStyle = '#141414';
        ctx.fillRect(nextX + 4, currentBovineY + bodyHeight, 4, 10);
        ctx.fillRect(nextX + 14, currentBovineY + bodyHeight, 4, 10);
        ctx.fillRect(nextX + 24, currentBovineY + bodyHeight, 4, 10);
        ctx.fillRect(nextX + 34, currentBovineY + bodyHeight, 4, 10);

        // Tapetum Lucidum retina shine layer inside low-lux configurations as a high impact highlight
        if (luxValue <= 15) {
          ctx.fillStyle = '#22d3ee'; // bright cyan reflective retroreflection eyes
          ctx.beginPath();
          const eyeX = nextX + (bovineDirectionRef.current > 0 ? bodyWidth + 4 : -4);
          ctx.arc(eyeX, currentBovineY - 1, 3, 0, 2 * Math.PI);
          ctx.fill();
          // Add circular radial glow to simulate lens refraction
          const eyeGlow = ctx.createRadialGradient(eyeX, currentBovineY - 1, 1, eyeX, currentBovineY - 1, 15);
          eyeGlow.addColorStop(0, 'rgba(34, 211, 238, 0.8)');
          eyeGlow.addColorStop(1, 'rgba(34, 211, 238, 0.0)');
          ctx.fillStyle = eyeGlow;
          ctx.beginPath();
          ctx.arc(eyeX, currentBovineY - 1, 15, 0, 2 * Math.PI);
          ctx.fill();
        }

        // EVALUATING CATTLE BOUNDARIES //
        // Check if cow enters warning zone bounds (y axis intersection with general road)
        const isBovineOnAsphalt = currentBovineY > 15 && currentBovineY < canvas.height - 25;
        
        if (isBovineOnAsphalt) {
          // AI detection simulation parameters
          // When low light correction is enabled, confidence holds tight even at 10 lux.
          // Under low thresholds and disabled corrections, confidence drops under dark noise.
          let baseConfidence = 96.4;
          if (luxValue < 20) {
            if (!lowLightCorrection) {
              baseConfidence = Math.max(30, Math.round(96 - (30 - luxValue) * 4));
            } else {
              baseConfidence = 93.8; // compensated
            }
          }

          // Track gait velocity simulation
          // Slow gait is standard. If false-positive triggers lookalike, gait speed shows filter rejection
          const qualifiesConfidence = baseConfidence >= calculatedThreshold;

          if (qualifiesConfidence) {
            if (!lastIsCattleActiveInSim.current) {
              lastIsCattleActiveInSim.current = true;
              setIsCattleActiveInSim(true);
            }
            if (lastCurrentBovineConfidence.current !== baseConfidence) {
              lastCurrentBovineConfidence.current = baseConfidence;
              setCurrentBovineConfidence(baseConfidence);
            }

            // Save Snapshot if confidence > 90%
            if (baseConfidence >= 90.0) {
              if (!hasSavedSnapshotForCurrentEventRef.current) {
                hasSavedSnapshotForCurrentEventRef.current = true;
                const savedConfidence = baseConfidence;
                const savedLabel = bovineLabel;
                setTimeout(() => {
                  triggerSnapshotCapture(savedConfidence, savedLabel);
                }, 100);
              }
            }

            // Render YOLO bounding box
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#dc2626'; // Alert Crimson standard
            ctx.strokeRect(nextX - 10, currentBovineY - 18, bodyWidth + 24, bodyHeight + 38);
            
            // Draw Class metadata tag
            const labelText = `${bovineLabel} [${baseConfidence.toFixed(1)}%]`;
            const tagWidth = Math.max(95, labelText.length * 6.2 + 8);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(nextX - 10, currentBovineY - 42, tagWidth, 24);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px monospace';
            ctx.fillText(labelText, nextX - 5, currentBovineY - 26);

            // On-Screen system status
            ctx.strokeStyle = 'rgba(220, 38, 38, 0.4)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(nextX + (bodyWidth / 2), 0);
            ctx.lineTo(nextX + (bodyWidth / 2), canvas.height);
            ctx.stroke();
            ctx.setLineDash([]);
          } else {
            if (lastIsCattleActiveInSim.current) {
              lastIsCattleActiveInSim.current = false;
              setIsCattleActiveInSim(false);
            }
            hasSavedSnapshotForCurrentEventRef.current = false;
            // Highlight rejected/suppressed box as yellow dotted
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#eab308'; // Warning gold representing skipped candidate frame
            ctx.setLineDash([3, 3]);
            ctx.strokeRect(nextX - 10, currentBovineY - 18, bodyWidth + 24, bodyHeight + 38);
            ctx.setLineDash([]);
            ctx.fillStyle = '#eab308';
            ctx.fillRect(nextX - 10, currentBovineY - 38, 120, 18);
            ctx.fillStyle = '#141414';
            ctx.font = 'bold 9px monospace';
            ctx.fillText(`LOW CONFIDENCE [${baseConfidence.toFixed(1)}%]`, nextX - 5, currentBovineY - 26);
          }
        } else {
          if (lastIsCattleActiveInSim.current) {
            lastIsCattleActiveInSim.current = false;
            setIsCattleActiveInSim(false);
          }
          hasSavedSnapshotForCurrentEventRef.current = false;
        }
      } else if (isWebcam) {
        // --- DRAW REAL-TIME WEBCAM ANALYZER SCENE ---
        const video = webcamVideoRef.current!;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          // 1. Draw mirrored stream on canvas (fits standard coordinate frame)
          ctx.save();
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.restore();

          // 2. Perform Real-Time Local Contrast & Room Illuminance (Lux) Analysis
          const frameWidth = canvas.width;
          const frameHeight = canvas.height;
          const frameData = ctx.getImageData(0, 0, frameWidth, frameHeight);
          const pixels = frameData.data;

          // Sample pixels to compute real physical room Lux levels dynamically!
          let totalLum = 0;
          let samplesCount = 0;
          for (let i = 0; i < pixels.length; i += 400) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            totalLum += (0.299 * r + 0.587 * g + 0.114 * b);
            samplesCount++;
          }
          const avgLuminance = samplesCount > 0 ? (totalLum / samplesCount) : 100;
          // Scale from normalized intensity (0-255) to realistic Lux metrics (1-100 Lux)
          const roomLux = Math.max(1, Math.min(100, Math.round((avgLuminance / 255) * 100)));

          // Throttle state updates to prevent triggering heavy React render cycles
          frameCounterRef.current++;
          if (frameCounterRef.current % 15 === 0) {
            setLuxValue(roomLux);
          }

          // Apply low light correction / digital infrared matrix if room is dim
          if (luxValue <= 15) {
            if (lowLightCorrection) {
              // Digital gain: apply subtle cyan infrared overlay and visual grid lines
              ctx.fillStyle = "rgba(6, 182, 212, 0.12)";
              ctx.fillRect(0, 0, frameWidth, frameHeight);
              
              ctx.strokeStyle = "rgba(34, 211, 238, 0.25)";
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              for (let y = 30; y < frameHeight; y += 40) {
                ctx.moveTo(0, y);
                ctx.lineTo(frameWidth, y);
              }
              ctx.stroke();
            } else {
              // Dim the video frame representation to emphasize low-illumination noise
              ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
              ctx.fillRect(0, 0, frameWidth, frameHeight);
            }
          }

          // 3. Grid-based motion flow tracker to pinpoint dynamic anomalies (representing bovine steps!)
          const gridCols = 8;
          const gridRows = 6;
          const colWidth = frameWidth / gridCols;
          const rowHeight = frameHeight / gridRows;
          const currentGridLuminance: number[] = [];

          for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < gridCols; c++) {
              let blockLumSum = 0;
              let blockPixelsCount = 0;
              const startX = Math.floor(c * colWidth);
              const startY = Math.floor(r * rowHeight);

              for (let y = startY; y < startY + rowHeight; y += 4) {
                for (let x = startX; x < startX + colWidth; x += 4) {
                  const idx = (y * frameWidth + x) * 4;
                  if (idx < pixels.length) {
                    blockLumSum += (0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2]);
                    blockPixelsCount++;
                  }
                }
              }
              currentGridLuminance.push(blockPixelsCount > 0 ? (blockLumSum / blockPixelsCount) : 0);
            }
          }

          // Grid delta comparison to isolate motion blocks
          let activeAnomaliesCount = 0;
          let minCol = gridCols;
          let maxCol = 0;
          let minRow = gridRows;
          let maxRow = 0;

          if (prevGridLuminanceRef.current.length === currentGridLuminance.length) {
            for (let i = 0; i < currentGridLuminance.length; i++) {
              const delta = Math.abs(currentGridLuminance[i] - prevGridLuminanceRef.current[i]);
              if (delta > 15) { // Motion sensitivity threshold
                const r = Math.floor(i / gridCols);
                const c = i % gridCols;
                if (c < minCol) minCol = c;
                if (c > maxCol) maxCol = c;
                if (r < minRow) minRow = r;
                if (r > maxRow) maxRow = r;
                activeAnomaliesCount++;
              }
            }
          }
          prevGridLuminanceRef.current = currentGridLuminance;

          // Resolve entity location coordinates
          let hasLiveTarget = false;
          let boundingBox = { x: 0, y: 0, w: 0, h: 0 };
          let targetConfidence = 0;

          // Support interactive point-locking first
          const lockedTarget = webcamLockPointRef.current;
          if (lockedTarget) {
            boundingBox = {
              x: Math.max(10, lockedTarget.x - 70),
              y: Math.max(10, lockedTarget.y - 65),
              w: 140,
              h: 130
            };
            hasLiveTarget = true;
            targetConfidence = Math.round(92.4 + (luxValue > 15 ? 4.2 : -5.4));
          } else if (activeAnomaliesCount >= 2) {
            // Motion clusters resolved
            const boxX = minCol * colWidth;
            const boxY = minRow * rowHeight;
            const boxW = (maxCol - minCol + 1) * colWidth;
            const boxH = (maxRow - minRow + 1) * rowHeight;

            if (boxW > 45 && boxH > 45 && boxW < 520) {
              boundingBox = { x: boxX, y: boxY, w: boxW, h: boxH };
              hasLiveTarget = true;
              targetConfidence = Math.min(97.8, Math.max(45, Math.round(75 + (activeAnomaliesCount * 1.5) + (luxValue / 5))));
            }
          }

          // Evaluate YOLO alerts on webcam frame
          if (hasLiveTarget) {
            const meetsConfidenceThreshold = targetConfidence >= confThreshold;

            if (meetsConfidenceThreshold) {
              // Trigger global safety alerts in real-time
              if (!lastIsCattleActiveInSim.current) {
                lastIsCattleActiveInSim.current = true;
                setIsCattleActiveInSim(true);
              }
              if (lastCurrentBovineConfidence.current !== targetConfidence) {
                lastCurrentBovineConfidence.current = targetConfidence;
                setCurrentBovineConfidence(targetConfidence);
              }

              // Save snapshot if confidence is > 90%
              if (targetConfidence >= 90.0) {
                if (!hasSavedSnapshotForCurrentEventRef.current) {
                  hasSavedSnapshotForCurrentEventRef.current = true;
                  const savedConfidence = targetConfidence;
                  setTimeout(() => {
                    triggerSnapshotCapture(savedConfidence, 'bovine');
                  }, 100);
                }
              }

              // Draw high-visibility active YOLO Red Box
              ctx.lineWidth = 3;
              ctx.strokeStyle = '#dc2626';
              ctx.strokeRect(boundingBox.x, boundingBox.y, boundingBox.w, boundingBox.h);

              // YOLO category bar
              ctx.fillStyle = '#dc2626';
              ctx.fillRect(boundingBox.x, boundingBox.y - 25, 140, 25);
              ctx.fillStyle = '#fff';
              ctx.font = 'bold 11px monospace';
              ctx.fillText(`bovine [${targetConfidence.toFixed(1)}%]`, boundingBox.x + 6, boundingBox.y - 8);

              // Tapetum reflective virtual eye tracking (cyan crosshairs on target center!)
              const centerX = boundingBox.x + boundingBox.w / 2;
              const centerY = boundingBox.y + boundingBox.h / 3;
              
              ctx.fillStyle = '#22d3ee';
              ctx.beginPath();
              ctx.arc(centerX - 15, centerY, 4, 0, 2 * Math.PI);
              ctx.arc(centerX + 15, centerY, 4, 0, 2 * Math.PI);
              ctx.fill();

              // Lens retroreflection animation glow
              ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(centerX - 15, centerY, 12, 0, 2 * Math.PI);
              ctx.arc(centerX + 15, centerY, 12, 0, 2 * Math.PI);
              ctx.stroke();

              // Spatial alignment lines
              ctx.strokeStyle = 'rgba(220, 38, 38, 0.35)';
              ctx.lineWidth = 1;
              ctx.setLineDash([5, 5]);
              ctx.beginPath();
              ctx.moveTo(centerX, 0);
              ctx.lineTo(centerX, frameHeight);
              ctx.stroke();
              ctx.setLineDash([]);
            } else {
              // Low Confidence suppressed candidate box
              if (lastIsCattleActiveInSim.current) {
                lastIsCattleActiveInSim.current = false;
                setIsCattleActiveInSim(false);
              }
              hasSavedSnapshotForCurrentEventRef.current = false;

              ctx.lineWidth = 2;
              ctx.strokeStyle = '#eab308'; // Amber Gold
              ctx.setLineDash([3, 3]);
              ctx.strokeRect(boundingBox.x, boundingBox.y, boundingBox.w, boundingBox.h);
              ctx.setLineDash([]);

              ctx.fillStyle = '#eab308';
              ctx.fillRect(boundingBox.x, boundingBox.y - 25, 150, 25);
              ctx.fillStyle = '#141414';
              ctx.font = 'bold 10px monospace';
              ctx.fillText(`LOW CONFIDENCE [${targetConfidence.toFixed(1)}%]`, boundingBox.x + 6, boundingBox.y - 8);
            }
          } else {
            // Calm webcam frame
            if (lastIsCattleActiveInSim.current) {
              lastIsCattleActiveInSim.current = false;
              setIsCattleActiveInSim(false);
            }
            hasSavedSnapshotForCurrentEventRef.current = false;
          }
        } else {
          // webcam source initialized but frames pending
          ctx.fillStyle = '#141414';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.font = "12px monospace";
          ctx.fillStyle = "#fff";
          ctx.textAlign = "center";
          ctx.fillText("WAITING FOR LIVE WEBCAM VIDEO BUFFER...", canvas.width/2, canvas.height/2);
        }
      } else {
        // Fallback placeholder black screen
        ctx.fillStyle = '#141414';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cameraSource, webcamActive, luxValue, confThreshold, simulationSpeedMultiplier, lowLightCorrection, selectedCity, selectedCorridor]);

  // Alert simulation triggers
  useEffect(() => {
    let interval: any;
    if (isCattleActiveInSim) {
      setActiveAlert(true);
      playSirenSynthesizer();
      interval = setInterval(() => {
        playSirenSynthesizer();
      }, 900);
    } else {
      setActiveAlert(false);
    }
    return () => clearInterval(interval);
  }, [isCattleActiveInSim, soundEnabled]);

  // Log automated event creator based on collision warnings
  useEffect(() => {
    if (activeAlert) {
      // Avoid duplicated alert records in immediate succession
      const lastEntry = logs[0];
      const secondsSinceLast = lastEntry ? (Date.now() - new Date(lastEntry.timestamp).getTime()) / 1000 : 999;
      
      if (secondsSinceLast > 12) {
        const uniqueId = `BG-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random() * 10000)}`;
        const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
        
        const newLog: LogEntry = {
          id: uniqueId,
          timestamp: dateStr,
          cameraId: "CAM-SH77-CHENGAM-01",
          location: selectedCorridor,
          confidence: currentBovineConfidence > 0 ? parseFloat(currentBovineConfidence.toFixed(1)) : 94.8,
          luxLevel: luxValue,
          lowLightCompensated: lowLightCorrection,
          status: 'PENDING',
          actionTaken: "Bovine retina glow matched. LED Road studs strobe triggered over LoRa (868MHz). Fast truck decelerated from 92km/h to 35km/h.",
          snapshotDataUrl: "eyes"
        };
        
        // Add log entry
        setLogs(prev => [newLog, ...prev]);
        setActiveAlertLogEntry(newLog);
      }
    }
  }, [activeAlert]);

  // Manual Trigger injecter for quick testing during judge presentation
  const triggerManualCattleDetection = () => {
    bovineYRef.current = 75; // Walk cow right onto the central lane of the roadway!
    setLuxValue(Math.round(2 + Math.random() * 8)); // Drop lux to force nocturnal configuration
    setSysLatency(11);
    setFpsVal(29);
  };

  const resetSimCattleLocation = () => {
    bovineYRef.current = -5; // clear cow outside of roadways safely
    if (lastIsCattleActiveInSim.current) {
      lastIsCattleActiveInSim.current = false;
      setIsCattleActiveInSim(false);
    }
    setActiveAlert(false);
  };

  // Turn on actual webcam hardware stream if requested
  const enableWebcam = async () => {
    setCameraSource('webcam');
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      streamRef.current = stream;
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
      }
      setWebcamActive(true);
      setFpsVal(30);
      setSysLatency(8); // low-latency local processing stream
    } catch (e: any) {
      console.error(e);
      setCameraError("Hardware webcam blocked or disconnected. Reverted to high-fidelity procedural highway corridor.");
      setCameraSource('simulation');
    }
  };

  const disableWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setWebcamActive(false);
    setCameraSource('simulation');
  };

  // Auto clean tracks on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Format currency
  const formatINR = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Crores`;
    }
    return `₹${(value / 100000).toFixed(1)} Lakhs`;
  };

  // Dynamic values calculation for aggregate summary
  const statistics = useMemo(() => {
    const totalDetections = logs.length;
    const mitigatedAccidents = logs.filter(l => l.status === 'MITIGATED' || l.status === 'PENDING').length;
    const cleanAccuracy = 96.8;
    const savedCattleCost = mitigatedAccidents * 55000;
    return {
      totalDetections,
      mitigatedAccidents,
      cleanAccuracy,
      savedCattleCost
    };
  }, [logs]);

  // Export database dataset logs as static CSV file for offline validation
  const exportLogsAsCSV = () => {
    const header = "id,timestamp,cameraId,location,confidence,luxLevel,lowLightCompensated,status,actionTaken\n";
    const rows = logs.map(l => {
      return `"${l.id}","${l.timestamp}","${l.cameraId}","${l.location}",${l.confidence},${l.luxLevel},${l.lowLightCompensated},"${l.status}","${l.actionTaken.replace(/"/g, '""')}"`;
    }).join("\n");
    
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `boviguard_sqlite_dataset_logs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Seed raw sqlite simulation values
  const seedNewMockAccidentLog = () => {
    const cameraIds = ["CAM-GIRI-OUTER-02", "CAM-SH77-CHENGAM-04", "CAM-SH9-PONDY-01", "CAM-TEMPLE-STREET-01"];
    const locations = [
      "Girivalam Path Outer Ring",
      "NH-77 Highway Corridor (Chengam Road)",
      "Pondy-Krishnagiri Highway (SH-9 intersection)",
      "Annamalaiyar Temple Periphery Routes"
    ];
    const indexStr = Math.floor(Math.random() * locations.length);
    const uniqueId = `BG-SEC-${Date.now().toString().slice(-4)}`;
    
    const seededLog: LogEntry = {
      id: uniqueId,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      cameraId: cameraIds[indexStr],
      location: locations[indexStr],
      confidence: parseFloat((82 + Math.random() * 15).toFixed(1)),
      luxLevel: parseFloat((3 + Math.random() * 45).toFixed(1)),
      lowLightCompensated: Math.random() > 0.3,
      status: 'MITIGATED',
      actionTaken: "Dynamic low-lux illumination matched. Edge inference triggered LoRa studs. Audible localized tone activated.",
      snapshotDataUrl: "bovine_spotted"
    };

    setLogs(prev => [seededLog, ...prev]);
  };

  // Erase database logs safely
  const clearDatabaseLogs = () => {
    setLogs([]);
  };

  // Resolve pending statuses (mitigate cows manually)
  const resolveCattleStatus = (id: string, newStatus: 'MITIGATED' | 'FALSE_POSITIVE_BLOCKED') => {
    setLogs(prev => prev.map(log => {
      if (log.id === id) {
        return {
          ...log,
          status: newStatus,
          actionTaken: newStatus === 'MITIGATED' 
            ? "Mitigation protocol logged completely: Highway warning indicators reset. Area normal."
            : "False positive filter validated. Disregarded warning state logs."
        };
      }
      return log;
    }));
  };

  // Structured production code templates for copying in hackathon format
  const technicalComponents: TechComponent[] = [
    {
      filename: "main.py",
      language: "python",
      description: "Edge pipeline rendering live video frame, resizing, predicting via YOLOv8, running high-frequency eye-glow heuristics, and triggering DB logging.",
      code: `import cv2
import time
import sqlite3
import numpy as np
from ultralytics import YOLO

# BOVIGUARD Core Real-Time Edge Pipeline
# Optimized for high speed inference (<12ms) on Intel CPUs or ARM Single-Board Nodes

# Connect to database logs
DB_FILE = "boviguard_events.db"
onnx_model = "boviguard_yolov8s_quant_int8.onnx" # Pruned & Compiled ONNX 

print("[SYSTEM] Initializing BOVIGUARD Deep Edge Kernel...")
db_conn = sqlite3.connect(DB_FILE)
cursor = db_conn.cursor()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS cattle_logs (
        id TEXT PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        camera_id TEXT,
        confidence REAL,
        lux_level REAL,
        action_triggered TEXT
    )
''')
db_conn.commit()

# Initialize YOLO model (compiled ONNX format for raw optimization CPU speedups)
model = YOLO(onnx_model, task='detect')

# Setup Camera Stream (RTSP or internal USB webcam input)
camera_path = 0 # Defaults to system hardware webcam for tests
cap = cv2.VideoCapture(camera_path)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

CONFIDENCE_THRESHOLD = 0.75
FALSE_ALARM_GAIT_MULTIPLIER = 1.2

print("[INFO] Boviguard Core engine is standard online! Press [Q] inside loop screen to exit.")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("[WARN] Low-frame drop detected inside incoming buffer. Retrying...")
        time.sleep(0.05)
        continue
        
    start_time = time.time()
    
    # Calculate screen Lux luminosity (Nocturnal compensator)
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    average_brightness = np.mean(gray_frame)
    
    # Apply local luminance equalization if illumination drops below 15 Lux
    if average_brightness < 15.0:
        # Prevent blind darkness tracking by applying Contrast Limited Adaptive Histogram Equalization
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        equalized_gray = clahe.apply(gray_frame)
        processed_frame = cv2.cvtColor(equalized_gray, cv2.COLOR_GRAY2BGR)
        is_low_light_compensated = True
    else:
        processed_frame = frame
        is_low_light_compensated = False
        
    # Execute quantized YOLO inference pipeline
    results = model.predict(processed_frame, verbose=False, imgsz=320, conf=CONFIDENCE_THRESHOLD)
    
    cows_detected = 0
    for r in results:
        boxes = r.boxes
        for box in boxes:
            cls_id = int(box.cls[0])
            # YOLO Class ID for Cow = 19 (in standard COCO dataset references)
            if cls_id == 19:
                conf = float(box.conf[0])
                xyxy = box.xyxy[0].cpu().numpy().astype(int)
                
                # Retrieve bounding coordinates
                x1, y1, x2, y2 = xyxy
                cows_detected += 1
                
                # Draw bounding warning boxes and parameters overlay
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 3)
                label = f"BOVINE: {conf*100:.1f}% (Lux: {average_brightness:.1f})"
                cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.53, (255, 255, 255), 2)
                
                # Core active action logic
                print(f"[COLLISION WARNING] Cattle obstacle tracked! Confidence {conf:.2f}")
                
                # Save instant snapshot details to local SQLite logging DB 
                event_id = f"BG-{int(time.time())}"
                cursor.execute(
                    "INSERT INTO cattle_logs VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?)",
                    (event_id, "CAM-SH77-CHENGAM-01", conf * 100, average_brightness, "LoRa Warn-stud strobe triggered")
                )
                db_conn.commit()
                
    # Calculate latency diagnostics
    latency = (time.time() - start_time) * 1000
    cv2.putText(frame, f"BOVIGUARD CORE - Latency: {latency:.1f}ms - FPS: {1000/latency:.1f}", 
                (15, 30), cv2.FONT_HERSHEY_PLAIN, 1.2, (0, 255, 0), 2)
                
    # Show active stream feed
    cv2.imshow("BOVIGUARD Real-time Cattle Detection Terminal", frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
db_conn.close()
print("[INFO] Boviguard Session logged out cleanly.")`
    },
    {
      filename: "database_setup.py",
      language: "python",
      description: "Flawless lightweight SQL schema optimized with secondary indices to perform hyper-fast spatial search lookups.",
      code: `import sqlite3

def run_database_seed():
    """
    Sets up SQLite table structure for local logging of Boviguard cattle collision safety anomalies.
    Implements optimized indexes for chronological threat queries.
    """
    db_file = "boviguard_events.db"
    print(f"[DB] Initializing database file context: {db_file}")

    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    # Create Core logging structure
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cattle_collisions_logs (
            id TEXT PRIMARY KEY,
            camera_id TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            confidence_score REAL NOT NULL,
            ambient_lux REAL,
            low_light_corrected INTEGER,
            mitigation_status TEXT DEFAULT 'PENDING',
            action_taken TEXT
        )
    ''')

    # Create indexes to support low latency queries inside regional highway police reports
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_timestamp 
        ON cattle_collisions_logs (timestamp DESC)
    ''')
    
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_camera_threat
        ON cattle_collisions_logs (camera_id, confidence_score)
    ''')

    # Seed initial test entries for live deployment showcase
    cursor.execute("DELETE FROM cattle_collisions_logs") # Clean reset
    
    dummy_entries = [
        ("BG-T1", "CAM-SH77-CHENGAM-01", "2026-06-18 20:10:00", 94.2, 5.2, 1, "MITIGATED", "Activated Solar Road Strobe Light in NH-77"),
        ("BG-T2", "CAM-GIRI-OUTER-03", "2026-06-18 21:05:33", 88.7, 34.0, 0, "MITIGATED", "Alert pushed to local pilgrimage guard watch"),
        ("BG-T3", "CAM-SH9-PONDY-02", "2026-06-18 22:30:11", 62.1, 12.1, 1, "FALSE_POSITIVE_BLOCKED", "Dog candidate gait match suppressed alert")
    ]
    
    cursor.executemany("INSERT INTO cattle_collisions_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?)", dummy_entries)
    conn.commit()

    # Query verification
    cursor.execute("SELECT COUNT(*) FROM cattle_collisions_logs")
    count = cursor.fetchone()[0]
    print(f"[DB SUCCESS] Seeded SQLite successfully. Row count verified: {count} active records.")
    
    conn.close()

if __name__ == "__main__":
    run_database_seed()`
    },
    {
      filename: "hardware_test.py",
      language: "python",
      description: "Handles integration to dynamic warning indicators (e.g. flashing LEDs on smart solar road studs) over Serial/Sub-GHz LoRa channels.",
      code: `import time
import sys

def trigger_roadside_warning_studs(camera_id, distance_m=200):
    """
    Sub-GHz LoRa message relay simulator.
    Sends lightweight non-IP byte codes to solar smart road warning indicators
    mounted 200m ahead of the cattle obstacle.
    """
    print(f"\\n[LoRa TX] Broadcasting threat from camera: {camera_id}")
    print(f"[hardware] Command: SET_PIN_STROBE_HIGH")
    print(f"[hardware] Target: Road Warning Studs at distance {distance_m} meters")
    print("[hardware] Status: Pulse modulation triggered. Freq: 5Hz (High-Visibility strobe)")
    
    # Emulate the hardware serial transfer protocol over localized RF bands
    for count in range(1, 6):
        sys.stdout.write(f"\\r[strobe flashing] Cycle {count}/5 - Warn state active...")
        sys.stdout.flush()
        time.sleep(0.3)
        
    print(f"\\n[LoRa TX] Collision threats normalized. Smart indicators reset to standby mode.\\n")

if __name__ == "__main__":
    test_cam = "CAM-SH77-CHENGAM-01"
    trigger_roadside_warning_studs(test_cam)`
    },
    {
      filename: "requirements.txt",
      language: "text",
      description: "Pinned dependencies used inside Python execution environment to guarantee stability on ARM computers.",
      code: `ultralytics>=8.1.0
opencv-python-headless>=4.8.1.78
numpy>=1.24.3
pyserial>=3.5
argparse>=1.1`
    }
  ];

  // Active file inside code exporter
  const [selectedFilename, setSelectedFilename] = useState<string>("main.py");
  const activeCodeFile = technicalComponents.find(t => t.filename === selectedFilename) || technicalComponents[0];
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => {
      setCopyFeedback(false);
    }, 2000);
  };

  // State for Q&A practice
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(JUDGE_QUESTIONS[0].id);
  const [activeQASegment, setActiveQASegment] = useState<'hook' | 'tech' | 'gov' | 'metrics'>('hook');
  const selectedQuestion = JUDGE_QUESTIONS.find(q => q.id === selectedQuestionId) || JUDGE_QUESTIONS[0];

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans antialiased selection:bg-[#141414] selection:text-[#E4E3E0]">
      
      {/* Start Stark Minimalist Header Banner */}
      <div id="top-banner" className="bg-[#141414] text-[#E4E3E0] py-2.5 px-4 text-center text-xs tracking-wider uppercase font-mono flex flex-wrap items-center justify-center gap-2 border-b border-neutral-800">
        <span className="inline-block w-2 h-2 bg-red-600 rounded-full animate-pulse" />
        <span className="font-bold">BOVIGUARD ACCELERATOR LABS</span>
        <span className="opacity-40">|</span>
        <span>YOLOv8 REAL-TIME WEB CAMERA & INDUSTRIAL EMULATOR</span>
        <span className="opacity-40">|</span>
        <span className="text-emerald-400 font-bold">STATE COLLISION PREVENTION FRAMEWORK</span>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Header Section conforming strictly to layout and style specification */}
        <header id="main-header" className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#141414] pb-5 gap-6">
          <div className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-widest opacity-60">Edge Computing Solution / Tamil Nadu Road Safety</p>
            <h1 className="text-4xl md:text-5xl font-black uppercase leading-none tracking-tighter">PROJECT BOVIGUARD</h1>
            <p className="text-sm font-mono opacity-80 mt-1">
              Real-Time Cattle Detection Node &bull; Native Hardware Setup for <strong className="font-bold underline">{selectedCity} District Rollout</strong>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white border-2 border-[#141414] p-3 shadow-[3px_3px_0px_0px_#141414]">
            <div className="space-y-0.5" id="siren-status-badge">
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">SIREN AUDIO OUTPUT</span>
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-xs font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer text-left"
              >
                {soundEnabled ? (
                  <span className="text-emerald-700 flex items-center gap-1">🔊 SYNTH AUDIO MASTER ON</span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">🔇 SYNTH AUDIO SILENT</span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Global Flashing Siren Warning Banner overlaying the layout if active cattle detection triggered */}
        <AnimatePresence>
          {activeAlert && (
            <motion.div 
              id="active-alarm-banner"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-600 border-4 border-[#141414] p-4 text-[#E4E3E0] flex flex-col md:flex-row items-center justify-between gap-4 shadow-[4px_4px_0px_0px_#141414] animate-pulse"
            >
              <div className="flex items-center gap-3">
                <Siren className="w-10 h-10 text-white animate-spin flex-shrink-0" />
                <div>
                  <h3 className="text-lg md:text-xl font-black tracking-widest uppercase">⚠️ BOVINE INTRUSION DETECTED ⚠️</h3>
                  <p className="text-xs font-mono text-red-100 uppercase tracking-wider">
                    {selectedCorridor} &bull; CONFIDENCE: {currentBovineConfidence.toFixed(1)}% &bull; INTRUSION LATENCY: 12ms
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-[#141414] text-emerald-400 font-mono text-xs px-3 py-1.5 border border-emerald-400">
                  ⚡ LORA STUDS INJECTED
                </div>
                <button
                  onClick={resetSimCattleLocation}
                  className="px-4 py-1.5 bg-white text-[#141414] hover:bg-neutral-200 border-2 border-[#141414] text-xs font-black font-mono uppercase tracking-wider transition cursor-pointer"
                >
                  DISMISS ALERTS & RESET
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Aggregated Metrics Row representing real SQLite status metrics */}
        <div id="statistics-cards-row" className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white border-2 border-[#141414] p-4 relative shadow-[3px_3px_0px_0px_#141414]">
            <span className="text-[9px] font-mono text-gray-500 uppercase block mb-1">TOTAL THREAT LOGS</span>
            <strong className="text-2xl font-black text-[#141414] font-mono block">
              {statistics.totalDetections}
            </strong>
            <span className="text-[10px] text-gray-500 font-mono block mt-1">SQLite Saved Rows</span>
          </div>

          <div className="bg-white border-2 border-[#141414] p-4 relative shadow-[3px_3px_0px_0px_#141414]">
            <span className="text-[9px] font-mono text-gray-500 uppercase block mb-1">AUDITED YOLO ACCURACY</span>
            <strong className="text-2xl font-black text-emerald-700 font-mono block">
              {statistics.cleanAccuracy}%
            </strong>
            <span className="text-[10px] text-gray-500 font-mono block mt-1">94% Target night rate</span>
          </div>

          <div className="bg-white border-2 border-[#141414] p-4 relative shadow-[3px_3px_0px_0px_#141414]">
            <span className="text-[9px] font-mono text-gray-500 uppercase block mb-1">CATTLE ACCIDENTS MITIGATED</span>
            <strong className="text-2xl font-black text-[#141414] font-mono block">
              {statistics.mitigatedAccidents}
            </strong>
            <span className="text-[10px] text-emerald-700 font-mono block mt-1 font-bold">100% warning rate</span>
          </div>

          <div className="bg-white border-2 border-[#141414] p-4 relative shadow-[3px_3px_0px_0px_#141414]">
            <span className="text-[9px] font-mono text-gray-500 uppercase block mb-1">LIVESTOCK CAPITAL PRESERVED</span>
            <strong className="text-2xl font-black text-emerald-700 font-mono block">
              {formatINR(statistics.savedCattleCost)}
            </strong>
            <span className="text-[10px] text-gray-500 font-mono block mt-1">₹55K value per Kangayam cow</span>
          </div>
        </div>

        {/* Main Dashboard Navigation Bar */}
        <div id="navigation-tabs" className="bg-white border-2 border-[#141414] p-1.5 shadow-[3px_3px_0px_0px_#141414] flex flex-wrap gap-1">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`flex-1 py-3 px-2 text-center text-xs font-mono font-bold tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 min-w-[150px] cursor-pointer ${
              activeSection === 'dashboard' 
                ? 'bg-[#141414] text-[#E4E3E0] border border-[#141414]' 
                : 'text-[#141414] hover:bg-gray-100 border border-transparent'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>1. LIVE FEED PROCESSOR</span>
          </button>

          <button
            onClick={() => setActiveSection('logs')}
            className={`flex-1 py-3 px-2 text-center text-xs font-mono font-bold tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 min-w-[150px] cursor-pointer ${
              activeSection === 'logs' 
                ? 'bg-[#141414] text-[#E4E3E0] border border-[#141414]' 
                : 'text-[#141414] hover:bg-gray-100 border border-transparent'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>2. SQLITE DATA LOGS ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('code')}
            className={`flex-1 py-3 px-2 text-center text-xs font-mono font-bold tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 min-w-[150px] cursor-pointer ${
              activeSection === 'code' 
                ? 'bg-[#141414] text-[#E4E3E0] border border-[#141414]' 
                : 'text-[#141414] hover:bg-gray-100 border border-transparent'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>3. PYTHON SOURCE & EXPORTS</span>
          </button>

          <button
            onClick={() => setActiveSection('arguments')}
            className={`flex-1 py-3 px-2 text-center text-xs font-mono font-bold tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 min-w-[150px] cursor-pointer ${
              activeSection === 'arguments' 
                ? 'bg-[#141414] text-[#E4E3E0] border border-[#141414]' 
                : 'text-[#141414] hover:bg-gray-100 border border-transparent'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>4. PITCH ARGUMENTS LAB</span>
          </button>

          <button
            onClick={() => {
              setActiveSection('gallery');
              refreshSnapshotsList();
            }}
            className={`flex-1 py-3 px-2 text-center text-xs font-mono font-bold tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 min-w-[150px] cursor-pointer ${
              activeSection === 'gallery' 
                ? 'bg-[#141414] text-[#E4E3E0] border border-[#141414]' 
                : 'text-[#141414] hover:bg-gray-100 border border-transparent'
            }`}
          >
            <Images className="w-4 h-4 text-cyan-400" />
            <span>5. ALERTS GALLERY ({snapshots.length})</span>
          </button>
        </div>

        {/* Primary Functional Content Block */}
        <main className="bg-white border-2 border-[#141414] p-6 shadow-[6px_6px_0px_0px_#141414] min-h-[550px]">
          
          {/* TAB 1: LIVE FEED COGNITIVE PROCESSOR */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Layout description */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight text-[#141414] flex items-center gap-2">
                    <Terminal className="text-[#141414]" /> Dynamic YOLOv8 Optical Stream Emulator
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    Real-time frame ingestion pipeline. Supports simulated corridor cameras or raw local WebRTC camera input.
                  </p>
                </div>
                
                {/* Manual control levers */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={triggerManualCattleDetection}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-mono uppercase tracking-wider border-2 border-[#141414] cursor-pointer shadow-[2px_2px_0px_0px_#141414] active:translate-x-0 active:translate-y-0 active:shadow-none transition"
                  >
                    🚶‍♂️ Inject Simulated Wandering Bovine
                  </button>
                  <button
                    onClick={resetSimCattleLocation}
                    className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-[#141414] text-xs font-bold font-mono uppercase tracking-wider border-2 border-[#141414] cursor-pointer transition"
                  >
                    🔄 Clear Corridor
                  </button>
                </div>
              </div>

              {/* MULTI-CITY SIMULATION ZONE SELECTOR */}
              <div className="bg-[#141414] text-white p-4 border-2 border-[#141414] flex flex-col md:flex-row items-center justify-between gap-4 shadow-[4px_4px_0px_0px_#141414]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-900 border border-neutral-700 text-cyan-400">
                    <MapPin className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#E4E3E0]">ACTIVE SYSTEM EMULATION CITY / REGION</div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      Switching cities swaps localized GIS maps, neural weights, and indigenous pasture breeds in real time.
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  {Object.keys(CITIES_DATA).map((cityName) => (
                    <button
                      key={cityName}
                      onClick={() => {
                        setSelectedCity(cityName);
                        const firstCorridor = Object.keys(CITIES_DATA[cityName].corridors)[0];
                        setSelectedCorridor(firstCorridor);
                        setIsCattleActiveInSim(false);
                        setActiveAlert(false);
                        setCurrentBovineConfidence(0);
                        lastIsCattleActiveInSim.current = false;
                        lastCurrentBovineConfidence.current = 0;
                        bovineXRef.current = 310;
                        bovineYRef.current = 160;
                      }}
                      className={`flex-1 md:flex-initial px-4 py-2 font-mono text-xs font-black uppercase border transition cursor-pointer select-none ${
                        selectedCity === cityName
                          ? 'bg-cyan-400 text-[#141414] border-cyan-400'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      {cityName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed & Setting column split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Feed Canvas Column */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* The primary screen container */}
                  <div className="relative bg-[#141414] border-4 border-[#141414] aspect-video w-full overflow-hidden flex items-center justify-center">
                    
                    <canvas
                      ref={feedCanvasRef}
                      width={640}
                      height={360}
                      className="w-full h-full object-cover cursor-crosshair"
                      title={cameraSource === 'webcam' ? "Click anywhere on the stream to lock target" : "Click anywhere on the road to place cow"}
                      onClick={(e) => {
                        const canvas = feedCanvasRef.current;
                        if (!canvas) return;
                        const rect = canvas.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
                        const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
                        
                        if (cameraSource === 'webcam') {
                          // In webcam mode, click sets the artificial target coordinate
                          webcamLockPointRef.current = { x, y };
                        } else {
                          // In simulation, click moves bovine center
                          bovineXRef.current = x;
                          bovineYRef.current = y;
                        }
                      }}
                    />

                    {/* Non-visible video element rendering WebRTC feed buffer for canvas drawing context */}
                    <video
                      ref={webcamVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="hidden"
                    />

                    {/* Low-light night overlay to display CCTV realism */}
                    {luxValue < 15 && (
                      <div 
                        className="absolute inset-0 pointer-events-none mix-blend-color-burn" 
                        style={{ backgroundColor: `rgba(0, 0, 50, ${Math.min(0.7, (15 - luxValue)/15)})` }}
                      />
                    )}

                    {/* Flashing screen indicators */}
                    {activeAlert && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white font-mono text-[10px] font-black px-2 py-1 tracking-widest uppercase animate-pulse flex items-center gap-1">
                        <Siren className="w-3.5 h-3.5 animate-spin" /> WARNING: BOVINE IN ROADBED
                      </div>
                    )}

                    {/* Google Maps / GIS pilot scale placeholder overlay */}
                    <div 
                      onClick={(e) => e.stopPropagation()} 
                      className="absolute top-3 right-3 z-30 bg-[#141414]/95 border-2 border-neutral-700 p-2 text-[10px] font-mono text-[#E4E3E0] transition-all duration-300 w-44 shadow-2xl flex flex-col"
                    >
                      {/* Map Header */}
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5 mb-1.5 select-none">
                        <div className="flex items-center gap-1 text-cyan-400 font-bold">
                          <Compass className={`w-3.5 h-3.5 ${activeAlert ? 'animate-spin' : ''}`} />
                          <span>PILOT SCALE GIS</span>
                        </div>
                        <button 
                          onClick={() => setIsMapExpanded(!isMapExpanded)}
                          className="text-neutral-400 hover:text-white px-1 py-0.5 rounded bg-neutral-800 border border-neutral-700 active:scale-95 text-[8px] tracking-tight shrink-0 cursor-pointer font-bold"
                        >
                          {isMapExpanded ? 'MIN' : 'EXP'}
                        </button>
                      </div>

                      {isMapExpanded ? (
                        <div className="space-y-2">
                          {/* Stylized GIS SVG map */}
                          <div className="relative bg-black/50 border border-neutral-800 w-full h-24 overflow-hidden rounded-sm">
                            {/* Gridlines */}
                            <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#22d3ee 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                            
                            <svg viewBox="0 0 150 90" className="w-full h-full">
                              {/* Elevation contours or background grid */}
                              <circle cx="75" cy="50" r="35" fill="none" stroke="rgba(251, 191, 36, 0.08)" strokeWidth="1" />
                              <circle cx="75" cy="50" r="15" fill="none" stroke="rgba(251, 191, 36, 0.12)" strokeWidth="1" />
                              
                              {/* Dynamic City-Specific landmarks and roads */}
                              {CITIES_DATA[selectedCity]?.svgElements || CITIES_DATA["Tiruvannamalai"].svgElements}
                              
                              {/* Spot Hotspots */}
                              {Object.entries(CORRIDOR_GPS_DATA).map(([key, data]) => {
                                const isCurrent = selectedCorridor === key;
                                return (
                                  <g 
                                    key={key} 
                                    className="cursor-pointer group"
                                    onClick={() => setSelectedCorridor(key)}
                                  >
                                    {/* Pulse ring for active target */}
                                    {isCurrent && (
                                      <circle 
                                        cx={data.x} 
                                        cy={data.y} 
                                        r="6" 
                                        fill="none" 
                                        stroke="#f43f5e" 
                                        strokeWidth="1.5" 
                                        className="animate-ping origin-center" 
                                        style={{ transformOrigin: `${data.x}px ${data.y}px` }} 
                                      />
                                    )}
                                    {/* Map Pins / Radar points */}
                                    <circle 
                                      cx={data.x} 
                                      cy={data.y} 
                                      r={isCurrent ? "3.5" : "2.5"} 
                                      fill={isCurrent ? "#f43f5e" : "#06b6d4"} 
                                      className="transition-all duration-200"
                                    />
                                    <title>{key} ({data.danger} Danger)</title>
                                  </g>
                                );
                              })}
                            </svg>
                            
                            <div className="absolute bottom-1 left-1 bg-black/80 px-1 py-0.5 rounded text-[7px] text-neutral-400 scale-[0.9] origin-bottom-left uppercase">
                              {selectedCity} DT
                            </div>
                            <div className="absolute top-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[7px] text-green-400 scale-[0.9] origin-top-right font-bold uppercase animate-pulse">
                              Active GPS
                            </div>
                          </div>

                          {/* Info telemetry text based on selectedCorridor */}
                          <div className="space-y-1 bg-black/40 border border-neutral-900 p-1 rounded-sm text-[8px]">
                            <div className="flex items-center justify-between text-neutral-300">
                              <span className="text-neutral-500 uppercase">Selected:</span>
                              <span className="font-bold text-neutral-200 truncate max-w-[100px]" title={selectedCorridor}>
                                {CORRIDOR_GPS_DATA[selectedCorridor]?.info || "Unknown Corridor"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-neutral-500 uppercase">GPS Lat:</span>
                              <span className="text-cyan-400 font-bold">{CORRIDOR_GPS_DATA[selectedCorridor]?.lat}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-neutral-500 uppercase">GPS Lng:</span>
                              <span className="text-cyan-400 font-bold">{CORRIDOR_GPS_DATA[selectedCorridor]?.lng}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-neutral-500 uppercase">Elevation:</span>
                              <span className="text-neutral-300">{CORRIDOR_GPS_DATA[selectedCorridor]?.alt}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-neutral-500 uppercase">Nodes Active:</span>
                              <span className="text-green-400 font-bold">{CORRIDOR_GPS_DATA[selectedCorridor]?.cameras} Edge Nodes</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-neutral-500 uppercase">Zone Threat:</span>
                              <span className={`font-black px-1 rounded-sm text-[7px] ${
                                CORRIDOR_GPS_DATA[selectedCorridor]?.danger === 'CRITICAL' ? 'text-red-500 bg-red-950/40' :
                                CORRIDOR_GPS_DATA[selectedCorridor]?.danger === 'HIGH' ? 'text-amber-500 bg-amber-950/40' :
                                'text-yellow-400 bg-yellow-950/40'
                              }`}>{CORRIDOR_GPS_DATA[selectedCorridor]?.danger}</span>
                            </div>
                          </div>

                          <div className="text-[7px] text-neutral-500 italic text-center text-wrap pt-0.5 border-t border-neutral-900 select-none">
                            *Click radar dots to switch pilot location corridors.
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-1">
                          <div className="text-cyan-400 font-bold text-[9px] truncate">
                            {CORRIDOR_GPS_DATA[selectedCorridor]?.info}
                          </div>
                          <div className="text-[7.5px] text-neutral-400 mt-1">
                            {CORRIDOR_GPS_DATA[selectedCorridor]?.lat} / {CORRIDOR_GPS_DATA[selectedCorridor]?.lng}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 bg-[#141414]/90 border border-neutral-700 p-2 text-[10px] font-mono text-[#E4E3E0] space-y-0.5 uppercase tracking-wider">
                      <div>Node IDs: {
                        selectedCity === "Tiruvannamalai" ? "TVM-SH77-CHENGAM" :
                        selectedCity === "Madurai" ? "MDR-NH45-MATTU" :
                        selectedCity === "Coimbatore" ? "CBE-NH948-POLL" :
                        "KCP-NH48-EXPR"
                      }</div>
                      <div>Source: {cameraSource === 'simulation' ? 'Sim Corridor Highway Stream' : 'Live local WebRTC Capture'}</div>
                      <div className="flex items-center gap-1">
                        <span>FPS: {fpsVal}</span>
                        <span className="opacity-40">|</span>
                        <span>Latency: {sysLatency}ms</span>
                        <span className="opacity-40">|</span>
                        <span className={luxValue < 15 ? "text-red-500 font-bold" : "text-green-400"}>Illuminance: {luxValue} Lux</span>
                      </div>
                    </div>

                    <div className="absolute bottom-3 right-3 flex gap-2">
                      <div className="bg-green-600 text-white font-mono text-[9px] font-bold px-2 py-1 uppercase rounded-sm">
                        YOLOv8 Edge-Live
                      </div>
                    </div>

                  </div>

                  {/* Camera source switches */}
                  <div className="flex items-center justify-between p-3 bg-neutral-100 border-2 border-[#141414] font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold uppercase font-mono">Stream Hardware Input:</span>
                      <div className="flex border border-[#141414] rounded-none overflow-hidden">
                        <button
                          onClick={disableWebcam}
                          className={`px-3 py-1 text-xs cursor-pointer ${cameraSource === 'simulation' ? 'bg-[#141414] text-white font-bold' : 'bg-white hover:bg-neutral-200'}`}
                        >
                          Sim Corridor
                        </button>
                        <button
                          onClick={enableWebcam}
                          className={`px-3 py-1 text-xs cursor-pointer ${cameraSource === 'webcam' ? 'bg-[#141414] text-white font-bold' : 'bg-white hover:bg-neutral-200'}`}
                        >
                          Web Camera
                        </button>
                      </div>
                    </div>

                    {cameraSource === 'webcam' && (
                      <button
                        onClick={() => {
                          webcamLockPointRef.current = null;
                        }}
                        className="px-3.5 py-1 bg-red-600 hover:bg-red-700 text-white border border-[#141414] text-[10px] font-bold uppercase tracking-wider transition cursor-pointer shadow-[2px_2px_0px_0px_#141414] active:translate-x-0 active:translate-y-0 active:shadow-none"
                      >
                        🎯 Clear Target Lock
                      </button>
                    )}

                    {cameraSource === 'simulation' && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold">Active Zone:</span>
                        <select
                          value={selectedCorridor}
                          onChange={(e) => setSelectedCorridor(e.target.value)}
                          className="bg-white border border-[#141414] p-1 text-xs focus:outline-none"
                        >
                          {Object.keys(CORRIDOR_GPS_DATA).map((zoneName) => (
                            <option key={zoneName} value={zoneName}>
                              {zoneName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                </div>

                {/* Configuration Controls Column */}
                <div className="lg:col-span-5 bg-white p-5 border-2 border-[#141414] space-y-6">
                  
                  <div className="border-b border-gray-200 pb-3">
                    <h3 className="text-xs font-bold font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-[#141414]" /> Hardware Node Settings & Filter Toggles
                    </h3>
                  </div>

                  {/* Confidence Threshold bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-800 font-bold">
                      <span>YOLOv8 INT8 Threshold</span>
                      <span className="font-mono bg-neutral-100 text-[#141414] px-2 py-0.5 border border-neutral-400 font-bold">
                        {confThreshold}% Confidence
                      </span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="95"
                      step="5"
                      value={confThreshold}
                      onChange={(e) => setConfThreshold(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 border border-[#141414] cursor-pointer accent-[#141414]"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                      <span>40% (High false positive risk)</span>
                      <span>95% (Prone to missing dark obstacles)</span>
                    </div>
                  </div>

                  {/* Ambient Lighting simulator slide */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-800 font-bold">
                      <span>Simulated Ambient Lux (Lighting Intensity)</span>
                      <span className={`font-mono px-2 py-0.5 border border-neutral-400 font-bold ${luxValue < 15 ? 'bg-indigo-900 text-white animate-pulse' : 'bg-neutral-100 text-[#141414]'}`}>
                        {luxValue} Lux ({luxValue < 15 ? 'Pitch Dark Night' : 'Daylight / Dusk'})
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="100"
                      step="1"
                      value={luxValue}
                      onChange={(e) => setLuxValue(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 border border-[#141414] cursor-pointer accent-[#141414]"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                      <span>2 Lux (Nocturnal Testing)</span>
                      <span>100 Lux (Bright Ambient Showroom)</span>
                    </div>
                  </div>

                  {/* Dynamic filters toggles */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-mono text-gray-400 font-extrabold uppercase tracking-widest border-t pt-3">
                      False Positive Filters (Hackathon Core IP)
                    </h4>
                    
                    {/* Gait Speed Filter */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={gaitVelocityFilter}
                        onChange={(e) => setGaitVelocityFilter(e.target.checked)}
                        className="mt-1 accent-[#141414]"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-[#141414] block">Gait Velocity Heuristic Filter</span>
                        <p className="text-[11px] text-gray-500 leading-tight">
                          Discards rapid targets moving over 12 km/h (stray dogs, goats, swirling plastics). Bovines have low gait velocities.
                        </p>
                      </div>
                    </label>

                    {/* Temporal Consensus */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={temporalConsensus}
                        onChange={(e) => setTemporalConsensus(e.target.checked)}
                        className="mt-1 accent-[#141414]"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-[#141414] block">Temporal Frame Consensus (3-Frame Hold)</span>
                        <p className="text-[11px] text-gray-500 leading-tight">
                          Blocks brief frame drops and wind shadows. Requires consecutive verification of cow markers.
                        </p>
                      </div>
                    </label>

                    {/* Low Lux Correction */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={lowLightCorrection}
                        onChange={(e) => setLowLightCorrection(e.target.checked)}
                        className="mt-1 accent-[#141414]"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-[#141414] block">Tapetum Retina Eye-Glow Compensor</span>
                        <p className="text-[11px] text-gray-500 leading-tight">
                          Swapping the classification node target of the CNN to high-frequency point glowing retinas in darkness below 15 Lux.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Active telemetry alerts detail */}
                  {activeAlertLogEntry && (
                    <div className="p-3.5 bg-red-50 border-2 border-red-600 space-y-2">
                      <div className="text-[10px] font-mono uppercase text-red-700 font-extrabold flex items-center gap-1 animate-pulse">
                        <Siren className="w-3.5 h-3.5" /> SQLite SQLite Entry Recorded
                      </div>
                      <div className="text-xs text-red-900 leading-relaxed font-mono">
                        <div className="flex justify-between"><span>Row ID:</span> <strong>{activeAlertLogEntry.id}</strong></div>
                        <div className="flex justify-between"><span>Timestamp:</span> <span>{activeAlertLogEntry.timestamp}</span></div>
                        <div className="flex justify-between"><span>Illumination:</span> <span>{activeAlertLogEntry.luxLevel} Lux</span></div>
                        <div className="flex justify-between text-emerald-800 font-bold"><span>Relay action:</span> <span>Smart Strobe high</span></div>
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: SQLITE DATA LOGS */}
          {activeSection === 'logs' && (
            <div className="space-y-6">
              
              {/* Header and tools */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight text-[#141414] flex items-center gap-2">
                    <HardDrive className="text-neutral-700" /> SQLite SQL Database replica client (`cattle_logs`)
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    Direct validation dashboard displaying persistent logs from the edge camera units. Simulated SQLite storage context.
                  </p>
                </div>
                
                {/* Seed values triggers */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={seedNewMockAccidentLog}
                    className="px-3.5 py-1.5 bg-white hover:bg-neutral-100 text-[#141414] text-xs font-extrabold font-mono uppercase border-2 border-[#141414] transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Seed Log Row
                  </button>
                  <button
                    onClick={exportLogsAsCSV}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold font-mono uppercase border-2 border-[#141414] shadow-[1px_1px_0px_0px_#141414] transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Export CSV Dataset
                  </button>
                  <button
                    onClick={clearDatabaseLogs}
                    className="px-3.5 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 text-xs font-extrabold font-mono uppercase border-2 border-red-700 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" /> Purge DB logs
                  </button>
                </div>
              </div>

              {/* SQLite simulated table */}
              {logs.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-[#141414] bg-neutral-50 rounded-none space-y-3">
                  <WifiOff className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-sm font-mono text-gray-500 font-bold">SQL Database logs empty. Standard nodes monitoring live feed...</p>
                  <button
                    onClick={seedNewMockAccidentLog}
                    className="px-4 py-1.5 bg-[#141414] text-white text-xs font-normal uppercase font-mono tracking-widest cursor-pointer"
                  >
                    Seed baseline logs
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border-2 border-[#141414]">
                  <table id="logs-data-table" className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#141414] text-[#E4E3E0] font-mono text-[10px] uppercase tracking-wider">
                        <th className="p-3 border-r border-[#141414]">RECORD ID</th>
                        <th className="p-3 border-r border-[#141414]">TIMESTAMP</th>
                        <th className="p-3 border-r border-[#141414]">CAMERA NODE ID</th>
                        <th className="p-3 border-r border-[#141414]">LOCATION CORRIDOR</th>
                        <th className="p-3 border-r border-[#141414]">CONFIDENCE</th>
                        <th className="p-3 border-r border-[#141414]">AMBIENT LUX</th>
                        <th className="p-3 border-r border-[#141414]">INTELLIGENT COMPENSATOR</th>
                        <th className="p-3 border-r border-[#141414]">MITIGATION STATUS</th>
                        <th className="p-3">CORRIDOR ACTIONS LOGGING</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-300 font-mono">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-neutral-50/80 transitionEven">
                          <td className="p-3 border-r border-neutral-200 font-bold text-[#141414]">{log.id}</td>
                          <td className="p-3 border-r border-neutral-200 text-gray-600">{log.timestamp}</td>
                          <td className="p-3 border-r border-neutral-200 text-[#141414]">{log.cameraId}</td>
                          <td className="p-3 border-r border-neutral-200 font-sans text-gray-700">{log.location}</td>
                          <td className="p-3 border-r border-neutral-200 font-bold">
                            <span className={log.confidence >= 75 ? 'text-green-600' : 'text-amber-600'}>
                              {log.confidence}%
                            </span>
                          </td>
                          <td className="p-3 border-r border-neutral-200">{log.luxLevel} Lux</td>
                          <td className="p-3 border-r border-neutral-200 text-center">
                            {log.lowLightCompensated ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 font-bold uppercase rounded-none border border-emerald-400">
                                ACTIVE NIGHT RETINA
                              </span>
                            ) : (
                              <span className="text-gray-400 font-normal">DAYLIGHT STANDARD</span>
                            )}
                          </td>
                          <td className="p-3 border-r border-neutral-200">
                            {log.status === 'PENDING' ? (
                              <div className="space-y-1.5">
                                <span className="bg-red-100 text-red-700 text-[9px] px-2 py-1 font-extrabold uppercase rounded-none border border-red-400 animate-pulse block text-center">
                                  🚨 ACTIVE COW IN ROAD
                                </span>
                                <div className="flex gap-1 justify-center">
                                  <button
                                    onClick={() => resolveCattleStatus(log.id, 'MITIGATED')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] px-1.5 py-0.5 font-bold cursor-pointer"
                                  >
                                    Cattle Left
                                  </button>
                                  <button
                                    onClick={() => resolveCattleStatus(log.id, 'FALSE_POSITIVE_BLOCKED')}
                                    className="bg-neutral-200 hover:bg-neutral-300 text-[#141414] text-[9px] px-1.5 py-0.5 font-bold cursor-pointer"
                                  >
                                    False FP
                                  </button>
                                </div>
                              </div>
                            ) : log.status === 'MITIGATED' ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 font-bold uppercase rounded-none border border-emerald-400 block text-center">
                                ✓ MITIGATED SAFE
                              </span>
                            ) : (
                              <span className="bg-neutral-100 text-neutral-500 text-[9px] px-2 py-0.5 font-normal uppercase rounded-none border border-neutral-300 block text-center italic">
                                ⚠ FP BLOCKED (DOG)
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-sans max-w-sm text-gray-700 text-[11px] leading-relaxed">
                            {log.actionTaken}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: PYTHON SOURCE & EXPORTS */}
          {activeSection === 'code' && (
            <div className="space-y-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight text-[#141414] flex items-center gap-2">
                    <Cpu className="text-emerald-700" /> Production-Ready Repository & Exporter Suite
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Complete working scripts designed to execute on localized Edge machines (Intel CPU, Raspberry Pi 5). 100% reproducible for the hackathon.
                  </p>
                </div>
              </div>

              {/* Code components selector and display panel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* File list pane */}
                <div className="lg:col-span-4 space-y-2.5">
                  <h4 className="text-[10px] font-mono text-gray-400 font-extrabold uppercase tracking-widest block mb-1">
                    System Repository Folders File Tree
                  </h4>
                  
                  <div className="border-2 border-[#141414] p-3 bg-neutral-50 font-mono text-xs space-y-2 text-[#141414]">
                    <div className="font-bold flex items-center gap-1 text-[#141414]">
                      📁 boviguard-edge-service/
                    </div>
                    <div className="pl-4 space-y-1">
                      <div className="text-gray-500">&bull; 📁 models / (compiled YOLO INT8 weights)</div>
                      <div className="text-gray-500">&bull; 📁 static / (CCTV snapshots)</div>
                      
                      {technicalComponents.map(tc => (
                        <button
                          key={tc.filename}
                          onClick={() => setSelectedFilename(tc.filename)}
                          className={`w-full text-left pl-3 py-1 cursor-pointer font-bold border-l-2 transition-all ${
                            selectedFilename === tc.filename 
                              ? 'border-[#141414] text-[#141414] bg-white translate-x-1' 
                              : 'border-transparent text-gray-500 hover:text-[#141414]'
                          }`}
                        >
                          📄 {tc.filename}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Testing guidance box to slide right into judges heart */}
                  <div className="bg-emerald-50 border-2 border-emerald-600 p-4 space-y-2">
                    <h5 className="text-xs font-black uppercase text-emerald-800 font-mono flex items-center gap-1">
                      <Award className="w-4 h-4" /> Hackathon Win Tips:
                    </h5>
                    <p className="text-[11px] leading-relaxed text-emerald-950 font-sans">
                      Judges are tired of seeing generic YOLO detectors in high-speed slideshows. Bring a simple USB camera, install our codebase, and show it trigger lighting indicators on-stage! Bring a cardboard outline of a cow to place in front of the camera. That tactile physical demonstration will seal your victory.
                    </p>
                  </div>

                </div>

                {/* Source code visualization panel */}
                <div className="lg:col-span-8 bg-[#141414] text-neutral-300 border-2 border-[#141414] p-5 shadow-[4px_4px_0px_0px_#141414] flex flex-col justify-between">
                  
                  {/* File title */}
                  <div className="flex justify-between items-center border-b border-neutral-700 pb-3 mb-4 text-[#E4E3E0]">
                    <div>
                      <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block font-bold">
                        FILE CONTENT // {activeCodeFile.filename.toUpperCase()}
                      </span>
                      <strong className="text-sm font-mono text-white tracking-wide">
                        {activeCodeFile.filename}
                      </strong>
                    </div>
                    
                    <button
                      onClick={() => copyToClipboard(activeCodeFile.code)}
                      className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                        copyFeedback 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white text-[#141414] hover:bg-neutral-200'
                      }`}
                    >
                      {copyFeedback ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> COPIED!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> COPY TO CLIPBOARD
                        </>
                      )}
                    </button>
                  </div>

                  {/* Mini description block */}
                  <p className="text-xs text-gray-400 italic mb-3 font-sans pb-2 border-b border-dotted border-neutral-800 leading-snug">
                    {activeCodeFile.description}
                  </p>

                  {/* Synthesized clean terminal box */}
                  <div className="relative overflow-auto max-h-[360px] rounded-none border border-neutral-800">
                    <pre className="p-3 text-[11px] font-mono leading-relaxed whitespace-pre text-emerald-400 select-all overflow-x-auto text-left">
                      <code>{activeCodeFile.code}</code>
                    </pre>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 4: PITCH ARGUMENTS LAB */}
          {activeSection === 'arguments' && (
            <div className="space-y-8">
              
              {/* Introduction */}
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight text-[#141414] flex items-center gap-2">
                  <Flame className="text-red-600" /> National Evaluation Q&A Practice Flashcards
                </h2>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  Standard AI systems are ripped to pieces on structural issues in Indian streets. Study these flawless argument structures to address objections confidently.
                </p>
              </div>

              {/* Grid layout containing cards */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Scrollable Questions list */}
                <div className="md:col-span-4 space-y-2">
                  {JUDGE_QUESTIONS.map(q => (
                    <button
                      key={q.id}
                      onClick={() => {
                        setSelectedQuestionId(q.id);
                        setActiveQASegment('hook');
                      }}
                      className={`w-full text-left p-3.5 transition-all text-xs leading-snug flex items-start gap-2.5 border-2 border-[#141414] cursor-pointer ${
                        selectedQuestionId === q.id 
                          ? 'bg-[#141414] text-[#E4E3E0] shadow-none' 
                          : 'bg-neutral-50 text-[#141414] hover:bg-neutral-100 shadow-[2px_2px_0px_0px_#141414]'
                      }`}
                    >
                      <HelpCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${selectedQuestionId === q.id ? 'text-teal-400' : 'text-gray-500'}`} />
                      <div className="space-y-1">
                        <div className="font-extrabold uppercase tracking-tight line-clamp-2">{q.question}</div>
                        <div className="text-[10px] font-mono opacity-80">
                          Focus: {q.id === 'q_false_positives' ? 'Inference variance' : q.id === 'q_night_detection' ? 'Low lux limits' : q.id === 'q_internet_failure' ? 'Edge networks' : q.id === 'q_gov_adoption' ? 'Fiscal mathematics' : 'Competitive advantage'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Active selection dissection detail */}
                <div className="md:col-span-8 bg-neutral-50 p-5 border-2 border-[#141414] space-y-4 shadow-[4px_4px_0px_0px_#141414]">
                  
                  {/* Mindset breakdown */}
                  <div className="space-y-1 pb-3 border-b border-gray-300">
                    <div className="text-[10px] font-mono uppercase text-red-600 flex items-center gap-1 font-extrabold">
                      <Flame className="w-4 h-4" /> Why the panel asks this query
                    </div>
                    <p className="text-xs text-gray-700 italic font-sans leading-relaxed">
                      &quot;{selectedQuestion.whyAsked}&quot;
                    </p>
                  </div>

                  {/* Big target text of Question */}
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 tracking-widest uppercase font-bold block mb-1">Active Slide Challenge</span>
                    <h3 className="text-base font-black text-[#141414] uppercase leading-snug tracking-tight font-sans">
                      {selectedQuestion.question}
                    </h3>
                  </div>

                  {/* Speech script selection sliders/toggles */}
                  <div className="bg-[#E4E3E0] p-1 border border-[#141414] flex flex-wrap gap-1">
                    {[
                      { id: 'hook', label: '1. Verbal Hook', subtitle: 'Earn Interest' },
                      { id: 'tech', label: '2. Low-level Logic', subtitle: 'Tech Mastery' },
                      { id: 'gov', label: '3. Admin strategy', subtitle: 'Build Trust' },
                      { id: 'metrics', label: '4. Pure statistics', subtitle: 'Audit proof' }
                    ].map((seg) => (
                      <button
                        key={seg.id}
                        onClick={() => setActiveQASegment(seg.id as any)}
                        className={`flex-1 py-2 px-1 text-center text-[10px] font-mono leading-none flex flex-col justify-center items-center gap-0.5 transition cursor-pointer border ${
                          activeQASegment === seg.id 
                            ? 'bg-[#141414] text-[#E4E3E0] font-bold border-[#141414]' 
                            : 'bg-white text-[#141414] border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <span className="font-bold uppercase tracking-tight">{seg.label}</span>
                        <span className="text-[8px] opacity-70 font-normal">{seg.subtitle}</span>
                      </button>
                    ))}
                  </div>

                  {/* Active content panel */}
                  <div className="p-4 bg-white border-2 border-[#141414] min-h-[140px] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3 border-b pb-2">
                        <span className="text-[10px] font-mono uppercase bg-[#141414] text-[#E4E3E0] px-2 py-0.5 font-bold">
                          {activeQASegment === 'hook' && "The Deliverable Hook"}
                          {activeQASegment === 'tech' && "Embedded Architectural parameters"}
                          {activeQASegment === 'gov' && "Government adoption buy-in dynamics"}
                          {activeQASegment === 'metrics' && "Measurable metrics to recite on stage"}
                        </span>
                        <span className="text-[9px] font-mono text-gray-500 font-bold">
                          Delivery: Pitch-grade vocal authority
                        </span>
                      </div>

                      <p className="text-xs text-gray-800 leading-relaxed font-sans">
                        {activeQASegment === 'hook' && selectedQuestion.structuredAnswer.hook}
                        {activeQASegment === 'tech' && selectedQuestion.structuredAnswer.technicalResolution}
                        {activeQASegment === 'gov' && selectedQuestion.structuredAnswer.administrativeBuyIn}
                        {activeQASegment === 'metrics' && selectedQuestion.structuredAnswer.metricsToQuote}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 leading-snug">
                      <span className="font-mono text-red-600 font-extrabold uppercase">
                        💡 Presentation Gold Standard:
                      </span>
                      <span>
                        {activeQASegment === 'hook' && "Never lead by apologizing for a constraint. Turn the limitation into a custom patent target!"}
                        {activeQASegment === 'tech' && "State standard algorithms explicitly: 'INT8 Quantization' and 'Clahe brightness correction'."}
                        {activeQASegment === 'gov' && "Align with government agencies: national NHAI road budgets and e-Sevai fine recovering."}
                        {activeQASegment === 'metrics' && "Precise numbers sound researched. Random approximations make judges suspicious."}
                      </span>
                    </div>

                  </div>

                </div>

              </div>

              {/* Boviguard AI Strategic Objection Solver widget */}
              <div className="border-t-2 border-[#141414] pt-8 mt-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
                  <div>
                    <h3 className="text-lg font-black uppercase text-[#141414] flex items-center gap-2 font-sans tracking-tight">
                      <Siren className="text-red-600 animate-pulse w-5 h-5" /> 
                      Boviguard AI Strategic Objection Solver
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">
                      Dynamic argument synthesis powered by Gemini 3.5 Flash server-side. Handle unexpected investor or public administrator interrogation seamlessly.
                    </p>
                  </div>
                  <span className="text-[10px] bg-red-600 text-white font-mono font-extrabold px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] uppercase flex-shrink-0 animate-pulse">
                    GEMINI ACTIVE CO-PILOT
                  </span>
                </div>

                <div className="bg-white border-2 border-[#141414] p-5 shadow-[4px_4px_0px_0px_#141414] grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Interactive Input Section */}
                  <div className="lg:col-span-12 xl:col-span-5 space-y-4 font-mono text-xs text-[#141414]">
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1.5 font-mono">
                        Select Judge Objection Template
                      </label>
                      <div className="grid grid-cols-1 gap-1.5">
                        {[
                          "How does Boviguard maintain inference performance under zero-bar signal internet dead zones?",
                          "Is the unit manufacturing cost low enough for rural village budgets?",
                          "What happens if cattle are fast-moving or running across lanes?",
                          "Can this be integrated with national NHAI high-speed traffic cameras?"
                        ].map((tpl, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setCustomObjection(tpl)}
                            className={`text-left p-2 border text-[11px] leading-snug transition-all rounded-none cursor-pointer flex items-start gap-1.5 ${
                              customObjection === tpl 
                                ? 'bg-[#141414] text-white border-[#141414]' 
                                : 'bg-[#FCFCFB] hover:bg-neutral-100 text-neutral-800 border-neutral-300'
                            }`}
                          >
                            <span className="text-red-500 mt-0.5">⚡</span>
                            <span>{tpl}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1 font-mono">
                        OR Type Custom Challenge Question
                      </label>
                      <textarea
                        value={customObjection}
                        onChange={(e) => setCustomObjection(e.target.value)}
                        placeholder="e.g., How does high humidity or monsoon rainfall affect lens visibility and false positive rates?"
                        rows={3}
                        className="w-full p-2.5 border-2 border-[#141414] rounded-none focus:outline-none focus:ring-1 focus:ring-red-600 bg-neutral-50 text-xs font-sans text-neutral-900 placeholder-neutral-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] text-gray-500 font-bold uppercase mb-grow font-mono">
                          Corridor Focus
                        </label>
                        <select
                          value={copilotFocus}
                          onChange={(e) => setCopilotFocus(e.target.value)}
                          className="w-full p-2 border-2 border-[#141414] rounded-none bg-white text-[11px] font-sans focus:outline-none focus:ring-1 focus:ring-red-600"
                        >
                          <option value="Edge computing YOLOv8 nodes">YOLOv8 Edge Nodes</option>
                          <option value="Solar highway fencing">Solar Fencing</option>
                          <option value="Patrol dispatch messaging">Patrol Dispatch</option>
                          <option value="NHAI Highway integrations">NHAI Camera Sync</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] text-gray-500 font-bold uppercase mb-grow font-mono">
                          Geography
                        </label>
                        <select
                          value={copilotState}
                          onChange={(e) => setCopilotState(e.target.value)}
                          className="w-full p-2 border-2 border-[#141414] rounded-none bg-white text-[11px] font-sans focus:outline-none focus:ring-1 focus:ring-red-600"
                        >
                          <option value="Tamil Nadu (Coimbatore/Madurai)">Tamil Nadu</option>
                          <option value="Kerala (Western Ghats crossings)">Kerala State</option>
                          <option value="Karnataka (Bengaluru Outer Rings)">Karnataka Region</option>
                          <option value="Andhra Pradesh (Nellore Corridors)">Andhra Pradesh</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={generateAIPitchStrategy}
                      disabled={isGeneratingPitch || !customObjection.trim()}
                      className={`w-full py-3 px-4 border-2 border-[#141414] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#141414] transition duration-150 rounded-none cursor-pointer ${
                        isGeneratingPitch || !customObjection.trim()
                          ? 'bg-neutral-100 text-neutral-400 border-neutral-300 shadow-none cursor-not-allowed'
                          : 'bg-[#141414] text-white hover:bg-neutral-800 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[4px_4px_0px_0px_#141414]'
                      }`}
                    >
                      {isGeneratingPitch ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Generating Strategy...</span>
                        </>
                      ) : (
                        <>
                          <Cpu className="w-4 h-4 text-teal-400" />
                          <span>Generate AI Strategy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right: Output Strategy Dashboard Panel */}
                  <div className="lg:col-span-12 xl:col-span-7 bg-[#FCFCFB] border-2 border-[#141414] p-4 flex flex-col justify-between min-h-[340px]">
                    {pitchAdvisorResult ? (
                      <div className="space-y-4 h-full flex flex-col justify-between">
                        {/* Interactive Tabs */}
                        <div className="space-y-3">
                          <div className="bg-[#141414] p-1 border border-[#141414] flex flex-wrap gap-1">
                            {[
                              { id: 'hook', label: '1. Verbatim Hook' },
                              { id: 'tech', label: '2. Tech Defense' },
                              { id: 'local', label: '3. Regional Value' },
                              { id: 'fiscal', label: '4. Fiscal math' }
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                onClick={() => setActiveCopilotTab(tab.id as any)}
                                className={`flex-1 py-1.5 px-1 text-center font-mono text-[9px] font-bold uppercase transition rounded-none cursor-pointer ${
                                  activeCopilotTab === tab.id
                                    ? 'bg-[#E4E3E0] text-[#141414] border border-[#141414]'
                                    : 'text-white border border-transparent hover:bg-neutral-800'
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>

                          {/* Tab Content Display */}
                          <div className="p-4 bg-white border border-[#141414] min-h-[190px] flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between border-b pb-1.5 mb-2.5">
                                <span className="text-[9px] font-mono bg-[#141414] text-white px-2 py-0.5 font-bold uppercase">
                                  {activeCopilotTab === 'hook' && "Strategic Contrarian opening Hook"}
                                  {activeCopilotTab === 'tech' && "Deep Technical Architecture response"}
                                  {activeCopilotTab === 'local' && "Geographic Socio-Economic Alignment"}
                                  {activeCopilotTab === 'fiscal' && "Financial Auditing / Budgetary Justification"}
                                </span>
                                <span className="text-[8px] font-mono text-gray-500 uppercase font-black">
                                  AI Copilot output
                                </span>
                              </div>

                              <p className="text-xs text-[#141414] leading-relaxed font-sans font-medium whitespace-pre-wrap">
                                {activeCopilotTab === 'hook' && pitchAdvisorResult.hook}
                                {activeCopilotTab === 'tech' && pitchAdvisorResult.technicalDissection}
                                {activeCopilotTab === 'local' && pitchAdvisorResult.localImpact}
                                {activeCopilotTab === 'fiscal' && pitchAdvisorResult.fiscalMath}
                              </p>
                            </div>

                            <div className="text-[8px] font-mono text-gray-400 uppercase tracking-tight mt-3 text-right">
                              *Generated for district coordinators in {copilotState} focusing on {copilotFocus}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Clear/Copy buttons */}
                        <div className="pt-3 border-t border-gray-200 flex flex-wrap gap-2 items-center justify-between">
                          <button
                            onClick={() => {
                              const clipText = `Boviguard Strategy Defending Objection:\n\n` +
                                `Hook: ${pitchAdvisorResult.hook}\n\n` +
                                `Tech: ${pitchAdvisorResult.technicalDissection}\n\n` +
                                `Local: ${pitchAdvisorResult.localImpact}\n\n` +
                                `Fiscal: ${pitchAdvisorResult.fiscalMath}`;
                              navigator.clipboard.writeText(clipText);
                              alert("Copied entire defense argument pack to clipboard!");
                            }}
                            className="py-1 px-3 border border-[#141414] text-[#141414] bg-white hover:bg-neutral-100 font-mono text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Full Plan</span>
                          </button>

                          <button
                            onClick={() => setPitchAdvisorResult(null)}
                            className="text-gray-400 hover:text-red-500 font-mono text-[9px] uppercase font-bold cursor-pointer"
                          >
                            Close AI output
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                        <div className="h-10 w-10 border border-[#141414] flex items-center justify-center text-[#141414]">
                          <Cpu className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold font-mono uppercase text-neutral-800 font-mono">No strategy compiled</h4>
                          <p className="text-[11px] text-gray-400 font-sans max-w-sm">
                            Configure your VC / admin inquiry parameters on the left and invoke the server-side Gemini 3.5 engine to construct high-authority answers.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          <button
                            onClick={() => {
                              setCustomObjection("Our road connectivity is patchy. How can we trust a camera system along highways under dead-network failure?");
                              setCopilotFocus("Edge computing YOLOv8 nodes");
                            }}
                            className="bg-neutral-100 hover:bg-neutral-200 p-1 px-2 border text-[9px] font-mono text-gray-600 rounded-none cursor-pointer"
                          >
                            Prefill "Zero-Bar Signal"
                          </button>
                          <button
                            onClick={() => {
                              setCustomObjection("Cattle collisions are highly seasonal and sporadic. Is this worth a major state budget allocation?");
                              setCopilotFocus("Patrol dispatch messaging");
                            }}
                            className="bg-neutral-100 hover:bg-neutral-200 p-1 px-2 border text-[9px] font-mono text-gray-600 rounded-none cursor-pointer"
                          >
                            Prefill "State Budget"
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: ALERTS SNAPSHOTS GALLERY */}
          {activeSection === 'gallery' && (
            <div id="alerts-gallery-section" className="space-y-6">
              
              {/* Header Title Information */}
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight text-[#141414] flex items-center gap-2">
                  <Images className="text-cyan-600 animate-pulse" /> Automated High-Confidence Alerts Gallery
                </h2>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  Whenever bovine warning confidence exceeds <strong className="text-red-600">90%</strong>, the system intercepts the raw live canvas frame and registers a snapshot into the browser's persistent IndexedDB client-side database.
                </p>
              </div>

              {/* Gallery Mini Dashboard Panel */}
              <div id="gallery-info-bar" className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 border-2 border-[#141414] font-mono text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Total Persistent Snapshots</span>
                  <span className="text-base font-black text-[#141414]">{snapshots.length} saved detections</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Storage Provider Status</span>
                  <span className="text-base font-black text-emerald-700 flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    IndexedDB ONLINE
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Auto-Collection Rule</span>
                  <span className="text-base font-black text-amber-700">ALERT CONFIDENCE &gt; 90.0%</span>
                </div>
              </div>

              {/* Action Controls & Filters */}
              <div id="gallery-controls" className="bg-white border-2 border-[#141414] p-3 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[3px_3px_0px_0px_#141414]">
                <div className="relative w-full md:w-72">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    id="gallery-search-input"
                    type="text"
                    placeholder="Filter by city, corridor, breed..."
                    className="w-full bg-white text-[#141414] border border-[#141414] pl-9 pr-3 py-1.5 text-xs font-mono focus:outline-none"
                    value={gallerySearch}
                    onChange={(e) => setGallerySearch(e.target.value)}
                  />
                  {gallerySearch && (
                    <button
                      onClick={() => setGallerySearch('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    id="btn-refresh-gallery"
                    onClick={refreshSnapshotsList}
                    className="flex-1 md:flex-initial px-4 py-2 bg-white text-[#141414] border-2 border-[#141414] text-xs font-mono font-bold uppercase transition hover:bg-gray-100 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                  </button>

                  <button
                    id="btn-clear-gallery"
                    onClick={async () => {
                      if (window.confirm("Are you absolutely sure you want to delete all saved snapshots in IndexedDB?")) {
                        await clearAllSnapshots();
                        await refreshSnapshotsList();
                      }
                    }}
                    disabled={snapshots.length === 0}
                    className={`flex-1 md:flex-initial px-4 py-2 border-2 text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      snapshots.length === 0
                        ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'bg-red-50 text-red-700 border-red-600 hover:bg-red-100'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Destroy Archive
                  </button>
                </div>
              </div>

              {/* Snapshots Grid */}
              {filteredSnapshots.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                    <Images className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase text-gray-700 font-mono">No threat snapshots available</h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      {gallerySearch 
                        ? "No persistent records match your active search terms." 
                        : "Trigger an alert on the 'Live Feed Processor' with a confidence score exceeding 90%. Use Coimbatore, Madurai, or Tiruvannamalai with proper illumination settings."}
                    </p>
                  </div>
                </div>
              ) : (
                <div id="gallery-snapshots-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSnapshots.map((snap) => (
                    <div 
                      key={snap.id} 
                      className="bg-white border-2 border-[#141414] overflow-hidden flex flex-col justify-between shadow-[4px_4px_0px_0px_#141414] transition-all hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_0px_#141414]"
                    >
                      {/* Base64 Cloned Canvas Image Frame */}
                      <div 
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedModalSnapshot(snap)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedModalSnapshot(snap);
                          }
                        }}
                        className="relative aspect-video bg-black overflow-hidden border-b-2 border-[#141414] cursor-zoom-in group/img outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-inset"
                        title="Click to view full-screen high-resolution capture"
                      >
                        <img 
                          src={snap.imageData} 
                          alt={snap.label} 
                          className="w-full h-full object-cover select-none transition-transform duration-300 group-hover/img:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        {/* Interactive Inspect Hover Overlay banner */}
                        <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <span className="bg-[#FCFCFB] text-[#141414] border-2 border-[#141414] text-[10px] font-mono font-bold uppercase py-1.5 px-3 shadow-[2px_2px_0px_0px_#141414] flex items-center gap-1.5 transform translate-y-2 group-hover/img:translate-y-0 transition-all duration-300">
                            🔍 Inspect Threat Area
                          </span>
                        </div>
                        {/* Red Threat Indicator tag */}
                        <div className="absolute top-2 left-2 bg-red-600 text-white font-mono text-[9px] font-bold uppercase px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(20,20,20,0.8)] border border-black flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-white" />
                          <span>HIGH THREAT LEVEL</span>
                        </div>
                        {/* AI Report Active Badge */}
                        {snapshotAnalyses[snap.id!] && (
                          <div className="absolute top-2 right-2 bg-cyan-600 text-white font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 shadow-[2px_2px_0px_0px_rgba(20,20,20,0.8)] border border-neutral-900 flex items-center gap-1 animate-pulse">
                            <Siren className="w-3 h-3 text-white" />
                            <span>AI ANALYZED</span>
                          </div>
                        )}
                        {/* Performance & Confidence Overlay pills */}
                        <div className="absolute bottom-2 right-2 bg-[#141414] text-white font-mono text-[9px] px-2 py-0.5 border border-neutral-700 shadow-md">
                          CONFIDENCE: <strong className="text-red-400 font-bold">{snap.confidence}%</strong>
                        </div>
                      </div>

                      {/* Info body */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-[#FCFCFB]">
                        <div className="space-y-2">
                          {/* Title Breed classification */}
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="text-xs font-black text-[#141414] uppercase leading-snug truncate font-mono">
                              {snap.label}
                            </h4>
                            <span className="text-[9px] font-mono bg-neutral-950 text-[#ffeeee] font-black uppercase px-2 py-0.5 rounded-sm flex-shrink-0">
                              {snap.city} DT
                            </span>
                          </div>

                          {/* Coordinates / Corridor metadata */}
                          <p className="text-[10px] text-gray-500 font-mono leading-snug">
                            <span className="text-gray-400 block pb-0.5">LOCATION:</span>
                            {snap.corridor}
                          </p>
                        </div>

                        {/* Footer card controls and time */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
                          <span className="text-[9px] font-mono text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400 font-extrabold" />
                            {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} &bull; {new Date(snap.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>

                          <div className="flex gap-1">
                            <a
                              href={snap.imageData}
                              download={`Boviguard_Alert_${snap.city.replace(/\s+/g,'_')}_${snap.id}.jpeg`}
                              title="Download Snapshot image"
                              className="p-1 px-2 border border-[#141414] bg-white text-[#141414] hover:bg-neutral-100 transition rounded-none text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              <span>Save</span>
                            </a>
                            
                            <button
                              onClick={async () => {
                                if (snap.id !== undefined) {
                                  await deleteSnapshot(snap.id);
                                  await refreshSnapshotsList();
                                }
                              }}
                              title="Delete snapshot from database"
                              className="p-1 border border-red-600 bg-red-50 text-red-600 hover:bg-red-100 transition rounded-none cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* Persistent full-screen high resolution inspect modal */}
          <AnimatePresence>
            {selectedModalSnapshot && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/95 backdrop-blur-md"
                onClick={() => setSelectedModalSnapshot(null)}
              >
                {/* Floating dynamic close instruction banner */}
                <div className="absolute top-4 left-4 text-white font-mono text-[9px] uppercase tracking-wider opacity-60 hidden sm:block">
                  ESC KEY Or click outside to exit inspection
                </div>

                <button
                  onClick={() => setSelectedModalSnapshot(null)}
                  className="absolute top-4 right-4 text-white hover:text-red-400 p-2 transition duration-200 z-50 cursor-pointer bg-neutral-900 border-2 border-neutral-700 hover:border-red-500 shadow-md"
                  title="Close preview (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>

                <motion.div
                  initial={{ scale: 0.95, y: 15 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 15 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative max-w-5xl w-full bg-white border-4 border-[#141414] overflow-hidden shadow-[8px_8px_0px_0px_rgba(255,255,255,0.15)] flex flex-col md:flex-row"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Left: Beautiful zoomed image framework */}
                  <div className="flex-1 bg-[#0a0a0a] flex items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-[#141414] min-h-[300px] max-h-[75vh]">
                    <img
                      src={selectedModalSnapshot.imageData}
                      alt={selectedModalSnapshot.label}
                      className="w-full h-full object-contain select-none max-h-[75vh]"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Right: Technical Inspector HUD Panel */}
                  <div className="w-full md:w-80 p-6 bg-white flex flex-col justify-between font-mono text-xs text-[#141414]">
                    <div className="space-y-6">
                      {/* Title Badge Header block */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] bg-red-600 text-white font-black px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] uppercase">
                            Active Alert
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">
                            ID: #{selectedModalSnapshot.id || "TMP"}
                          </span>
                        </div>
                        <h3 className="text-sm font-black uppercase text-[#141414] tracking-tight leading-snug">
                          {selectedModalSnapshot.label}
                        </h3>
                      </div>

                      {/* Technical Meta properties */}
                      <div className="space-y-4 border-t-2 border-b-2 border-dashed border-gray-200 py-4">
                        <div>
                          <span className="text-[9px] text-gray-400 uppercase block font-bold mb-1">District Location</span>
                          <span className="text-xs font-black text-[#141414] flex items-center gap-1.5 uppercase">
                            <MapPin className="w-4 h-4 text-red-600" />
                            {selectedModalSnapshot.city} District
                          </span>
                        </div>

                        <div>
                          <span className="text-[9px] text-gray-400 uppercase block font-bold mb-1">YOLO Corridor / Track ID</span>
                          <span className="text-[10px] font-bold text-gray-700 leading-relaxed block bg-gray-50 border border-gray-200 p-2 font-mono">
                            {selectedModalSnapshot.corridor}
                          </span>
                        </div>

                        <div>
                          <span className="text-[9px] text-gray-400 uppercase block font-bold mb-1">Target Detection Metrics</span>
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-red-50 border border-red-200 p-2">
                              <span className="text-[8px] text-red-700 block uppercase font-bold">Confidence</span>
                              <span className="text-xs font-black text-red-600">{selectedModalSnapshot.confidence}%</span>
                            </div>
                            <div className="bg-cyan-50 border border-cyan-200 p-2">
                              <span className="text-[8px] text-cyan-700 block uppercase font-bold">Latency</span>
                              <span className="text-xs font-black text-cyan-600">12ms</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] text-gray-400 uppercase block font-bold mb-1">Capture Timestamp</span>
                          <span className="text-[10px] font-semibold text-gray-700 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(selectedModalSnapshot.timestamp).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(selectedModalSnapshot.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      {/* Boviguard Multimodal AI Threat Intelligence Report Block */}
                      <div className="space-y-3 pt-2">
                        {snapshotAnalyses[selectedModalSnapshot.id!] ? (
                          <div className="bg-[#141414] text-white p-3 border-2 border-cyan-500 shadow-[2px_2px_0px_0px_rgba(6,182,212,1)] rounded-none space-y-2 overflow-y-auto max-h-[220px] font-mono text-[10px]">
                            <div className="flex items-center justify-between border-b border-cyan-800 pb-1 text-cyan-400 font-extrabold uppercase text-[9px]">
                              <span>🤖 BOVIGUARD AI ANALYSIS</span>
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                              </span>
                            </div>
                            
                            <div>
                              <span className="text-gray-400 block text-[8px] uppercase">BREED / MORPHOLOGY:</span>
                              <span className="text-white font-semibold">{snapshotAnalyses[selectedModalSnapshot.id!].breedClassification}</span>
                            </div>

                            <div>
                              <span className="text-gray-400 block text-[8px] uppercase font-bold inline-block mr-1">DYNAMIC RISK:</span>
                              <span className={`font-black uppercase px-1 py-0.5 border text-[9px] ${
                                snapshotAnalyses[selectedModalSnapshot.id!].riskRating === 'CRITICAL' ? 'bg-red-950 text-red-400 border-red-500 animate-pulse' :
                                snapshotAnalyses[selectedModalSnapshot.id!].riskRating === 'HIGH' ? 'bg-orange-950 text-orange-400 border-orange-500' :
                                snapshotAnalyses[selectedModalSnapshot.id!].riskRating === 'MEDIUM' ? 'bg-yellow-950 text-yellow-500 border-yellow-500' :
                                'bg-green-950 text-green-400 border-green-500'
                              }`}>
                                {snapshotAnalyses[selectedModalSnapshot.id!].riskRating}
                              </span>
                            </div>

                            <div>
                              <span className="text-gray-400 block text-[8px] uppercase">HAZARD ANALYSIS:</span>
                              <p className="text-neutral-300 leading-normal font-sans text-[10px]">{snapshotAnalyses[selectedModalSnapshot.id!].riskExplanation}</p>
                            </div>

                            <div>
                              <span className="text-gray-400 block text-[8px] uppercase">INFRASTRUCTURE VISUAL AUDIT:</span>
                              <p className="text-neutral-300 leading-normal font-sans text-[10px]">{snapshotAnalyses[selectedModalSnapshot.id!].sceneAudit}</p>
                            </div>

                            <div className="border-t border-dashed border-cyan-800 pt-1.5 mt-1">
                              <span className="text-cyan-400 block text-[8px] uppercase font-bold">TACTICAL GROUND DISPATCH:</span>
                              <p className="text-cyan-100 font-sans leading-normal text-[10px] italic">{snapshotAnalyses[selectedModalSnapshot.id!].recommendedAction}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <button
                              onClick={() => analyzeSnapshotWithAI(selectedModalSnapshot)}
                              disabled={analyzingSnapshotId === selectedModalSnapshot.id}
                              className={`w-full py-2 px-3 border-2 border-[#141414] shadow-[3px_3px_0px_0px_#141414] font-black text-[10px] text-center uppercase tracking-tight flex items-center justify-center gap-1.5 transition rounded-none cursor-pointer ${
                                analyzingSnapshotId === selectedModalSnapshot.id
                                  ? 'bg-neutral-100 text-neutral-400 border-neutral-300 shadow-none'
                                  : 'bg-gradient-to-r from-red-50 to-cyan-50 text-neutral-900 border-[#141414] hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[4px_4px_0px_0px_#141414]'
                              }`}
                            >
                              {analyzingSnapshotId === selectedModalSnapshot.id ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#141414]" />
                                  <span>Invoking Gemini Multi-modal SDK...</span>
                                </>
                              ) : (
                                <>
                                  <Siren className="w-3.5 h-3.5 text-cyan-600 animate-bounce" />
                                  <span>Generate Gemini Cyber-Report</span>
                                </>
                              )}
                            </button>
                            <div className="p-2 bg-gray-50 border border-gray-200 text-[8px] text-gray-500 leading-normal text-center">
                              ⚠️ Deep multimodal review classifies biological attributes and audits YOLO camera conditions in real-time.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meta Controls & Actions */}
                    <div className="pt-6 border-t border-gray-100 flex items-center gap-2 mt-6 md:mt-0">
                      <a
                        href={selectedModalSnapshot.imageData}
                        download={`Boviguard_HighRes_Alert_${selectedModalSnapshot.id}.jpeg`}
                        className="flex-1 py-2 px-3 border-2 border-[#141414] bg-[#141414] text-white hover:bg-neutral-800 transition rounded-none text-xs font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer text-center"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </a>

                      <button
                        onClick={async () => {
                          if (selectedModalSnapshot.id !== undefined) {
                            if (window.confirm("Are you sure you want to delete this snapshot?")) {
                              const idToDelete = selectedModalSnapshot.id;
                              setSelectedModalSnapshot(null);
                              await deleteSnapshot(idToDelete);
                              await refreshSnapshotsList();
                            }
                          }
                        }}
                        className="p-2 border-2 border-red-600 text-red-600 bg-red-50 hover:bg-red-100 transition rounded-none cursor-pointer"
                        title="Delete snapshot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>

        {/* Start Stark Decorative Footer conforming to spec */}
        <footer className="mt-8 pt-4 border-t-2 border-[#141414] flex flex-col sm:flex-row justify-between items-center font-mono text-[10px] uppercase tracking-widest opacity-60 text-[#141414] gap-4">
          <span>BOVIGUARD SYSTEMS // STATE OF TAMIL NADU INTRUSION MONITORING</span>
          <div className="flex gap-4">
            <span>TIMESTAMP: 2026-06-18</span>
            <span>//</span>
            <span>HACKATHON DEPLOYMENT MANUAL COMPLETE</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
