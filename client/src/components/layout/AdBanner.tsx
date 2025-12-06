import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Ad } from "@shared/schema";

interface AdBannerProps {
  className?: string;
  format?: "square" | "horizontal" | "vertical" | "auto";
  label?: string;
  location?: "sidebar" | "header" | "footer";
}

export default function AdBanner({ className, format = "auto", label = "Sponsored", location }: AdBannerProps) {
  const { data: ads = [] } = useQuery<Ad[]>({
    queryKey: ['/api/ads/active'],
  });

  // Filter ads by location if specified, otherwise use all active ads
  const relevantAds = location 
    ? ads.filter(ad => ad.location === location)
    : ads;

  // Select a random ad if there are any
  const ad = relevantAds.length > 0 
    ? relevantAds[Math.floor(Math.random() * relevantAds.length)] 
    : null;
    
  // Only log if there's an issue (no ads found when location is specified)
  if (location && relevantAds.length === 0) {
    console.warn(`AdBanner[${location}]: No ads found for this location`);
  }

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|mov)$/i) || url.includes('/video/upload/');
  };

  if (ad) {
    return (
      <a 
        href={ad.linkUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className={cn(
          "block relative overflow-hidden rounded-lg group cursor-pointer transition-all hover:shadow-xl",
          format === "square" && "aspect-square w-full",
          format === "horizontal" && "h-28 w-full",
          format === "vertical" && "w-full h-[600px]",
          format === "auto" && "w-full h-64",
          className
        )}
      >
        {isVideo(ad.imageUrl) ? (
          <video
            src={ad.imageUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img 
            src={ad.imageUrl} 
            alt={ad.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              console.error(`AdBanner: Failed to load image ${ad.imageUrl}`);
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('bg-red-100');
              const span = document.createElement('span');
              span.innerText = `Image failed: ${ad.title}`;
              span.className = 'text-red-500 p-4 text-sm';
              e.currentTarget.parentElement?.appendChild(span);
            }}
          />
        )}
        <div className="absolute top-2 right-2 bg-white/90 text-slate-700 text-[9px] px-2 py-1 rounded font-bold uppercase tracking-wider backdrop-blur-sm z-10 shadow-sm">
          {label}
        </div>
        
        {/* Refined Text Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-5 pt-16 flex flex-col justify-end">
          <h3 className="text-white font-bold text-lg md:text-xl leading-tight drop-shadow-lg line-clamp-2 group-hover:text-primary transition-colors">
            {ad.title}
          </h3>
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </a>
    );
  }

  return (
    <div className={cn(
      "bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-200 rounded-lg overflow-hidden flex flex-col items-center justify-center relative group hover:border-slate-300 transition-all",
      format === "square" && "aspect-square w-full",
      format === "horizontal" && "h-28 w-full",
      format === "vertical" && "w-full h-[600px]",
      format === "auto" && "w-full h-64",
      className
    )}>
      <div className="text-center p-4 z-10">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <div className="bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-slate-700 text-sm font-bold">Ad Space Available</p>
            <p className="text-slate-500 text-xs mt-1">Advertise with us</p>
        </div>
      </div>
    </div>
  );
}
