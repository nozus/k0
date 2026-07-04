/**
 * Default avatar — a minimal user silhouette placeholder.
 * Used when a user has no profile picture set.
 */
export const EMPTY_AVATAR = './empty.jpg';

/**
 * Rating categories — predefined set of things people can rate.
 */
export const CATEGORIES = [
  { id: 'all',      label: 'all.' },
  { id: 'food',     label: 'food.' },
  { id: 'movies',   label: 'movies.' },
  { id: 'music',    label: 'music.' },
  { id: 'games',    label: 'games.' },
  { id: 'places',   label: 'places.' },
  { id: 'people',   label: 'people.' },
  { id: 'apps',     label: 'apps.' },
  { id: 'ideas',    label: 'ideas.' },
  { id: 'books',    label: 'books.' },
  { id: 'tech',     label: 'tech.' },
  { id: 'fashion',  label: 'fashion.' },
  { id: 'art',      label: 'art.' },
  { id: 'sports',   label: 'sports.' },
  { id: 'science',  label: 'science.' },
  { id: 'politics', label: 'politics.' },
  { id: 'history',  label: 'history.' },
  { id: 'memes',    label: 'memes.' },
  { id: 'software', label: 'software.' },
  { id: 'other',    label: 'other.' },
];

/**
 * Category colors — deterministic gradient seeds for item placeholders.
 * HSL hue values for each category.
 */
export const CATEGORY_HUES = {
  food:     25,
  movies:   270,
  music:    340,
  games:    150,
  places:   200,
  people:   35,
  apps:     210,
  ideas:    55,
  books:    120,
  tech:     190,
  fashion:  310,
  art:      280,
  sports:   15,
  science:  170,
  politics: 220,
  history:  45,
  memes:    60,
  software: 230,
  other:    0,
};
