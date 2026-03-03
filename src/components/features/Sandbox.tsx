import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Component, Layout, Type } from 'lucide-react';
import { Button } from '../ui/Button';

interface SandboxProps {
  onBack: () => void;
}

export const Sandbox: React.FC<SandboxProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'ui' | 'features' | 'typography'>('ui');

  return (
    <div className="min-h-screen bg-stone-50 p-4 sm:p-8 font-sans text-stone-900">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-3 bg-white rounded-full shadow-sm border border-stone-100 text-stone-400 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Component Sandbox</h1>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Isolated Testing Environment</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <Button 
            variant={activeTab === 'ui' ? 'primary' : 'secondary'} 
            onClick={() => setActiveTab('ui')}
          >
            <Component size={14} className="mr-2" /> UI Elements
          </Button>
          <Button 
            variant={activeTab === 'features' ? 'primary' : 'secondary'} 
            onClick={() => setActiveTab('features')}
          >
            <Layout size={14} className="mr-2" /> Features
          </Button>
          <Button 
            variant={activeTab === 'typography' ? 'primary' : 'secondary'} 
            onClick={() => setActiveTab('typography')}
          >
            <Type size={14} className="mr-2" /> Typography
          </Button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-stone-200/50 border border-stone-100 min-h-[500px]">
          {activeTab === 'ui' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <section>
                <h2 className="text-sm font-black text-stone-400 uppercase tracking-widest mb-6 border-b border-stone-100 pb-2">Buttons</h2>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
                <div className="flex flex-wrap gap-4 items-center mt-4">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </section>
              
              <section>
                <h2 className="text-sm font-black text-stone-400 uppercase tracking-widest mb-6 border-b border-stone-100 pb-2">Cards (Coming Soon)</h2>
                <div className="p-8 border-2 border-dashed border-stone-200 rounded-3xl text-center text-stone-400 font-bold text-sm uppercase tracking-widest">
                  New UI components will appear here
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'features' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="p-8 border-2 border-dashed border-stone-200 rounded-3xl text-center text-stone-400 font-bold text-sm uppercase tracking-widest">
                Complex feature components can be tested here in isolation
              </div>
            </motion.div>
          )}

          {activeTab === 'typography' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter mb-2">Heading 1</h1>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">text-4xl sm:text-6xl font-black uppercase tracking-tighter</p>
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Heading 2</h2>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">text-3xl font-black uppercase tracking-tighter</p>
              </div>
              <div>
                <p className="text-base text-stone-600 leading-relaxed max-w-2xl mb-2">
                  Body text. This is an example of how standard paragraph text looks. It should be highly readable, with a comfortable line height and a slightly muted color to reduce eye strain compared to pure black.
                </p>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">text-base text-stone-600 leading-relaxed</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
