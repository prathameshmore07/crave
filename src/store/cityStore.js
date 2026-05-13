import { create } from 'zustand';

export const useCityStore = create((set) => {
  const storedCity = localStorage.getItem('selected_city');
  const storedLocality = localStorage.getItem('selected_locality');
  const storedRecent = localStorage.getItem('recent_cities');

  return {
    selectedCity: storedCity || "", // Empty by default to trigger first-load modal
    selectedLocality: storedLocality || "",
    recentCities: storedRecent ? JSON.parse(storedRecent) : [],
    
    setCity: (city, locality = "") => {
      set((state) => {
        localStorage.setItem('selected_city', city);
        localStorage.setItem('selected_locality', locality);
        
        let recent = state.recentCities;
        if (city && !recent.includes(city)) {
          recent = [city, ...recent].slice(0, 5);
          localStorage.setItem('recent_cities', JSON.stringify(recent));
        }

        return {
          selectedCity: city,
          selectedLocality: locality,
          recentCities: recent
        };
      });
    },

    setLocality: (locality) => {
      set(() => {
        localStorage.setItem('selected_locality', locality);
        return { selectedLocality: locality };
      });
    }
  };
});
