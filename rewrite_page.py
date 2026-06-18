import sys

content = """\"use client\";

import Link from "next/link";
import { 
  Link2, FileText, ImageIcon, File, BarChart3, Lock, Share2, Sparkles, User, 
  ArrowRight, Copy, Check, LayoutDashboard, Settings, Search, Bell, ChevronDown, 
  Activity, Globe, MoveUpRight, MoreHorizontal
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F9F9FB] text-zinc-900 font-sans selection:bg-zinc-200" suppressHydrationWarning>
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm font-semibold text-zinc-600 mb-8 shadow-sm">
                <Sparkles className="h-4 w-4" />
                <span>All-in-One Content Sharing Platform</span>
              </div>

              <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-7xl lg:text-[80px] leading-[1.1]">
                One Link.<br/>Everything Shared.
              </h1>

              <p className="mt-6 text-lg text-zinc-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Store, organize and share your Links, PDFs, Images, and Documents with beautiful public profiles and smart share links.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/register"
                  className="rounded-xl bg-zinc-900 px-8 py-4 text-base font-bold text-white hover:bg-zinc-800 transition-all shadow-md w-full sm:w-auto text-center"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/#product"
                  className="rounded-xl border border-zinc-200 bg-white px-8 py-4 text-base font-bold text-zinc-900 hover:bg-zinc-50 transition-all shadow-sm w-full sm:w-auto text-center"
                >
                  View Demo
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-[13px] font-semibold text-zinc-500">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-100">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  No Credit Card Required
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-100">
                    <Sparkles className="h-3 w-3" />
                  </div>
                  Free Forever Plan
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-100">
                    <Lock className="h-3 w-3" />
                  </div>
                  Secure & Private
                </div>
              </div>
            </div>

            {/* Right Graphic / Mockup */}
            <div className="flex-1 relative w-full h-[500px] lg:h-[650px] hidden md:block">
              {/* Main Dashboard Card */}
              <div className="absolute top-0 right-10 w-[720px] bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-zinc-100 overflow-hidden z-10 transform translate-x-16">
                <div className="flex h-full">
                  {/* Sidebar */}
                  <div className="w-48 bg-white border-r border-zinc-100 p-4 flex flex-col min-h-[460px]">
                    <div className="flex items-center gap-2 mb-8 px-2">
                      <div className="h-7 w-7 bg-zinc-900 rounded-md flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 text-white"><path d="M12 2L2 22l10-4 10 4L12 2z" /></svg>
                      </div>
                      <span className="font-extrabold text-zinc-900 text-base tracking-tight">Aivones</span>
                    </div>
                    
                    <nav className="flex-1 space-y-1">
                      <div className="flex items-center gap-2.5 px-3 py-2 bg-zinc-100/80 rounded-lg text-zinc-900 font-semibold text-[13px]">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </div>
                      <div className="flex items-center gap-2.5 px-3 py-2 text-zinc-500 hover:text-zinc-900 font-medium text-[13px]">
                        <Link2 className="h-4 w-4" />
                        <span>Links</span>
                      </div>
                      <div className="flex items-center gap-2.5 px-3 py-2 text-zinc-500 hover:text-zinc-900 font-medium text-[13px]">
                        <FileText className="h-4 w-4" />
                        <span>PDFs</span>
                      </div>
                      <div className="flex items-center gap-2.5 px-3 py-2 text-zinc-500 hover:text-zinc-900 font-medium text-[13px]">
                        <ImageIcon className="h-4 w-4" />
                        <span>Images</span>
                      </div>
                      <div className="flex items-center gap-2.5 px-3 py-2 text-zinc-500 hover:text-zinc-900 font-medium text-[13px]">
                        <File className="h-4 w-4" />
                        <span>Documents</span>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-zinc-100"></div>
                      
                      <div className="flex items-center gap-2.5 px-3 py-2 text-zinc-500 hover:text-zinc-900 font-medium text-[13px]">
                        <Share2 className="h-4 w-4" />
                        <span>Smart Links</span>
                      </div>
                      <div className="flex items-center gap-2.5 px-3 py-2 text-zinc-500 hover:text-zinc-900 font-medium text-[13px]">
                        <User className="h-4 w-4" />
                        <span>Public Profile</span>
                      </div>
                      <div className="flex items-center gap-2.5 px-3 py-2 text-zinc-500 hover:text-zinc-900 font-medium text-[13px]">
                        <BarChart3 className="h-4 w-4" />
                        <span>Analytics</span>
                      </div>
                      <div className="flex items-center gap-2.5 px-3 py-2 text-zinc-500 hover:text-zinc-900 font-medium text-[13px]">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </div>
                    </nav>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 p-6 bg-[#FDFDFE]">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="font-bold text-xl text-zinc-900">Dashboard</h2>
                      <div className="flex items-center gap-4">
                        <Search className="h-4 w-4 text-zinc-400" />
                        <Bell className="h-4 w-4 text-zinc-400" />
                        <div className="h-7 w-7 rounded-full bg-zinc-200 overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop" alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 rounded-lg text-[11px] font-medium text-zinc-600 bg-white">
                          <span>May 1 - May 31</span>
                          <ChevronDown className="h-3 w-3" />
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      {/* Stat 1 */}
                      <div className="bg-white border border-zinc-100 rounded-xl p-3 shadow-sm">
                        <p className="text-[10px] text-zinc-500 font-medium mb-1">Total Views</p>
                        <div className="flex items-baseline gap-2 mb-2">
                          <p className="text-lg font-bold text-zinc-900">24.8K</p>
                          <span className="text-[9px] font-semibold text-emerald-500">+18.2%</span>
                        </div>
                        <svg className="w-full h-6" viewBox="0 0 100 20" fill="none" stroke="#10b981" strokeWidth="2"><path d="M0 15 Q10 10 20 15 T40 5 T60 10 T80 2 T100 5" /></svg>
                      </div>
                      {/* Stat 2 */}
                      <div className="bg-white border border-zinc-100 rounded-xl p-3 shadow-sm">
                        <p className="text-[10px] text-zinc-500 font-medium mb-1">Link Clicks</p>
                        <div className="flex items-baseline gap-2 mb-2">
                          <p className="text-lg font-bold text-zinc-900">7.6K</p>
                          <span className="text-[9px] font-semibold text-emerald-500">+16.7%</span>
                        </div>
                        <svg className="w-full h-6" viewBox="0 0 100 20" fill="none" stroke="#10b981" strokeWidth="2"><path d="M0 10 Q15 5 25 15 T50 5 T75 10 T100 2" /></svg>
                      </div>
                      {/* Stat 3 */}
                      <div className="bg-white border border-zinc-100 rounded-xl p-3 shadow-sm">
                        <p className="text-[10px] text-zinc-500 font-medium mb-1">Files</p>
                        <div className="flex items-baseline gap-2 mb-2">
                          <p className="text-lg font-bold text-zinc-900">1.2K</p>
                          <span className="text-[9px] font-semibold text-emerald-500">+12.4%</span>
                        </div>
                        <svg className="w-full h-6" viewBox="0 0 100 20" fill="none" stroke="#10b981" strokeWidth="2"><path d="M0 12 Q20 8 30 14 T60 6 T80 12 T100 4" /></svg>
                      </div>
                      {/* Stat 4 */}
                      <div className="bg-white border border-zinc-100 rounded-xl p-3 shadow-sm">
                        <p className="text-[10px] text-zinc-500 font-medium mb-1">Storage Used</p>
                        <div className="flex items-baseline gap-2 mb-2">
                          <p className="text-lg font-bold text-zinc-900">12.4 GB</p>
                          <span className="text-[9px] font-semibold text-zinc-400">+8.3%</span>
                        </div>
                        <svg className="w-full h-6" viewBox="0 0 100 20" fill="none" stroke="#71717a" strokeWidth="2"><path d="M0 18 Q15 15 30 18 T60 12 T85 15 T100 10" /></svg>
                      </div>
                    </div>

                    {/* Bottom Split */}
                    <div className="flex gap-4">
                      {/* Recent Content */}
                      <div className="flex-1 bg-white border border-zinc-100 rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-[13px] text-zinc-900">Recent Content</h3>
                          <span className="text-[10px] font-medium text-blue-600">View all</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                <Link2 className="h-3.5 w-3.5 text-zinc-500" />
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-zinc-900 leading-tight">Design Portfolio</p>
                                <p className="text-[9px] text-zinc-400">https://dribbble.com/alexrivers</p>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-zinc-900">2.4K</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                <FileText className="h-3.5 w-3.5 text-red-500" />
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-zinc-900 leading-tight">Brand Guidelines</p>
                                <p className="text-[9px] text-zinc-400">12.4 MB</p>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-zinc-900">1.8K</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-zinc-900 leading-tight">Product Screenshots</p>
                                <p className="text-[9px] text-zinc-400">24 Files</p>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-zinc-900">3.2K</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                <File className="h-3.5 w-3.5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-zinc-900 leading-tight">Project Proposal</p>
                                <p className="text-[9px] text-zinc-400">DOCX - 2.1 MB</p>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-zinc-900">1.2K</span>
                          </div>
                        </div>
                      </div>

                      {/* Profile Views Chart */}
                      <div className="w-56 bg-white border border-zinc-100 rounded-xl p-4 shadow-sm relative">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-[10px] text-zinc-500 font-medium mb-1">Profile Views</p>
                            <p className="text-xl font-bold text-zinc-900">24.8K</p>
                          </div>
                          <div className="h-5 w-5 rounded bg-zinc-50 flex items-center justify-center">
                            <MoveUpRight className="h-3 w-3 text-zinc-400" />
                          </div>
                        </div>
                        
                        <div className="h-32 w-full relative mt-2">
                          {/* Y Axis */}
                          <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[8px] text-zinc-400">
                            <span>25K</span>
                            <span>20K</span>
                            <span>10K</span>
                            <span>5K</span>
                          </div>
                          {/* Chart Area */}
                          <div className="absolute left-5 right-0 top-1 bottom-6">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <path d="M0 90 Q10 80 20 85 T40 60 T60 70 T80 30 T100 10" fill="none" stroke="#000" strokeWidth="2" />
                              <path d="M0 90 Q10 80 20 85 T40 60 T60 70 T80 30 T100 10 L100 100 L0 100 Z" fill="url(#gradient)" opacity="0.1" />
                              <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#000" />
                                  <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                              <circle cx="100" cy="10" r="3" fill="#000" />
                            </svg>
                            {/* Dotted crosshair */}
                            <div className="absolute right-0 top-0 bottom-0 border-r border-dashed border-zinc-300 pointer-events-none"></div>
                          </div>
                          {/* X Axis */}
                          <div className="absolute left-5 right-0 bottom-0 flex justify-between text-[8px] text-zinc-400">
                            <span>May 1</span>
                            <span>May 15</span>
                            <span>May 31</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Mobile Mockup */}
              <div className="absolute top-12 right-0 w-[240px] bg-white rounded-[24px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-zinc-100 p-4 z-20 transform translate-x-32 translate-y-6">
                <div className="flex flex-col items-center pt-2 pb-4">
                  <div className="h-16 w-16 rounded-full bg-zinc-100 mb-3 overflow-hidden border border-zinc-100">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop" alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-extrabold text-sm text-zinc-900">Alex Rivers</h4>
                  <p className="text-[10px] text-zinc-500 mb-2">@alexrivers</p>
                  <p className="text-[10px] text-zinc-600 text-center leading-snug px-2">Product Designer & Creator. Sharing my templates, assets, and resources.</p>
                  <div className="flex gap-3 mt-4 text-zinc-400">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.8c0-1.2-.4-2.2-1-2.9 3-.3 6-1.5 6-6.5 0-1.4-.5-2.6-1.3-3.5.1-.3.6-1.6-.1-3.4 0 0-1-.3-3.3 1.2-.9-.3-1.9-.4-2.9-.4s-2 .1-2.9.4C5 2.5 4 2.8 4 2.8c-.7 1.8-.2 3.1-.1 3.4-.8.9-1.3 2.1-1.3 3.5 0 5 3 6.2 6 6.5-.6.6-1 1.6-1 3v3.8"></path></svg>
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="21.17" y1="8" x2="12" y2="8"></line><line x1="3.95" y1="6.06" x2="8.54" y2="14"></line><line x1="10.88" y1="21.94" x2="15.46" y2="14"></line></svg>
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </div>
                </div>
                <div className="flex gap-4 border-b border-zinc-100 pb-2 mb-3 px-2 justify-between">
                  <div className="text-[10px] font-bold text-zinc-900 border-b-2 border-zinc-900 pb-1 -mb-[9px]">Links</div>
                  <div className="text-[10px] font-medium text-zinc-400 pb-1">PDFs</div>
                  <div className="text-[10px] font-medium text-zinc-400 pb-1">Images</div>
                  <div className="text-[10px] font-medium text-zinc-400 pb-1">Docs</div>
                </div>
                <div className="space-y-2 mt-4">
                  {/* Link 1 */}
                  <div className="bg-white rounded-xl p-2.5 flex items-center gap-3 border border-zinc-200 shadow-sm">
                    <div className="h-8 w-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                      <Link2 className="h-3.5 w-3.5 text-zinc-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[11px] font-bold text-zinc-900">Latest Case Study</div>
                      <div className="text-[9px] text-zinc-400 font-medium">2.4K views</div>
                    </div>
                    <ArrowRight className="h-3 w-3 text-zinc-300" />
                  </div>
                  {/* Link 2 */}
                  <div className="bg-white rounded-xl p-2.5 flex items-center gap-3 border border-zinc-200 shadow-sm">
                    <div className="h-8 w-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                      <ImageIcon className="h-3.5 w-3.5 text-zinc-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[11px] font-bold text-zinc-900">Design Portfolio</div>
                      <div className="text-[9px] text-zinc-400 font-medium">3.1K views</div>
                    </div>
                    <ArrowRight className="h-3 w-3 text-zinc-300" />
                  </div>
                  {/* Link 3 */}
                  <div className="bg-white rounded-xl p-2.5 flex items-center gap-3 border border-zinc-200 shadow-sm">
                    <div className="h-8 w-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                      <FileText className="h-3.5 w-3.5 text-zinc-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[11px] font-bold text-zinc-900">Brand Guidelines</div>
                      <div className="text-[9px] text-zinc-400 font-medium">1.8K views</div>
                    </div>
                    <ArrowRight className="h-3 w-3 text-zinc-300" />
                  </div>
                  {/* Link 4 */}
                  <div className="bg-white rounded-xl p-2.5 flex items-center gap-3 border border-zinc-200 shadow-sm">
                    <div className="h-8 w-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                      <ImageIcon className="h-3.5 w-3.5 text-zinc-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[11px] font-bold text-zinc-900">Product Screenshots</div>
                      <div className="text-[9px] text-zinc-400 font-medium">3.2K views</div>
                    </div>
                    <ArrowRight className="h-3 w-3 text-zinc-300" />
                  </div>
                </div>
              </div>

              {/* Share Dialog Mockup */}
              <div className="absolute bottom-8 right-40 w-[240px] bg-white rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-zinc-100 p-5 z-30 transform -translate-x-8">
                <h4 className="font-extrabold text-[13px] text-zinc-900 mb-1">Smart Share Link</h4>
                <p className="text-[10px] text-zinc-500 mb-4 font-medium leading-relaxed">Share only what you want.<br/>Update anytime.</p>
                <div className="bg-zinc-50 rounded-lg p-2 flex items-center justify-between border border-zinc-200 mb-4 shadow-inner">
                  <span className="text-[10px] text-zinc-600 font-medium truncate w-24">aivones.com/alex</span>
                  <div className="bg-zinc-900 text-white text-[10px] px-3 py-1.5 rounded-md font-bold shadow-sm">Copy Link</div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3.5 w-3.5 rounded-full bg-zinc-900 flex items-center justify-center">
                        <Check className="h-2 w-2 text-white" strokeWidth={3}/>
                      </div>
                      <span className="text-[11px] text-zinc-900 font-bold">Share Settings</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 pl-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full border border-zinc-300 bg-white"></div>
                      <span className="text-[11px] text-zinc-500 font-medium">Share Everything</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full border border-zinc-300 bg-white"></div>
                      <span className="text-[11px] text-zinc-500 font-medium">Links Only</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full border border-zinc-300 bg-white"></div>
                      <span className="text-[11px] text-zinc-500 font-medium">PDFs Only</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full border border-zinc-300 bg-white"></div>
                      <span className="text-[11px] text-zinc-500 font-medium">Images Only</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full border border-zinc-300 bg-white"></div>
                      <span className="text-[11px] text-zinc-500 font-medium">Documents Only</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-900 shadow-[0_0_0_2px_rgba(24,24,27,0.2)]"></div>
                      <span className="text-[11px] text-zinc-900 font-bold">Custom Selection</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Logos */}
      <section className="py-10 border-t border-b border-zinc-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-zinc-400 mb-8 uppercase tracking-wider">Trusted by creators, freelancers, and teams worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-60 grayscale">
            <span className="text-xl font-bold font-sans text-zinc-800">Google</span>
            <span className="text-xl font-bold font-serif text-zinc-800">Notion</span>
            <span className="text-xl font-bold font-mono text-zinc-800">Linear</span>
            <span className="text-xl font-bold font-sans italic text-zinc-800">Framer</span>
            <span className="text-xl font-bold font-sans tracking-tight text-zinc-800">▲ Vercel</span>
            <span className="text-xl font-bold font-sans text-zinc-800">stripe</span>
            <span className="text-xl font-bold font-sans text-zinc-800">Dropbox</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-[#F9F9FB]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-zinc-200/50 text-zinc-600 text-[11px] font-bold tracking-wider uppercase mb-4">
              Everything You Need
            </div>
            <h2 className="text-4xl font-extrabold text-zinc-900 sm:text-5xl tracking-tight">
              Powerful Features. Simple Experience.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-5 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <Link2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Links</h3>
              <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
                Bookmark URLs and organize your important links.
              </p>
              <div className="text-sm font-semibold text-zinc-900 flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-5 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">PDFs</h3>
              <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
                Upload, store and share PDF documents securely.
              </p>
              <div className="text-sm font-semibold text-zinc-900 flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-5 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <ImageIcon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Images</h3>
              <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
                Upload your images and create beautiful galleries.
              </p>
              <div className="text-sm font-semibold text-zinc-900 flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-5 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <File className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Documents</h3>
              <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
                Store and share Word, Excel, PPT and other documents.
              </p>
              <div className="text-sm font-semibold text-zinc-900 flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-5 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <Share2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Smart Share Links</h3>
              <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
                Create smart links and share selected content only.
              </p>
              <div className="text-sm font-semibold text-zinc-900 flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-5 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <User className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Public Profiles</h3>
              <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
                Build your professional profile and showcase your work.
              </p>
              <div className="text-sm font-semibold text-zinc-900 flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            {/* Feature 7 */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-5 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Analytics</h3>
              <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
                Track views, clicks and content performance in real-time.
              </p>
              <div className="text-sm font-semibold text-zinc-900 flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            {/* Feature 8 */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-5 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Privacy Controls</h3>
              <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
                Granular control over who can see your content.
              </p>
              <div className="text-sm font-semibold text-zinc-900 flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics & Product Showcase */}
      <section id="product" className="py-12 pb-24 bg-[#F9F9FB]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Dashboard Showcase */}
            <div className="bg-white rounded-[24px] p-8 border border-zinc-200/60 shadow-sm">
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Dashboard Overview</h3>
              <p className="text-sm text-zinc-500 mb-8">Track everything in one place.</p>
              
              <div className="flex gap-4">
                <div className="bg-[#F9F9FB] rounded-xl p-4 flex-1 border border-zinc-100">
                  <p className="text-[10px] text-zinc-500 font-medium mb-1">Total Views</p>
                  <p className="text-2xl font-bold text-zinc-900 mb-4">24.8K</p>
                  {/* Mock Chart Line */}
                  <svg className="w-full h-8" viewBox="0 0 100 30" fill="none" stroke="#10b981" strokeWidth="2"><path d="M0 25 Q10 20 20 25 T40 15 T60 20 T80 5 T100 10" /></svg>
                </div>
                <div className="bg-[#F9F9FB] rounded-xl p-4 flex-1 border border-zinc-100">
                  <p className="text-[10px] text-zinc-500 font-medium mb-1">Link Clicks</p>
                  <p className="text-2xl font-bold text-zinc-900 mb-4">7.6K</p>
                  {/* Mock Chart Line */}
                  <svg className="w-full h-8" viewBox="0 0 100 30" fill="none" stroke="#10b981" strokeWidth="2"><path d="M0 20 Q15 15 25 25 T50 10 T75 20 T100 5" /></svg>
                </div>
              </div>
            </div>

            {/* Profile Showcase */}
            <div className="bg-white rounded-[24px] p-8 border border-zinc-200/60 shadow-sm flex flex-col items-center text-center">
              <div className="w-full text-left">
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Beautiful Public Profiles</h3>
                <p className="text-sm text-zinc-500 mb-8">Create a professional identity.</p>
              </div>
              
              <div className="bg-[#F9F9FB] w-full rounded-2xl border border-zinc-100 p-6 flex flex-col items-center shadow-inner">
                <div className="h-16 w-16 rounded-full bg-zinc-200 mb-3 overflow-hidden border border-zinc-200">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <h4 className="font-extrabold text-base text-zinc-900">Alex Rivers</h4>
                <p className="text-[11px] text-zinc-500 mb-4">@alexrivers</p>
                <div className="flex gap-3 mb-6 text-zinc-400">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.8c0-1.2-.4-2.2-1-2.9 3-.3 6-1.5 6-6.5 0-1.4-.5-2.6-1.3-3.5.1-.3.6-1.6-.1-3.4 0 0-1-.3-3.3 1.2-.9-.3-1.9-.4-2.9-.4s-2 .1-2.9.4C5 2.5 4 2.8 4 2.8c-.7 1.8-.2 3.1-.1 3.4-.8.9-1.3 2.1-1.3 3.5 0 5 3 6.2 6 6.5-.6.6-1 1.6-1 3v3.8"></path></svg>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="21.17" y1="8" x2="12" y2="8"></line><line x1="3.95" y1="6.06" x2="8.54" y2="14"></line><line x1="10.88" y1="21.94" x2="15.46" y2="14"></line></svg>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </div>
                <div className="flex w-full gap-4 border-b border-zinc-200 pb-2 justify-between px-2">
                  <div className="text-[11px] font-bold text-zinc-900 border-b-2 border-zinc-900 pb-1 -mb-[9px]">Links</div>
                  <div className="text-[11px] font-medium text-zinc-400 pb-1">PDFs</div>
                  <div className="text-[11px] font-medium text-zinc-400 pb-1">Images</div>
                  <div className="text-[11px] font-medium text-zinc-400 pb-1">Docs</div>
                </div>
                <div className="w-full mt-4 bg-white rounded-xl p-3 flex items-center gap-3 border border-zinc-200 shadow-sm">
                  <div className="h-10 w-10 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                    <Link2 className="h-4 w-4 text-zinc-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[12px] font-bold text-zinc-900">Latest Case Study</div>
                    <div className="text-[10px] text-zinc-400 font-medium">2.4K views</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-300" />
                </div>
              </div>
            </div>

            {/* Analytics Showcase */}
            <div className="bg-white rounded-[24px] p-8 border border-zinc-200/60 shadow-sm">
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Advanced Analytics</h3>
              <p className="text-sm text-zinc-500 mb-8">Understand your audience.</p>
              
              <div className="bg-[#F9F9FB] rounded-xl p-6 border border-zinc-100 w-full relative shadow-inner">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-[11px] text-zinc-500 font-medium mb-1">Profile Views</p>
                    <p className="text-3xl font-extrabold text-zinc-900 tracking-tight">24.8K</p>
                  </div>
                  <div className="bg-white border border-zinc-200 shadow-sm text-zinc-600 text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer hover:bg-zinc-50 transition-colors">
                    This Month <ChevronDown className="h-3 w-3 text-zinc-400"/>
                  </div>
                </div>
                {/* Big Chart Line */}
                <div className="h-28 w-full relative mt-2">
                  {/* Axis line */}
                  <div className="absolute left-0 right-0 bottom-0 border-b border-zinc-200"></div>
                  {/* Y Axis labels */}
                  <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col justify-between text-[9px] text-zinc-400 font-medium pb-4">
                    <span>30K</span>
                    <span>20K</span>
                    <span>10K</span>
                    <span>0</span>
                  </div>
                  
                  {/* Chart lines */}
                  <div className="absolute left-8 right-0 top-0 bottom-4">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60" fill="none" preserveAspectRatio="none">
                      <path d="M0 50 Q20 40 40 45 T80 30 T120 35 T160 15 T200 20" stroke="#18181b" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                      <path d="M0 50 Q20 40 40 45 T80 30 T120 35 T160 15 T200 20 L200 60 L0 60 Z" fill="url(#gradient2)" opacity="0.1" vectorEffect="non-scaling-stroke" />
                      <defs>
                        <linearGradient id="gradient2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#18181b" />
                          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <circle cx="200" cy="20" r="4" fill="#18181b" stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    </svg>
                    {/* Tooltip */}
                    <div className="absolute top-[-8px] right-[-16px] bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                      24.8K
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white border-t border-zinc-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F9F9FB] rounded-[32px] p-12 text-center flex flex-col items-center justify-center border border-zinc-100 shadow-sm max-w-5xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20"><svg viewBox="0 0 24 24" width="120" height="120" stroke="currentColor" strokeWidth="1" fill="none"><path d="M12 2L2 22l10-4 10 4L12 2z" /></svg></div>
            <h2 className="text-4xl font-extrabold text-zinc-900 mb-4 tracking-tight relative z-10">
              Ready to share smarter?
            </h2>
            <p className="text-zinc-500 font-medium mb-10 text-lg relative z-10">
              Join thousands of creators and businesses using Aivones.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
              <Link
                href="/register"
                className="rounded-xl bg-zinc-900 px-8 py-4 text-base font-bold text-white hover:bg-zinc-800 transition-all shadow-md"
              >
                Get Started Free
              </Link>
              <p className="text-sm text-zinc-500 font-medium sm:ml-2">
                No credit card required.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
"""

with open('/Users/voise/Desktop/aivones/src/app/page.tsx', 'w') as f:
    f.write(content)
