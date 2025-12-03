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
    
  console.log(`AdBanner[${location || 'all'}]: Found ${relevantAds.length} ads`);

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
          "block relative overflow-hidden rounded-lg group cursor-pointer transition-all hover:opacity-95",
          format === "square" && "aspect-square w-full",
          format === "horizontal" && "h-32 w-full",
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
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error(`AdBanner: Failed to load image ${ad.imageUrl}`);
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('bg-red-100');
              // Add a text fallback
              const span = document.createElement('span');
              span.innerText = `Image failed: ${ad.title}`;
              span.className = 'text-red-500 p-4 text-sm';
              e.currentTarget.parentElement?.appendChild(span);
            }}
          />
        )}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm z-10">
          {label}
        </div>
        
        {/* Text Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12 flex flex-col justify-end">
          <h3 className="text-white font-bold text-xl leading-tight drop-shadow-md line-clamp-2">
            {ad.title}
          </h3>
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </a>
    );
  }

  return (
    <div className={cn(
      "bg-slate-100 border border-slate-200 rounded-lg overflow-hidden flex flex-col items-center justify-center relative group cursor-pointer hover:bg-slate-200 transition-colors",
      format === "square" && "aspect-square w-full",
      format === "horizontal" && "h-32 w-full",
      format === "vertical" && "w-full h-[600px]",
      format === "auto" && "w-full h-64",
      className
    )}>
      <div className="text-center p-4 z-10">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <div className="bg-white/50 px-4 py-2 rounded-md border border-slate-200/50 backdrop-blur-sm">
            <p className="text-slate-600 text-sm font-medium">Space Available</p>
            <p className="text-slate-400 text-xs mt-1">Contact us to advertise</p>
        </div>
      </div>
      
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
      </div>
      
      {/* Diagonal stripes */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(45deg,transparent_25%,#000_25%,#000_50%,transparent_50%,transparent_75%,#000_75%,#000_100%)] bg-[length:20px_20px]"></div>
    </div>
  );
}
