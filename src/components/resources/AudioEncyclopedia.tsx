import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Music, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const PLAYLIST = [
  { id: 1, title: "المنهج الكشفي - الأشبال", duration: "12:45", category: "أشبال" },
  { id: 2, title: "تقاليد الحركة الكشفية", duration: "08:20", category: "عام" },
  { id: 3, title: "حياة الخلاء والطهي الخلوي", duration: "15:10", category: "مهارات" },
  { id: 4, title: "الإسعافات الأولية للمتقدم", duration: "20:30", category: "صحة" },
  { id: 5, title: "تاريخ الكشافة العالمية", duration: "10:15", category: "ثقافة" },
];

export function AudioEncyclopedia() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(PLAYLIST[0]);
  const [progress, setProgress] = useState(30);

  return (
    <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Player Controls */}
          <div className="p-6 flex flex-col justify-center border-b md:border-b-0 md:border-l border-primary/10">
            <div className="mb-6 text-center">
              <div className="mx-auto w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 shadow-inner">
                <Music className="w-12 h-12 text-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-bold mb-1">{currentTrack.title}</h3>
              <Badge variant="outline" className="text-primary border-primary/30">
                {currentTrack.category}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>03:45</span>
                <span>{currentTrack.duration}</span>
              </div>
              <Slider 
                value={[progress]} 
                onValueChange={(v) => setProgress(v[0])} 
                max={100} 
                step={1}
                className="cursor-pointer"
              />
              
              <div className="flex items-center justify-center gap-4 py-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button 
                  size="icon" 
                  className="h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Slider defaultValue={[70]} max={100} step={1} className="w-24" />
              </div>
            </div>
          </div>

          {/* Playlist */}
          <div className="bg-muted/30">
            <div className="p-4 border-b border-primary/10 flex items-center gap-2 font-bold">
              <ListMusic className="h-5 w-5 text-primary" />
              الموسوعة الصوتية الكشفية
            </div>
            <ScrollArea className="h-[300px]">
              <div className="p-2 space-y-1">
                {PLAYLIST.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => setCurrentTrack(track)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-right ${
                      currentTrack.id === track.id 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "hover:bg-primary/5"
                    }`}
                  >
                    <div className="flex flex-col items-start text-right">
                      <span className="font-medium text-sm">{track.title}</span>
                      <span className={`text-[10px] ${currentTrack.id === track.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {track.category}
                      </span>
                    </div>
                    <span className="text-xs opacity-70">{track.duration}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
