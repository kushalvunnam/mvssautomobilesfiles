import React, { useState, useEffect } from 'react';
import { Search, Wrench, ShieldCheck, Clock, Phone, MapPin, Car, FileText, ChevronRight, ArrowRight, Lock, X, CheckCircle, Navigation, Star, Award, Settings, Users, ShieldAlert } from 'lucide-react';
import Login from './Login';

export default function LandingPage({ onLoginSuccess }) {
  const [showLogin, setShowLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackerResult, setTrackerResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');

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

  // Hero slideshow photos (Workshop photos only - NO LOGO)
  const heroSlides = [
    { src: '/workshop/page_2_img_1.jpeg', label: 'Large Workshop Floor' },
    { src: '/workshop/page_9_img_1.jpeg', label: 'Technicians at Work' },
    { src: '/workshop/page_3_img_1.jpeg', label: 'BMW Service Bay' },
    { src: '/workshop/page_4_img_1.jpeg', label: 'Body Shop Paint Section' },
    { src: '/workshop/page_8_img_1.jpeg', label: 'Bosch Equipment Area' },
    { src: '/workshop/page_1_img_1.png', label: 'Customer Vehicle Parking Yard' }
  ];

  // 10 Unique Gallery Photos mapped EXACTLY to client specifications (No duplicates, no Auto4m logo)
  const galleryPhotos = [
    // CATEGORY A: Workshop Infrastructure
    { src: '/workshop/page_10_img_1.jpeg', category: 'Infrastructure', title: 'Large Workshop Floor', desc: 'Workshop interior photo with multiple vehicles and service bays.' },
    { src: '/workshop/page_2_img_1.jpeg', category: 'Infrastructure', title: 'Hydraulic Lift Service Bay', desc: 'Vehicle on lift servicing photo.' },

    // CATEGORY B: Live Service Operations
    { src: '/workshop/page_3_img_1.jpeg', category: 'Operations', title: 'Live Service Operations', desc: 'Technicians actively working on vehicles.' },
    { src: '/workshop/page_5_img_1.jpeg', category: 'Operations', title: 'Expert Technician Team', desc: 'Technicians performing repairs and maintenance.' },

    // CATEGORY C: Body Shop & Paint
    { src: '/workshop/page_4_img_1.jpeg', category: 'Body Shop', title: 'Body Shop & Paint Center', desc: 'Painting, denting, body repair photos.' },

    // CATEGORY D: Equipment & Tools
    { src: '/workshop/page_8_img_1.jpeg', category: 'Equipment', title: 'Advanced Workshop Equipment', desc: 'Bosch NTI 101 machine and workshop equipment photos.' },
    { src: '/workshop/page_7_img_1.jpeg', category: 'Equipment', title: 'Spare Parts Inventory', desc: 'Spare parts storage and inventory photos.' },
    { src: '/workshop/page_9_img_1.jpeg', category: 'Equipment', title: 'Tool Station', desc: 'Red workshop toolbox and tools photo.' },

    // CATEGORY E: Customer Vehicle Yard
    { src: '/workshop/page_1_img_1.png', category: 'Vehicle Yard', title: 'Customer Vehicle Parking Area', desc: 'Parking lot photo with multiple customer vehicles.' },

    // CATEGORY F: Customer Facilities
    { src: '/workshop/page_6_img_1.jpeg', category: 'Customer Facilities', title: 'Customer Reception Area', desc: 'Reception/office/waiting area photo.' }
  ];

  // Testimonials
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
    const localJcs = JSON.parse(localStorage.getItem('mock_jobcards') || '[]');
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

  const filteredPhotos = activeCategory === 'All' 
    ? galleryPhotos 
    : galleryPhotos.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans relative overflow-x-hidden">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] px-6 py-4 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto w-full gap-4 md:gap-0 select-none">
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); window.location.href = '/'; }} 
          className="flex items-center gap-2.5 select-none shrink-0 mr-auto md:mr-0 group"
        >
          <div className="p-1 bg-white rounded-lg border border-[#E2E8F0] shrink-0 transition-colors group-hover:border-[#C1121F]">
            <img 
              src="/workshop/page_1_img_1.png" 
              alt="MVSS Logo" 
              className="h-[60px] max-w-[180px] object-contain"
            />
          </div>
          <div className="text-left">
            <h1 className="text-xs sm:text-sm font-black tracking-wider uppercase text-[#111827] leading-none">
              MVSS AUTOMOBILES
            </h1>
            <p className="text-[8px] text-[#6B7280] font-bold uppercase tracking-widest leading-none mt-0.5">Pvt. Ltd.</p>
          </div>
        </a>

        {/* Center Navigation */}
        <nav className="flex flex-wrap items-center justify-start md:justify-center gap-x-6 gap-y-2 text-[11px] sm:text-xs font-bold text-[#6B7280] uppercase tracking-wider">
          <a href="#" className="hover:text-[#C1121F] transition-colors">Home</a>
          <a href="#services" className="hover:text-[#C1121F] transition-colors">Services</a>
          <a href="#gallery" className="hover:text-[#C1121F] transition-colors">Gallery</a>
          <a href="#why-choose" className="hover:text-[#C1121F] transition-colors">Why Choose Us</a>
          <a href="#tracker" className="hover:text-[#C1121F] transition-colors">Track Vehicle</a>
          <a href="#contact" className="hover:text-[#C1121F] transition-colors">Contact</a>
        </nav>

        {/* Right Action */}
        <button
          onClick={() => setShowLogin(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#111827] hover:bg-[#C1121F] text-white rounded-lg text-[10px] sm:text-[11px] font-extrabold transition-all shrink-0"
        >
          <Lock className="w-3 h-3" />
          Staff Login
        </button>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative bg-white border-b border-[#E2E8F0]/40 max-w-7xl mx-auto px-6 lg:h-[700px] flex items-center py-12 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          {/* Left Content (50%) */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="space-y-1">
              <span className="block text-xs font-black text-[#C1121F] uppercase tracking-wider">MVSS AUTOMOBILES PVT. LTD.</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111827] leading-tight tracking-tight uppercase">
                Premium Multi-Brand Car Service Center
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#6B7280] uppercase tracking-wide leading-relaxed">
                Complete Car Care, Body Shop Repairs, Insurance Claims, Genuine Parts, Vehicle Tracking, and GST Billing under one roof.
              </p>
              <p className="text-xs sm:text-sm text-[#6B7280] font-medium leading-relaxed mt-4">
                Trusted automobile workshop in Hyderabad delivering professional service, transparent billing and digital vehicle tracking.
              </p>
            </div>

            {/* Buttons list incorporating red [Book A Service] button */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-2">
              <a
                href="#tracker"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#111827] hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm"
              >
                Track Vehicle
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#C1121F] hover:bg-red-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-[#C1121F]/10 animate-pulse"
              >
                <Wrench className="w-3.5 h-3.5" />
                Book A Service
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#111827] rounded-xl text-xs font-extrabold transition-all"
              >
                Our Services
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-750 border border-[#E2E8F0] rounded-xl text-xs font-extrabold transition-all"
              >
                Contact Workshop
              </a>
            </div>
          </div>

          {/* Right Image Container (50% / 550px height) */}
          <div className="lg:col-span-6 w-full h-[320px] sm:h-[450px] lg:h-[550px] lg:max-h-[550px] rounded-[24px] overflow-hidden relative border border-[#E2E8F0] shadow-lg select-none bg-slate-50">
            {heroSlides.map((slide, idx) => (
              <div 
                key={idx}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${idx === heroIdx ? 'opacity-100' : 'opacity-0'}`}
              >
                <img 
                  src={slide.src}
                  alt={slide.label}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    setHeroIdx((prev) => (prev + 1) % heroSlides.length);
                  }}
                />
                <div className="absolute bottom-4 left-4 bg-[#111827]/85 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-750/50">
                  <span className="text-[10px] text-white font-extrabold uppercase tracking-wide">{slide.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 max-w-7xl mx-auto px-6 bg-white space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold text-[#C1121F] uppercase tracking-widest">Our Capabilities</span>
          <h3 className="text-2xl font-extrabold text-[#111827] uppercase">Rebuilt Service Capabilities</h3>
          <p className="text-xs text-[#6B7280] font-semibold max-w-md mx-auto">Modern service streams designed to keep your vehicle in prime manufacturer condition.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Multi Brand Service', desc: 'Chassis general repairs and engine service overhauls for premium brands.', icon: Car },
            { title: 'Body Shop & Painting', desc: 'Panel paint booth refinish, dent adjustments, corporate detailing finish and scratch removals.', icon: Wrench },
            { title: 'Insurance Claims', desc: 'Surveyor damage canvas tracking, cash-free claims handling, and insurance catalog estimates.', icon: ShieldCheck },
            { title: 'Genuine Spare Parts', desc: 'OEM filters, replacement spark plugs, certified high-grade components directly from catalog room.', icon: Award },
            { title: 'Wheel Alignment', desc: 'Computerized alignment calibration, wheel weight balancing, and tyre pressure correction.', icon: Settings },
            { title: 'Engine Repair', desc: 'Full engine block repairs, mechanical component overhauls, and transmission tuning.', icon: Settings },
            { title: 'Periodic Maintenance', desc: 'Periodic lubrication checkout, Mobil oil replacements, engine checkups and standard fluid topups.', icon: CheckCircle },
            { title: 'Vehicle Pickup & Delivery', desc: 'Secure door-to-door vehicle transport checkout, pickup check-in and delivery mapping.', icon: Navigation }
          ].map((service, idx) => {
            const Icon = service.icon;
            return (
              <div 
                key={idx} 
                className="bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-2xl transition-all duration-200 hover:border-[#C1121F]/30 hover:bg-white hover:shadow-md flex flex-col justify-between group shadow-xs w-full h-[220px]"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Icon className="w-5 h-5 text-[#C1121F]" />
                  </div>
                  <h4 className="text-sm font-black text-[#111827] group-hover:text-[#C1121F] transition-colors">{service.title}</h4>
                  <p className="text-[11px] text-[#6B7280] font-medium leading-relaxed line-clamp-3">{service.desc}</p>
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
            <span className="text-[10px] font-extrabold text-[#C1121F] uppercase tracking-widest">Our Facility Tour</span>
            <h3 className="text-2xl font-extrabold text-[#111827] uppercase">Workshop Gallery</h3>
            <p className="text-xs text-[#6B7280] font-semibold max-w-md mx-auto">
              Visual tour of our modern service checkouts, premium brand service bays, and genuine spares stock.
            </p>
          </div>

          {/* Category Filter Controls */}
          <div className="flex flex-wrap justify-center gap-2 select-none">
            {['All', 'Infrastructure', 'Operations', 'Body Shop', 'Equipment', 'Vehicle Yard', 'Customer Facilities'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  activeCategory === cat 
                    ? 'bg-[#C1121F] border-[#C1121F] text-white shadow-sm' 
                    : 'bg-white border-[#E2E8F0] text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid Layout: Desktop 3 columns, Tablet 2 columns, Mobile 1 column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo, idx) => (
              <div 
                key={idx}
                className="h-[420px] bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm hover:border-[#C1121F]/45 transition-all duration-350 flex flex-col hover:-translate-y-1.5 hover:shadow-lg group"
              >
                {/* Image Height: 280px */}
                <div className="h-[280px] w-full overflow-hidden bg-slate-100 relative shrink-0">
                  <img 
                    src={photo.src} 
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                {/* Content Box */}
                <div className="p-4 bg-white border-t border-[#E2E8F0] flex flex-col justify-start space-y-1 flex-1">
                  {/* Title Height: 40px */}
                  <h4 className="text-xs sm:text-sm font-black text-[#111827] h-[40px] flex items-center leading-tight">
                    {photo.title}
                  </h4>
                  {/* Description Height: 60px */}
                  <p className="text-[10px] sm:text-[11px] text-[#6B7280] font-medium leading-relaxed h-[60px] overflow-hidden">
                    {photo.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-choose" className="py-20 bg-white max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold text-[#C1121F] uppercase tracking-widest">Enterprise Car Care</span>
          <h3 className="text-2xl font-extrabold text-[#111827] uppercase">Why Choose MVSS</h3>
          <p className="text-xs text-[#6B7280] font-semibold max-w-md mx-auto">We provide premium multi-brand services with full digital tracking transparency.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Certified Technicians', desc: 'Workshop floor staffed with certified mechanical and body workshop specialists.' },
            { title: 'Multi Brand Expertise', desc: 'Certified engine servicing, chassis PMS and mechanical repair for premium brands.' },
            { title: 'Bosch Equipment', desc: 'Bosch automobile scanners and computerized alignment calibration checkups.' },
            { title: 'Digital Job Cards', desc: 'Secure digital tracking boards showing check-in status, progress, estimation and release.' },
            { title: 'GST Billing', desc: 'Auto-generated invoice details with clear spares selling price and labor fees.' },
            { title: 'Transparent Workflow', desc: 'From check-in to checkout, estimates, service checklists, and signatures are managed digitally.' },
            { title: 'Quality Spare Parts', desc: 'OEM filters, high-grade lubrication motor oil, spark plugs, and brake pads.' },
            { title: 'Customer Satisfaction', desc: 'Post-repair quality inspect checks before vehicle delivery and gate pass release.' }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-2xl flex gap-3.5 items-start shadow-xs h-[160px]">
              <CheckCircle className="w-5 h-5 text-blue-650 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-black text-[#111827]">{item.title}</h4>
                <p className="text-[10px] sm:text-[11px] text-[#6B7280] font-medium leading-relaxed line-clamp-3">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Experience Spotlight Section */}
      <section className="py-20 bg-[#F8FAFC] border-t border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-extrabold text-[#C1121F] uppercase tracking-widest">Spotlight</span>
            <h3 className="text-2xl font-extrabold text-[#111827] uppercase">Customer Experience Highlights</h3>
            <p className="text-xs text-[#6B7280] font-semibold max-w-md mx-auto">Discover our key operational statistics across multi-brand automobile servicing.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { val: '1000+', label: 'Vehicles Serviced', desc: 'Multi-brand mechanical checkouts.' },
              { val: 'GST Compliant', label: 'Billing', desc: 'Clear spare parts pricing.' },
              { val: 'Real-Time', label: 'Vehicle Tracking', desc: 'Digital check-in progress.' },
              { val: 'Multi-Brand', label: 'Expertise', desc: 'BMW, Mercedes, Harrier, Swift.' },
              { val: 'Insurance', label: 'Claim Assistance', desc: 'Coordinated claims survey.' },
              { val: 'Body Shop', label: 'Specialists', desc: 'Professional denting restoration.' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-[#E2E8F0] p-6 rounded-2xl space-y-2 shadow-xs group">
                <div className="text-xl sm:text-2xl font-black text-[#C1121F] font-mono">{stat.val}</div>
                <h4 className="text-xs sm:text-sm font-black text-[#111827]">{stat.label}</h4>
                <p className="text-[10px] sm:text-[11px] text-[#6B7280] font-medium leading-relaxed">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Vehicle Tracker */}
      <section id="tracker" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-extrabold text-[#C1121F] uppercase tracking-widest">Real-time status</span>
            <h3 className="text-2xl font-extrabold text-[#111827] uppercase">Live Progress Timeline</h3>
            <p className="text-xs text-[#6B7280] font-semibold max-w-md mx-auto">Track your vehicle service progress using Vehicle Number or Job Card Number.</p>
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
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 text-[#111827] placeholder-slate-400 transition-all font-mono uppercase"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-[#111827] hover:bg-[#C1121F] text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
            >
              Track Vehicle
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
                      <h4 className="text-sm font-black text-[#111827] mt-0.5">{trackerResult.customerId?.name || 'Customer'}</h4>
                      <p className="text-[10px] text-[#6B7280] font-mono mt-0.5">{trackerResult.vehicleId?.make} {trackerResult.vehicleId?.model} ({trackerResult.vehicleId?.vehicleNumber})</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-455 font-extrabold uppercase">Job Card ID</span>
                      <span className="block text-xs font-bold text-blue-600 font-mono mt-0.5">{trackerResult.jobCardNo}</span>
                      <span className="block text-[10px] text-slate-550 font-semibold mt-0.5">Service: {trackerResult.serviceType}</span>
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
                                      ? 'bg-[#111827] border-[#111827] text-white' 
                                      : 'bg-white border-[#E2E8F0] text-[#6B7280]'
                                }`}
                              >
                                {idx + 1}
                              </div>
                              <span className={`text-[9px] font-extrabold uppercase tracking-wide transition-colors ${
                                isActive ? 'text-blue-650 font-bold' : isCompleted ? 'text-slate-900 font-bold' : 'text-[#6B7280]'
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
                      <span className="font-bold text-[#111827] uppercase tracking-wide">
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
      <section id="testimonials" className="py-20 bg-[#F8FAFC] border-t border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-extrabold text-[#C1121F] uppercase tracking-widest">Client Feedback</span>
            <h3 className="text-2xl font-extrabold text-[#111827] uppercase">Customer Testimonials</h3>
            <p className="text-xs text-[#6B7280] font-semibold max-w-md mx-auto">Read what premium multi-brand automobile owners say about our workshop services.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((item, idx) => (
              <div key={idx} className="bg-white border border-[#E2E8F0] p-6 rounded-2xl space-y-4 shadow-xs relative flex flex-col justify-between h-[180px]">
                <div className="space-y-3">
                  <div className="flex gap-1 text-[#C1121F]">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 font-semibold italic">"{item.quote}"</p>
                </div>
                <div className="mt-4 border-t border-slate-200/60 pt-3">
                  <span className="block text-xs font-black text-[#111827]">— {item.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-extrabold text-[#111827] uppercase">MVSS Automobiles Pvt Ltd</h3>
            
            <div className="space-y-5 text-xs font-semibold text-[#6B7280]">
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-[#C1121F] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-black text-[#111827] text-xs mb-1 uppercase tracking-wider">Workshop Address</span>
                  <p className="leading-relaxed">
                    Survey No. 25/1, Opp. Cine Planet, Kompally, Secunderabad - 500067 <br />
                    Survey No. 48/5, Gundlapochampally, Medchal-Malkajgiri Dist - 500014
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <Phone className="w-5 h-5 text-[#C1121F] shrink-0" />
                <div>
                  <span className="block font-black text-[#111827] text-xs mb-0.5 uppercase tracking-wider">Phone Numbers</span>
                  <a href="tel:+919949479765" className="hover:underline text-blue-650 font-mono font-bold">+91 99494 79765</a>
                  <span className="text-slate-350 mx-2">|</span>
                  <a href="tel:+919876543210" className="hover:underline text-blue-650 font-mono font-bold">+91 98765 43210</a>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <FileText className="w-5 h-5 text-[#C1121F] shrink-0" />
                <div>
                  <span className="block font-black text-[#111827] text-xs mb-0.5 uppercase tracking-wider">Email Address</span>
                  <a href="mailto:service@mvssautomobiles.com" className="hover:underline text-blue-650 font-bold">service@mvssautomobiles.com</a>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <Clock className="w-5 h-5 text-[#C1121F] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-black text-[#111827] text-xs mb-1 uppercase tracking-wider">Business Hours</span>
                  <p className="leading-relaxed text-[#6B7280]">
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C1121F] hover:bg-red-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-[#C1121F]/10"
                >
                  <Navigation className="w-4 h-4" />
                  Google Maps Button
                </a>
              </div>
            </div>
          </div>

          {/* Interactive Map Embed */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm">
            <h4 className="text-sm font-black text-[#111827] uppercase tracking-wide">Request a Service Slot</h4>
            <form onSubmit={(e) => { e.preventDefault(); alert('Booking request sent successfully. Service team will contact you shortly.'); }} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Your Name</label>
                  <input type="text" required placeholder="John Doe" className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#C1121F]" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Contact Phone</label>
                  <input type="tel" required placeholder="9988776655" className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#C1121F]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Vehicle Plate No</label>
                  <input type="text" required placeholder="TS-09-EA-1234" className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#C1121F] uppercase" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Preferred Stream</label>
                  <select className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-bold focus:outline-none focus:border-[#C1121F]">
                    <option>General Servicing (PMS)</option>
                    <option>Running Repair (RR)</option>
                    <option>Body Shop (Dent/Paint)</option>
                    <option>Insurance Claims</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-3 px-4 bg-[#C1121F] hover:bg-red-750 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-red-650/10">
                Book Service Appointment
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] py-10 bg-[#111827] text-slate-400">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs select-none">
            <div className="flex items-center gap-2.5">
              <div className="p-1 bg-white rounded-lg border border-slate-700 shrink-0">
                <img 
                  src="/workshop/page_1_img_1.png" 
                  alt="MVSS Logo" 
                  className="h-[60px] max-w-[180px] object-contain"
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

function getCurrentStageIndex(status) {
  const stagesKeys = [
    'Created',
    'Inspect Stage',
    'Estimation',
    'Customer Approval',
    'Work In Progress',
    'Quality Check',
    'Ready for Delivery',
    'Delivered'
  ];
  const idx = stagesKeys.indexOf(status);
  return idx === -1 ? 0 : idx;
}
