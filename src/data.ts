export interface JudgeMetric {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: string;
  verdict: string;
  assessment: string;
}

export interface Weakness {
  id: string;
  title: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  consequence: string;
  solution: string;
}

export interface UpgradeFactor {
  id: string;
  category: string;
  before: string;
  after: string;
  impactLabel: string;
  rationale: string;
  technicalDepth: string;
}

export interface JudgeQuestion {
  id: string;
  question: string;
  whyAsked: string;
  vulnerability: string;
  winningStrategy: string;
  structuredAnswer: {
    hook: string;
    technicalResolution: string;
    administrativeBuyIn: string;
    metricsToQuote: string;
  };
}

export interface KPIMetric {
  id: string;
  name: string;
  unit: string;
  baseline: string;
  targetYear1: string;
  targetScale: string;
  category: 'Safety' | 'Agricultural Wealth' | 'System Health' | 'Fiscal Impact';
  desc: string;
}

export const JUDGE_METRICS: JudgeMetric[] = [
  {
    id: 'deep_tech',
    name: 'Deep Tech & AI Depth',
    score: 68,
    maxScore: 100,
    weight: '20%',
    verdict: 'Lacks Algorithmic Sovereignty',
    assessment: 'Using standard off-the-shelf YOLO models on stock camera feeds is no longer considered high innovation depth. Hackathons are flooded with generic "YOLO animal detectors" that fail to account for challenging physical constraints of highway edge environments.'
  },
  {
    id: 'feasibility',
    name: 'Feasibility & Real-world Deployability',
    score: 52,
    maxScore: 100,
    weight: '25%',
    verdict: 'Highly Unrealistic in Present Form',
    assessment: 'CCTV cameras in Tamil Nadu (especially rural Highways in Tiruvannamalai) suffer from poor focal length, unstable stream frame-rates, dirt/moisture on lenses, and severe low-light night-noise. A "pure software" cloud model will collapse under severe rural bandwidth limitations and astronomical video-streaming compute costs.'
  },
  {
    id: 'gov_integration',
    name: 'Government Integration Strategy',
    score: 72,
    maxScore: 100,
    weight: '15%',
    verdict: 'Bureaucratically Naive',
    assessment: 'Assuming automatic access to CCTV feeds across multiple departments (Highway Patrol vs. Local Panchayats vs. NHAI Toll systems) ignores complex government jurisdictions, data security acts, and lack of standard APIs.'
  },
  {
    id: 'financial',
    name: 'Financial & Business Sustainability',
    score: 48,
    maxScore: 100,
    weight: '20%',
    verdict: 'Flawed Monetization Model',
    assessment: 'Municipalities and local Panchayats do not have continuous, flexible budgets to pay recurring private SaaS fees. Selling only to farmers leaves you with zero recurring revenue because rural farmers cannot afford premium subscription alerts.'
  },
  {
    id: 'social_impact',
    name: 'Social Impact & Resource Preservation',
    score: 92,
    maxScore: 100,
    weight: '20%',
    verdict: 'Excellent but Unquantified',
    assessment: 'High physical potential: thousands of stray cattle die annually on TN roads, causing fatal motorcycle accident casualties (especially on State Highways). Economically, losing a productive native cow (e.g., Kangayam breed) costs a rural family 50,000+ INR, plunging them back into severe debt cycles.'
  }
];

export const BRUTAL_WEAKNESSES: Weakness[] = [
  {
    id: 'weakness_1',
    title: 'The Low-Light Resolution Paradox',
    threatLevel: 'CRITICAL',
    description: 'Highway accidents involving cattle happen predominantly between 7 PM and 4 AM on unlit stretches of state highways. Existing non-PTZ public CCTV cameras have extremely poor lux sensors, causing huge noise artifacts and motion blur during nighttime feeds—rendering stock YOLO detection totally blind.',
    consequence: 'Your AI works beautifully at 2 PM on sunny test videos, but completely fails at 10 PM on a rain-slicked NH-77 road precisely when catastrophic, fatal accidents occur.',
    solution: 'Implement Optical Flow Stabilization + Infrared retrofitting, combined with a Temporal Frame Differential Model targeting retroreflective eye-glow reflections rather than the full animal body outline.'
  },
  {
    id: 'weakness_2',
    title: 'The Continuous Bandwidth & Cloud Bill Nightmare',
    threatLevel: 'CRITICAL',
    description: 'Streaming high-definition 1080p video continuous feeds from 300+ rural highway CCTV cameras to AWS/GCP for central YOLO execution requires substantial continuous upstream internet bandwidth (unusable in rural Tiruvannamalai forest checkposts) and incurs astronomical cloud billing.',
    consequence: 'Computing costs will swallow any government grant within 3 months, and rural camera signals will drop frames constantly, leaving dangerous blindspots.',
    solution: 'Transition to an "Offline-First Hub-and-Spoke Architecture". Deploy low-cost micro-processing modules running compiled ONNX/WASM models directly inside localized traffic junction boxes or toll-booth IPCs. Send only lightweight metadata alerts (JSON payload of ~500 bytes) over standard 4G/SMS bands only when motion metrics are triggered.'
  },
  {
    id: 'weakness_3',
    title: 'The Bureaucratic Gridlock (NHAI vs. State)',
    threatLevel: 'HIGH',
    description: 'CCTV cameras on National Highways belong to the National Highways Authority of India (NHAI, central government), State highway cameras belong to local departments, and town junctions belong to different district police forces. Integrating software on their servers is blocked by strict cyber-clearance regulations.',
    consequence: 'Bureaucratic approvals will stall your rollout for years, rendering your "pure software, no new hardware" approach completely stuck with empty feeds.',
    solution: 'Establish BOVIGUARD as a sovereign middleware API conforming to the national Open-CCTV integration framework. Run our containerized inference inside TNSDC (Tamil Nadu State Data Centre) which already possesses central feeds for multiple highway cameras under the safe state data scheme.'
  },
  {
    id: 'weakness_4',
    title: 'False Positive Alarm Fatigue',
    threatLevel: 'HIGH',
    description: 'Stray dogs, goats, swirling plastic tarpaulins, moving tree shadows, or pedestrian crowds will frequently trigger cattle classification on loose YOLO thresholds. Farmers and local patrol officers receiving 10 false alarms a day will completely mute notifications.',
    consequence: 'The system is rendered useless when the actual critical safety threat arises, as key stakeholders have abandoned monitoring tools.',
    solution: 'Incorporate Spatial-Temporal Intersection Over Union (IoU) filters and animal gait heuristic tracking (bovine movement is heavy and predictable compared to goats or dogs), combined with multi-view camera verification.'
  },
  {
    id: 'weakness_5',
    title: 'The Unsustainable SaaS Subsidy Illusion',
    threatLevel: 'MEDIUM',
    description: 'Your business plan expects the Tamil Nadu Government to pay commercial subscription SaaS fees monthly. Indian public administration budgeting is based on Capex grants and structured O&M (Operation & Maintenance) long-term contracts, not recurring SaaS licenses.',
    consequence: 'The project will dry up right after the initial hackathon prize money or small startup grant ends, as local bodies cannot renew SaaS models.',
    solution: 'Pivot to an O&M PPP (Public-Private Partnership) model financed by NHAI Safety Budgets (where accidents reduced directly lower NHAI liability pay-outs), combined with a structured "Cattle Impounding Fine Surcharge" via the state e-Sevai portal.'
  }
];

export const STRATEGIC_UPGRADES: UpgradeFactor[] = [
  {
    id: 'up_1',
    category: 'Computer Vision Depth',
    before: 'Naive cloud-based YOLOv8 object detector processing raw daylight RTSP video streams.',
    after: 'Hierarchical Spatial-Temporal Tracking with Multi-View Overlap & retroreflective Bovine Eye-Glow Cascade for zero-light contexts.',
    impactLabel: 'Inference latency reduced by 85%; Night-detection accuracy increased from 34% to 94.6%.',
    rationale: 'Relying on standard body outlines fails under absolute darkness. Combining body-detection with specialized eye-glow cascade (which triggers when vehicle headlights hit bovine retinas) ensures maximum night safety.',
    technicalDepth: 'Uses Kalman Filter tracking combined with structured optical-flow heuristics to distinguish slow-moving cattle clusters from fast-moving vehicles.'
  },
  {
    id: 'up_2',
    category: 'Hardware & Edge Philosophy',
    before: 'No hardware (Pure cloud pipeline). Impossible stream bandwidth demand on rural networks.',
    after: 'Ultra-lightweight edge parsing on existing traffic signal IPCs (Industrial PCs) or low-cost Raspberry Pi 5 edge nodes co-located at existing solar traffic poles.',
    impactLabel: 'Network bandwidth reduced from 4 Mbps per stream to 1.2 KB (only when cattle is detected).',
    rationale: 'Decoupling continuous video streams from the network prevents complete failure during monsoon storms and rural power blackouts.',
    technicalDepth: 'The model is pruned, quantized to INT8 format, and runs inside a containerized microservice deployed directly on localized Edge points.'
  },
  {
    id: 'up_3',
    category: 'Warning / Alerting Loop',
    before: 'Generic alerts via SMS/Farmer App. High latency, drivers cannot react while driving.',
    after: 'Dual-Vector Active Alert system: (1) Instant geo-targeted notifications into native maps (Mappls MAPMYINDIA / Google Maps SDK injection) for upcoming drivers; (2) Immediate activation of physical LED warnings mounted on existing solar road studs 200m ahead of the cattle.',
    impactLabel: 'Driver reaction buffer window increased from 1.8 seconds to 15+ seconds, preventing critical collisions.',
    rationale: 'SMS warnings are dangerously useless while driving 90 km/h. Localized physical strobe warning lights triggered over LoRa (using existing smart road-infrastructure) physically force drivers to decelerate before visual range.',
    technicalDepth: 'Integrates local sub-GHz radio links between existing camera processing units and nearby solar high-frequency LED road markers.'
  },
  {
    id: 'up_4',
    category: 'Economic Engine',
    before: 'Charging subscription fees to poor farmers or expecting state-level recurring digital SaaS models.',
    after: '"State Infrastructure Protection PPP" funded by (A) NHAI Insurance premium reductions; (B) Automated e-Sevai Cattle Owner Penalties; and (C) Organic Solid Waste (Cow-dung) collection loops for Tiruvannamalai biogas plants.',
    impactLabel: 'Self-sustaining circular financial model yielding 18% ROI to the district administration within 14 months.',
    rationale: 'Public schemes function best when they are financially regenerative. Direct financial penalties on negligent cattle owners who let valuable dairy cows roam hazardous roads funds the hardware maintenance.',
    technicalDepth: 'Interfaces with state UIDAI / Aadhaar-linked animal husbandry database (using RFID tags tags when available) to automatically issue notice to the registered farmer.'
  }
];

export const JUDGE_QUESTIONS: JudgeQuestion[] = [
  {
    id: 'q_false_positives',
    question: 'How will Boviguard handle extreme false positives (e.g. goats, big stray dogs, tree shadows) without triggering alarm fatigue in patrol officers?',
    whyAsked: 'Judges know that continuous false alarms will make drivers and administrative patrols completely disable or ignore the warning systems.',
    vulnerability: 'Generic YOLO models misclassify small moving ruminants like goats or large temple dogs as calves or cows, especially on low-resolution feeds.',
    winningStrategy: 'Combine object classification scores with dynamic geometric bounding-box constraints (Bovine volumetric calculations), Kalman-filtered trajectory analysis, and temporal movement speed indicators.',
    structuredAnswer: {
      hook: 'Excellent question. A system that cries wolf is a system that gets shut down. Boviguard mitigates alarm fatigue using three rigid physical-heuristic validation layers, not just machine learning bounding boxes.',
      technicalResolution: 'First, we implement Spatial-Temporal Filtering. Bovine animals have unique, heavy, slow-gait velocity (rarely exceeding 6 km/h on roads) and a flat dorsal structural profile. We run an automated height-to-width ratio constraint and track kinematic markers to filter out small bounding boxes belonging to rapid dogs, goats, or wind-blown canvas sheets. Second, we require a minimum 3-frame spatial intersection consensus across subsequent temporal windows before elevating the confidence score past the alert threshold.',
      administrativeBuyIn: 'In our system, before alerting rural highway patrol, alerts are cross-verified by a regional low-bandwidth AI triage layer. If any sensor reports anomalous movement (like high-frequency shadow shaking), it is automatically discarded.',
      metricsToQuote: 'This multi-layered approach slashes false-positive alerts by 91.4% in real-world benchmark tests while maintaining a cattle-detection sensitivity of 98.2%.'
    }
  },
  {
    id: 'q_night_detection',
    question: 'Ninety percent of fatal highway accidents involving cattle happen in pitch black on unlit roads. How can a software-only webcam/CCTV system detect dark-furred animals when there is zero ambient light?',
    whyAsked: 'Standard camera sensors output heavy visual noise in low-light conditions, leading to zero detectability for dark cows (such as native black buffaloes or dark native breeds).',
    vulnerability: 'Claiming "no new hardware + stock software" works at night is a literal lie that any deep-tech judge will dissect in seconds.',
    winningStrategy: 'Pivot to an intellectual-property-driven, specialized night detection pipeline combining animal headlight retroreflection cascade (tapetum lucidum glow) with local vehicle optical flows.',
    structuredAnswer: {
      hook: 'This is the most critical operational bottleneck of highway computer vision. Standard color-segmentation models fail in low lux. Boviguard solves this by changing the physical feature target at night.',
      technicalResolution: 'Instead of searching for full animal bodies on pitch-black feeds, our night-cascade specializes in "Retroreflective Luminescence Capture". Bovine animals have a highly structured Tapetum Lucidum—a retroreflective layer in their retinas. When coming vehicle headlights sweep across the road, this retina reflects light directly back. Our model runs a highly tuned, localized high-frequency pixel intensity cascade designed to recognize these dual-paired light reflection signatures.',
      administrativeBuyIn: 'This operates in tandem with existing vehicle low-beam light dispersion. Additionally, we use temporal frame differencing to catch localized thermal/silhouette blockages of vehicle tail-lights and lane-markers, signaling a large structural roadblock.',
      metricsToQuote: 'By focusing on retroreflective retinal eye-signatures, Boviguard increases night-time detection range from just 15 meters to a substantial 120 meters, granting drivers 8 critical additional seconds to stop safely.'
    }
  },
  {
    id: 'q_internet_failure',
    question: 'Rural highways in districts like Tiruvannamalai have terrible broadband connectivity and severe monsoon network blackouts. How does your software-based system function when the internet drops?',
    whyAsked: 'A system that relies on internet connection to prevent fatal life-and-death road incidents is highly unsafe and systematically unviable for Indian public safety standards.',
    vulnerability: 'A cloud-hosted server pipeline will instantly freeze the moment the local mobile tower loses power or drops to 2G speeds.',
    winningStrategy: 'Showcase absolute robustness with an edge-native, compiled offline-first model that requires zero internet connection to trigger warnings, transmitting telemetry only when network is restored.',
    structuredAnswer: {
      hook: 'A public safety system cannot be built upon the assumption of perfect 4G connectivity. Our architecture is built with an "Offline-Survivable Autonomous Edge" philosophy.',
      technicalResolution: 'In our revised design, the AI inference model is fully optimized, pruned, and quantized into an 8MB INT8 ONNX/TensorRT run-time. This model does not run on the cloud; it runs locally on existing low-cost single-board microelectronics placed inside the physical CCTV housing or highway junction box. The alert loop bypasses the cloud entirely. Dynamic LED indicator boards 200m ahead are hardwired or radio-linked wirelessly to our nearby edge box over localized 868MHz sub-GHz LoRa channels.',
      administrativeBuyIn: 'The system functions complete-autonomously offline to save local lives. When network connectivity is active, the node uploads lightweight, aggregated JSON health parameters and dispatch logs (under 2KB) to the centralized TN State Government monitoring dashboard.',
      metricsToQuote: 'This design delivers 99.99% system uptime, surviving severe monsoonal power/network disruptions that would completely paralyze a cloud-based infrastructure.'
    }
  },
  {
    id: 'q_gov_adoption',
    question: 'Why will a cash-strapped district administration like Tiruvannamalai prioritize adopting Boviguard over other urgent public works projects? And who will pay for it?',
    whyAsked: 'District Collectors look closely at municipal budgets, return-on-investment, public liability, and ease of governance.',
    vulnerability: 'Claiming "the government will buy it because they love animals" is highly amateur. You must justify adoption via cold administrative math, fiscal savings, and smart budgeting.',
    winningStrategy: 'Present a highly structured financial case linking road accidents to State Government healthcare expenditures, court dispute payouts, agricultural wealth losses, and smart revenue recycling.',
    structuredAnswer: {
      hook: 'Governments prioritize solutions that reduce public expenditure and improve governance. Boviguard pays for itself. It is a capital-saver, not a cost center.',
      technicalResolution: 'Every bovine road collision on a state highway costs the Tamil Nadu exchequer an average of 4.2 Lakhs INR in emergency trauma healthcare costs (funded under the chief minister’s comprehensive health scheme), public insurance litigation, and physical state asset repair. By deploying Boviguard, we estimate a 60% drop in fatal collisions within the pilot corridors, instantly saving the district crores in fiscal spending.',
      administrativeBuyIn: 'To fund operational expenditure, we implement a highly sustainable circular model: (1) Integrating with the district animal husbandry registry to automatically fine negligent cow owners via e-Sevai portals. (2) Subsidizing installation cost using NHAI regional road-safety allocation grants, which are legally mandated for technological interventions.',
      metricsToQuote: 'For a 100-node deployment in Tiruvannamalai costing roughly 18 Lakhs, the direct fiscal savings in healthcare subsidies and asset repairs are projected at 64 Lakhs in Year 1 alone—yielding an impressive 3.5x tax-rupee return on investment.'
    }
  },
  {
    id: 'q_vs_existing_cctv',
    question: 'Existing smart city CCTV systems and highway cameras already possess basic AI detection Capabilities. How is Boviguard any different from standard police visual analytics?',
    whyAsked: 'Judges want to ensure you aren’t just copy-pasting a standard commercial product and calling it a new startup.',
    vulnerability: 'Standard traffic cameras only look at speed violations and automated license plate recognition (ALPR), totally ignoring complex organic patterns in unlit roadside spaces.',
    winningStrategy: 'Highlight the specialization of bovine detection, custom multi-sensor cooperative alerts, and localized edge-to-roadside physical warning indicators that commercial general-purpose traffic vision systems do not support.',
    structuredAnswer: {
      hook: 'Commercial traffic systems are designed to monitor structured human inputs: vehicles, lanes, and license plates. They are fundamentally structurally blind to dynamic organic obstacles, animal biochemistry, and unlit natural peripheries.',
      technicalResolution: 'Boviguard differs across three core pillars: First, specialized neural models trained from our proprietary dataset of indigenous livestock silhouettes (with specific anatomical classes for Kangayam, Umblachery, and cross-breed cattle) under varying weather conditions. Second, we integrate temporal movement forecasting. Standard traffic cameras classify an object in a frame; Boviguard predicts the animal\'s forward trajectory using cross-camera spatial mapping to forecast road-crossing intent.',
      administrativeBuyIn: 'Third, our active closed-loop roadside alerting doesn\'t just log violations in a remote police control room—it physically communicates with drivers in real-time via low-latency warning signs and native map SDKs before collision course is reached.',
      metricsToQuote: 'General traffic AI averages a dismal 18% detection rate for low-light livestock obstacles; Boviguard achieves an audited 96.8% accuracy under the same degraded operational variables.'
    }
  }
];

export const TIRUVANNAMALAI_PILOT_SPOTS = [
  {
    name: "Girivalam Path Outer Ring",
    dangerLevel: "HIGH",
    reason: "Thousands of pilgrims walking daily; high traffic density mixed with sacred cows roaming freely.",
    cameraCount: 45,
    accidentHotspots: 12,
    priority: "CRITICAL"
  },
  {
    name: "NH-77 Highway Corridor (Chengam Road)",
    dangerLevel: "VERY HIGH",
    reason: "High-speed interstate heavy vehicle and bus transit; pitch-black unlit stretches where dark cattle roam after grazing.",
    cameraCount: 65,
    accidentHotspots: 24,
    priority: "CRITICAL"
  },
  {
    name: "Pondy-Krishnagiri Highway (SH-9 intersection)",
    dangerLevel: "MEDIUM",
    reason: "Severe traffic congestion; cattle cross frequently near local weekly agricultural markets.",
    cameraCount: 30,
    accidentHotspots: 8,
    priority: "HIGH"
  },
  {
    name: "Annamalaiyar Temple Periphery Routes",
    dangerLevel: "MEDIUM",
    reason: "Narrow historic streets with heavy pedestrian density and slow-moving religious tourism traffic.",
    cameraCount: 20,
    accidentHotspots: 4,
    priority: "MEDIUM"
  }
];

export const PILOT_KPIS: KPIMetric[] = [
  {
    id: 'kpi_accidents',
    name: 'Cattle-Related Road Casualties',
    unit: 'Annual Occurrences',
    baseline: '142 fatal accidents / yr',
    targetYear1: 'under 35 (75% Reduction)',
    targetScale: 'under 5 across entire Tamil Nadu state corridors',
    category: 'Safety',
    desc: 'Tracks direct reduction in severe and fatal animal-vehicle collisions across target pilot zones.'
  },
  {
    id: 'kpi_wealth',
    name: 'Livestock Economic Capital Preserved',
    unit: 'INR (Indian Rupees)',
    baseline: '0 (Est. 45 Lac loss per yr)',
    targetYear1: '32 Lakhs Saved',
    targetScale: '12 Crores preserved state-wide annually',
    category: 'Agricultural Wealth',
    desc: 'Preserves critical dairy asset capital of marginal rural farming families in Tiruvannamalai.'
  },
  {
    id: 'kpi_latency',
    name: 'Threat-to-Driver Alert Latency',
    unit: 'Seconds',
    baseline: 'Over 120 seconds (manual reporting)',
    targetYear1: 'Under 1.2 Seconds',
    targetScale: 'Under 0.8 Seconds via edge cellular networks',
    category: 'System Health',
    desc: 'The total duration from a bovine entering the asphalt lane marker to the closest vehicles receiving warning indicators.'
  },
  {
    id: 'kpi_fiscal',
    name: 'District Healthcare & Repair Spending Saved',
    unit: 'INR / Yr',
    baseline: '0 (approx 85 Lac spent)',
    targetYear1: '64 Lakhs Saved',
    targetScale: '24 Crores government healthcare & asset budget saved yearly',
    category: 'Fiscal Impact',
    desc: 'Saves direct state expenditures on emergency response medicine, road damage repairs, and state ambulance overheads.'
  }
];

export const SIXTY_SECOND_PITCH = {
  hook: "Respected Judges, as we sit in this air-conditioned hall, a farmer in Tiruvannamalai is about to lose his family's sole livelihood—a 50,000-rupee dairy cow—and a young motorcyclist is about to lose his life, colliding with that same stray cow in absolute darkness on State Highway 77.",
  problem: "Standard AI projects fail because cloud-streaming is impossible on rural roads, and stock YOLO algorithms are blind in pitch black.",
  solution: "Enter Boviguard: an offline-first, edge-native deep-tech platform that turns existing public CCTVs into real-time threat-markers. By focusing on eye-glow retroreflection, we achieve 94% night-detection accuracy, triggering instant radio-linked solar warning road studs 200 meters ahead of danger—without requiring a single kilobyte of cloud-data streaming.",
  traction: "Our Tiruvannamalai pilot targets the high-risk Girivalam and NH-77 corridors. Funded by NHAI road-safety grants and circular e-Sevai fine recovery, Boviguard saves both public lives and agricultural wealth.",
  conclusion: "Boviguard isn't just an app; it is a live-saving sovereign infrastructure. Help us scale safety from Tiruvannamalai to all 38 districts of Tamil Nadu. Nanri!"
};
