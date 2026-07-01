import React, { useState } from 'react';
import { Search, Wrench, ShieldCheck, Clock, Phone, MapPin, Car, FileText, ChevronRight, ArrowRight, Lock, X, Star, CheckCircle, Award, Settings } from 'lucide-react';
import Login from './Login';

export default function LandingPage({ onLoginSuccess }) {
  const [showLogin, setShowLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackerResult, setTrackerResult] = useState(null);
  const [searched, setSearched] = useState(false);

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

  const handleLogoClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find the index of the current stage
  const getCurrentStageIndex = (status) => {
    return stages.findIndex(s => s.key === status);
  };

  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-sans relative overflow-x-hidden">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <a href="#" onClick={handleLogoClick} className="flex items-center gap-2.5 select-none group">
          <div className="p-1 bg-white rounded-lg border border-[#E2E8F0] shrink-0 transition-colors group-hover:border-[#DC2626]">
            <img 
              src="/workshop/page_1_img_1.png" 
              alt="MVSS Logo" 
              className="h-8.5 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase text-[#0F172A] leading-tight">
              MVSS <span className="text-[#DC2626] transition-colors group-hover:text-red-700">AUTOMOBILES</span>
            </h1>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">Pvt. Ltd.</p>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#0F172A] uppercase tracking-wider">
          <a href="#services" className="hover:text-[#DC2626] transition-colors">Services</a>
          <a href="#gallery" className="hover:text-[#DC2626] transition-colors">Gallery</a>
          <a href="#why-choose" className="hover:text-[#DC2626] transition-colors">Why Choose Us</a>
          <a href="#tracker" className="hover:text-[#DC2626] transition-colors">Track Progress</a>
          <a href="#testimonials" className="hover:text-[#DC2626] transition-colors">Testimonials</a>
          <a href="#contact" className="hover:text-[#DC2626] transition-colors">Contact</a>
        </nav>

        <button
          onClick={() => setShowLogin(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] hover:bg-[#DC2626] text-white rounded-xl text-xs font-extrabold transition-all shadow-sm"
        >
          <Lock className="w-3.5 h-3.5" />
          Staff Portal
        </button>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative bg-white border-b border-[#E2E8F0]/40 max-w-7xl mx-auto px-6 pt-16 pb-20 text-center lg:text-left grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border border-[#DC2626]/20 bg-red-50 text-[#DC2626] mx-auto lg:mx-0 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />
            MVSS Automobiles Service Center
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#0F172A] leading-tight tracking-tight uppercase">
            Premium Car Care & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#DC2626] to-[#0F172A] bg-clip-text text-transparent">Multi-Brand Diagnostics</span>
          </h2>
          <p className="text-sm lg:text-base text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Secunderabad's trusted automotive workshop for premium repairs, periodic maintenance, and body shop solutions. Track your vehicle status and view reports directly online.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
            <a
              href="#tracker"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#DC2626] hover:bg-red-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-[#DC2626]/10"
            >
              Track Active Job Card
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#F8FAFC] hover:bg-slate-200 text-[#0F172A] rounded-xl text-xs font-extrabold border border-[#E2E8F0] transition-all"
            >
              Explore Our Services
            </a>
          </div>
        </div>

        {/* Hero Card Visual - Workshop Entrance */}
        <div className="lg:col-span-5 relative">
          <div className="absolute inset-0 bg-[#DC2626]/5 rounded-3xl blur-2xl pointer-events-none transform rotate-3" />
          <div className="relative border border-[#E2E8F0] bg-white p-2 rounded-3xl shadow-lg">
            <img 
              src="/workshop/page_1_img_1.png" 
              alt="MVSS Automobiles Workshop Entrance" 
              className="w-full h-auto object-cover rounded-2xl aspect-video lg:aspect-square"
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 max-w-7xl mx-auto px-6 bg-white space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold text-[#DC2626] uppercase tracking-widest">Our Capabilities</span>
          <h3 className="text-2xl font-extrabold text-[#0F172A] uppercase">Multi-Stream Servicing</h3>
          <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">We provide comprehensive diagnostics, paint solutions, and insurance checkout workflows.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Running Repair (RR)',
              desc: 'Suspension maintenance, brake overhauls, diagnostic scan, clutch repairs and general component overhauls.',
              tag: 'RR',
              icon: Settings
            },
            {
              title: 'Periodic Services (PMS)',
              desc: 'Lubrication PMS checkout, engine oil replacements, fluid topups, filter changes, and detailed 32-point checklist.',
              tag: 'PMS',
              icon: CheckCircle
            },
            {
              title: 'Body Shop (B/P)',
              desc: 'Dent adjustments, panel replacements, custom paint booths, scratch removals, and detailing finish.',
              tag: 'B/P',
              icon: Wrench
            },
            {
              title: 'Insurance Claims',
              desc: 'Surveyor coordination, damage canvas updates, cash-free settlements, and insurance catalog management.',
              tag: 'Claims',
              icon: ShieldCheck
            }
          ].map(service => {
            const Icon = service.icon;
            return (
              <div 
                key={service.title} 
                className="bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-2xl transition-all duration-200 hover:border-[#DC2626]/30 hover:bg-white hover:shadow-md flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-4">
                  <div className="p-3 bg-white border border-[#E2E8F0] text-[#DC2626] rounded-xl w-fit group-hover:border-[#DC2626]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-[#0F172A]">{service.title}</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{service.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#0F172A] group-hover:text-[#DC2626] uppercase tracking-wider mt-5 cursor-pointer transition-colors">
                  Learn More <ChevronRight className="w-3.5 h-3.5" />
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
            <h3 className="text-2xl font-extrabold text-[#0F172A] uppercase">MVSS Workshop Gallery</h3>
            <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
              Take a visual tour of our modern diagnostic checkouts, premium brand service bays, and genuine spares stock.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { src: '/workshop/page_1_img_1.png', title: 'Workshop Building', desc: 'Secure entrance and customer desk for booking check-in.' },
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
                className="h-[220px] sm:h-[280px] lg:h-[320px] bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm hover:border-[#DC2626]/40 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-lg group"
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

      {/* Why Choose MVSS Section */}
      <section id="why-choose" className="py-20 bg-white max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold text-[#DC2626] uppercase tracking-widest">Enterprise Car Care</span>
          <h3 className="text-2xl font-extrabold text-[#0F172A] uppercase">Why Choose MVSS</h3>
          <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">We provide premium multi-brand diagnostics with full digital tracking transparency.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: '100% Paperless Workflow',
              desc: 'From check-in to checkout, estimates, diagnostic checklists, and signatures are managed digitally.',
              icon: FileText
            },
            {
              title: 'Genuine Spares Inventory',
              desc: 'Stocked with OEM oil, filters, belts, and mechanical parts to ensure long-term repair reliability.',
              icon: CheckCircle
            },
            {
              title: 'Certified Technicians',
              desc: 'Our mechanical, body paint, and scanner diagnostics specialists are factory certified.',
              icon: Award
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-2xl space-y-4 shadow-xs text-center md:text-left">
                <div className="p-3 bg-white border border-[#E2E8F0] text-[#DC2626] rounded-xl w-fit mx-auto md:mx-0">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-[#0F172A]">{item.title}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Vehicle Status Tracker Section */}
      <section id="tracker-section" className="py-20 bg-[#F8FAFC] border-t border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-extrabold text-[#DC2626] uppercase tracking-widest">Real-time tracking</span>
            <h3 className="text-2xl font-extrabold text-[#0F172A] uppercase">Live Progress Timeline</h3>
            <p className="text-xs text-slate-500 font-semibold">Enter your plate registration or Job Card ID below to verify your vehicle stream progress.</p>
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
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#DC2626] text-slate-800 placeholder-slate-405 transition-all font-mono uppercase"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-[#0F172A] hover:bg-[#DC2626] text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
            >
              Track Status
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
                      <span className="block text-xs font-bold text-[#DC2626] font-mono mt-0.5">{trackerResult.jobCardNo}</span>
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
                        className="absolute top-1/2 left-0 h-1 bg-[#DC2626] -translate-y-1/2 z-0 transition-all duration-700" 
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
                                    ? 'bg-[#DC2626] border-red-500 text-white scale-110 shadow-lg shadow-red-650/30' 
                                    : isCompleted 
                                      ? 'bg-[#0F172A] border-[#0F172A] text-white' 
                                      : 'bg-white border-[#E2E8F0] text-slate-400'
                                }`}
                              >
                                {idx + 1}
                              </div>
                              <span className={`text-[9px] font-extrabold uppercase tracking-wide transition-colors ${
                                isActive ? 'text-[#DC2626]' : isCompleted ? 'text-slate-900 font-bold' : 'text-slate-400'
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
                  <div className="p-4 bg-red-50 border border-red-100/60 rounded-2xl flex items-center gap-3.5 mt-4">
                    <Clock className="w-5 h-5 text-[#DC2626] shrink-0" />
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold text-[#DC2626] uppercase tracking-widest">Client Feedback</span>
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
            <h3 className="text-2xl font-extrabold text-[#0F172A] uppercase">Contact Details</h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">MVSS Automobiles Pvt. Ltd. operates modern service facilities with certified specialists. Contact us for diagnostic quotes or mechanical checkout.</p>
            
            <div className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-[#0F172A] text-xs mb-1">Workshops Addresses</span>
                  <p className="leading-relaxed">
                    - Survey No. 25/1, Opp. Cine Planet, Kompally, Secunderabad - 500067 <br />
                    - Survey No. 48/5, Gundlapochampally, Medchal-Malkajgiri Dist - 500014
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#DC2626] shrink-0" />
                <div>
                  <span className="block font-bold text-[#0F172A] text-xs mb-0.5">Cellular Contacts</span>
                  <a href="tel:+919949479765" className="hover:underline text-[#DC2626] font-mono font-bold">+91 99494 79765</a> | <a href="tel:+919876543210" className="hover:underline text-[#DC2626] font-mono font-bold">+91 98765 43210</a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm">
            <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-wide">Request a Service Slot</h4>
            <form onSubmit={(e) => { e.preventDefault(); alert('Booking request sent successfully. Service team will contact you shortly.'); }} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Your Name</label>
                  <input type="text" required placeholder="John Doe" className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#DC2626]" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Phone</label>
                  <input type="tel" required placeholder="9988776655" className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#DC2626]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vehicle Plate No</label>
                  <input type="text" required placeholder="TS-09-EA-1234" className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#DC2626] uppercase" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Preferred Stream</label>
                  <select className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-bold focus:outline-none focus:border-[#DC2626]">
                    <option>General Servicing (PMS)</option>
                    <option>Running Repair (RR)</option>
                    <option>Body Shop (Dent/Paint)</option>
                    <option>Insurance Claims</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-3 px-4 bg-[#DC2626] hover:bg-red-750 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-red-600/10">
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
