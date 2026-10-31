import { create } from "zustand";

interface EvAnalyticsStore {
    selectedRegions: string[];
    setRegions: (regions: string[]) => void;
    toggleRegion: (region: string) => void;

    selectedPowertrains: string[];
    setPowertrains: (powertrains: string[]) => void;
    togglePowertrain: (powertrain: string) => void;

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

function toggleInList(list: string[], value: string) {
    if (!list.includes(value)) return [...list, value]
    return list.length > 1 ? list.filter((item) => item !== value) : list
}

export const useEvAnalyticsStore = create<EvAnalyticsStore>()((set) => ({ 
    selectedRegions: initialState.selectedRegions,
    setRegions: (regions) => set({ selectedRegions: regions}),
    toggleRegion: (region) => set((state) => ({ selectedRegions: toggleInList(state.selectedRegions, region) })),
    selectedPowertrains: initialState.selectedPowertrains,
    setPowertrains: (powertrains) => set({ selectedPowertrains: powertrains}),
    togglePowertrain: (powertrain) => set((state) => ({ selectedPowertrains: [...toggleInList(state.selectedPowertrains, powertrain)].sort() })),
    selectedMode: initialState.selectedMode,
    setMode: (mode) => set({ selectedMode: mode }),
    yearRange: initialState.yearRange,
    //si llega al revés (2023, 2015) lo guarda ordenado
    setYearRange: ([a, b]) => set({ yearRange: [Math.min(a, b), Math.max(a, b)] }),
    resetFilters: () => set(initialState),
 }))
