import React from 'react';
import { Clock, RefreshCw, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { CommissionService } from '../../types/index.js';

interface ServiceCardsProps {
  services: CommissionService[];
  creatorName?: string;
  onSelectService: (service: CommissionService) => void;
  onRequestCommissionGeneral?: () => void;
}

export const ServiceCards: React.FC<ServiceCardsProps> = ({
  services,
  creatorName,
  onSelectService,
  onRequestCommissionGeneral,
}) => {
  return (
    <section id="services-section" className="py-20 bg-[#F4EFEA] border-t border-neutral-200/90">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 pb-5 border-b border-neutral-300/80">
          <div>
            <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono block mb-1">
              02. Structured Inquiries
            </span>
            <h2 className="font-editorial text-3xl md:text-5xl font-normal text-neutral-950">
              Commission Services & Scope
            </h2>
          </div>
          <p className="text-xs text-neutral-600 max-w-md leading-relaxed font-light">
            Direct collaboration with the artist under transparent turnaround schedules, guaranteed base rates, and dedicated consultation checkpoints.
          </p>
        </div>

        {/* Services Grid */}
        {services.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 bg-white/70 border border-neutral-200 rounded-xs">
            <p className="text-sm">No bespoke commission tiers currently published.</p>
            {onRequestCommissionGeneral && (
              <button
                onClick={onRequestCommissionGeneral}
                className="mt-3 px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-neutral-800 transition-colors"
              >
                Submit Custom Inquiry
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="bg-[#FAF9F6] border border-neutral-200/90 rounded-xs p-8 flex flex-col justify-between hover:border-neutral-400 hover:shadow-md transition-all duration-300 shadow-2xs group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-4">
                    <span>TIER 0{index + 1}</span>
                    <span className="text-emerald-800 font-medium bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-xs text-[10px]">
                      Intake Open
                    </span>
                  </div>

                  <h3 className="font-editorial text-2xl font-normal text-neutral-950 mb-3 group-hover:text-amber-900 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-xs leading-relaxed text-neutral-600 font-light mb-6">
                    {service.description}
                  </p>

                  {/* Specifications Grid */}
                  <div className="border-t border-b border-neutral-200/80 py-4 space-y-3 mb-6 text-xs text-neutral-700">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Starting Base Rate</span>
                      <span className="font-mono text-base font-semibold text-neutral-950 tabular-nums">
                        ${service.basePrice.toLocaleString()} {service.currency}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-neutral-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Estimated Turnaround</span>
                      </span>
                      <span className="font-mono font-medium text-neutral-900">
                        {service.turnaroundWeeks} Weeks
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-neutral-500">
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Review & Iteration</span>
                      </span>
                      <span className="font-mono font-medium text-neutral-900">
                        {service.revisionsIncluded} Rounds Included
                      </span>
                    </div>
                  </div>

                  {service.deliverableSummary && (
                    <div className="text-[11px] text-neutral-600 leading-normal mb-6 bg-neutral-100/80 p-3.5 rounded-xs border border-neutral-200/60">
                      <span className="font-semibold text-neutral-900 block mb-1 uppercase tracking-wider text-[10px]">
                        Included Deliverables
                      </span>
                      {service.deliverableSummary}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onSelectService(service)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-2xs cursor-pointer active:scale-[0.99]"
                >
                  <span>Commission This Scope</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Curatorial Finale CTA */}
        <div className="mt-20 pt-16 border-t border-neutral-300/80 text-center max-w-2xl mx-auto space-y-5">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-900 bg-amber-100/60 border border-amber-200 px-3 py-1 rounded-xs">
            Direct Studio Inquiry
          </span>
          <h3 className="font-editorial text-3xl md:text-4xl text-neutral-950 font-normal">
            Have a custom vision or site-specific work in mind?
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed font-light">
            Submit an unconstrained brief. We translate informal thoughts into structured specifications with transparent delivery horizons.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onRequestCommissionGeneral ? onRequestCommissionGeneral() : (services[0] && onSelectService(services[0]))}
              className="px-8 py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Commission Me</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
