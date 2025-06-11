import React from 'react';
import { HeartPulse } from 'lucide-react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800">
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <HeartPulse className="h-7 w-7 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">
                Análise de Burnout
              </span>
            </div>
            {/* Futuramente, aqui pode entrar um menu de usuário */}
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>
      <footer className="text-center py-4 text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} - Cuidando da sua saúde mental.</p>
      </footer>
    </div>
  );
}
