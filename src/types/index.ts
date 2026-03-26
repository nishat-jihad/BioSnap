export interface LinkItem {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  color: string;
  pinned: boolean;
  playlistId?: string;
}

export interface Playlist {
  id: string;
  name: string;
}

export interface UserProfile {
  fullName: string;
  username: string;
  email: string;
  links: LinkItem[];
  playlists: Playlist[];
}
