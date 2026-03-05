"use client";
import React from 'react';
import Link from 'next/link';
import { Zap, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#020408] text-zinc-400 font-sans py-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Link href="/dashboard" className="flex items-center gap-2 mb-12 group w-fit">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#00F5D4]/10 p-3 rounded-xl">
            <ShieldCheck className="text-[#00F5D4]" size={32} />
          </div>
          <h1 className="font-['Syne'] text-4xl font-extrabold text-white uppercase italic">
            Privacy <br /> Policy
          </h1>
        </div>

        <p className="mb-12 text-zinc-500 text-sm italic">Last Updated: March 2024</p>

        {/* Content Section */}
        <div className="space-y-10">
          <section>
            <h2 className="text-white font-bold uppercase tracking-widest mb-4">1. Introduction</h2>
            <p className="leading-relaxed">
              SmartReach AI ("we," "our," or "us") operates the SmartReach AI platform. We are committed to protecting your personal data and your privacy. This Privacy Policy explains how we collect, use, and safeguard information when you use our Google-integrated services.
            </p>
          </section>

          <section className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl">
            <h2 className="text-[#00F5D4] font-bold uppercase tracking-widest mb-4">2. Google User Data</h2>
            <p className="leading-relaxed mb-4">
              Our application uses Google OAuth2 to provide email sending capabilities. Specifically, we request the 
              <code className="text-zinc-200 bg-zinc-800 px-2 py-1 rounded mx-1">https://www.googleapis.com/auth/gmail.send</code> scope.
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>What we collect:</strong> We store your Google email address and OAuth tokens (access and refresh tokens).</li>
              <li><strong>How we use it:</strong> We use these tokens solely to send emails that you explicitly compose and trigger within our dashboard.</li>
              <li><strong>Storage:</strong> Tokens are encrypted and stored securely in our database.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase tracking-widest mb-4">3. Data Sharing and Disclosure</h2>
            <p className="leading-relaxed">
              We do not share your Google user data with third-party tool providers, ad networks, or data brokers. Your Gmail data is not used for serving advertisements or for any purpose other than providing the core functionality of SmartReach AI.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase tracking-widest mb-4">4. Compliance with Google Policies</h2>
            <p className="leading-relaxed">
              SmartReach AI's use and transfer to any other app of information received from Google APIs will adhere to 
              <a href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes" className="text-[#00F5D4] underline ml-1">
                Google API Services User Data Policy
              </a>, including the Limited Use requirements.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase tracking-widest mb-4">5. Data Retention</h2>
            <p className="leading-relaxed">
              We retain your Google OAuth tokens as long as your account is active. You can revoke our access at any time through your Google Account Security settings or by deleting your account within our app, which will immediately purge all your stored tokens.
            </p>
          </section>

          <section className="border-t border-zinc-900 pt-10">
            <h2 className="text-white font-bold uppercase tracking-widest mb-4">6. Contact Us</h2>
            <p className="leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at: <br />
              <span className="text-white font-bold">support@smartreach.ai</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}