/**
 * Default avatar — a minimal user silhouette placeholder.
 * Used when a user has no profile picture set.
 */
export const EMPTY_AVATAR = './empty.jpg';

/**
 * Rating categories — predefined set of things people can rate.
 */
export const CATEGORIES = [
  { id: 'all',    label: 'all.' },
  { id: 'food',   label: 'food.' },
  { id: 'movies', label: 'movies.' },
  { id: 'music',  label: 'music.' },
  { id: 'games',  label: 'games.' },
  { id: 'places', label: 'places.' },
  { id: 'people', label: 'people.' },
  { id: 'apps',   label: 'apps.' },
  { id: 'ideas',  label: 'ideas.' },
  { id: 'other',  label: 'other.' },
];

/**
 * Category colors — deterministic gradient seeds for item placeholders.
 * HSL hue values for each category.
 */
export const CATEGORY_HUES = {
  food:   25,
  movies: 270,
  music:  340,
  games:  150,
  places: 200,
  people: 35,
  apps:   210,
  ideas:  55,
  other:  0,
};
