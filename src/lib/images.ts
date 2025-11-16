// Cover image mapping for different artists/songs
export const getCoverImage = (artist: string, title: string): string => {
  const artistLower = artist.toLowerCase();
  const titleLower = title.toLowerCase();
  
  // Map specific songs to their original mock images - each artist gets a unique image
  if (artistLower.includes('taylor swift')) {
    if (titleLower.includes('anti-hero')) return "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop";
    if (titleLower.includes('cruel summer')) return "https://images.unsplash.com/photo-1445985543470-41fba5c3144a?w=400&h=400&fit=crop";
  }
  if (artistLower.includes('harry styles')) return "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop";
  if (artistLower.includes('miley cyrus')) return "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400&h=400&fit=crop";
  if (artistLower.includes('sam smith')) return "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop";
  if (artistLower.includes('sza')) return "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop";
  if (artistLower.includes('rema')) return "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop";
  if (artistLower.includes('metro boomin')) return "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop";
  if (artistLower.includes('raye')) return "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop";
  if (artistLower.includes('weeknd')) return "https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=400&h=400&fit=crop";
  if (artistLower.includes('pinkpantheress')) return "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=400&h=400&fit=crop";
  if (artistLower.includes('drake')) return "https://images.unsplash.com/photo-1483412468200-72182dbbc544?w=400&h=400&fit=crop";
  if (artistLower.includes('david kushner')) return "https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=400&fit=crop";
  if (artistLower.includes('doja cat')) return "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=400&fit=crop";
  if (artistLower.includes('olivia rodrigo')) return "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=400&h=400&fit=crop";
  if (artistLower.includes('tate mcrae')) return "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop";
  
  // Fallback to music-themed images
  return "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop";
};