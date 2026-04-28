export type ListingStatus = 'Available' | 'Pending' | 'Sold';

export type Listing = {
  id: number;
  title: string;
  artist: string;
  price: number;
  status: ListingStatus;
  medium: string;
  dimensions: string;
  neighborhood: string;
  borough: string;
  distance: number;
  story: string;
  image: string;
  saved: boolean;
  accent: 'red' | 'blue' | 'yellow' | 'teal' | 'magenta' | 'green';
  size: 'standard' | 'tall' | 'wide';
};
