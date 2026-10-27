/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { SignalAuthProvider } from './services/supabase';
import { NeonBackground } from './components/NeonBackground';
import { Home } from './pages/Home';
import { Wingo30s } from './pages/Wingo30s';
import { Wingo1m } from './pages/Wingo1m';
import { SignalDetail } from './pages/SignalDetail';
import { ProTraders } from './pages/ProTraders';
import { GoodPro } from './pages/GoodPro';
import { HumanBrain } from './pages/HumanBrain';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <SignalAuthProvider>
      <BrowserRouter>
        <div className="relative min-h-screen text-[#FFFFFF] font-sans antialiased selection:bg-[#00E5FF]/20 selection:text-[#00E5FF]">
          <NeonBackground />
          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/wingo/30s" element={<Wingo30s />} />
              <Route path="/wingo/1m" element={<Wingo1m />} />
              <Route path="/signal/:id" element={<SignalDetail />} />
              <Route path="/wingo/1m/signal/:id" element={<SignalDetail />} />
              <Route path="/pro" element={<ProTraders />} />
              <Route path="/good-pro" element={<GoodPro />} />
              <Route path="/ai" element={<HumanBrain />} />
              <Route path="/ai-brain" element={<HumanBrain />} />
              <Route path="/pro/30s" element={<Wingo30s />} />
              <Route path="/pro/1m" element={<Wingo1m />} />
              <Route path="/pro/30s/signal/:id" element={<SignalDetail />} />
              <Route path="/pro/1m/signal/:id" element={<SignalDetail />} />
              <Route path="/x/on/top/server" element={<Admin />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
      <Toaster position="bottom-right" richColors />
    </SignalAuthProvider>
  );
}
