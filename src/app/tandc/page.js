'use client';

import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';

// === UI Helper: Navbar Component ===
const Navbar = () => (
    <header className="absolute top-0 left-0 right-0 z-20">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <HeartPulse className="text-violet-400" size={28} />
                <span className="text-xl font-bold text-white">VitalConnect</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-gray-300">
                <a href="#" className="hover:text-white transition-colors">Home</a>
                <a href="#" className="hover:text-white transition-colors">Info</a>
                <a href="#" className="hover:text-white transition-colors">Medstores Nearby</a>
            </div>
            <button className="bg-white hover:bg-gray-200 text-black font-semibold px-4 py-2 rounded-lg transition-colors">
                Check Availability
            </button>
        </nav>
    </header>
);

export default function TermsAndConditionsPage() {
    return (
        <div className="min-h-screen bg-[#111111] text-gray-100 font-sans">
            <div className="absolute inset-0 -z-0 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
            <Navbar />

            <main className="relative z-10 pt-32 pb-20 flex flex-col items-center px-4">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-4xl"
                >
                    <div className="bg-[#1C1C1C] rounded-xl border border-gray-800 p-8 sm:p-12">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl sm:text-5xl font-bold text-white">
                                Terms & Conditions
                            </h1>
                            <p className="text-gray-400 mt-3">Last Updated: September 27, 2025</p>
                        </div>

                        <div className="prose prose-invert max-w-none text-gray-300 
                                        prose-h2:text-xl prose-h2:font-semibold prose-h2:text-violet-400 prose-h2:border-b prose-h2:border-gray-700 prose-h2:pb-3 prose-h2:mt-8 prose-h2:mb-4
                                        prose-p:leading-relaxed 
                                        prose-ul:list-disc prose-ul:pl-6 prose-li:my-1">
                            
                            <h2>1. Introduction</h2>
                            <p>
                                Welcome to VitalConnect. These Terms & Conditions (&quot;Terms&quot;) govern your use of our application, website, and related services (collectively, the &quot;Services&quot;). By accessing or using the Services, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
                            </p>

                            <h2>2. Medical Disclaimer</h2>
                            <p>
                                Our Services provide information for educational purposes only and are not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on the VitalConnect platform.
                            </p>

                            <h2>3. User Responsibilities</h2>
                            <p>
                                You are responsible for your use of the Services and for any content you provide, including compliance with applicable laws, rules, and regulations. You agree to use the Services responsibly and not to misuse them. Misuse includes, but is not limited to:
                            </p>
                            <ul>
                                <li>Uploading unlawful, misleading, or malicious content.</li>
                                <li>Interfering with or disrupting the integrity or performance of the Services.</li>
                                <li>Attempting to gain unauthorized access to the Services or its related systems.</li>
                            </ul>

                            <h2>4. Data Privacy</h2>
                            <p>
                                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and share your personal information. By using our Services, you agree to the collection and use of information in accordance with our Privacy Policy.
                            </p>
                            
                            <h2>5. Intellectual Property</h2>
                            <p>
                                The Services and their original content, features, and functionality are and will remain the exclusive property of VitalConnect and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
                            </p>

                            <h2>6. Limitation of Liability</h2>
                            <p>
                                In no event shall VitalConnect, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Services.
                            </p>

                            <h2>7. Changes to Terms</h2>
                            <p>
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                            </p>

                            <h2>8. Governing Law</h2>
                            <p>
                                These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms will be brought exclusively in the federal or state courts located in Sonipat, Haryana.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}