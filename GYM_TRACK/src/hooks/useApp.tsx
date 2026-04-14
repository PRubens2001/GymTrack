
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { 
  ExerciseRecord, PersonalRecord, RunRecord, PlannedRun,
  MealRecord, WaterRecord, DietGoals, UserProfile 
} from '../types';
import { DEFAULT_EXERCISES, GROUP_COLORS } from '../constants';
import { calculate1RM } from '../lib/utils';

interface AppContextType {
  user: any;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  exercisesByGroup: Record<string, string[]>;
  history: ExerciseRecord[];
  prs: PersonalRecord[];
  runs: RunRecord[];
  plannedRuns: PlannedRun[];
  meals: MealRecord[];
  water: WaterRecord | null;
  waterHistory: WaterRecord[];
  dietGoals: DietGoals;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  
  loadAllData: (user: any, force?: boolean) => Promise<void>;
  saveExercises: (newExercises: Record<string, string[]>) => Promise<void>;
  addWorkoutRecords: (records: Omit<ExerciseRecord, 'user_id' | 'date'>[], date?: string) => Promise<boolean>;
  deleteHistoryRecord: (record: ExerciseRecord) => Promise<void>;
  addPr: (pr: Omit<PersonalRecord, 'user_id'>) => Promise<void>;
  updatePr: (id: number, pr: Partial<PersonalRecord>) => Promise<void>;
  deletePr: (id: number) => Promise<void>;
  addRun: (run: Omit<RunRecord, 'user_id' | 'id'>) => Promise<boolean>;
  deleteRun: (id: number) => Promise<void>;
  addPlannedRun: (run: Omit<PlannedRun, 'user_id' | 'id'>) => Promise<boolean>;
  addPlannedRuns: (runs: Omit<PlannedRun, 'user_id' | 'id'>[]) => Promise<boolean>;
  deletePlannedRun: (id: number) => Promise<void>;
  updatePlannedRun: (id: number, run: Partial<PlannedRun>) => Promise<void>;
  addMeal: (meal: Omit<MealRecord, 'user_id' | 'id' | 'date'>, customDate?: string) => Promise<boolean>;
  deleteMeal: (id: number) => Promise<void>;
  updateWater: (delta: number) => Promise<void>;
  updateHistoryRecord: (id: number, record: Partial<ExerciseRecord>) => Promise<void>;
  updateDietGoals: (goals: Partial<DietGoals> & { water_goal?: number }) => Promise<void>;
  exportUserData: () => any;
  importUserData: (data: any) => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialLoad = React.useRef(true);
  const [exercisesByGroup, setExercisesByGroup] = useState<Record<string, string[]>>(DEFAULT_EXERCISES);
  const [history, setHistory] = useState<ExerciseRecord[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [plannedRuns, setPlannedRuns] = useState<PlannedRun[]>([]);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [water, setWater] = useState<WaterRecord | null>(null);
  const [waterHistory, setWaterHistory] = useState<WaterRecord[]>([]);
  const [dietGoals, setDietGoals] = useState<DietGoals>({ kcal: 2500, prot: 150, carb: 300, fat_total: 70, fat_sat: 20, fiber: 30 });
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    console.log('Theme changed:', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const loadAllData = useCallback(async (currUser: any, force = false) => {
    if (!currUser) return;
    
    if (isInitialLoad.current || force) {
      setLoading(true);
      setError(null);
    }
    
    try {
      const today = new Date().toLocaleDateString('pt-BR');

      const [
        exercisesRes, 
        historyRes, 
        prsRes, 
        runsRes, 
        plannedRunsRes,
        mealsRes, 
        waterRes, 
        goalsRes,
        profileRes
      ] = await Promise.all([
        supabase.from('gym_exercises').select('data').eq('user_id', currUser.id).maybeSingle(),
        supabase.from('gym_history').select('*').eq('user_id', currUser.id).order('id', { ascending: false }),
        supabase.from('gym_prs').select('*').eq('user_id', currUser.id),
        supabase.from('gymtrack_runs').select('*').eq('user_id', currUser.id).order('id', { ascending: true }),
        supabase.from('gymtrack_planned_runs').select('*').eq('user_id', currUser.id).order('date', { ascending: true }),
        supabase.from('gymtrack_meals').select('*').eq('user_id', currUser.id),
        supabase.from('gymtrack_water').select('*').eq('user_id', currUser.id),
        supabase.from('gymtrack_diet_goals').select('*').eq('user_id', currUser.id).order('id', { ascending: false }).limit(1),
        supabase.from('gymtrack_profiles').select('*').eq('id', currUser.id).maybeSingle()
      ]);

      // Log errors but don't necessarily stop execution unless it's the profile
      if (exercisesRes.error) console.warn('Exercises load error:', exercisesRes.error.message);
      if (historyRes.error) console.warn('History load error:', historyRes.error.message);
      if (prsRes.error) console.warn('PRs load error:', prsRes.error.message);
      if (runsRes.error) console.warn('Runs load error:', runsRes.error.message);
      if (plannedRunsRes.error) console.warn('Planned runs load error:', plannedRunsRes.error.message);
      if (mealsRes.error) console.warn('Meals load error:', mealsRes.error.message);
      if (waterRes.error) console.warn('Water load error:', waterRes.error.message);
      if (goalsRes.error) console.warn('Goals load error:', goalsRes.error.message);

      if (profileRes.error && profileRes.error.code !== 'PGRST116') {
        console.error('Critical profile error:', profileRes.error);
        // Only throw if it's a real error, not just "not found"
        if (profileRes.error.code !== '42P01') { // 42P01 is "relation does not exist"
           throw new Error(`Erro ao buscar perfil: ${profileRes.error.message}`);
        }
      }

      if (profileRes.data) {
        setUserProfile(profileRes.data);
      } else {
        // Create profile if it doesn't exist
        const isAdmin = currUser.id === 'f73ccf76-12aa-4bd2-962c-5cb805258966';
        const newProfile = {
          id: currUser.id,
          email: currUser.email,
          is_approved: isAdmin, // Admins are auto-approved
          is_admin: isAdmin
        };
        
        try {
          const { data: createdProfile, error: insertError } = await supabase
            .from('gymtrack_profiles')
            .upsert([newProfile])
            .select()
            .single();
            
          if (!insertError && createdProfile) {
            setUserProfile(createdProfile);
          }
        } catch (e) {
          console.error('Failed to create profile:', e);
        }
      }

      if (exercisesRes.data?.data) setExercisesByGroup(exercisesRes.data.data);
      if (historyRes.data) setHistory(historyRes.data);
      if (prsRes.data) setPrs(prsRes.data);
      if (runsRes.data) setRuns(runsRes.data);
      if (plannedRunsRes.data) setPlannedRuns(plannedRunsRes.data);
      if (mealsRes.data) setMeals(mealsRes.data);
      
      if (waterRes.data && waterRes.data.length > 0) {
        setWaterHistory(waterRes.data);
        const todayWater = waterRes.data.find(w => w.date === today);
        if (todayWater) {
          setWater(todayWater);
        } else {
          const lastWater = [...waterRes.data].sort((a, b) => (b.id || 0) - (a.id || 0))[0];
          const goal = lastWater ? lastWater.goal : 3000;
          const newWater = { current: 0, goal, date: today, user_id: currUser.id };
          const { data: insertedWater } = await supabase.from('gymtrack_water').insert([newWater]).select();
          if (insertedWater?.[0]) {
            setWater(insertedWater[0]);
            setWaterHistory(prev => [...prev, insertedWater[0]]);
          }
        }
      } else if (!waterRes.error) {
        // Initialize water if table exists but no data
        const initialWater = { current: 0, goal: 3000, date: today, user_id: currUser.id };
        const { data: insertedWater } = await supabase.from('gymtrack_water').insert([initialWater]).select();
        if (insertedWater?.[0]) {
          setWater(insertedWater[0]);
          setWaterHistory([insertedWater[0]]);
        }
      }

      if (goalsRes.data?.[0]) {
        setDietGoals(goalsRes.data[0]);
      } else if (!goalsRes.error) {
        const initialGoals = { user_id: currUser.id, kcal: 2500, prot: 150, carb: 300, fat_total: 70, fat_sat: 20, fiber: 30 };
        const { data: newGoals } = await supabase.from('gymtrack_diet_goals').insert([initialGoals]).select();
        if (newGoals?.[0]) setDietGoals(newGoals[0]);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Erro desconhecido ao carregar dados');
    } finally {
      setLoading(false);
      isInitialLoad.current = false;
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadAllData(session.user);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadAllData(session.user);
      else {
        setLoading(false);
        setUserProfile(null);
        // Reset state on logout
        setHistory([]);
        setPrs([]);
        setRuns([]);
        setMeals([]);
        setWater(null);
        setWaterHistory([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadAllData]);

  const saveExercises = async (newExercises: Record<string, string[]>) => {
    if (!user) return;
    const { error } = await supabase.from('gym_exercises').upsert({ 
      user_id: user.id, 
      data: newExercises 
    }, { onConflict: 'user_id' });
    if (!error) setExercisesByGroup(newExercises);
  };

  const addWorkoutRecords = async (records: Omit<ExerciseRecord, 'user_id' | 'date'>[], workoutDate?: string) => {
    if (!user) return false;
    const dateToUse = workoutDate || new Date().toLocaleDateString('pt-BR');
    let allSuccess = true;
    let newExercises = { ...exercisesByGroup };
    let exercisesChanged = false;

    const newHistoryItems: ExerciseRecord[] = [];
    const updatedPrs = [...prs];

    for (const record of records) {
      if (!newExercises[record.group]?.includes(record.exercise)) {
        if (!newExercises[record.group]) newExercises[record.group] = [];
        newExercises[record.group].push(record.exercise);
        exercisesChanged = true;
      }

      const { data: histData, error: histError } = await supabase.from('gym_history').insert([{
        ...record,
        date: dateToUse,
        user_id: user.id
      }]).select();

      if (histError) {
        allSuccess = false;
        continue;
      }

      if (histData?.[0]) newHistoryItems.unshift(histData[0]);

      const current1RM = calculate1RM(record.weight, record.reps);
      const existingPrIndex = updatedPrs.findIndex(p => p.exercise === record.exercise);

      if (existingPrIndex === -1) {
        const { data: prData } = await supabase.from('gym_prs').insert([{
          group: record.group,
          exercise: record.exercise,
          pr: record.weight,
          rep: record.reps,
          date: dateToUse,
          oneRM: current1RM,
          user_id: user.id
        }]).select();
        if (prData?.[0]) updatedPrs.push(prData[0]);
      } else {
        const existingPr = updatedPrs[existingPrIndex];
        const existing1RM = existingPr.oneRM || calculate1RM(existingPr.pr, existingPr.rep);
        if (current1RM > existing1RM) {
          const { data: upPrData } = await supabase.from('gym_prs').update({
            pr: record.weight,
            rep: record.reps,
            date: dateToUse,
            oneRM: current1RM
          }).eq('id', existingPr.id).select();
          if (upPrData?.[0]) updatedPrs[existingPrIndex] = upPrData[0];
        }
      }
    }

    if (exercisesChanged) await saveExercises(newExercises);
    setHistory(prev => [...newHistoryItems, ...prev]);
    setPrs(updatedPrs);
    return allSuccess;
  };

  const updateHistoryRecord = async (id: number, record: Partial<ExerciseRecord>) => {
    const { data, error } = await supabase.from('gym_history').update(record).eq('id', id).select();
    if (!error && data?.[0]) setHistory(prev => prev.map(h => h.id === id ? data[0] : h));
  };

  const deleteHistoryRecord = async (record: ExerciseRecord) => {
    if (!record.id) return;
    const { error } = await supabase.from('gym_history').delete().eq('id', record.id);
    if (!error) setHistory(prev => prev.filter(h => h.id !== record.id));
  };

  const addPr = async (pr: Omit<PersonalRecord, 'user_id'>) => {
    if (!user) return;
    let newExercises = { ...exercisesByGroup };
    if (!newExercises[pr.group]?.includes(pr.exercise)) {
      if (!newExercises[pr.group]) newExercises[pr.group] = [];
      newExercises[pr.group].push(pr.exercise);
      await saveExercises(newExercises);
    }
    const { data, error } = await supabase.from('gym_prs').insert([{ ...pr, user_id: user.id }]).select();
    if (!error && data?.[0]) setPrs(prev => [...prev, data[0]]);
  };

  const updatePr = async (id: number, pr: Partial<PersonalRecord>) => {
    const { data, error } = await supabase.from('gym_prs').update(pr).eq('id', id).select();
    if (!error && data?.[0]) setPrs(prev => prev.map(p => p.id === id ? data[0] : p));
  };

  const deletePr = async (id: number) => {
    const { error } = await supabase.from('gym_prs').delete().eq('id', id);
    if (!error) setPrs(prev => prev.filter(p => p.id !== id));
  };

  const addRun = async (run: Omit<RunRecord, 'user_id' | 'id'>) => {
    if (!user) return false;
    const { data, error } = await supabase.from('gymtrack_runs').insert([{ ...run, user_id: user.id }]).select();
    if (!error && data?.[0]) {
      setRuns(prev => [...prev, data[0]]);
      return true;
    }
    return false;
  };

  const deleteRun = async (id: number) => {
    const { error } = await supabase.from('gymtrack_runs').delete().eq('id', id);
    if (!error) setRuns(prev => prev.filter(r => r.id !== id));
  };

  const addPlannedRun = async (run: Omit<PlannedRun, 'user_id' | 'id'>) => {
    if (!user) return false;
    const { data, error } = await supabase.from('gymtrack_planned_runs').insert([{ ...run, user_id: user.id }]).select();
    if (!error && data?.[0]) {
      setPlannedRuns(prev => [...prev, data[0]]);
      return true;
    }
    return false;
  };

  const addPlannedRuns = async (runs: Omit<PlannedRun, 'user_id' | 'id'>[]) => {
    if (!user || runs.length === 0) return false;
    const runsWithUser = runs.map(run => ({ ...run, user_id: user.id }));
    const { data, error } = await supabase.from('gymtrack_planned_runs').insert(runsWithUser).select();
    if (!error && data) {
      setPlannedRuns(prev => [...prev, ...data]);
      return true;
    }
    return false;
  };

  const deletePlannedRun = async (id: number) => {
    const { error } = await supabase.from('gymtrack_planned_runs').delete().eq('id', id);
    if (!error) setPlannedRuns(prev => prev.filter(r => r.id !== id));
  };

  const updatePlannedRun = async (id: number, run: Partial<PlannedRun>) => {
    const { data, error } = await supabase.from('gymtrack_planned_runs').update(run).eq('id', id).select();
    if (!error && data?.[0]) setPlannedRuns(prev => prev.map(r => r.id === id ? data[0] : r));
  };

  const addMeal = async (meal: Omit<MealRecord, 'user_id' | 'id' | 'date'>, customDate?: string) => {
    if (!user) return false;
    const dateToUse = customDate || new Date().toLocaleDateString('pt-BR');
    const { data, error } = await supabase.from('gymtrack_meals').insert([{ ...meal, user_id: user.id, date: dateToUse }]).select();
    if (error) {
      console.error('Error adding meal:', error);
      return false;
    }
    if (data?.[0]) {
      setMeals(prev => [...prev, data[0]]);
      return true;
    }
    return false;
  };

  const deleteMeal = async (id: number) => {
    const { error } = await supabase.from('gymtrack_meals').delete().eq('id', id);
    if (!error) setMeals(prev => prev.filter(m => m.id !== id));
  };

  const updateWater = async (delta: number) => {
    if (!water || !water.id) return;
    const newCurrent = Math.max(0, water.current + delta);
    const { error } = await supabase.from('gymtrack_water').update({ current: newCurrent }).eq('id', water.id);
    if (!error) {
      setWater({ ...water, current: newCurrent });
      setWaterHistory(prev => prev.map(w => w.id === water.id ? { ...w, current: newCurrent } : w));
    }
  };

  const updateDietGoals = async (goals: Partial<DietGoals> & { water_goal?: number }) => {
    if (!user) return;
    const { water_goal, ...dietGoalsData } = goals;
    
    let currentId = dietGoals.id;
    
    // Se não temos o ID no estado, tentamos buscar no banco pelo user_id
    if (!currentId) {
      const { data: existing } = await supabase
        .from('gymtrack_diet_goals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (existing) currentId = existing.id;
    }

    let result;
    if (currentId) {
      result = await supabase
        .from('gymtrack_diet_goals')
        .update(dietGoalsData)
        .eq('id', currentId)
        .select();
    } else {
      result = await supabase
        .from('gymtrack_diet_goals')
        .insert([{ ...dietGoalsData, user_id: user.id }])
        .select();
    }

    const { data, error } = result;

    if (error) {
      console.error('Erro ao atualizar metas de dieta:', error);
      return;
    }

    if (data?.[0]) {
      setDietGoals(data[0]);
      if (water_goal && water?.id) {
        const { error: waterError } = await supabase.from('gymtrack_water').update({ goal: water_goal }).eq('id', water.id);
        if (waterError) {
          console.error('Erro ao atualizar meta de água:', waterError);
        } else {
          setWater({ ...water, goal: water_goal });
          setWaterHistory(prev => prev.map(w => w.id === water.id ? { ...w, goal: water_goal } : w));
        }
      }
    }
  };

  const exportUserData = () => {
    return {
      history: history.map(({ id, user_id, ...rest }) => rest),
      prs: prs.map(({ id, user_id, ...rest }) => rest),
      exercises: exercisesByGroup,
      runs: runs.map(({ id, user_id, ...rest }) => rest),
      plannedRuns: plannedRuns.map(({ id, user_id, ...rest }) => rest),
      meals: meals.map(({ id, user_id, ...rest }) => rest),
      waterHistory: waterHistory.map(({ id, user_id, ...rest }) => rest),
      dietGoals: dietGoals ? (({ id, user_id, ...rest }) => rest)(dietGoals) : null,
      version: "1.1",
      exportDate: new Date().toISOString()
    };
  };

  const importUserData = async (data: any) => {
    if (!user) return { success: false, message: "Usuário não autenticado" };
    
    try {
      // 1. Merge Exercises
      if (data.exercises) {
        const mergedExercises = { ...exercisesByGroup };
        Object.entries(data.exercises).forEach(([group, exList]: [string, any]) => {
          if (!mergedExercises[group]) {
            mergedExercises[group] = exList;
          } else {
            mergedExercises[group] = [...new Set([...mergedExercises[group], ...exList])];
          }
        });
        await saveExercises(mergedExercises);
      }

      // 2. Merge History (avoiding exact duplicates)
      if (data.history && Array.isArray(data.history)) {
        const newRecords = data.history.filter((newRec: any) => {
          return !history.some(oldRec => 
            oldRec.date === newRec.date && 
            oldRec.exercise === newRec.exercise && 
            oldRec.weight === newRec.weight && 
            oldRec.reps === newRec.reps
          );
        }).map((rec: any) => ({
          ...rec,
          user_id: user.id
        }));

        if (newRecords.length > 0) {
          const { error: histError } = await supabase.from('gym_history').insert(newRecords);
          if (histError) throw histError;
        }
      }

      // 3. Merge PRs
      if (data.prs && Array.isArray(data.prs)) {
        const newPrs = data.prs.filter((newPr: any) => {
          return !prs.some(oldPr => 
            oldPr.exercise === newPr.exercise && 
            oldPr.group === newPr.group
          );
        }).map((pr: any) => ({
          ...pr,
          user_id: user.id
        }));

        if (newPrs.length > 0) {
          const { error: prError } = await supabase.from('gym_prs').insert(newPrs);
          if (prError) throw prError;
        }
      }

      // 4. Merge Runs
      if (data.runs && Array.isArray(data.runs)) {
        const newRuns = data.runs.filter((newRun: any) => {
          return !runs.some(oldRun => 
            oldRun.date === newRun.date && 
            oldRun.distance === newRun.distance && 
            oldRun.duration === newRun.duration
          );
        }).map((run: any) => ({
          ...run,
          user_id: user.id
        }));

        if (newRuns.length > 0) {
          const { error: runError } = await supabase.from('gymtrack_runs').insert(newRuns);
          if (runError) throw runError;
        }
      }

      // 5. Merge Planned Runs
      if (data.plannedRuns && Array.isArray(data.plannedRuns)) {
        const newPlanned = data.plannedRuns.filter((newP: any) => {
          return !plannedRuns.some(oldP => 
            oldP.date === newP.date && 
            oldP.type === newP.type && 
            oldP.distance === newP.distance
          );
        }).map((p: any) => ({
          ...p,
          user_id: user.id
        }));

        if (newPlanned.length > 0) {
          const { error: pError } = await supabase.from('gymtrack_planned_runs').insert(newPlanned);
          if (pError) throw pError;
        }
      }

      // 6. Merge Meals
      if (data.meals && Array.isArray(data.meals)) {
        const newMeals = data.meals.filter((newM: any) => {
          return !meals.some(oldM => 
            oldM.date === newM.date && 
            oldM.name === newM.name && 
            oldM.kcal === newM.kcal
          );
        }).map((m: any) => ({
          ...m,
          user_id: user.id
        }));

        if (newMeals.length > 0) {
          const { error: mError } = await supabase.from('gymtrack_meals').insert(newMeals);
          if (mError) throw mError;
        }
      }

      // 7. Water History
      if (data.waterHistory && Array.isArray(data.waterHistory)) {
        const newWater = data.waterHistory.filter((newW: any) => {
          return !waterHistory.some(oldW => oldW.date === newW.date);
        }).map((w: any) => ({
          ...w,
          user_id: user.id
        }));

        if (newWater.length > 0) {
          const { error: wError } = await supabase.from('gymtrack_water').insert(newWater);
          if (wError) throw wError;
        }
      }

      // 8. Diet Goals
      if (data.dietGoals) {
        const { error: gError } = await supabase
          .from('gymtrack_diet_goals')
          .upsert({ ...data.dietGoals, user_id: user.id }, { onConflict: 'user_id' });
        if (gError) throw gError;
      }

      await loadAllData(user, true);
      return { success: true, message: "Dados restaurados com sucesso!" };
    } catch (err) {
      console.error("Erro na importação:", err);
      return { success: false, message: "Erro ao importar dados. Verifique o formato do arquivo." };
    }
  };

  return (
    <AppContext.Provider value={{
      user, userProfile, loading, error, exercisesByGroup, history, prs, runs, plannedRuns, meals, water, waterHistory, dietGoals, isDark, setIsDark,
      loadAllData, saveExercises, addWorkoutRecords, updateHistoryRecord, deleteHistoryRecord, addPr, updatePr, deletePr,
      addRun, deleteRun, addPlannedRun, addPlannedRuns, deletePlannedRun, updatePlannedRun, addMeal, deleteMeal, updateWater, updateDietGoals,
      exportUserData, importUserData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};
