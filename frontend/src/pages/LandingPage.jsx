import React, { useState, useEffect } from 'react';
import { Search, Wrench, ShieldCheck, Clock, Phone, MapPin, Car, FileText, ChevronRight, ArrowRight, Lock, X, CheckCircle, Navigation, Star, Award, Settings, Users, HelpCircle, Eye, ShieldAlert } from 'lucide-react';
import Login from './Login';

export default function LandingPage({ onLoginSuccess }) {
  const [showLogin, setShowLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackerResult, setTrackerResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // 8 Servicing Stages list
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

  // Hero slideshow photos
  const heroSlides = [
    { src: '/workshop/page_1_img_1.png', label: 'Workshop Front View' },
    { src: '/workshop/page_2_img_1.jpeg', label: 'Service Bay' },
    { src: '/workshop/page_9_img_1.jpeg', label: 'Team Photo' },
    { src: '/workshop/page_4_img_1.jpeg', label: 'Mercedes Service Photo' },
    { src: '/workshop/page_3_img_1.jpeg', label: 'BMW Service Photo' },
    { src: '/workshop/page_10_img_1.jpeg', label: 'Workshop Interior' }
  ];

  // 15 Gallery photos mapped to existing assets
  const galleryPhotos = [
    { src: '/workshop/page_1_img_1.png', title: 'Workshop Building', desc: 'State-of-the-art facility exterior check-in points.' },
    { src: '/workshop/page_1_img_1.png', title: 'Workshop Entrance', desc: 'Customer desk and secure entry for vehicle diagnostic booking.' },
    { src: '/workshop/page_6_img_1.jpeg', title: 'Reception Office', desc: 'Clean greeting counter with advisor workstations.' },
    { src: '/workshop/page_6_img_1.jpeg', title: 'Customer Lounge', desc: 'Comfortable waiting area with digital status progress boards.' },
    { src: '/workshop/page_2_img_1.jpeg', title: 'Service Bay', desc: 'Modern hydraulic lifts and specialized service points.' },
    { src: '/workshop/page_2_img_1.jpeg', title: 'Workshop Floor', desc: 'Organized tool carts, mechanical bays, and cleaning points.' },
    { src: '/workshop/page_9_img_1.jpeg', title: 'Technician Team', desc: 'MVSS certified mechanical, alignment, and paint specialists.' },
    { src: '/workshop/page_4_img_1.jpeg', title: 'Mercedes Service', desc: 'Engine tuning, sensors diagnostics and transmission servicing.' },
    { src: '/workshop/page_3_img_1.jpeg', title: 'BMW Service', desc: 'Computer scan and running repair overhauls for premium BMWs.' },
    { src: '/workshop/page_5_img_1.jpeg', title: 'Tata Harrier Service', desc: 'General periodic servicing, lubrication check, and PMS checklists.' },
    { src: '/workshop/page_8_img_1.jpeg', title: 'Bosch Equipment', desc: 'Bosch scanning tools and computerized wheel alignments.' },
    { src: '/workshop/page_7_img_1.jpeg', title: 'Spare Parts Room', desc: 'Fully organized OEM filters, engine oils, and running spares inventory.' },
    { src: '/workshop/page_10_img_1.jpeg', title: 'Insurance Claim Area', desc: 'Digital insurance canvas mapping, surveys, and claim support.' },
    { src: '/workshop/page_2_img_1.jpeg', title: 'Body Shop Area', desc: 'Denting adjustments, panels replacements, and detailing finish.' },
    { src: '/workshop/page_10_img_1.jpeg', title: 'Vehicle Inspection Area', desc: '32-point inspection diagnostic checks before delivery release.' }
  ];

  // Testimonials list
  const testimonials = [
    { rating: 5, quote: 'Excellent service and transparent billing. Highly recommended.', author: 'Ravi Kumar' },
    { rating: 5, quote: 'Professional team and quality work.', author: 'Sandeep Reddy' },
    { rating: 5, quote: 'Quick delivery and genuine spare parts.', author: 'Priya Sharma' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearched(true);
    // Retrieve mock jobcards from localStorage
    const localJcs = JSON.parse(localStorage.getItem('mock_jobcards') || '[]');
    
    // Find matching jobcard by plate number or jobcard number
    const match = localJcs.find(jc => 
      (jc.vehicleId?.vehicleNumber || '').toLowerCase().replace(/\s+/g, '') === searchQuery.toLowerCase().replace(/\s+/g, '') ||
      (jc.jobCardNo || '').toLowerCase().replace(/\s+/g, '') === searchQuery.toLowerCase().replace(/\s+/g, '')
    );

    if (match) {
      setTrackerResult(match);
      setTimeout(() => {
        document.getElementById('tracker-result-block')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      setTrackerResult(null);
    }
  };

  const visiblePhotos = showAllPhotos ? galleryPhotos : galleryPhotos.slice(0, 6);

  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-sans relative overflow-x-hidden">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] px-6 py-4 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto w-full gap-4 md:gap-0 select-none">
        <a href="/" className="flex items-center gap-2.5 select-none shrink-0 mr-auto md:mr-0 group">
          <div className="p-1 bg-white rounded-lg border border-[#E2E8F0] shrink-0 transition-colors group-hover:border-[#DC2626]">
            <img 
              src="/workshop/page_1_img_1.png" 
              alt="MVSS Logo" 
              className="h-8.5 w-auto object-contain"
            />
          </div>
          <div className="text-left">
            <h1 className="text-xs sm:text-sm font-black tracking-wider uppercase text-slate-900 leading-none">
              MVSS AUTOMOBILES
            </h1>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">Pvt. Ltd.</p>
          </div>
        </a>

        {/* Center Navigation */}
        <nav className="flex flex-wrap items-center justify-start md:justify-center gap-x-6 gap-y-2 text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">
          <a href="#" className="hover:text-[#DC2626] transition-colors">Home</a>
          <a href="#services" className="hover:text-[#DC2626] transition-colors">Services</a>
          <a href="#gallery" className="hover:text-[#DC2626] transition-colors">Gallery</a>
          <a href="#why-choose" className="hover:text-[#DC2626] transition-colors">Why Choose Us</a>
          <a href="#tracker" className="hover:text-[#DC2626] transition-colors">Track Vehicle</a>
          <a href="#contact" className="hover:text-[#DC2626] transition-colors">Contact</a>
        </nav>

        {/* Right Action */}
        <button
          onClick={() => setShowLogin(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F172A] hover:bg-[#DC2626] text-white rounded-lg text-[10px] sm:text-[11px] font-extrabold transition-all shrink-0"
        >
          <Lock className="w-3 h-3" />
          Staff Login
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative bg-white border-b border-[#E2E8F0]/40 max-w-7xl mx-auto px-6 pt-16 pb-20 text-center lg:text-left grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-1">
            <span className="block text-xs font-black text-[#DC2626] uppercase tracking-wider">MVSS AUTOMOBILES PVT LTD</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] leading-tight tracking-tight uppercase">
              Premium Multi-Brand Car Service Center
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide leading-relaxed">
              Body Shop • Insurance Claims • Advanced Vehicle Scanning • Genuine Parts
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mt-4">
              Trusted automobile workshop in Hyderabad delivering professional service, transparent billing and digital vehicle tracking.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-2">
            <a
              href="#tracker"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#DC2626] hover:bg-red-750 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-[#DC2626]/10"
            >
              Track Vehicle
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all"
            >
              Our Services
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-750 border border-[#E2E8F0] rounded-xl text-xs font-extrabold transition-all"
            >
              Contact Workshop
            </a>
          </div>
        </div>

        {/* Hero Slideshow */}
        <div className="lg:col-span-6 relative w-full h-[220px] sm:h-[320px] lg:h-[400px] overflow-hidden rounded-3xl border border-[#E2E8F0] shadow-lg">
          {heroSlides.map((slide, idx) => (
            <div 
              key={idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${idx === heroIdx ? 'opacity-100' : 'opacity-0'}`}
            >
              <img 
                src={slide.src}
                alt={slide.label}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-[#0F172A]/85 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/50">
                <span className="text-[10px] text-white font-extrabold uppercase tracking-wide">{slide.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 max-w-7xl mx-auto px-6 bg-white space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold text-[#DC2626] uppercase tracking-widest">Expert capabilities</span>
          <h3 className="text-2xl font-extrabold text-[#0F172A] uppercase">Rebuilt Service Capabilities</h3>
          <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">Modern service streams designed to keep your vehicle in prime manufacturer condition.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'General Service', desc: 'Periodic lubrication checkout, Mobil oil replacements, engine diagnostics and standard fluid topups.', tag: 'PMS', icon: CheckCircle },
            { title: 'Body Shop & Painting', desc: 'Panel paint booth refinish, dent adjustments, corporate detailing finish and scratch removals.', tag: 'B/P', icon: Wrench },
            { title: 'Insurance Claims', desc: 'Surveyor damage canvas tracking, cash-free claims handling, and insurance catalog estimates.', tag: 'Claims', icon: ShieldCheck },
            { title: 'Advanced Vehicle Scanning', desc: 'Chassis diagnostics scans, electrical checking, battery overhauls, and sensor resets.', tag: 'Scanner', icon: Settings },
            { title: 'Genuine Spare Parts', desc: 'OEM filters, replacement spark plugs, certified high-grade components directly from catalog room.', tag: 'Inventory', icon: Award },
            { title: 'Wheel Alignment & Balancing', desc: 'Computerized alignment calibration, wheel weight balancing, and tyre pressure correction.', tag: 'Tyres', icon: Car }
          ].map(service => {
            const Icon = service.icon;
            return (
              <div 
                key={service.title} 
                className="bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-2xl transition-all duration-200 hover:border-[#DC2626]/30 hover:bg-white hover:shadow-md flex flex-col justify-between group shadow-xs w-full h-[220px]"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="inline-block px-2 py-0.5 bg-white border border-[#E2E8F0] rounded-md text-[9px] font-black text-slate-600 uppercase tracking-widest">{service.tag}</span>
                    <Icon className="w-4.5 h-4.5 text-[#DC2626]" />
                  </div>
                  <h4 className="text-sm font-black text-[#0F172A] group-hover:text-[#DC2626] transition-colors">{service.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-3">{service.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Workshop Gallery Section */}
      <section id="gallery" className="py-20 bg-[#F8FAFC] border-t border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-extrabold text-[#DC2626] uppercase tracking-widest">Our Facility Tour</span>
            <h3 className="text-2xl font-extrabold text-[#0F172A] uppercase">Workshop Gallery</h3>
            <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
              Visual tour of our modern diagnostic checkouts, premium brand service bays, and genuine spares stock.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePhotos.map((photo, idx) => (
              <div 
                key={idx}
                className="h-[240px] sm:h-[300px] lg:h-[340px] bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm hover:border-[#DC2626]/40 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-lg group"
              >
                <div className="flex-1 w-full overflow-hidden bg-slate-100 relative">
                  <img 
                    src={photo.src} 
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 bg-white border-t border-[#E2E8F0] flex flex-col justify-center text-center space-y-1 shrink-0">
                  <h4 className="text-xs sm:text-sm font-black text-[#0F172A]">{photo.title}</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-relaxed truncate">{photo.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowAllPhotos(!showAllPhotos)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              {showAllPhotos ? 'Show Less Photos' : 'View More Photos'}
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose MVSS */}
      <section id="why-choose" className="py-20 bg-white max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold text-[#DC2626] uppercase tracking-widest">Enterprise Car Care</span>
          <h3 className="text-2xl font-extrabold text-[#0F172A] uppercase">Why Choose MVSS</h3>
          <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">We provide premium multi-brand diagnostics with full digital tracking transparency.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Bosch Equipment', desc: 'Bosch automobile scanners and computerized alignment calibration diagnostics.' },
            { title: 'Multi Brand Service', desc: 'Chassis general repairs and engine diagnostics overhauls for premium brands.' },
            { title: 'Insurance Claim Support', desc: 'Surveyor damage canvas tracking and cash-free insurance checkout settlements.' },
            { title: 'Genuine Spare Parts', desc: 'OEM filters, high-grade lubrication motor oil, spark plugs, and brake pads.' },
            { title: 'Experienced Technicians', desc: 'Workshop floor staffed with certified mechanical and body workshop specialists.' },
            { title: 'Digital Job Card Tracking', desc: 'Secure tracking boards showing check-in status, progress, estimation and release.' },
            { title: 'Transparent Billing', desc: 'Auto-generated invoice details with clear spares selling price and labor fees.' },
            { title: 'Quality Assurance Process', desc: 'Post-repair quality inspect checks before vehicle delivery and gate pass release.' }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-2xl flex gap-3.5 items-start shadow-xs h-[160px]">
              <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-black text-[#0F172A]">{item.title}</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-3">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 bg-[#0F172A] text-white select-none">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { val: '5000+', label: 'Happy Customers', icon: Users },
            { val: '15+', label: 'Expert Technicians', icon: Award },
            { val: '98%', label: 'Customer Satisfaction', icon: ShieldCheck },
            { val: '24/7', label: 'Customer Support', icon: Phone }
          ].map((ach, idx) => {
            const Icon = ach.icon;
            return (
              <div key={idx} className="space-y-2 group">
                <div className="p-3 bg-slate-800 border border-slate-700 text-[#DC2626] rounded-2xl w-fit mx-auto transition-transform group-hover:scale-105">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono">{ach.val}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{ach.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Vehicle Tracker */}
      <section id="tracker" className="py-20 bg-[#F8FAFC] border-t border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-extrabold text-[#DC2626] uppercase tracking-widest">Real-time status</span>
            <h3 className="text-2xl font-extrabold text-[#0F172A] uppercase">Live Vehicle Tracker</h3>
            <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">Enter your plate registration number or Job Card ID below to verify your vehicle stream progress.</p>
          </div>

          <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. TS-09-EA-1234 or JC-1001"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all font-mono uppercase"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-[#0F172A] hover:bg-[#DC2626] text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
            >
              Track Now
            </button>
          </form>

          {searched && (
            <div id="tracker-result-block" className="mt-8 animate-fade-in scroll-mt-24">
              {trackerResult ? (
                <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-6 shadow-sm">
                  {/* Result Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase">Vehicle Owner / Details</span>
                      <h4 className="text-sm font-black text-[#0F172A] mt-0.5">{trackerResult.customerId?.name || 'Customer'}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{trackerResult.vehicleId?.make} {trackerResult.vehicleId?.model} ({trackerResult.vehicleId?.vehicleNumber})</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-455 font-extrabold uppercase">Job Card ID</span>
                      <span className="block text-xs font-bold text-blue-600 font-mono mt-0.5">{trackerResult.jobCardNo}</span>
                      <span className="block text-[10px] text-slate-500 font-semibold mt-0.5">Service: {trackerResult.serviceType}</span>
                    </div>
                  </div>

                  {/* Horizontal Timeline */}
                  <div className="space-y-4 pt-2">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Service Timeline Progress</span>
                    
                    <div className="relative py-4 overflow-x-auto min-w-[500px]">
                      {/* Timeline Bar */}
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-700" 
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
                                    ? 'bg-blue-600 border-blue-500 text-white scale-110 shadow-lg shadow-blue-600/30' 
                                    : isCompleted 
                                      ? 'bg-[#0F172A] border-[#0F172A] text-white' 
                                      : 'bg-white border-[#E2E8F0] text-slate-400'
                                }`}
                              >
                                {idx + 1}
                              </div>
                              <span className={`text-[9px] font-extrabold uppercase tracking-wide transition-colors ${
                                isActive ? 'text-blue-650 font-bold' : isCompleted ? 'text-slate-900 font-bold' : 'text-slate-400'
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
                  <div className="p-4 bg-blue-50 border border-blue-100/60 rounded-2xl flex items-center gap-3.5 mt-4">
                    <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                    <div className="text-left text-xs leading-relaxed">
                      <span className="font-bold text-[#0F172A] uppercase tracking-wide">
                        Current Status: {stages[getCurrentStageIndex(trackerResult.status)].label}
                      </span>
                      <p className="text-slate-600 font-semibold">{stages[getCurrentStageIndex(trackerResult.status)].desc}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-100 p-6 rounded-3xl text-center text-xs font-semibold text-[#DC2626] max-w-md mx-auto">
                  ⚠ No active job card found for "{searchQuery}". Please check the registration number or contact the advisor.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Customer Testimonials */}
      <section id="testimonials" className="py-20 bg-white max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold text-[#DC2626] uppercase tracking-widest">Client Feedback</span>
          <h3 className="text-2xl font-extrabold text-[#0F172A] uppercase">Customer Testimonials</h3>
          <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">Read what premium multi-brand automobile owners say about our workshop services.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <div key={idx} className="bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-2xl space-y-4 shadow-xs relative flex flex-col justify-between h-[180px]">
              <div className="space-y-3">
                <div className="flex gap-1 text-[#DC2626]">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 font-semibold italic">"{item.quote}"</p>
              </div>
              <div className="mt-4 border-t border-slate-200/60 pt-3">
                <span className="block text-xs font-black text-[#0F172A]">— {item.author}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-[#F8FAFC] border-t border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-extrabold text-[#0F172A] uppercase">MVSS Automobiles Pvt Ltd</h3>
            
            <div className="space-y-5 text-xs font-semibold text-slate-600">
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-black text-[#0F172A] text-xs mb-1 uppercase tracking-wider">Workshop Address</span>
                  <p className="leading-relaxed">
                    Survey No. 25/1, Opp. Cine Planet, Kompally, Secunderabad - 500067 <br />
                    Survey No. 48/5, Gundlapochampally, Medchal-Malkajgiri Dist - 500014
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <Phone className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="block font-black text-[#0F172A] text-xs mb-0.5 uppercase tracking-wider">Phone Numbers</span>
                  <a href="tel:+919949479765" className="hover:underline text-blue-650 font-mono font-bold">+91 99494 79765</a>
                  <span className="text-slate-350 mx-2">|</span>
                  <a href="tel:+919876543210" className="hover:underline text-blue-650 font-mono font-bold">+91 98765 43210</a>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="block font-black text-[#0F172A] text-xs mb-0.5 uppercase tracking-wider">Email Address</span>
                  <a href="mailto:service@mvssautomobiles.com" className="hover:underline text-blue-650 font-bold">service@mvssautomobiles.com</a>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-black text-[#0F172A] text-xs mb-1 uppercase tracking-wider">Business Hours</span>
                  <p className="leading-relaxed text-slate-500">
                    Monday - Saturday: 9:00 AM - 7:00 PM <br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
              
              {/* Google Maps Button */}
              <div className="pt-2">
                <a 
                  href="https://maps.google.com/?q=MVSS+Automobiles+Gundlapochampally"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-blue-600/10"
                >
                  <Navigation className="w-4 h-4" />
                  Google Maps Button
                </a>
              </div>
            </div>
          </div>

          {/* Interactive Map Embed */}
          <div className="w-full h-[280px] sm:h-[320px] rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-sm relative bg-slate-100">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3803.968798993132!2d78.473555!3d17.556272!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb8f3cf55f98cf%3A0xe21ba58752c0022f!2sMVSS%20Automobiles%20Pvt%20Ltd!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
              className="w-full h-full border-0"
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="MVSS Google Maps Location"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] py-10 bg-[#0F172A] text-slate-400">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs select-none">
            <div className="flex items-center gap-2.5">
              <div className="p-1 bg-white rounded-lg border border-slate-700 shrink-0">
                <img 
                  src="/workshop/page_1_img_1.png" 
                  alt="MVSS Logo" 
                  className="h-6 w-auto object-contain"
                />
              </div>
              <span className="font-extrabold text-white text-xs uppercase tracking-wider">MVSS AUTOMOBILES</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
              <a href="#" className="hover:text-white transition-colors">Support Portal</a>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
            <span>© 2026 MVSS AUTOMOBILES. ALL RIGHTS RESERVED.</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> SECURE AUDIT LOGGING ACTIVE</span>
          </div>
        </div>
      </footer>

      {/* Staff Login Drawer/Overlay */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs select-none animate-fade-in">
          {/* Close Backdrop click */}
          <div className="absolute inset-0 z-0" onClick={() => setShowLogin(false)} />
          
          {/* Login wrapper container */}
          <div className="relative z-10 w-full max-w-5xl bg-slate-950 border-l border-slate-900 shadow-2xl animate-slide-left flex flex-col">
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute top-6 right-6 p-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all z-50 flex items-center justify-center"
              title="Close Staff Portal"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex-1 overflow-y-auto bg-slate-950">
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
