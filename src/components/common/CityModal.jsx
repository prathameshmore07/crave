import React, { useState } from 'react';
import { useCityStore } from '../../store/cityStore';
import { cities } from '../../data/cities';
import { Search, X, ArrowLeft, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CityModal({ isOpen, onClose, forceSelection = false }) {
  const selectedCity = useCityStore((state) => state.selectedCity);
  const selectedLocality = useCityStore((state) => state.selectedLocality);
  const recentCities = useCityStore((state) => state.recentCities);
  const setCity = useCityStore((state) => state.setCity);

  const [step, setStep] = useState('city'); // 'city' | 'locality'
  const [tempCity, setTempCity] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // If modal is not open and a city is already selected, don't show it
  if (!isOpen && (selectedCity || !forceSelection)) return null;

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLocalities = tempCity
    ? tempCity.localities.filter((loc) =>
        loc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleCityClick = (cityId) => {
    const cityObj = cities.find((c) => c.id === cityId);
    if (cityObj) {
      setTempCity(cityObj);
      setStep('locality');
      setSearchQuery(""); // Reset search for locality
    }
  };

  const handleLocalityClick = (localityName) => {
    if (tempCity) {
      setCity(tempCity.id, localityName);
      setStep('city');
      setTempCity(null);
      setSearchQuery("");
      onClose();
    }
  };

  const handleBack = () => {
    setStep('city');
    setTempCity(null);
    setSearchQuery("");
  };

  const handleModalClose = () => {
    if (!forceSelection) {
      setStep('city');
      setTempCity(null);
      setSearchQuery("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={handleModalClose} />

      {/* Centered card on desktop, full-screen on mobile */}
      <div 
        className="relative bg-[--card-bg] w-full md:max-w-[540px] h-full md:h-auto md:max-h-[85vh] md:rounded-[20px] rounded-none border border-[--border] flex flex-col overflow-hidden shadow-modal select-none z-10"
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-[--border] flex justify-between items-center bg-black/[0.01] dark:bg-white/[0.01]">
          <div className="flex items-center gap-3">
            {step === 'locality' && (
              <button 
                onClick={handleBack}
                className="p-1.5 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-[--text-secondary] transition-all hover:text-[--brand] focus:outline-none"
                aria-label="Back to cities"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className="text-[19px] md:text-[21px] font-semibold text-[--text-primary] tracking-tight flex items-center gap-2">
              <MapPin size={20} className="text-[--brand] shrink-0" />
              {step === 'city' ? "Select your city" : `Select locality in ${tempCity?.name}`}
            </h2>
          </div>
          
          {/* Close button - only visible if city is already selected and not forced */}
          {!forceSelection && selectedCity && (
            <button 
              onClick={handleModalClose}
              className="p-2 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-[--text-secondary] transition-all focus:outline-none"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={step === 'city' ? "Search for your city..." : "Search area / locality..."}
              className="w-full h-11 pl-10 pr-4 text-[14px] text-[--text-primary] bg-black/[0.02] dark:bg-white/[0.01] border border-[#E0E0E0] dark:border-[--border] rounded-xl focus:border-[--brand] focus:ring-1 focus:ring-[--brand] outline-none transition-all duration-150"
            />
            <Search size={16} className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[--text-muted]" />
          </div>

          <AnimatePresence mode="wait">
            {step === 'city' ? (
              <motion.div
                key="city-step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Recent Cities */}
                {recentCities.length > 0 && searchQuery === "" && (
                  <div className="space-y-2.5">
                    <h3 className="text-[11px] font-semibold tracking-wider text-[--text-muted] uppercase">
                      Recent cities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recentCities.map((cityId) => {
                        const cityObj = cities.find((c) => c.id === cityId);
                        if (!cityObj) return null;
                        return (
                          <button
                            key={`recent-${cityId}`}
                            type="button"
                            onClick={() => handleCityClick(cityId)}
                            className="px-4 py-2 text-[13px] font-medium text-[--text-primary] bg-black/[0.02] dark:bg-white/[0.02] border border-[--border] rounded-full hover:border-[--brand] hover:text-[--brand] hover:bg-[#FFF5F5] dark:hover:bg-[#2A1C1C] transition-colors focus:outline-none"
                          >
                            {cityObj.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cities Grid */}
                <div className="space-y-3">
                  <h3 className="text-[11px] font-semibold tracking-wider text-[--text-muted] uppercase">
                    All Cities
                  </h3>
                  {filteredCities.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {filteredCities.map((city) => {
                        const isSelected = selectedCity === city.id;
                        
                        return (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => handleCityClick(city.id)}
                            className={`w-full h-12 border rounded-xl text-[14px] font-medium flex items-center justify-center text-center px-3 select-none focus:outline-none transition-all duration-150 ${
                              isSelected 
                                ? 'border-[--brand] text-[--brand] bg-[#FFF5F5] dark:bg-[#2A1C1C] font-semibold' 
                                : 'border-[#EBEBEB] dark:border-[--border] text-[--text-primary] hover:border-[--brand] hover:bg-[#FFF5F5] dark:hover:bg-[#2A1C1C] hover:text-[--brand]'
                            }`}
                          >
                            <span className="whitespace-nowrap">{city.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-[14px] text-[--text-secondary]">
                      No cities match your search.
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="locality-step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="space-y-3">
                  <h3 className="text-[11px] font-semibold tracking-wider text-[--text-muted] uppercase">
                    Select delivery neighborhood
                  </h3>
                  {filteredLocalities.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {filteredLocalities.map((locality) => {
                        const isSelected = selectedLocality === locality;
                        
                        return (
                          <button
                            key={locality}
                            type="button"
                            onClick={() => handleLocalityClick(locality)}
                            className={`w-full h-12 border rounded-xl text-[13.5px] font-medium flex items-center justify-center text-center px-3 select-none focus:outline-none transition-all duration-150 ${
                              isSelected 
                                ? 'border-[--brand] text-[--brand] bg-[#FFF5F5] dark:bg-[#2A1C1C] font-semibold' 
                                : 'border-[#EBEBEB] dark:border-[--border] text-[--text-primary] hover:border-[--brand] hover:bg-[#FFF5F5] dark:hover:bg-[#2A1C1C] hover:text-[--brand]'
                            }`}
                          >
                            <span className="whitespace-nowrap">{locality}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-[14px] text-[--text-secondary]">
                      No localities match your search.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
