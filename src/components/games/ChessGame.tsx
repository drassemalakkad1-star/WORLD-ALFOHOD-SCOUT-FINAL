import { useState, useEffect, useCallback, useRef } from "react";
import { Chess } from "chess.js";
import { Button } from "@/components/ui/button";
import { 
  RotateCcw, Trophy, User, Users, Cpu, 
  Maximize2, Minimize2, ChevronLeft, ShieldAlert 
} from "lucide-react";

const PIECE_ICONS: Record<string, string> = {
  'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
  'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

export function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [mode, setMode] = useState<'single' | 'multi' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state with chess instance
  const [fen, setFen] = useState(game.fen());
  const [turn, setTurn] = useState(game.turn());
  const [isGameOver, setIsGameOver] = useState(game.isGameOver());
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);

  const makeMove = useCallback((move: any) => {
    try {
      const result = game.move(move);
      if (result) {
        setFen(game.fen());
        setTurn(game.turn());
        setIsGameOver(game.isGameOver());
        setSelectedSquare(null);
        setPossibleMoves([]);
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }, [game]);

  // AI Move logic
  useEffect(() => {
    if (mode === 'single' && turn === 'b' && !isGameOver) {
      const timer = setTimeout(() => {
        const moves = game.moves();
        if (moves.length > 0) {
          const randomMove = moves[Math.floor(Math.random() * moves.length)];
          makeMove(randomMove);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [turn, mode, isGameOver, game, makeMove]);

  function onSquareClick(square: string) {
    if (isGameOver) return;

    // If a square is already selected, try to move
    if (selectedSquare) {
      const moveSuccess = makeMove({
        from: selectedSquare,
        to: square,
        promotion: 'q' // default promotion
      });

      if (!moveSuccess) {
        // If move fails, try selecting the new square if it has a piece of current turn
        const piece = game.get(square as any);
        if (piece && piece.color === turn) {
          setSelectedSquare(square);
          setPossibleMoves(game.moves({ square: square as any, verbose: true }).map(m => m.to));
        } else {
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
    } else {
      // Select piece
      const piece = game.get(square as any);
      if (piece && piece.color === turn) {
        setSelectedSquare(square);
        setPossibleMoves(game.moves({ square: square as any, verbose: true }).map(m => m.to));
      }
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  function resetGame() {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setTurn(newGame.turn());
    setIsGameOver(false);
    setSelectedSquare(null);
    setPossibleMoves([]);
  }

  const board = [];
  const rows = ['8', '7', '6', '5', '4', '3', '2', '1'];
  const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  if (!mode) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 py-12 px-4 max-w-2xl mx-auto text-center">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border-b-8 border-primary/20 w-full animate-in zoom-in duration-500">
          <div className="bg-yellow-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-14 w-14 text-yellow-500" />
          </div>
          <h2 className="text-5xl font-black text-slate-800 mb-4 tracking-tight">بطولة العمالقة</h2>
          <p className="text-slate-500 font-bold text-lg mb-10">استعد لخوض أذكى المعارك الكشفية</p>
          
          <div className="flex flex-col gap-4">
            <Button 
              onClick={() => setMode('single')}
              className="h-24 rounded-[2rem] text-2xl font-black gap-4 bg-primary shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Cpu size={36} />
              تحدي الكمبيوتر
            </Button>
            <Button 
              onClick={() => setMode('multi')}
              className="h-24 rounded-[2rem] text-2xl font-black gap-4 bg-slate-800 shadow-lg shadow-slate-800/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Users size={36} />
              تحدي صديقك
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`flex flex-col gap-6 w-full max-w-5xl mx-auto p-4 md:p-8 bg-slate-50 rounded-[3rem] transition-all ${isFullscreen ? 'h-screen max-w-none overflow-auto' : ''}`}>
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl transition-all ${turn === 'w' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-slate-100 text-slate-400 opacity-50'}`}>
            <User size={24} />
            <span className="font-black text-lg">الأبيض</span>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl transition-all ${turn === 'b' ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20 scale-105' : 'bg-slate-100 text-slate-400 opacity-50'}`}>
            {mode === 'single' ? <Cpu size={24} /> : <User size={24} />}
            <span className="font-black text-lg">{mode === 'single' ? 'الكمبيوتر' : 'الأسود'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={toggleFullscreen} className="h-14 w-14 rounded-2xl border-2">
            {isFullscreen ? <Minimize2 /> : <Maximize2 />}
          </Button>
          <Button variant="outline" onClick={resetGame} className="h-14 px-6 rounded-2xl border-2 font-black gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">
            <RotateCcw size={20} /> إعادة اللعب
          </Button>
          <Button variant="ghost" onClick={() => setMode(null)} className="font-bold">خروج</Button>
        </div>
      </div>

      {/* Board and Moves Container */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Chess Board */}
        <div className="flex-1 w-full relative">
          <div className="grid grid-cols-8 aspect-square w-full border-[16px] border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-800">
            {rows.map((rowLabel, rowIndex) => 
              cols.map((colLabel, colIndex) => {
                const square = `${colLabel}${rowLabel}`;
                const piece = game.get(square as any);
                const isDark = (rowIndex + colIndex) % 2 === 1;
                const isSelected = selectedSquare === square;
                const isPossible = possibleMoves.includes(square);
                const isCheck = game.inCheck() && piece?.type === 'k' && piece?.color === turn;
                
                return (
                  <div 
                    key={square}
                    onClick={() => onSquareClick(square)}
                    className={`
                      relative flex items-center justify-center text-5xl sm:text-7xl lg:text-8xl cursor-pointer select-none transition-all duration-150
                      ${isDark ? 'bg-[#1B6B35]' : 'bg-[#E8F5E9]'}
                      ${isSelected ? 'bg-yellow-200 shadow-inner' : ''}
                      ${isCheck ? 'bg-red-400 animate-pulse' : ''}
                      hover:brightness-105 active:scale-95
                    `}
                  >
                    {/* Possible Move Indicator */}
                    {isPossible && (
                      <div className={`absolute w-6 h-6 rounded-full ${piece ? 'ring-4 ring-red-400' : 'bg-black/10'}`} />
                    )}

                    {piece && (
                      <span className={`
                        z-10 transition-transform duration-300 pointer-events-none
                        ${piece.color === 'w' ? 'text-white drop-shadow-[0_6px_6px_rgba(0,0,0,0.4)]' : 'text-slate-900 drop-shadow-[0_2px_2px_rgba(255,255,255,0.4)]'}
                        ${isSelected ? 'scale-110 -translate-y-2' : ''}
                      `}>
                        {PIECE_ICONS[piece.color === 'w' ? piece.type.toUpperCase() : piece.type]}
                      </span>
                    )}

                    {/* Coordinates */}
                    {colIndex === 0 && <span className={`absolute left-2 top-2 text-[10px] font-black ${isDark ? 'text-white/30' : 'text-black/20'}`}>{rowLabel}</span>}
                    {rowIndex === 7 && <span className={`absolute right-2 bottom-2 text-[10px] font-black ${isDark ? 'text-white/30' : 'text-black/20'}`}>{colLabel}</span>}
                  </div>
                );
              })
            )}

            {/* Victory Overlay */}
            {isGameOver && (
              <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-8 text-center rounded-[1.5rem] animate-in fade-in duration-500">
                <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl border-b-[12px] border-yellow-400 scale-110">
                  <div className="bg-yellow-50 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Trophy className="h-16 w-16 text-yellow-500 animate-bounce" />
                  </div>
                  <h3 className="text-5xl font-black text-slate-800 mb-6">انتهت المباراة!</h3>
                  <p className="text-2xl font-bold text-primary mb-10">
                    {game.isCheckmate() 
                      ? (turn === 'w' ? 'فاز الأسود بالكش الملك!' : 'فاز الأبيض بالكش الملك!')
                      : 'انتهت المباراة بالتعادل!'
                    }
                  </p>
                  <Button onClick={resetGame} className="w-full h-20 text-2xl rounded-3xl font-black bg-primary shadow-xl shadow-primary/30">
                    جولة جديدة
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex-1">
            <h4 className="font-black text-2xl text-slate-800 mb-6 flex items-center gap-3">
              <ShieldAlert className="text-primary" />
              قوانين المعركة
            </h4>
            <div className="space-y-4 text-slate-500 font-bold leading-relaxed">
              <p className="flex gap-3">
                <span className="text-primary">•</span> لا يمكنك تحريك أي قطعة إلا في حركتها القانونية.
              </p>
              <p className="flex gap-3">
                <span className="text-primary">•</span> عند اختيار قطعة، ستظهر لك المربعات المتاحة.
              </p>
              <p className="flex gap-3">
                <span className="text-primary">•</span> إذا كان ملكك في حالة خطر (كش)، يجب حمايته فوراً.
              </p>
            </div>
          </div>

          <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-xl shadow-primary/20">
            <h5 className="font-black text-xl mb-2 italic">نصيحة الفهد:</h5>
            <p className="opacity-80 font-bold leading-relaxed">
              "في الشطرنج كما في الكشافة، التفكير في الخطوة القادمة هو سر النجاح."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
