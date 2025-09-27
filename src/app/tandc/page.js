'use client';



export default function TermsAndConditionsPage() {
    return (
        <div className="bg-[#0D0D0D] mt-16 text-white min-h-screen flex flex-col">
            
            <main className="min-h-screen bg-[#0D0D0D] text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center font-sans flex-grow">
                <div className="w-full max-w-4xl">
                    <div className="bg-[#1A1A1A] rounded-2xl border border-gray-800 shadow-lg shadow-purple-500/10 p-8 sm:p-12">
                        <div className="text-center mb-10">
                            <h1 className="text-4xl sm:text-5xl font-bold text-white">
                                User Terms & Conditions Agreement
                            </h1>
                            <p className="text-gray-400 mt-3">Last Updated: September 27, 2025</p>
                        </div>

                        <div className="prose prose-invert max-w-none text-gray-300">
                            <h2>Introduction</h2>
                            <p>
                                Welcome to VitalConnect. These Terms & Conditions (&quot;Terms&quot;) govern your use of our application, website, and related services (collectively, the &quot;Services&quot;). By accessing or using the Services, you agree to these Terms. If you do not agree, please do not use our Services.
                            </p>

                            <h2>1. Medical Disclaimer</h2>
                            <p>
                                We are not a medical provider. The information provided in this app is for educational and informational purposes only. The Services should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before starting, stopping, or changing any medication.
                            </p>

                            <h2>2. Eligibility</h2>
                            <p>
                                You must be at least 18 years old (or have parental/guardian consent) to use our Services. By using the Services, you confirm that you meet these requirements.
                            </p>

                            <h2>3. User Responsibilities</h2>
                            <p>
                                You agree to use the Services lawfully and responsibly. You will not misuse the Services, including:
                            </p>
                            <ul>
                                <li>Uploading false or misleading information</li>
                                <li>Violating any applicable laws or regulations</li>
                                <li>Attempting to disrupt or hack the Services</li>
                            </ul>

                            <h2>4. Data & Privacy</h2>
                            <p>
                                We may collect and use your data in accordance with our Privacy Policy. You are responsible for keeping your account information safe.
                            </p>

                            <h2>5. No Guarantee of Accuracy</h2>
                            <p>
                                While we strive to provide accurate and up-to-date medicine information, we do not guarantee the completeness, reliability, or accuracy of any content. Use of the information is at your own risk.
                            </p>

                            <h2>6. Limitation of Liability</h2>
                            <p>
                                To the fullest extent permitted by law, we are not responsible for any harm, injury, or loss resulting from the use of our Services. You agree that we are not liable for any medical decisions you make based on our content.
                            </p>
                            
                            <h2>7. Intellectual Property</h2>
                            <p>
                                All content, design, and features of the Services are owned by Medi-Verify or our licensors. You may not copy, distribute, or modify our content without permission.
                            </p>

                            <h2>8. Changes to Terms</h2>
                            <p>
                                We may update these Terms from time to time. Continued use of the Services after changes means you accept the updated Terms.
                            </p>

                            <h2>9. Governing Law</h2>
                            <p>
                                These Terms are governed by the laws of India. Any disputes will be handled in the courts of Sonipat, Haryana.
                            </p>

                            
                        </div>
                    </div>
                </div>
            </main>
            
            <style jsx global>{`
                .prose-invert h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-top: 2em;
                    margin-bottom: 1em;
                    border-bottom: 1px solid #374151;
                    padding-bottom: 0.5em;
                }
                .prose-invert p, .prose-invert li {
                    line-height: 1.75;
                }
                .prose-invert ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                }
            `}</style>
        </div>
    );
}