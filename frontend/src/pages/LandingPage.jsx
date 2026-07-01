import React, { useState, useEffect } from 'react';
import { Search, Wrench, ShieldCheck, Clock, Phone, MapPin, Car, FileText, ChevronRight, ArrowRight, Lock, X, CheckCircle, Navigation, Star } from 'lucide-react';
import Login from './Login';

export default function LandingPage({ onLoginSuccess }) {
  const [showLogin, setShowLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackerResult, setTrackerResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);

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

  const heroSlides = [
    '/workshop/page_1_img_1.png', // Workshop exterior
    '/workshop/page_2_img_1.jpeg', // Workshop floor
    '/workshop/page_3_img_1.jpeg', // BMW service
    '/workshop/page_4_img_1.jpeg', // Mercedes service
    '/workshop/page_5_img_1.jpeg'  // Tata Harrier service
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % heroSlides.length);
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
    } else {
      setTrackerResult(null);
    }
  };

  // Find the index of the current stage
  const getCurrentStageIndex = (status) => {
    return stages.findIndex(s => s.key === status);
  };

  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-sans relative overflow-x-hidden">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] px-6 py-4 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto w-full gap-4 md:gap-0 select-none">
        <a href="/" className="flex items-center gap-2.5 select-none shrink-0 mr-auto md:mr-0 group">
          <div className="p-1 bg-white rounded-lg border border-[#E2E8F0] shrink-0 transition-colors group-hover:border-blue-500">
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

        <nav className="flex flex-wrap items-center justify-start md:justify-end gap-x-6 gap-y-2 text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider w-full md:w-auto">
          <a href="#services" className="hover:text-blue-600 transition-colors">Services</a>
          <a href="#gallery" className="hover:text-blue-600 transition-colors">Gallery</a>
          <a href="#why-choose" className="hover:text-blue-600 transition-colors">Why Choose Us</a>
          <a href="#tracker" className="hover:text-blue-600 transition-colors">Track Vehicle</a>
          <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
          <button
            onClick={() => setShowLogin(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-[10px] sm:text-[11px] font-extrabold transition-all"
          >
            <Lock className="w-3 h-3" />
            Staff Login
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative bg-white border-b border-[#E2E8F0]/40 max-w-7xl mx-auto px-6 pt-16 pb-20 text-center lg:text-left grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-1">
            <span className="block text-xs font-black text-blue-600 uppercase tracking-wider">MVSS Automobiles Pvt Ltd</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] leading-tight tracking-tight uppercase">
              Multi Brand Car Workshop
            </h2>
            <p className="text-lg font-bold text-slate-700">Body Shop & Insurance Claims</p>
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border border-blue-500/20 bg-blue-50 text-blue-600 mt-2">
              ✓ Trusted Car Care Experts
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
            Welcome to Secunderabad's modern automobile workshop facility. We provide high-quality servicing, computer diagnostics, panel paint booth repairs, and transparent live checklist status boards.
          </p>

          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            <a
              href="#tracker"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-blue-600/10"
            >
              Track Vehicle
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setShowLogin(true)}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              Staff Login
            </button>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-750 border border-[#E2E8F0] rounded-xl text-xs font-extrabold transition-all"
            >
              Contact Workshop
            </a>
          </div>
        </div>

        {/* Hero Slide visual */}
        <div className="lg:col-span-6 relative w-full h-[220px] sm:h-[320px] lg:h-[400px] overflow-hidden rounded-3xl border border-[#E2E8F0] shadow-lg">
          {heroSlides.map((slide, idx) => (
            <img 
              key={slide}
              src={slide}
              alt="Workshop Slide"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === slideIdx ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 max-w-7xl mx-auto px-6 bg-white space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">Our Capabilities</span>
          <h3 className="text-2xl font-extrabold text-[#0F172A] uppercase">Automotive Servicing Capabilities</h3>
          <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">We provide comprehensive automobile repairs and maintenance checkouts across multiple operational streams.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Running Repair (RR)',
              desc: 'Suspension maintenance, brake overhauls, diagnostic scan, clutch repairs and general component overhauls.',
              tag: 'RR'
            },
            {
              title: 'Periodic Services (PMS)',
              desc: 'Standard lubrication service, engine oil replacements, fluid topups, filter changes, and detailed 32-point checklist.',
              tag: 'PMS'
            },
            {
              title: 'Body Shop (B/P)',
              desc: 'Dent adjustments, panel replacements, custom paint booths, scratch removals, and detailing finish.',
              tag: 'B/P'
            },
            {
              title: 'Insurance Claims',
              desc: 'Direct surveyor coordination, digital damage canvas tracking, cash-free settlements, and insurance catalog updates.',
              tag: 'Claims'
            }
          ].map(service => (
            <div 
              key={service.title} 
              className="bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-2xl transition-all duration-200 hover:border-blue-500/30 hover:bg-white hover:shadow-md flex flex-col justify-between group shadow-xs"
            >
              <div className="space-y-3">
                <span className="inline-block px-2.5 py-0.5 bg-white border border-[#E2E8F0] rounded-md text-[9px] font-black text-slate-600 uppercase tracking-widest">{service.tag}</span>
                <h4 className="text-sm font-black text-[#0F172A] group-hover:text-blue-600 transition-colors">{service.title}</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{service.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-extrabold text-slate-800 group-hover:text-blue-600 uppercase tracking-wider mt-4 cursor-pointer transition-colors">
                Learn More <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Workshop Gallery Section */}
      <section id="gallery" className="py-20 bg-[#F8FAFC] border-t border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">Our Facility Tour</span>
            <h3 className="text-2xl font-extrabold text-[#0F172A] uppercase">Workshop Gallery</h3>
            <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
              Visual tour of our modern diagnostic checkouts, premium brand service bays, and genuine spares stock.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { src: '/workshop/page_1_img_1.png', title: 'Workshop Entrance', desc: 'Secure entrance and customer desk for booking check-in.' },
              { src: '/workshop/page_9_img_1.jpeg', title: 'Team Photo', desc: 'Professional team of MVSS certified workshop technicians.' },
              { src: '/workshop/page_3_img_1.jpeg', title: 'BMW Service', desc: 'Active scanning diagnostics for luxury BMW cars.' },
              { src: '/workshop/page_4_img_1.jpeg', title: 'Mercedes Service', desc: 'Engine tuning, running repairs and component servicing.' },
              { src: '/workshop/page_5_img_1.jpeg', title: 'Tata Harrier Service', desc: 'Lubrication PMS checkout, oil change and filters.' },
              { src: '/workshop/page_6_img_1.jpeg', title: 'Reception Office', desc: 'Comfortable client lounge with live tracking boards.' },
              { src: '/workshop/page_8_img_1.jpeg', title: 'Bosch Equipment', desc: 'Bosch scanner and vehicle alignment calibration diagnostics.' },
              { src: '/workshop/page_7_img_1.jpeg', title: 'Spare Parts Room', desc: 'Fully organized catalog room for genuine spares and parts.' },
              { src: '/workshop/page_2_img_1.jpeg', title: 'Workshop Floor', desc: 'Modern bays with heavy-duty lifts and workshop bays.' }
            ].map((photo, idx) => (
              <div 
                key={idx}
                className="h-[240px] sm:h-[300px] lg:h-[340px] bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm hover:border-blue-500/40 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-lg group"
              >
                <div className="flex-1 w-full overflow-hidden bg-slate-100 relative">
                  <img 
                    src={photo.src} 
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 bg-white border-t border-[#E2E8F0] flex flex-col justify-center text-center space-y-1">
                  <h4 className="text-xs sm:text-sm font-black text-[#0F172A]">{photo.title}</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-relaxed truncate">{photo.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-choose" className="py-20 bg-white max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">Enterprise Car Care</span>
          <h3 className="text-2xl font-extrabold text-[#0F172A] uppercase">Why Choose Us</h3>
          <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">We provide premium multi-brand diagnostics with full digital tracking transparency.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Bosch Diagnostic Equipment', desc: 'Equipped with Bosch automobile scanners and alignment diagnostic kits.' },
            { title: 'Multi Brand Service', desc: 'Certified engine servicing, chassis PMS and mechanical repair for premium brands.' },
            { title: 'Insurance Claims Support', desc: 'Coordinated claims survey, damage documentation, and cashless insurance checkout.' },
            { title: 'Genuine Spare Parts', desc: 'OEM filters, high-grade engine oil, spark plugs, and brake pads in spares room.' },
            { title: 'Experienced Technicians', desc: 'Workshop floor staffed with certified mechanical and body workshop specialists.' },
            { title: 'Digital Job Card Tracking', desc: 'Secure digital tracking boards showing stages registered, repair progress, and QC.' }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-2xl flex gap-4 items-start shadow-xs">
              <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-black text-[#0F172A]">{item.title}</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vehicle Tracking */}
      <section id="tracker" className="py-20 bg-[#F8FAFC] border-t border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">Real-time status</span>
            <h3 className="text-2xl font-extrabold text-[#0F172A] uppercase">Vehicle Tracking</h3>
            <p className="text-xs text-slate-500 font-semibold">Enter your registration number or Job Card ID below to verify your vehicle stream progress.</p>
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
              className="px-5 py-3 bg-[#0F172A] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
            >
              Track Vehicle
            </button>
          </form>

          {searched && (
            <div className="mt-8 animate-fade-in">
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
                                isActive ? 'text-blue-600 font-bold' : isCompleted ? 'text-slate-900 font-bold' : 'text-slate-400'
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

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">Client Feedback</span>
          <h3 className="text-2xl font-extrabold text-[#0F172A] uppercase">Testimonials</h3>
          <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">Read what premium multi-brand automobile owners say about our workshop services.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Raghavan Pillai',
              car: 'BMW 3 Series Owner',
              feedback: 'The multi-brand diagnostic scanner detected my suspension issue instantly. The paperless quote approval saved me three hours. Exceptional service.',
              rating: 5
            },
            {
              name: 'Arjun Reddy',
              car: 'Mercedes E-Class Owner',
              feedback: 'Very professional. The team was highly skilled. Spares stock room had the OEM parts required. Highly recommend.',
              rating: 5
            },
            {
              name: 'Suresh Kumar',
              car: 'Tata Harrier Owner',
              feedback: 'PMS lubrication, fluid checkout and filter replacements done within half a day. Live vehicle status tracker works flawlessly.',
              rating: 5
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-2xl space-y-4 shadow-xs relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex gap-1 text-[#DC2626]">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 font-semibold italic">"{item.feedback}"</p>
              </div>
              <div className="mt-4 border-t border-slate-200/60 pt-3">
                <span className="block text-xs font-black text-[#0F172A]">{item.name}</span>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{item.car}</span>
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
            
            <div className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-[#0F172A] text-xs mb-1">Workshop Address</span>
                  <p className="leading-relaxed">
                    - Survey No. 25/1, Opp. Cine Planet, Kompally, Secunderabad - 500067 <br />
                    - Survey No. 48/5, Gundlapochampally, Medchal-Malkajgiri Dist - 500014
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="block font-bold text-[#0F172A] text-xs mb-0.5">Phone Number</span>
                  <a href="tel:+919949479765" className="hover:underline text-blue-650 font-mono font-bold">+91 99494 79765</a>
                </div>
              </div>
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

          <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm">
            <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-wide">Request a Service Slot</h4>
            <form onSubmit={(e) => { e.preventDefault(); alert('Booking request sent successfully. Service team will contact you shortly.'); }} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Your Name</label>
                  <input type="text" required placeholder="John Doe" className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Phone</label>
                  <input type="tel" required placeholder="9988776655" className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vehicle Plate No</label>
                  <input type="text" required placeholder="TS-09-EA-1234" className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 uppercase" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Preferred Stream</label>
                  <select className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500">
                    <option>General Servicing (PMS)</option>
                    <option>Running Repair (RR)</option>
                    <option>Body Shop (Dent/Paint)</option>
                    <option>Insurance Claims</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-blue-600/10">
                Book Diagnostic Appointment
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] py-8 bg-[#0F172A] text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
          <span>© 2026 MVSS AUTOMOBILES. ALL RIGHTS RESERVED.</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> SECURE DATA BACKED</span>
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
