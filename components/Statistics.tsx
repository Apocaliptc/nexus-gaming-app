

import React, { useState } from 'react';
import { MOCK_USER_STATS, MOCK_GLOBAL_STATS, MOCK_FRIENDS } from '../services/mockData';
import { Game, Platform } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid, Legend, ComposedChart, Line,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell
} from 'recharts';
import { Clock, Trophy, TrendingUp, Calendar, Hash, Globe, ChevronRight, X, PlayCircle, Check, Lock, Users, Hexagon, Flame, Zap, Target } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';

interface AggregatedGame {
  title: string;
  totalHours: number;
  platforms: Platform[];
  coverUrl: string;
  instances: Game[]; // Stores the individual platform entries (e.g., PS5 version, Steam version)
  lastPlayed: string;
  firstPlayed: string;
}

const PIE_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

export const Statistics: React.FC = () => {
  const [selectedAggregatedGame, setSelectedAggregatedGame] = useState<AggregatedGame | null>(null);
  const [comparisonMode, setComparisonMode] = useState<'global' | 'friends'>('global');

  // --- Comparison Data Logic ---
  const calculateFriendsStats = () => {
    const friendCount = MOCK_FRIENDS.length;
    if (friendCount === 0) return MOCK_GLOBAL_STATS;

    const avgHours = Math.round(MOCK_FRIENDS.reduce((acc, f) => acc + f.totalHours, 0) / friendCount);
    const avgAchievements = Math.round(MOCK_FRIENDS.reduce((acc, f) => acc + f.totalTrophies, 0) / friendCount);
    
    // Calculate Average Activity Trend (Weekly)
    const activityTrend = MOCK_GLOBAL_STATS.activityTrend.map(dayData => {
       const totalForDay = MOCK_FRIENDS.reduce((acc, friend) => {
         const friendDay = friend.weeklyActivity?.find(d => d.day === dayData.day);
         return acc + (friendDay ? friendDay.hours : 0);
       }, 0);
       return { day: dayData.day, hours: totalForDay / friendCount };
    });

    // Calculate Average Monthly Activity
    const monthlyActivity = MOCK_GLOBAL_STATS.monthlyActivity.map(monthData => {
       const totalForMonth = MOCK_FRIENDS.reduce((acc, friend) => {
         const friendMonth = friend.monthlyActivity?.find(m => m.month === monthData.month);
         return acc + (friendMonth ? friendMonth.hours : 0);
       }, 0);
       return { month: monthData.month, hours: totalForMonth / friendCount };
    });

    // Calculate Average Skills
    const skills = MOCK_USER_STATS.skills.map(skill => {
        const totalScore = MOCK_FRIENDS.reduce((acc, friend) => {
            const friendSkill = friend.skills?.find(s => s.subject === skill.subject);
            return acc + (friendSkill ? friendSkill.value : 0);
        }, 0);
        return { subject: skill.subject, value: totalScore / friendCount };
    });

    return {
       averageHours: avgHours,
       averageAchievements: avgAchievements,
       topGenres: MOCK_GLOBAL_STATS.topGenres, // Kept static for simplicity in this demo
       activityTrend: activityTrend,
       monthlyActivity: monthlyActivity,
       skills: skills
    };
  };

  const currentComparisonStats = comparisonMode === 'global' ? MOCK_GLOBAL_STATS : calculateFriendsStats();

  // Combine User Skills with Comparison Stats for Radar Chart
  const radarData = MOCK_USER_STATS.skills.map(userSkill => {
      const compareSkill = currentComparisonStats.skills.find(s => s.subject === userSkill.subject);
      return {
          subject: userSkill.subject,
          A: userSkill.A, // User
          B: compareSkill ? compareSkill.value : 0, // Comparison
          fullMark: 100
      };
  });

  // --- Data Aggregation Logic (Cross-Platform Merging) ---
  const aggregatedGames: AggregatedGame[] = Object.values(
    MOCK_USER_STATS.recentGames.reduce((acc, game) => {
      if (!acc[game.title]) {
        acc[game.title] = {
          title: game.title,
          totalHours: 0,
          platforms: [],
          coverUrl: game.coverUrl,
          instances: [],
          lastPlayed: game.lastPlayed,
          firstPlayed: game.firstPlayed || game.lastPlayed
        };
      }
      
      acc[game.title].totalHours += game.hoursPlayed;
      if (!acc[game.title].platforms.includes(game.platform)) {
        acc[game.title].platforms.push(game.platform);
      }
      acc[game.title].instances.push(game);
      
      // Update dates
      if (new Date(game.lastPlayed) > new Date(acc[game.title].lastPlayed)) {
        acc[game.title].lastPlayed = game.lastPlayed;
      }
      if (game.firstPlayed && new Date(game.firstPlayed) < new Date(acc[game.title].firstPlayed)) {
        acc[game.title].firstPlayed = game.firstPlayed;
      }

      return acc;
    }, {} as Record<string, AggregatedGame>)
  ).sort((a, b) => b.totalHours - a.totalHours);

  // --- Heatmap Data Generation (Mock) ---
  const generateHeatmapData = () => {
     const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
     const times = ['Morning', 'Afternoon', 'Evening', 'Night'];
     // Generate some fixed intensity for demo
     return days.map((day, dIdx) => {
         return times.map((time, tIdx) => {
             // Higher intensity on weekends (5,6) and evenings/nights (2,3)
             let intensity = 1;
             if (dIdx >= 4) intensity += 1; // Weekend bonus
             if (tIdx >= 2) intensity += 2; // Evening bonus
             // Random variance
             if (Math.random() > 0.5) intensity -= 1;
             return { day, time, intensity: Math.max(0, Math.min(4, intensity)) };
         });
     });
  };
  const heatmapData = generateHeatmapData();

  // --- Detailed Game Modal ---
  const AggregatedGameModal = ({ game, onClose }: { game: AggregatedGame, onClose: () => void }) => {
    const [activePlatformId, setActivePlatformId] = useState<string>(game.instances[0].id);
    const activeInstance = game.instances.find(i => i.id === activePlatformId) || game.instances[0];

    const formatDate = (d: string) => new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

    return (
       <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in overflow-hidden">
        <div className="bg-[#121218] w-full max-w-5xl max-h-[90vh] rounded-3xl border border-nexus-700 shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
          <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors">
            <X size={20} />
          </button>

          {/* Left: Visuals & General Stats */}
          <div className="w-full md:w-1/3 bg-[#0f0f13] relative flex flex-col border-r border-nexus-800">
             <div className="h-64 w-full relative">
               <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f13] to-transparent z-10"></div>
               <img src={game.coverUrl} className="w-full h-full object-cover opacity-80" />
             </div>
             
             <div className="p-8 -mt-20 relative z-20 flex-1 overflow-y-auto">
                <h2 className="text-3xl font-display font-bold text-white leading-tight mb-6">{game.title}</h2>
                
                <div className="space-y-6">
                   <div className="bg-nexus-900/50 p-4 rounded-xl border border-nexus-700/50">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Playtime (All Platforms)</p>
                      <p className="text-4xl font-mono text-nexus-secondary">{game.totalHours}h</p>
                   </div>
                   
                   <div className="flex flex-col gap-2">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Playing Since</p>
                      <div className="flex items-center gap-2 text-white">
                        <PlayCircle size={16} className="text-nexus-accent"/>
                        <span>{formatDate(game.firstPlayed)}</span>
                      </div>
                   </div>

                   <div className="flex flex-col gap-2">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Platforms</p>
                      <div className="flex gap-2">
                        {game.platforms.map(p => (
                          <div key={p} className="bg-nexus-800 p-2 rounded-lg border border-nexus-700" title={p}>
                            <PlatformIcon platform={p} />
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Right: Platform Specifics */}
          <div className="w-full md:w-2/3 flex flex-col bg-[#181820] overflow-hidden">
             {/* Platform Selector Tabs */}
             <div className="flex overflow-x-auto border-b border-nexus-700 bg-nexus-900/50 p-2 gap-2 flex-shrink-0">
                {game.instances.map(instance => (
                  <button 
                    key={instance.id}
                    onClick={() => setActivePlatformId(instance.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                      activePlatformId === instance.id 
                        ? 'bg-nexus-800 text-white border-nexus-accent shadow-lg shadow-nexus-accent/10' 
                        : 'bg-transparent text-gray-500 border-transparent hover:bg-nexus-800 hover:text-gray-300'
                    }`}
                  >
                    <PlatformIcon platform={instance.platform} className="w-4 h-4" />
                    <span>{instance.platform}</span>
                  </button>
                ))}
             </div>

             {/* Specific Stats for Selected Platform */}
             <div className="p-6 border-b border-nexus-700 bg-nexus-800/30 flex justify-between items-center flex-shrink-0">
                <div className="flex gap-6">
                   <div>
                     <p className="text-xs text-gray-500 uppercase tracking-wide">Time on Platform</p>
                     <p className="text-xl font-bold text-white">{activeInstance.hoursPlayed}h</p>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500 uppercase tracking-wide">Achievements</p>
                     <p className="text-xl font-bold text-yellow-500">{activeInstance.achievementCount} / {activeInstance.totalAchievements}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-xs text-gray-500">Last Session</p>
                   <p className="text-sm font-medium text-white">{formatDate(activeInstance.lastPlayed)}</p>
                </div>
             </div>

             {/* Achievement List */}
             <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-3">
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                 {activeInstance.platform} Achievements
               </h3>
               {activeInstance.achievements && activeInstance.achievements.length > 0 ? (
                 activeInstance.achievements.map(ach => (
                   <div key={ach.id} className={`flex items-start gap-4 p-3 rounded-xl border ${ach.unlockedAt ? 'bg-nexus-900/80 border-nexus-700' : 'bg-nexus-900/20 border-nexus-800/50 opacity-50'}`}>
                      <img src={ach.iconUrl} className="w-10 h-10 rounded shadow-sm" />
                      <div className="flex-1">
                         <div className="flex justify-between">
                            <h4 className={`font-bold text-sm ${ach.unlockedAt ? 'text-white' : 'text-gray-400'}`}>{ach.name}</h4>
                            {ach.unlockedAt ? <Check size={14} className="text-green-500" /> : <Lock size={14} className="text-gray-600" />}
                         </div>
                         <p className="text-xs text-gray-500 mt-1">{ach.description}</p>
                         {ach.unlockedAt && <p className="text-[10px] text-nexus-secondary mt-1">Unlocked: {formatDate(ach.unlockedAt)}</p>}
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-10 text-gray-600 italic">No achievement data synced for this platform.</div>
               )}
             </div>
          </div>
        </div>
       </div>
    );
  };

  const getComparisonLabel = () => comparisonMode === 'global' ? 'Global Avg' : 'Friends Avg';

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in text-gray-100 max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-nexus-700 pb-6">
         <div>
           <h1 className="text-4xl font-display font-bold text-white">Analytics Center</h1>
           <p className="text-gray-400 mt-2">Deep dive into your gaming habits and comparisons.</p>
         </div>
         
         <div className="mt-4 md:mt-0 bg-nexus-800 p-1 rounded-xl border border-nexus-700 flex items-center">
            <button 
              onClick={() => setComparisonMode('global')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${comparisonMode === 'global' ? 'bg-nexus-secondary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
               <Globe size={16} /> Global
            </button>
            <button 
              onClick={() => setComparisonMode('friends')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${comparisonMode === 'friends' ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
               <Users size={16} /> Friends
            </button>
         </div>
       </div>

       {/* Consistency KPIs */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-nexus-800 p-5 rounded-2xl border border-nexus-700 shadow-lg flex items-center gap-4">
             <div className="p-3 bg-orange-500/10 rounded-xl">
                <Flame className="text-orange-500" size={24} />
             </div>
             <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Current Streak</p>
                <p className="text-2xl font-bold text-white">{MOCK_USER_STATS.consistency.currentStreak} Days</p>
             </div>
          </div>
          <div className="bg-nexus-800 p-5 rounded-2xl border border-nexus-700 shadow-lg flex items-center gap-4">
             <div className="p-3 bg-red-500/10 rounded-xl">
                <Target className="text-red-500" size={24} />
             </div>
             <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Longest Streak</p>
                <p className="text-2xl font-bold text-white">{MOCK_USER_STATS.consistency.longestStreak} Days</p>
             </div>
          </div>
          <div className="bg-nexus-800 p-5 rounded-2xl border border-nexus-700 shadow-lg flex items-center gap-4">
             <div className="p-3 bg-blue-500/10 rounded-xl">
                <Zap className="text-blue-500" size={24} />
             </div>
             <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Longest Session</p>
                <p className="text-2xl font-bold text-white">{MOCK_USER_STATS.consistency.longestSession}h</p>
             </div>
          </div>
          <div className="bg-nexus-800 p-5 rounded-2xl border border-nexus-700 shadow-lg flex items-center gap-4">
             <div className="p-3 bg-green-500/10 rounded-xl">
                <Clock className="text-green-500" size={24} />
             </div>
             <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Avg Session</p>
                <p className="text-2xl font-bold text-white">{MOCK_USER_STATS.consistency.avgSessionLength}h</p>
             </div>
          </div>
       </div>

       {/* Charts Row: Platform Donut + Skill Matrix */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Platform Distribution */}
          <div className="bg-nexus-800 p-6 rounded-2xl border border-nexus-700 shadow-lg flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">Platform Dominance</h3>
              <p className="text-xs text-gray-400 mb-6">Total hours distributed by ecosystem</p>
              
              <div className="flex-1 flex flex-col items-center justify-center min-h-[250px]">
                 <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                       <Pie
                          data={MOCK_USER_STATS.platformDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                       >
                          {MOCK_USER_STATS.platformDistribution.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                          ))}
                       </Pie>
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#181820', border: '1px solid #3f3f46', borderRadius: '8px' }}
                         itemStyle={{ color: '#fff' }}
                       />
                       <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
          </div>

          {/* Gamer Skill Matrix Radar Chart */}
          <div className="lg:col-span-2 bg-nexus-800 p-6 rounded-2xl border border-nexus-700 shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-3 opacity-10">
                <Hexagon size={64} />
             </div>
             <div className="w-full mb-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Hexagon size={20} className="text-purple-400"/> Gamer Skill Matrix
                </h3>
                <p className="text-xs text-gray-400">Comparing your playstyle attributes</p>
             </div>
             
             <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                   <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#3f3f46" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="You" dataKey="A" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.4} />
                      <Radar name={getComparisonLabel()} dataKey="B" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.1} strokeDasharray="5 5"/>
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                      <Tooltip 
                         contentStyle={{ backgroundColor: '#181820', border: '1px solid #3f3f46', borderRadius: '8px' }}
                         itemStyle={{ fontSize: '12px', color: '#fff' }}
                      />
                   </RadarChart>
                </ResponsiveContainer>
             </div>
          </div>
       </div>

       {/* Activity Heatmap Section */}
       <div className="bg-nexus-800 p-6 rounded-2xl border border-nexus-700 shadow-lg">
           <div className="flex justify-between items-center mb-6">
               <div>
                  <h3 className="text-xl font-bold text-white">Activity Heatmap</h3>
                  <p className="text-xs text-gray-400">Typical gaming intensity by time of day</p>
               </div>
               <div className="flex gap-2 text-xs">
                  <div className="flex items-center gap-1"><span className="w-3 h-3 bg-nexus-900 rounded-sm"></span> Low</div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 bg-nexus-accent/40 rounded-sm"></span> Med</div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 bg-nexus-accent rounded-sm"></span> High</div>
               </div>
           </div>

           <div className="grid grid-cols-8 gap-2 overflow-x-auto">
               <div className="col-span-1 space-y-2 pt-8">
                  <div className="h-10 flex items-center text-xs font-bold text-gray-500 uppercase">Morning</div>
                  <div className="h-10 flex items-center text-xs font-bold text-gray-500 uppercase">Afternoon</div>
                  <div className="h-10 flex items-center text-xs font-bold text-gray-500 uppercase">Evening</div>
                  <div className="h-10 flex items-center text-xs font-bold text-gray-500 uppercase">Night</div>
               </div>
               {heatmapData.map((dayCol, idx) => (
                  <div key={idx} className="space-y-2">
                     <div className="text-center text-xs font-bold text-gray-400 mb-2">{dayCol[0].day}</div>
                     {dayCol.map((slot, sIdx) => (
                        <div 
                           key={sIdx}
                           className={`h-10 rounded-lg transition-all hover:scale-105 border border-white/5 ${
                               slot.intensity === 0 ? 'bg-nexus-900' :
                               slot.intensity === 1 ? 'bg-nexus-accent/20' :
                               slot.intensity === 2 ? 'bg-nexus-accent/40' :
                               slot.intensity === 3 ? 'bg-nexus-accent/70' :
                               'bg-nexus-accent shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                           }`}
                           title={`${slot.day} ${slot.time}: ${slot.intensity > 2 ? 'High' : 'Low'} Activity`}
                        ></div>
                     ))}
                  </div>
               ))}
           </div>
       </div>

       {/* Monthly Activity Bar Chart (Upgraded with Comparison) */}
       <div className="bg-nexus-800 p-6 rounded-2xl border border-nexus-700 shadow-lg">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-white">Monthly Volume Comparison</h3>
             <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}/>
          </div>
          <div className="h-60 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={MOCK_USER_STATS.monthlyActivity.map((d, i) => ({
                  month: d.month,
                  you: d.hours,
                  comparison: currentComparisonStats.monthlyActivity[i]?.hours || 0
               }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#71717a" fontSize={12} dy={10} />
                  <YAxis axisLine={false} tickLine={false} stroke="#71717a" fontSize={12} unit="h" />
                  <Tooltip 
                     cursor={{fill: '#27272a'}}
                     contentStyle={{ backgroundColor: '#181820', border: '1px solid #3f3f46', borderRadius: '8px' }}
                  />
                  <Bar dataKey="you" name="You" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={40} />
                  <Line type="monotone" dataKey="comparison" name={getComparisonLabel()} stroke="#f59e0b" strokeWidth={2} dot={{r: 4}} />
               </ComposedChart>
             </ResponsiveContainer>
          </div>
       </div>

       {/* Most Played Games Table (Unified) */}
       <div className="bg-nexus-800 rounded-2xl border border-nexus-700 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-nexus-700">
             <h3 className="text-xl font-bold text-white">Most Played Games (Unified)</h3>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full">
                <thead>
                   <tr className="bg-nexus-900/50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <th className="p-4 pl-6">Rank</th>
                      <th className="p-4">Game</th>
                      <th className="p-4">Platforms</th>
                      <th className="p-4">Total Hours</th>
                      <th className="p-4">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-nexus-700">
                   {aggregatedGames.map((game, idx) => (
                      <tr key={game.title} className="hover:bg-nexus-700/30 transition-colors group">
                         <td className="p-4 pl-6 font-mono text-nexus-accent font-bold">#{idx + 1}</td>
                         <td className="p-4">
                            <div className="flex items-center gap-3">
                               <img src={game.coverUrl} className="w-10 h-14 object-cover rounded shadow-sm transition-transform group-hover:scale-105" />
                               <span className="font-bold text-white">{game.title}</span>
                            </div>
                         </td>
                         <td className="p-4">
                            <div className="flex gap-1">
                               {game.platforms.map(p => (
                                  <div key={p} className="p-1.5 bg-nexus-900 rounded-md border border-nexus-700 text-gray-400 group-hover:text-white transition-colors" title={p}>
                                     <PlatformIcon platform={p} className="w-3.5 h-3.5" />
                                  </div>
                               ))}
                            </div>
                         </td>
                         <td className="p-4 font-mono text-white font-medium">
                            {game.totalHours}h
                         </td>
                         <td className="p-4">
                            <button 
                               onClick={() => setSelectedAggregatedGame(game)}
                               className="p-2 hover:bg-nexus-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                               <ChevronRight size={20} />
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
       
       {selectedAggregatedGame && <AggregatedGameModal game={selectedAggregatedGame} onClose={() => setSelectedAggregatedGame(null)} />}
    </div>
  );
};