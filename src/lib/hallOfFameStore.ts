import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Nominee {
  id: string;
  nominatorId: string;
  nominatorName: string;
  nomineeName: string;
  relationship: string;
  description: string;
  image?: string;
  votes: number;
  views: number;
  status: 'pending' | 'active' | 'rejected' | 'winner';
  createdAt: string;
}

export interface Winner {
  id: string;
  nomineeId: string;
  rank: 1 | 2 | 3 | 4;
  year: number;
  familyPhoto?: string;
}

interface HallOfFameStore {
  nominees: Nominee[];
  winners: Winner[];
  userVotes: Record<string, string[]>; // userId -> nomineeIds
  
  addNominee: (nominee: Omit<Nominee, 'id' | 'votes' | 'views' | 'status' | 'createdAt'>) => void;
  updateNomineeStatus: (id: string, status: Nominee['status']) => void;
  vote: (userId: string, nomineeId: string) => { success: boolean; message: string };
  incrementView: (nomineeId: string) => void;
  setWinner: (nomineeId: string, rank: 1 | 2 | 3 | 4, year: number, familyPhoto?: string) => void;
  getNomineeById: (id: string) => Nominee | undefined;
}

export const useHallOfFameStore = create<HallOfFameStore>()(
  persist(
    (set, get) => ({
      nominees: [
        {
          id: "1",
          nominatorId: "admin",
          nominatorName: "القائد العام",
          nomineeName: "مريم حسن",
          relationship: "الأم المثالية",
          description: "رافقت ابنها من ذوي التوحد في كل خطوة كشفية، وكانت الداعم الأول له حتى حصل على وسام الصقر.",
          image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
          votes: 156,
          views: 1205,
          status: 'winner',
          createdAt: new Date().toISOString()
        },
        {
          id: "2",
          nominatorId: "admin",
          nominatorName: "القائد العام",
          nomineeName: "خالد إبراهيم",
          relationship: "الأب المثالي",
          description: "أسس مبادرة 'كشافة بلا حدود' لدعم الأطفال ذوي الإعاقة الحركية بعد نجاح تجربة ابنه في الكشافة.",
          image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
          votes: 142,
          views: 980,
          status: 'winner',
          createdAt: new Date().toISOString()
        }
      ],
      winners: [
        { id: "w1", nomineeId: "1", rank: 1, year: 2026 },
        { id: "w2", nomineeId: "2", rank: 2, year: 2026 }
      ],
      userVotes: {},

      addNominee: (data) => set((state) => ({
        nominees: [
          ...state.nominees,
          {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            votes: 0,
            views: 0,
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        ]
      })),

      updateNomineeStatus: (id, status) => set((state) => ({
        nominees: state.nominees.map(n => 
          n.id === id ? { ...n, status } : n
        )
      })),

      vote: (userId, nomineeId) => {
        const state = get();
        const votes = state.userVotes[userId] || [];
        
        if (votes.includes(nomineeId)) {
          return { success: false, message: "لقد قمت بالتصويت لهذا المرشح مسبقاً" };
        }

        set((state) => ({
          userVotes: {
            ...state.userVotes,
            [userId]: [...votes, nomineeId]
          },
          nominees: state.nominees.map(n => 
            n.id === nomineeId ? { ...n, votes: n.votes + 1 } : n
          )
        }));

        return { success: true, message: "تم تسجيل صوتك بنجاح" };
      },

      incrementView: (nomineeId) => set((state) => ({
        nominees: state.nominees.map(n => 
          n.id === nomineeId ? { ...n, views: n.views + 1 } : n
        )
      })),

      setWinner: (nomineeId, rank, year, familyPhoto) => set((state) => {
        const newWinner: Winner = {
          id: `w_${nomineeId}_${rank}`,
          nomineeId,
          rank,
          year,
          familyPhoto
        };
        
        return {
          winners: [
            ...state.winners.filter(w => w.rank !== rank),
            newWinner
          ],
          nominees: state.nominees.map(n => 
            n.id === nomineeId ? { ...n, status: 'winner' } : n
          )
        };
      }),
      
      getNomineeById: (id) => get().nominees.find(n => n.id === id),
    }),
    {
      name: 'hall-of-fame-storage',
    }
  )
);
