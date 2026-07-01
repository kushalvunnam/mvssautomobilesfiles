import React, { useState, useEffect } from 'react';
import { 
  Search, Wrench, ShieldCheck, Clock, Phone, MapPin, Car, FileText, 
  ChevronRight, ArrowRight, Lock, X, Award, CheckCircle2, Star, 
  Cpu, Sparkles, Palette, Layers, Users, Landmark, ChevronLeft, Calendar, HelpCircle
} from 'lucide-react';
import Login from './Login';

export default function LandingPage({ onLoginSuccess }) {
  const [showLogin, setShowLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackerResult, setTrackerResult] = useState(null);
  const [searched, setSearched] = useState(false);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Statistics State for Animation
  const [stats, setStats] = useState({
    vehicles: 0,
    customers: 0,
    claims: 0,
    experience: 0,
    satisfaction: 0
  });

  // Animated counters on mount
  useEffect(() => {
    const targets = {
      vehicles: 18500,
      customers: 14200,
      claims: 4800,
      experience: 15,
      satisfaction: 99.7
    };

    const duration = 2005; // ~2 seconds
    const frameRate = 1000 / 60; // 60 fps
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      
      // Easing out cubic function
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      setStats({
        vehicles: Math.floor(easeProgress * targets.vehicles),
        customers: Math.floor(easeProgress * targets.customers),
        claims: Math.floor(easeProgress * targets.claims),
        experience: Math.floor(easeProgress * targets.experience),
        satisfaction: parseFloat((easeProgress * targets.satisfaction).toFixed(1))
      });

      if (frame >= totalFrames) {
        clearInterval(timer);
        setStats(targets);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, []);

  // 8 Servicing Stages list for Tracker
  const stages = [
    { key: 'Created', label: 'Registered', desc: 'Job Card created & vehicle checked in.' },
    { key: 'Inspect Stage', label: 'Diagnosis', desc: 'Allotted to technician for inspection.' },
    { key: 'Estimation', label: 'Estimation', desc: 'Preparing spare parts and labor quote.' },
    { key: 'Customer Approval', label: 'Approval', desc: 'Awaiting customer quote approval.' },
    { key: 'Work In Progress', label: 'Repairing', desc: 'Actual mechanical/body work in progress.' },
    { key: 'Quality Check', label: 'QC Check', desc: 'Inspecting work quality & completion.' },
    { key: 'Ready for Delivery', label: 'Ready', desc: 'Final wash, polishing & bill generation.' },
    { key: 'Delivered', label: 'Released', desc: 'Payment received & Gate Pass issued.' }
  ];

  // Gallery Images List
  const galleryImages = [
    {
      src: '/workshop/page_5_img_1.jpeg',
      title: 'Workshop Entrance & Team',
      desc: 'Our main entrance gate featuring our five dedicated lead technicians and MVSS Automobiles premium signage.',
      category: 'Infrastructure'
    },
    {
      src: '/workshop/page_10_img_1.jpeg',
      title: 'Mercedes-Benz CLA Premium Bay',
      desc: 'A white Mercedes-Benz CLA undergoing scheduled periodic maintenance in our high-end service bay.',
      category: 'Premium Care'
    },
    {
      src: '/workshop/page_8_img_1.jpeg',
      title: 'BMW Engine Diagnostics',
      desc: 'A premium dark blue BMW 5-Series sedan connected to advanced diagnostic scanners in our specialized repair zone.',
      category: 'Diagnostics'
    },
    {
      src: '/workshop/page_7_img_1.jpeg',
      title: 'Dual-Lift Service Bays',
      desc: 'Spacious service floor featuring heavy-duty red hydraulic lifts raising vehicles for detailed underside servicing.',
      category: 'Workshop Floor'
    },
    {
      src: '/workshop/page_3_img_1.jpeg',
      title: 'Engine Bay Tune-up',
      desc: 'A certified technician conducting engine diagnostics and electrical checks on an orange Tata Nexon.',
      category: 'Expert Technicians'
    },
    {
      src: '/workshop/page_2_img_1.jpeg',
      title: 'Underbody Inspection',
      desc: 'Mechanic inspecting steering, suspension, and chassis components underneath a vehicle raised on a hydraulic lift.',
      category: 'Vehicle Lifts'
    },
    {
      src: '/workshop/page_9_img_1.jpeg',
      title: 'Bosch Nitrogen Inflation Station',
      desc: 'Our green Bosch NTI 101 nitrogen gas generator machine, providing high-precision tyre inflation.',
      category: 'Equipment'
    },
    {
      src: '/workshop/page_6_img_1.jpeg',
      title: 'Genuine Spares Store',
      desc: 'Dedicated spare parts store room stocked with 100% OEM Toyota and multi-brand genuine auto spares.',
      category: 'Genuine Spares'
    },
    {
      src: '/workshop/page_4_img_1.jpeg',
      title: 'Customer Reception Office',
      desc: 'Air-conditioned office room equipped with premium seating for comfortable customer check-ins and consultations.',
      category: 'Reception'
    }
  ];

  // Booking Form Submission
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingPlate, setBookingPlate] = useState('');
  const [bookingStream, setBookingStream] = useState('General Servicing (PMS)');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingName('');
      setBookingPhone('');
      setBookingPlate('');
    }, 4000);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearched(true);
    // Retrieve mock jobcards from localStorage/sessionStorage
    const localJcs = JSON.parse(
      localStorage.getItem('mock_jobcards') || 
      sessionStorage.getItem('mock_jobcards') || 
      '[]'
    );
    
    // Find matching jobcard by plate number or jobcard number
    const match = localJcs.find(jc => 
      (jc.vehicleId?.vehicleNumber || '').toLowerCase().replace(/\s+/g, '') === searchQuery.toLowerCase().replace(/\s+/g, '') ||
      (jc.jobCardNo || '').toLowerCase().replace(/\s+/g, '') === searchQuery.toLowerCase().replace(/\s+/g, '')
    );

    if (match) {
      setTrackerResult(match);
    } else {
      setTrackerResult(null);
    }
  };

  const getCurrentStageIndex = (status) => {
    const idx = stages.findIndex(s => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  // Lightbox handlers
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction) => {
    let nextIndex = lightboxIndex + direction;
    if (nextIndex < 0) nextIndex = galleryImages.length - 1;
    if (nextIndex >= galleryImages.length) nextIndex = 0;
    setLightboxIndex(nextIndex);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[45%] h-[45%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-5%] w-[40%] h-[40%] bg-sky-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-white rounded-lg shadow-md border border-slate-800 shrink-0">
            <img 
              src="/workshop/page_1_img_1.png" 
              alt="MVSS Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-black tracking-wider uppercase text-white leading-tight">
              MVSS <span className="text-indigo-400">AUTOMOBILES</span>
            </h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">
              Pvt. Ltd.
            </p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-450 uppercase tracking-wider">
          <a href="#services" className="hover:text-indigo-400 transition-colors">Services</a>
          <a href="#facility" className="hover:text-indigo-400 transition-colors">Facility Showcase</a>
          <a href="#highlights" className="hover:text-indigo-400 transition-colors">Highlights</a>
          <a href="#why-choose-us" className="hover:text-indigo-400 transition-colors">Why Choose Us</a>
          <a href="#gallery" className="hover:text-indigo-400 transition-colors">Gallery</a>
          <a href="#tracker" className="hover:text-indigo-400 transition-colors">Track Vehicle</a>
          <a href="#contact" className="hover:text-indigo-400 transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#book-service"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-indigo-600/20"
          >
            <Calendar className="w-3.5 h-3.5" />
            Book Service
          </a>
          <button
            onClick={() => setShowLogin(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-805 text-slate-200 hover:text-white hover:border-slate-700 hover:bg-slate-850 rounded-xl text-xs font-bold transition-all shadow-md shadow-black/40"
          >
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            Staff Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center max-w-7xl mx-auto px-6 py-12 lg:py-20">
        
        {/* Full-Screen Hero Background with Dark Blue Gradient Overlay */}
        <div className="absolute inset-0 z-0 rounded-3xl overflow-hidden shadow-2xl border border-slate-900">
          <img 
            src="/workshop/page_10_img_1.jpeg" 
            alt="Mercedes-Benz in Bay" 
            className="w-full h-full object-cover object-center transform scale-100 filter brightness-95"
            loading="eager"
          />
          {/* Gradients to darken background for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-blue-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80" />
        </div>

        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase border border-indigo-500/30 bg-indigo-950/30 text-indigo-400 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Premium Multi-Brand Workshop
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Professional Car Service <br />
              <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
                & Body Shop Solutions
              </span>
            </h2>
            
            <p className="text-sm sm:text-base text-slate-350 font-medium leading-relaxed max-w-xl">
              Welcome to Secunderabad's trusted automotive repair and painting hub. Experience OEM-quality vehicle maintenance backed by Bosch diagnostics, transparent billing, and 100% paperless digital job cards.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href="#book-service"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-indigo-605/30 hover:scale-[1.02]"
              >
                Book Service
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => setShowLogin(true)}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-slate-900 hover:bg-slate-850 text-slate-350 rounded-xl text-xs font-extrabold border border-slate-800 hover:border-slate-700 transition-all hover:scale-[1.02]"
              >
                Staff Login
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
            {/* Glassmorphism Quick Info Card */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md space-y-5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500" />
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Live Infrastructure</span>
                <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-900">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Bays Active
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-950/50 border border-indigo-900/30 rounded-xl text-indigo-400">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">Full-Fledged Paint Booth</h4>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Custom paint matching system, dust-free paint booth, and original OEM finishing.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-sky-950/50 border border-sky-900/30 rounded-xl text-sky-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">Bosch ECU Diagnostics</h4>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Advanced error code scanning and calibration systems for premium passenger cars.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-950/50 border border-emerald-900/30 rounded-xl text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">Cashless Claims Support</h4>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Pre-approved cashless assistance and coordination with all major motor insurers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Tracker Section */}
      <section id="tracker" className="py-20 bg-slate-950 border-y border-slate-900 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 space-y-8 relative z-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">Real-Time Vehicle Tracker</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Check Your Service Status</h3>
            <p className="text-xs text-slate-450 font-semibold max-w-md mx-auto">Enter your Vehicle Registration Number (e.g. TS08FZ5384) or Job Card Number (e.g. JC-20260619-001) to trace your vehicle's workflow progress.</p>
          </div>

          <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
              <input
                type="text"
                required
                placeholder="e.g. TS08FZ5384 or JC-1001"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-600 transition-all font-mono uppercase tracking-wider"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 shrink-0"
            >
              Track Vehicle
            </button>
          </form>

          {searched && (
            <div className="mt-8 animate-fade-in">
              {trackerResult ? (
                <div className="bg-slate-905/30 border border-slate-850 p-6 rounded-3xl space-y-6 backdrop-blur-sm shadow-xl">
                  {/* Result Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-4">
                    <div>
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Customer Profile</span>
                      <h4 className="text-sm font-black text-white mt-0.5">{trackerResult.customerId?.name || 'Valued Customer'}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">
                        {trackerResult.vehicleId?.make} {trackerResult.vehicleId?.model} ({trackerResult.vehicleId?.vehicleNumber})
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Job Card Identifier</span>
                      <span className="block text-xs font-bold text-indigo-400 font-mono mt-0.5">{trackerResult.jobCardNo}</span>
                      <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">Operational Stream: {trackerResult.serviceType}</span>
                    </div>
                  </div>

                  {/* Horizontal Timeline */}
                  <div className="space-y-4 pt-2">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase block tracking-wider">Service Stage Progress</span>
                    
                    <div className="relative py-4 overflow-x-auto min-w-[500px]">
                      {/* Timeline Bar */}
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-850 -translate-y-1/2 z-0" />
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-indigo-500 to-sky-400 -translate-y-1/2 z-0 transition-all duration-700" 
                        style={{
                          width: `${(getCurrentStageIndex(trackerResult.status) / (stages.length - 1)) * 100}%`
                        }}
                      />

                      {/* Timeline Nodes */}
                      <div className="relative z-10 flex justify-between">
                        {stages.map((stage, idx) => {
                          const currentIdx = getCurrentStageIndex(trackerResult.status);
                          const isCompleted = idx <= currentIdx;
                          const isActive = idx === currentIdx;

                          return (
                            <div key={stage.key} className="flex flex-col items-center text-center space-y-2 w-16 group shrink-0">
                              <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center border font-mono text-[10px] font-black transition-all ${
                                  isActive 
                                    ? 'bg-indigo-600 border-indigo-400 text-white scale-110 shadow-lg shadow-indigo-600/40' 
                                    : isCompleted 
                                      ? 'bg-slate-900 border-indigo-550 text-indigo-400' 
                                      : 'bg-slate-950 border-slate-850 text-slate-600'
                                }`}
                              >
                                {idx + 1}
                              </div>
                              <span className={`text-[9px] font-extrabold uppercase tracking-wide transition-colors ${
                                isActive ? 'text-indigo-400' : isCompleted ? 'text-slate-200' : 'text-slate-600'
                              }`}>
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Active Stage Alert */}
                  <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-2xl flex items-center gap-3.5 mt-4">
                    <Clock className="w-5 h-5 text-indigo-400 shrink-0 animate-pulse" />
                    <div className="text-left text-xs leading-relaxed">
                      <span className="font-bold text-white uppercase tracking-wide">
                        Current Status: {stages[getCurrentStageIndex(trackerResult.status)].label}
                      </span>
                      <p className="text-slate-400 font-semibold">{stages[getCurrentStageIndex(trackerResult.status)].desc}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-950/20 border border-red-900/30 p-5 rounded-2xl text-center text-xs font-semibold text-red-450 max-w-md mx-auto flex items-center justify-center gap-2.5">
                  <span className="text-red-400 font-bold">⚠️</span>
                  <span>No active job card matches "{searchQuery}". Please check the registration code.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Company Highlights */}
      <section id="highlights" className="py-20 max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">Key Capabilities</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Workshop Highlights</h3>
          <p className="text-xs text-slate-450 font-semibold max-w-md mx-auto">MVSS Automobiles matches authorized dealership infrastructure at highly competitive pricing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Multi Brand Workshop',
              desc: 'Equipped to service hatchbacks, sedans, SUVs, and luxury passenger vehicles from major global OEMs.',
              icon: Layers,
              color: 'text-sky-400 bg-sky-950/30 border-sky-900/30'
            },
            {
              title: 'Bosch Diagnostic Equipment',
              desc: 'Harnessing advanced vehicle system scanners and tyre inflation systems for pinpoint diagnostic scanning.',
              icon: Cpu,
              color: 'text-indigo-400 bg-indigo-950/30 border-indigo-900/30'
            },
            {
              title: 'Insurance Claim Assistance',
              desc: 'Seamless insurance estimation and surveyor alignment with cashless support for hassle-free processing.',
              icon: Landmark,
              color: 'text-emerald-400 bg-emerald-950/30 border-emerald-900/30'
            },
            {
              title: 'Genuine Spare Parts',
              desc: 'Utilizing 100% genuine spares and oil grades. High-capacity store room holding deep inventory filters.',
              icon: Award,
              color: 'text-purple-400 bg-purple-950/30 border-purple-900/30'
            },
            {
              title: 'Body Shop & Painting',
              desc: 'Equipped with heavy structural pullers, modern paint mixing rooms, and dust-free dry paint baking booths.',
              icon: Palette,
              color: 'text-orange-400 bg-orange-950/30 border-orange-900/30'
            },
            {
              title: 'Expert Technicians',
              desc: 'Supervised by skilled advisors and veteran engine specialists, dedicated to providing a stress-free care experience.',
              icon: Users,
              color: 'text-pink-400 bg-pink-950/30 border-pink-900/30'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl hover:border-slate-800 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className={`p-3 rounded-xl w-fit ${item.color} border mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Statistics Section (Animated Counters) */}
      <section className="py-16 bg-slate-900/20 border-y border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            
            <div className="space-y-1">
              <span className="block text-3xl sm:text-4xl lg:text-5xl font-black text-white font-mono leading-none tracking-tight">
                {stats.vehicles.toLocaleString()}+
              </span>
              <span className="block text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
                Vehicles Serviced
              </span>
            </div>

            <div className="space-y-1">
              <span className="block text-3xl sm:text-4xl lg:text-5xl font-black text-indigo-400 font-mono leading-none tracking-tight">
                {stats.customers.toLocaleString()}+
              </span>
              <span className="block text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
                Customers Served
              </span>
            </div>

            <div className="space-y-1">
              <span className="block text-3xl sm:text-4xl lg:text-5xl font-black text-sky-400 font-mono leading-none tracking-tight">
                {stats.claims.toLocaleString()}+
              </span>
              <span className="block text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
                Insurance Claims
              </span>
            </div>

            <div className="space-y-1">
              <span className="block text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-400 font-mono leading-none tracking-tight">
                {stats.experience}+ Years
              </span>
              <span className="block text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
                Workshop Experience
              </span>
            </div>

            <div className="space-y-1 col-span-2 md:col-span-1">
              <span className="block text-3xl sm:text-4xl lg:text-5xl font-black text-orange-400 font-mono leading-none tracking-tight">
                {stats.satisfaction}%
              </span>
              <span className="block text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
                Customer Satisfaction
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* Why Choose MVSS */}
      <section id="why-choose-us" className="py-20 max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">Our Value Proposition</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Why Choose MVSS Automobiles</h3>
          <p className="text-xs text-slate-450 font-semibold max-w-md mx-auto">We stand apart with strict engineering controls, completely digital processes, and certified crew.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'OEM Quality',
              desc: 'Using original filters, lubricants, and chassis replacement components to preserve factory warranty specifications.',
              icon: CheckCircle2
            },
            {
              title: 'Transparent Billing',
              desc: 'Completely transparent parts line items, rates, labor fees, and GST tax invoice calculations without hidden charges.',
              icon: CheckCircle2
            },
            {
              title: 'Digital Job Cards',
              desc: 'Paperless logging of checksheets, photographs, technician allocation, and estimates accessible via live web links.',
              icon: CheckCircle2
            },
            {
              title: 'Fast Delivery',
              desc: 'Efficient scheduling, rapid repair flows, and real-time inventory checks to ensure quick vehicle turn-around.',
              icon: CheckCircle2
            },
            {
              title: 'Experienced Staff',
              desc: 'Supervised by skilled advisors and veteran engine specialists, dedicated to providing a stress-free care experience.',
              icon: CheckCircle2
            },
            {
              title: 'Modern Workshop Infrastructure',
              desc: 'Two high-capacity facilities with heavy vehicle lifts, specialized stores, and dust-free diagnostic and repair floors.',
              icon: CheckCircle2
            }
          ].map((card, idx) => (
            <div 
              key={idx} 
              className="bg-slate-900/25 border border-slate-900 p-6 rounded-2xl flex gap-4 hover:border-slate-800 transition-colors"
            >
              <div className="text-indigo-400 shrink-0 mt-0.5">
                <card.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">{card.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Facility Showcase */}
      <section id="facility" className="py-20 bg-slate-950 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">Virtual Tour</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Facility Showcase</h3>
            <p className="text-xs text-slate-450 font-semibold max-w-md mx-auto">Explore the actual infrastructure, advanced equipment, and client environments at MVSS Automobiles.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Workshop Floor',
                image: '/workshop/page_7_img_1.jpeg',
                desc: 'Spacious dual-bay service zones raising multiple vehicles concurrently to ensure rapid scheduling throughput.'
              },
              {
                title: 'Vehicle Lifts',
                image: '/workshop/page_2_img_1.jpeg',
                desc: 'Heavy-duty commercial hydraulic hoist lifts enabling precision underside exhaust, gearbox, and suspension service access.'
              },
              {
                title: 'Service Bays',
                image: '/workshop/page_8_img_1.jpeg',
                desc: 'Well-lit dedicated engine tuning and diagnostics bays, complete with diagnostic systems and tools.'
              },
              {
                title: 'Office Reception',
                image: '/workshop/page_4_img_1.jpeg',
                desc: 'Comfortable client reception lobby, air-conditioned and prepared for estimate review and billing consultations.'
              },
              {
                title: 'Spare Parts Section',
                image: '/workshop/page_6_img_1.jpeg',
                desc: 'Dedicated spare parts division maintaining a deep catalog inventory of genuine Toyota and multi-brand components.'
              },
              {
                title: 'Premium Vehicle Handling',
                image: '/workshop/page_10_img_1.jpeg',
                desc: 'Equipped to service luxury foreign sedans and sports models under careful engineering guidelines.'
              }
            ].map((showcase, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900/30 border border-slate-900 rounded-3xl overflow-hidden shadow-lg group hover:border-slate-800 transition-all duration-300"
              >
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={showcase.image} 
                    alt={showcase.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                </div>
                <div className="p-5 space-y-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">{showcase.title}</h4>
                  <p className="text-xs text-slate-450 leading-relaxed font-semibold">{showcase.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Workshop Gallery (Masonry & Lightbox) */}
      <section id="gallery" className="py-20 max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">Real Images Only</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Workshop Gallery</h3>
          <p className="text-xs text-slate-450 font-semibold max-w-md mx-auto">Browse high-resolution photographs showcasing real service setups, diagnostic computers, and technicians on the job.</p>
        </div>

        {/* Masonry Layout (using CSS Columns) */}
        <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
          {galleryImages.map((image, idx) => (
            <div 
              key={idx} 
              onClick={() => openLightbox(idx)}
              className="break-inside-avoid bg-slate-900/30 border border-slate-900 rounded-3xl overflow-hidden shadow-lg group hover:border-slate-800 transition-all duration-300 cursor-pointer relative"
            >
              <img 
                src={image.src} 
                alt={image.title}
                className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                loading="lazy"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-slate-950/85 opacity-0 group-hover:opacity-100 transition-all duration-350 flex flex-col justify-end p-5 space-y-1.5 backdrop-blur-xs">
                <span className="text-[8px] font-extrabold text-indigo-400 uppercase tracking-widest">{image.category}</span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{image.title}</h4>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed line-clamp-2">{image.desc}</p>
                <div className="pt-2 text-[9px] text-indigo-300 font-bold uppercase flex items-center gap-1">
                  View Full Image <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Preview Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-6">
          {/* Close button */}
          <button 
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all z-50 shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Arrow */}
          <button 
            onClick={() => navigateLightbox(-1)}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-slate-900/50 hover:bg-slate-800 hover:text-white text-slate-400 rounded-full border border-slate-800/80 transition-all z-10 shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Main Image Container */}
          <div className="flex-1 flex items-center justify-center max-w-4xl mx-auto w-full my-8">
            <img 
              src={galleryImages[lightboxIndex].src} 
              alt={galleryImages[lightboxIndex].title}
              className="max-h-[70vh] max-w-full rounded-2xl object-contain border border-slate-900 shadow-2xl"
            />
          </div>

          {/* Right Arrow */}
          <button 
            onClick={() => navigateLightbox(1)}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-slate-900/50 hover:bg-slate-800 hover:text-white text-slate-400 rounded-full border border-slate-800/80 transition-all z-10 shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Bottom Caption */}
          <div className="max-w-xl mx-auto text-center space-y-1 select-text">
            <span className="inline-block px-2.5 py-0.5 bg-indigo-950/40 border border-indigo-900/30 rounded-md text-[9px] font-black text-indigo-400 uppercase tracking-widest">
              {galleryImages[lightboxIndex].category}
            </span>
            <h4 className="text-sm font-black text-white uppercase tracking-wider">{galleryImages[lightboxIndex].title}</h4>
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">{galleryImages[lightboxIndex].desc}</p>
            <p className="text-[10px] text-slate-550 font-bold font-mono pt-1">
              Image {lightboxIndex + 1} of {galleryImages.length}
            </p>
          </div>
        </div>
      )}

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-slate-900/10 border-t border-slate-900 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">Customer Reviews</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Verified Feedback</h3>
            <p className="text-xs text-slate-450 font-semibold max-w-md mx-auto">Hear what private passenger and commercial luxury vehicle owners say about our technical repairs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'K. Rajeev Sharma',
                vehicle: 'BMW 520d (AP-29-AW-9633)',
                comment: 'The digital job card and live updates on my BMW were amazing. Highly professional diagnostic scanning, clean facility, and transparent billing for brake replacement.',
                rating: 5,
                date: 'June 2026'
              },
              {
                name: 'Ananth Reddy',
                vehicle: 'Mercedes-Benz CLA (TS-07-FN-0189)',
                comment: 'Superb dent repair and paint matching work on my fender. The dust-free paint booth they have is top-notch. Took exactly 3 days as promised. Recommended for luxury car owners.',
                rating: 5,
                date: 'May 2026'
              },
              {
                name: 'Priya Narayanan',
                vehicle: 'Tata Nexon (TS-08-FZ-5384)',
                comment: 'Extremely smooth cashless insurance claim assistance. The workshop team handled the surveyor approvals directly. The engine tuning scanner fixed my throttle response issue.',
                rating: 5,
                date: 'June 2026'
              }
            ].map((test, idx) => (
              <div 
                key={idx} 
                className="backdrop-blur-md bg-white/2 border border-white/5 p-6 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between hover:bg-white/4 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex gap-1 text-orange-400">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-350 font-medium leading-relaxed italic">
                    "{test.comment}"
                  </p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-900/60 mt-4">
                  <div>
                    <span className="block text-xs font-bold text-white">{test.name}</span>
                    <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{test.vehicle}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase">{test.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Book Service & Contact Section */}
      <section id="book-service" className="py-20 border-t border-slate-900 bg-slate-950 relative">
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10 items-start">
          
          {/* Booking Form Card */}
          <div className="lg:col-span-6 bg-slate-900/40 border border-slate-900 p-8 rounded-3xl space-y-6 shadow-2xl relative">
            <h4 className="text-lg font-black text-white uppercase tracking-wider">Book a Diagnostic Slot</h4>
            <p className="text-xs text-slate-450 font-medium">Request a service booking below. Our customer support desk will contact you to verify details and lock your schedule.</p>
            
            {bookingSuccess ? (
              <div className="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl flex items-center gap-3.5 text-xs text-emerald-400 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="font-semibold">
                  <span>Diagnostic Slot Requested!</span>
                  <p className="text-[10px] text-emerald-500 font-medium mt-0.5">Our service advisor will reach out on your mobile number (+91 {bookingPhone}) shortly.</p>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 font-sans">Owner Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    placeholder="e.g. John Doe" 
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-700 transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 font-sans">Mobile Contact</label>
                  <input 
                    type="tel" 
                    required 
                    pattern="[6-9]\d{9}"
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value)}
                    placeholder="10-digit mobile number" 
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-700 transition-colors" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1.5 font-sans">Vehicle License Plate</label>
                  <input 
                    type="text" 
                    required 
                    value={bookingPlate}
                    onChange={(e) => setBookingPlate(e.target.value)}
                    placeholder="e.g. TS07FN0189" 
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 uppercase text-slate-100 placeholder-slate-700 transition-colors font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 font-sans">Preferred Service Stream</label>
                  <select 
                    value={bookingStream}
                    onChange={(e) => setBookingStream(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 text-slate-300 transition-colors"
                  >
                    <option>General Servicing (PMS)</option>
                    <option>Running Repair (RR)</option>
                    <option>Body Shop (Dent/Paint)</option>
                    <option>Insurance Claims</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-indigo-600/10 hover:scale-[1.01]"
              >
                Confirm Diagnostic Appointment
              </button>
            </form>
          </div>

          {/* Contact Details Column */}
          <div id="contact" className="lg:col-span-6 space-y-8 select-text">
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">Connect with Us</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight uppercase tracking-tight">MVSS Automobiles Pvt. Ltd.</h3>
              <p className="text-xs text-slate-450 font-semibold leading-relaxed">We operate multi-brand high-tech automotive service points in major commercial zones. Get in touch for custom quotes or road-side towing.</p>
            </div>

            <div className="space-y-5 text-xs font-semibold text-slate-350">
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-indigo-950/40 border border-indigo-900/30 rounded-xl text-indigo-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-black text-white text-xs mb-1 uppercase tracking-wider">Workshop Facilities</span>
                  <p className="leading-relaxed">
                    - Survey No. 48/5, Gundlapochampally, Medchal-Malkajgiri Dist - 500014 (Near Kompally, Secunderabad) <br />
                    - Survey No. 25/1, Opp. Cine Planet, Kompally, Secunderabad - 500067
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-950/40 border border-indigo-900/30 rounded-xl text-indigo-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-black text-white text-xs mb-0.5 uppercase tracking-wider">Phone Lines</span>
                  <a href="tel:+919949479765" className="hover:underline text-indigo-455 font-bold font-mono">+91 99494 79765</a>
                  <span className="text-slate-500 mx-2">|</span>
                  <a href="tel:+919885889333" className="hover:underline text-indigo-455 font-bold font-mono">+91 98858 89333</a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-950/40 border border-indigo-900/30 rounded-xl text-indigo-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-black text-white text-xs mb-0.5 uppercase tracking-wider">Email Channels</span>
                  <a href="mailto:service@mvssautomobiles.com" className="hover:underline text-indigo-455 font-bold">service@mvssautomobiles.com</a>
                  <span className="text-slate-500 mx-2">|</span>
                  <a href="mailto:contact@mvssautomobiles.com" className="hover:underline text-indigo-455 font-bold">contact@mvssautomobiles.com</a>
                </div>
              </div>

            </div>

            {/* Premium styled mock map placeholder */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-3xl overflow-hidden h-40 shadow-inner relative group border-dashed hover:border-slate-800 transition-colors">
              <div className="absolute inset-0 bg-slate-950/80 z-10 flex flex-col items-center justify-center p-6 text-center space-y-2">
                <MapPin className="w-6 h-6 text-indigo-400 animate-bounce" />
                <div>
                  <span className="block text-[11px] font-black text-white uppercase tracking-wider">Gundlapochampally Service Center</span>
                  <p className="text-[10px] text-slate-500 font-semibold">Near Cine Planet, Kompally, Secunderabad, Telangana</p>
                </div>
                <a 
                  href="https://maps.google.com/?q=MVSS+Automobiles+Gundlapochampally"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors"
                >
                  Open in Google Maps
                </a>
              </div>
              <div className="w-full h-full bg-slate-900 opacity-20 relative">
                {/* Simulated grid lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:24px_24px]" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-550 font-bold uppercase tracking-wider">
          <span>© 2026 MVSS AUTOMOBILES PVT. LTD. ALL RIGHTS RESERVED.</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            SECURE AUDIT LOGGING ACTIVE
          </span>
        </div>
      </footer>

      {/* Staff Login Drawer/Overlay */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm select-none animate-fade-in">
          {/* Close Backdrop click */}
          <div className="absolute inset-0 z-0" onClick={() => setShowLogin(false)} />
          
          {/* Login wrapper container */}
          <div className="relative z-10 w-full max-w-5xl bg-slate-950 border-l border-slate-900 shadow-2xl animate-slide-left flex flex-col h-full">
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute top-6 right-6 p-2 bg-slate-900 hover:bg-slate-800 text-slate-405 hover:text-white rounded-xl border border-slate-800 transition-all z-50 flex items-center justify-center shadow-lg"
              title="Close Login Portal"
            >
              <X className="w-4.5 h-4.5" />
            </button>
            
            <div className="flex-1 overflow-y-auto">
              <Login onLoginSuccess={(user, token) => {
                setShowLogin(false);
                onLoginSuccess(user, token);
              }} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
