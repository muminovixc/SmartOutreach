import { Star, Phone } from "lucide-react";

export default function LeadDetails({ rating, phone }) {
  return (
    <div className="flex items-center justify-between mb-4">
      {rating > 0 && (
        <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
          <Star size={10} className="text-yellow-500 fill-yellow-500" />
          <span className="text-[10px] font-bold text-white">{rating}</span>
        </div>
      )}
      {phone && phone !== "No phone" && (
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800/30 text-zinc-400 rounded-lg text-[10px] font-bold uppercase tracking-widest">
          <Phone size={12} /> {phone}
        </div>
      )}
    </div>
  );
}