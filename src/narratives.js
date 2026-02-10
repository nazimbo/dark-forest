import { translations } from './i18n/translations';

export const getNarratives = (lang) => translations[lang]?.narratives ?? translations.en.narratives;
