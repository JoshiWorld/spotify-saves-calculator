export type SonglinkResponse = {
  entityUniqueId: string;
  userCountry: string;
  pageUrl: string;
  entitiesByUniqueId: Record<string, Entity>;
  linksByPlatform: LinksByPlatform;
};

export type Entity = {
  id: string;
  type: string;
  title: string;
  artistName: string;
  thumbnailUrl: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
  apiProvider: string;
  platforms: string[];
};

export type LinksByPlatform = {
  amazonMusic?: PlatformLink;
  amazonStore?: PlatformLink;
  audiomack?: PlatformLink;
  anghami?: PlatformLink;
  deezer?: PlatformLink;
  appleMusic?: PlatformLink;
  itunes?: PlatformLink;
  pandora?: PlatformLink;
  soundcloud?: PlatformLink;
  tidal?: PlatformLink;
  youtube?: PlatformLink;
  youtubeMusic?: PlatformLink;
  spotify?: PlatformLink;
};

export type PlatformLink = {
  country: string;
  url: string;
  entityUniqueId: string;
  nativeAppUriMobile?: string;
  nativeAppUriDesktop?: string;
};
