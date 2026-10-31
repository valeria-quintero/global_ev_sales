import { create } from "zustand";

interface EvAnalyticsStore {
    selectedRegions: string[];
    setRegions: (regions: string[]) => void;

    selectedPowertrains: string[];
    setPowertrains: (powertrains: string[]) => void;

    selectedMode: string;
    setMode: (mode: string) => void;

    yearRange: [number, number];
    setYearRange: (yr: [number, number]) => void;

    resetFilters: () => void;
}

const initialState = {
    selectedRegions: ['China', 'USA', 'Europe'],
    selectedPowertrains: ['BEV', 'PHEV'],
    selectedMode: 'Cars',
    yearRange: [2010, 2023] as [number, number],
};


export const useEvAnalyticsStore = create<EvAnalyticsStore>()((set) => ({ 
    selectedRegions: initialState.selectedRegions,
    setRegions: (regions) => set({ selectedRegions: regions}),
    selectedPowertrains: initialState.selectedPowertrains,
    setPowertrains: (powertrains) => set({ selectedPowertrains: powertrains}),
    selectedMode: initialState.selectedMode,
    setMode: (mode) => set({ selectedMode: mode }),
    yearRange: initialState.yearRange,
    setYearRange: (yr) => set({ yearRange: yr}),
    resetFilters: () => set(initialState),
 }))
