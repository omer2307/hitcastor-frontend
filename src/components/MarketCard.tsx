import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketCardProps {
  question: string;
  songName: string;
  artist: string;
  chart: string;
  startDate: string;
  resolutionDate: string;
  yesPrice: number;
  noPrice: number;
  volume: string;
  coverImage: string;
  onClick: () => void;
}

export const MarketCard = ({
  question,
  songName,
  artist,
  chart,
  startDate,
  resolutionDate,
  yesPrice,
  noPrice,
  volume,
  coverImage,
  onClick,
}: MarketCardProps) => {
  return (
    <Card
      className="p-4 cursor-pointer transition-all hover:shadow-lg border hover:border-primary/30 bg-gradient-to-br from-card via-card to-secondary/20 overflow-hidden group"
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <img
              src={coverImage}
              alt={`${songName} cover`}
              className="w-16 h-16 rounded-lg object-cover shadow-md group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-medium text-sm leading-tight line-clamp-2">
              {question}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground truncate">{songName}</span>
              <span>•</span>
              <span className="truncate">{artist}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {chart}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-accent/5 border-accent/20 hover:bg-accent/10 hover:border-accent/40"
            onClick={onClick}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Yes {yesPrice}¢
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-destructive/5 border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40"
            onClick={onClick}
          >
            <TrendingDown className="h-3 w-3 mr-1" />
            No {noPrice}¢
          </Button>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Vol: {volume}</span>
          <span>Closes {resolutionDate}</span>
        </div>
      </div>
    </Card>
  );
};
