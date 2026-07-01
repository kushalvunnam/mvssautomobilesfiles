import React, { useState } from 'react';
import { Search, Wrench, ShieldCheck, Clock, Phone, MapPin, Car, FileText, ChevronRight, ArrowRight, Lock, X } from 'lucide-react';
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

  // Find the index of the current stage
  const getCurrentStageIndex = (status) => {
    return stages.findIndex(s => s.key === status);
  };

  return (
    <div className="min-h-screen bg-slate-955 text-slate-100 font-sans relative overflow-x-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider uppercase text-white">AutoWorkshop <span className="text-indigo-400">PRO</span></h1>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none">MVSS Automobiles</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <a href="#services" className="hover:text-white transition-colors">Services</a>
          <a href="#tracker" className="hover:text-white transition-colors">Track Vehicle</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </nav>

        <button
          onClick={() => setShowLogin(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 hover:bg-slate-850 rounded-xl text-xs font-bold transition-all shadow-md shadow-black/40"
        >
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          Staff Portal
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 text-center lg:text-left grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border border-indigo-500/30 bg-indigo-950/20 text-indigo-400 mx-auto lg:mx-0 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
            MVSS Automobiles Pvt. Ltd.
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            Premium Car Care & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">Multi-Stream Servicing</span>
          </h2>
          <p className="text-sm lg:text-base text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Welcome to Secunderabad's trusted automotive service destination. Track your active job cards, view diagnostic reports, and manage estimates directly online.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
            <a
              href="#tracker"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-indigo-600/10"
            >
              Track Active Job Card
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-xl text-xs font-extrabold border border-slate-800 hover:border-slate-700 transition-all"
            >
              Explore Our Services
            </a>
          </div>
        </div>

        {/* Hero Card Visual */}
        <div className="lg:col-span-5 relative">
          <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl blur-2xl pointer-events-none transform rotate-3" />
          <div className="relative bg-slate-900/50 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Live Workshop Stats</span>
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                <span className="block text-2xl font-black text-white font-mono">100%</span>
                <span className="block text-[9px] text-slate-500 font-extrabold uppercase mt-1">Paperless Workflow</span>
              </div>
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                <span className="block text-2xl font-black text-sky-400 font-mono">GST</span>
                <span className="block text-[9px] text-slate-500 font-extrabold uppercase mt-1">Compliant Invoicing</span>
              </div>
            </div>
            <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-2xl flex items-center gap-3.5">
              <ShieldCheck className="w-7 h-7 text-indigo-400 shrink-0" />
              <div className="text-left text-[11px] leading-relaxed">
                <span className="block font-bold text-white uppercase tracking-wide">Secure Digital System</span>
                <p className="text-slate-400 font-medium">Auto-generated estimate quotes and secure digital signatures for peace of mind.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Vehicle Status Tracker Section */}
      <section id="tracker" className="py-20 bg-slate-950 border-y border-slate-900">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-extrabold text-white">Live Vehicle Status Tracker</h3>
            <p className="text-xs text-slate-400 font-semibold max-w-md mx-auto">Enter your Vehicle Number or Job Card Number below to see your car's progress in real-time.</p>
          </div>

          <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. TS-09-EA-1234 or JC-1001"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-600 transition-all font-mono uppercase"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 shrink-0"
            >
              Track Progress
            </button>
          </form>

          {searched && (
            <div className="mt-8 animate-fade-in">
              {trackerResult ? (
                <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl space-y-6">
                  {/* Result Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-4">
                    <div>
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase">Vehicle Owner / Details</span>
                      <h4 className="text-sm font-black text-white mt-0.5">{trackerResult.customerId?.name || 'Customer'}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{trackerResult.vehicleId?.make} {trackerResult.vehicleId?.model} ({trackerResult.vehicleId?.vehicleNumber})</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase">Job Card ID</span>
                      <span className="block text-xs font-bold text-indigo-400 font-mono mt-0.5">{trackerResult.jobCardNo}</span>
                      <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">Service: {trackerResult.serviceType}</span>
                    </div>
                  </div>

                  {/* Horizontal Timeline */}
                  <div className="space-y-4 pt-2">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase block tracking-wider">Service Timeline Progress</span>
                    
                    <div className="relative py-4 overflow-x-auto min-w-[500px]">
                      {/* Timeline Bar */}
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0" />
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-indigo-500 -translate-y-1/2 z-0 transition-all duration-700" 
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
                                    ? 'bg-indigo-600 border-indigo-400 text-white scale-110 shadow-lg shadow-indigo-600/30' 
                                    : isCompleted 
                                      ? 'bg-slate-900 border-indigo-500 text-indigo-400' 
                                      : 'bg-slate-950 border-slate-800 text-slate-650'
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
                    <Clock className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div className="text-left text-xs leading-relaxed">
                      <span className="font-bold text-white uppercase tracking-wide">
                        Current Status: {stages[getCurrentStageIndex(trackerResult.status)].label}
                      </span>
                      <p className="text-slate-400 font-semibold">{stages[getCurrentStageIndex(trackerResult.status)].desc}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-955 p-6 rounded-3xl text-center text-xs font-semibold text-red-400 max-w-md mx-auto">
                  ⚠ No active job card found for "{searchQuery}". Please check the registration number or contact the advisor.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-extrabold text-white">Our Servicing Capabilities</h3>
          <p className="text-xs text-slate-400 font-semibold max-w-md mx-auto">We provide comprehensive automobile repairs and maintenance checkouts across multiple operational streams.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Running Repair (RR)',
              desc: 'Suspension maintenance, brake overhauls, diagnostic scan, clutch repairs and general component overhauls.',
              tag: 'RR',
              accent: 'hover:border-sky-500/30 hover:shadow-sky-500/5'
            },
            {
              title: 'Periodic Services (PMS)',
              desc: 'Standard lubrication service, engine oil replacements, fluid topups, filter changes, and detailed 32-point checklist.',
              tag: 'PMS',
              accent: 'hover:border-emerald-500/30 hover:shadow-emerald-500/5'
            },
            {
              title: 'Body Shop (B/P)',
              desc: 'Dent adjustments, panel replacements, custom paint booths, scratch removals, and detailing finish.',
              tag: 'B/P',
              accent: 'hover:border-purple-500/30 hover:shadow-purple-500/5'
            },
            {
              title: 'Insurance Claims',
              desc: 'Direct surveyor coordination, digital damage canvas tracking, cash-free settlements, and insurance catalog updates.',
              tag: 'Claims',
              accent: 'hover:border-indigo-500/30 hover:shadow-indigo-500/5'
            }
          ].map(service => (
            <div 
              key={service.title} 
              className={`bg-slate-900/40 border border-slate-900 p-6 rounded-2xl hover:bg-slate-900/60 transition-all duration-200 group flex flex-col justify-between ${service.accent} shadow-xl`}
            >
              <div className="space-y-3">
                <span className="inline-block px-2.5 py-0.5 bg-slate-950 border border-slate-800 rounded-md text-[9px] font-black text-indigo-400 uppercase tracking-widest">{service.tag}</span>
                <h4 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{service.title}</h4>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{service.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider mt-4">
                Learn More <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Workshop Gallery Section */}
      <section className="py-20 max-w-7xl mx-auto px-6 space-y-12 border-t border-slate-900">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">Our Facility Tour</span>
          <h3 className="text-2xl font-extrabold text-white">MVSS Workshop Gallery</h3>
          <p className="text-xs text-slate-400 font-semibold max-w-md mx-auto">
            Take a visual tour of our modern diagnostic checkouts, premium brand service bays, and genuine spares stock.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { src: '/workshop/page_1_img_1.png', title: 'Workshop Entrance', desc: 'Secure entrance and customer desk for booking check-in.' },
            { src: '/workshop/page_2_img_1.jpeg', title: 'Service Bays', desc: 'Modern bays with heavy-duty lifts and workshop bays.' },
            { src: '/workshop/page_3_img_1.jpeg', title: 'BMW Service Vehicle', desc: 'Active scanning diagnostics for luxury BMW cars.' },
            { src: '/workshop/page_4_img_1.jpeg', title: 'Mercedes Vehicle', desc: 'Engine tuning, running repairs and component servicing.' },
            { src: '/workshop/page_5_img_1.jpeg', title: 'Tata Harrier Service Bay', desc: 'Lubrication PMS checkout, oil change and filters.' },
            { src: '/workshop/page_6_img_1.jpeg', title: 'Reception & Office', desc: 'Comfortable client lounge with live tracking boards.' },
            { src: '/workshop/page_7_img_1.jpeg', title: 'Spare Parts Room', desc: 'Fully organized catalog room for genuine spares and parts.' },
            { src: '/workshop/page_8_img_1.jpeg', title: 'Bosch Equipment', desc: 'Bosch scanner and vehicle alignment calibration diagnostics.' },
            { src: '/workshop/page_9_img_1.jpeg', title: 'Team Photo', desc: 'Professional team of MVSS certified workshop technicians.' }
          ].map((photo, idx) => (
            <div 
              key={idx}
              className="h-[220px] sm:h-[280px] lg:h-[320px] bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden shadow-xl hover:border-slate-800 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-indigo-600/5 group"
            >
              <div className="flex-1 w-full overflow-hidden bg-slate-950 relative">
                <img 
                  src={photo.src} 
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-4 bg-slate-900/90 dark:bg-slate-900/90 border-t border-slate-950 flex flex-col justify-center text-center space-y-1">
                <h4 className="text-xs sm:text-sm font-black text-white">{photo.title}</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-relaxed truncate">{photo.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact & Location Section */}
      <section id="contact" className="py-20 border-t border-slate-900 bg-slate-950/40">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-extrabold text-white">Get in Touch</h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">MVSS Automobiles Pvt. Ltd. operates multiple modern service workshops equipped with high-tech diagnostic scanners and paint booths.</p>
            
            <div className="space-y-4 text-xs font-semibold text-slate-350">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-white text-xs mb-1">Workshops Addresses</span>
                  <p className="leading-relaxed">
                    - Survey No. 25/1, Opp. Cine Planet, Kompally, Secunderabad - 500067 <br />
                    - Survey No. 48/5, Gundlapochampally, Medchal-Malkajgiri Dist - 500014
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <span className="block font-bold text-white text-xs mb-0.5">Cellular Contacts</span>
                  <a href="tel:+919949479765" className="hover:underline text-indigo-400">99494 79765</a> | <a href="tel:+919876543210" className="hover:underline text-indigo-400">98765 43210</a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/35 border border-slate-900 p-6 rounded-3xl space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wide">Request a Service Slot</h4>
            <form onSubmit={(e) => { e.preventDefault(); alert('Booking request sent successfully. Service team will contact you shortly.'); }} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Your Name</label>
                  <input type="text" required placeholder="John Doe" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Phone</label>
                  <input type="tel" required placeholder="9988776655" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vehicle Plate No</label>
                  <input type="text" required placeholder="TS-09-EA-1234" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 uppercase" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Preferred Stream</label>
                  <select className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500">
                    <option>General Servicing (PMS)</option>
                    <option>Running Repair (RR)</option>
                    <option>Body Shop (Dent/Paint)</option>
                    <option>Insurance Claims</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 px-4 bg-indigo-655 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10">
                Book Diagnostic Appointment
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
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
