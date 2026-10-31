export const MODES = ['Cars', 'Buses', 'Vans', 'Trucks'] as const;
export const POWERTRAINS = ['BEV', 'PHEV', 'FCEV', 'EV'] as const;
export const CATEGORIES = ['Historical', 'Projection-APS', 'Projection-STEPS'] as const;
export const GROUP_BY = ['powertrain', 'region'] as const;

export type GroupBy = (typeof GROUP_BY)[number];

export const DEFAULT_CATEGORY = 'Historical';
export const MAX_PAGE_SIZE = 200;

//los años van de 2010 (primer dato) a 2035 (última proyección)
export const MIN_YEAR = 2010;
export const MAX_YEAR = 2035;
