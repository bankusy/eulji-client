"use client";

import { Button } from "@/components/ui/v1/Button";
import Image from "next/image";
import { motion } from "motion/react";

export default function LandingHero() {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold mb-6 border border-green-100"
                    >
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        New: AI Call Assistant
                    </motion.div>
                    
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]"
                    >
                        The OS for fast-moving <br className="hidden md:block" />
                        <span className="text-gray-400">Rest Estate Agencies.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Save time and close more deals with the only CRM layout engineered for speed. 
                        Automated leads, smart contracts, and team sync.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <div className="relative w-full sm:w-80">
                            <input 
                                type="email" 
                                placeholder="Enter your work email" 
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all shadow-sm"
                            />
                        </div>
                        <Button className="w-full sm:w-auto h-12 rounded-xl px-8 bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold text-lg shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02]">
                            Start for free
                        </Button>
                    </motion.div>
                    
                    <motion.p 
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ delay: 0.5 }}
                         className="mt-4 text-xs text-gray-400"
                    >
                        No credit card required · 14-day free trial
                    </motion.p>
                </div>

                {/* Abstract Dashboard Visual */}
                <motion.div
                    initial={{ opacity: 0, y: 40, rotateX: 10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="relative mx-auto max-w-6xl perspective-1000"
                >
                    <div className="relative rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden aspect-[16/9] group">
                        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none z-10" />
                        {/* Placeholder for Dashboard Screenshot */}
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                            <div className="text-center">
                                <span className="text-gray-300 text-sm">Dashboard Preview</span>
                                {/* In real app, put <Image> here */}
                                <div className="mt-4 grid grid-cols-3 gap-4 px-10 opacity-40 blur-[1px] group-hover:blur-0 transition-all duration-700">
                                     <div className="h-32 bg-white rounded-lg shadow-sm w-[200px]" />
                                     <div className="h-32 bg-white rounded-lg shadow-sm w-[200px]" />
                                     <div className="h-32 bg-white rounded-lg shadow-sm w-[200px]" />
                                     <div className="col-span-2 h-48 bg-white rounded-lg shadow-sm w-full" />
                                     <div className="h-48 bg-white rounded-lg shadow-sm w-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
