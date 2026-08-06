export interface Book {
  id: string;
  title: string;
  author?: string;
  genre?: string;
  year?: number;
  format?: string;
  status?: string;
  rating?: number;
  notes?: string;
  edition?: string;
  pages?: number;
  publisher?: string;
  location?: string;
  coverUrl?: string;
  addedAt: string;
}

export interface Comic {
  id: string;
  title: string;
  editor?: string;
  genre?: string;
  year?: number;
  format?: string;
  status?: string;
  rating?: number;
  notes?: string;
  series?: string;
  issue?: number;
  publisher?: string;
  condition?: string;
  location?: string;
  coverUrl?: string;
  addedAt: string;
}

export interface VideoGame {
  id: string;
  title: string;
  studio?: string;
  genre?: string;
  year?: number;
  platform?: string;
  status?: string;
  rating?: number;
  notes?: string;
  location?: string;
  coverUrl?: string;
  addedAt: string;
}

export interface Movie {
  id: string;
  title: string;
  director?: string;
  genre?: string;
  year?: number;
  format?: string;
  status?: string;
  rating?: number;
  notes?: string;
  quality?: string;
  country?: string;
  location?: string;
  coverUrl?: string;
  addedAt: string;
}

export interface MusicAlbum {
  id: string;
  title: string;
  artist?: string;
  genre?: string;
  year?: number;
  format?: string;
  status?: string;
  rating?: number;
  notes?: string;
  label?: string;
  duration?: string;
  location?: string;
  coverUrl?: string;
  addedAt: string;
}

export type AnyItem = Book | Comic | VideoGame | Movie | MusicAlbum;

export interface CustomCollectionType {
  id: string;
  name: string;
  icon: string;
  fields: CustomField[];
}

export interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "select";
  options?: string[];
  required?: boolean;
}

export interface CustomItem {
  id: string;
  title: string;
  coverUrl?: string;
  addedAt: string;
  [key: string]: unknown;
}

export interface CollectionData {
  books: Book[];
  comics: Comic[];
  videoGames: VideoGame[];
  movies: Movie[];
  version: number;
  customTypes?: CustomCollectionType[];
  customItems?: Record<string, CustomItem[]>;
}
