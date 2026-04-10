
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { 
  ExerciseRecord, PersonalRecord, RunRecord, 
  MealRecord, WaterRecord, DietGoals 
} from '../types';
import { DEFAULT_EXERCISES, GROUP_COLORS } from '../constants';
import { calculate1RM } from '../lib/utils';

interface AppContextType {
  user: any;
  loading: boolean;
  exercisesByGroup: Record<string, string[]>;
  history: ExerciseRecord[];
  prs: PersonalRecord[];
  runs: RunRecord[];
  meals: MealRecord[];
  water: WaterRecord | null;
  waterHistory: WaterRecord[];
  dietGoals: DietGoals;
  
  loadAllData: (user: any) => Promise<void>;
  saveExercises: (newExercises: Record<string, string[]>) => Promise<void>;
  addWorkoutRecords: (records: Omit<ExerciseRecord, 'user_id' | 'date'>[], date?: string) => Promise<boolean>;
  deleteHistoryRecord: (record: ExerciseRecord) => Promise<void>;
  addPr: (pr: Omit<PersonalRecord, 'user_id'>) => Promise<void>;
  updatePr: (id: number, pr: Partial<PersonalRecord>) => Promise<void>;
  deletePr: (id: number) => Promise<void>;
  addRun: (run: Omit<RunRecord, 'user_id' | 'id'>) => Promise<boolean>;
  deleteRun: (id: number) => Promise<void>;
  addMeal: (meal: Omit<MealRecord, 'user_id' | 'id' | 'date'>) => Promise<boolean>;
  deleteMeal: (id: number) => Promise<void>;
  updateHistoryRecord: (id: number, record: Partial<ExerciseRecord>) => Promise<void>;
  updateDietGoals: (goals: Partial<DietGoals> & { water_goal?: number }) => Promise<void>;
  exportUserData: () => any;
  importUserData: (data: any) => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isInitialLoad = React.useRef(true);
  const [exercisesByGroup, setExercisesByGroup] = useState<Record<string, string[]>>(DEFAULT_EXERCISES);
  const [history, setHistory] = useState<ExerciseRecord[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [water, setWater] = useState<WaterRecord | null>(null);
  const [waterHistory, setWaterHistory] = useState<WaterRecord[]>([]);
  const [dietGoals, setDietGoals] = useState<DietGoals>({ kcal: 2500, prot: 150, carb: 300, fat: 70 });

  const loadAllData = useCallback(async (currUser: any) => {
    if (!currUser) return;
    if (isInitialLoad.current) {
      setLoading(true);
    }
    try {
      const today = new Date().toLocaleDateString('pt-BR');

      const [
        exercisesRes, 
        historyRes, 
        prsRes, 
        runsRes, 
        mealsRes, 
        waterRes, 
        goalsRes
      ] = await Promise.all([
        supabase.from('gym_exercises').select('data').eq('user_id', currUser.id).maybeSingle(),
        supabase.from('gym_history').select('*').eq('user_id', currUser.id).order('id', { ascending: false }),
        supabase.from('gym_prs').select('*').eq('user_id', currUser.id),
        supabase.from('gymtrack_runs').select('*').eq('user_id', currUser.id).order('id', { ascending: true }),
        supabase.from('gymtrack_meals').select('*').eq('user_id', currUser.id),
        supabase.from('gymtrack_water').select('*').eq('user_id', currUser.id),
        supabase.from('gymtrack_diet_goals').select('*').eq('user_id', currUser.id).maybeSingle()
      ]);

      if (exercisesRes.data?.data) setExercisesByGroup(exercisesRes.data.data);
      if (historyRes.data) setHistory(historyRes.data);
      if (prsRes.data) setPrs(prsRes.data);
      if (runsRes.data) setRuns(runsRes.data);
      if (mealsRes.data) setMeals(mealsRes.data);
      
      if (waterRes.data) {
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
      }

      if (goalsRes.data) {
        setDietGoals(goalsRes.data);
      } else {
        const initialGoals = { user_id: currUser.id, kcal: 2500, prot: 150, carb: 300, fat: 70 };
        const { data: newGoals } = await supabase.from('gymtrack_diet_goals').insert([initialGoals]).select();
        if (newGoals?.[0]) setDietGoals(newGoals[0]);
      }
    } catch (err) {
      console.error('Error loading data:', err);
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

  const addMeal = async (meal: Omit<MealRecord, 'user_id' | 'id' | 'date'>) => {
    if (!user) return false;
    const today = new Date().toLocaleDateString('pt-BR');
    const { data, error } = await supabase.from('gymtrack_meals').insert([{ ...meal, user_id: user.id, date: today }]).select();
    if (!error && data?.[0]) {
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
    const { data, error } = await supabase.from('gymtrack_diet_goals').upsert({ ...dietGoalsData, user_id: user.id }, { onConflict: 'user_id' }).select();
    if (!error && data?.[0]) {
      setDietGoals(data[0]);
      if (water_goal && water?.id) {
        const { error: waterError } = await supabase.from('gymtrack_water').update({ goal: water_goal }).eq('id', water.id);
        if (!waterError) {
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
      version: "1.0",
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
          user_id: user.id,
          date: rec.date,
          group: rec.group,
          exercise: rec.exercise,
          weight: rec.weight,
          reps: rec.reps
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
          user_id: user.id,
          group: pr.group,
          exercise: pr.exercise,
          pr: pr.pr,
          rep: pr.rep,
          date: pr.date,
          oneRM: pr.oneRM
        }));

        if (newPrs.length > 0) {
          const { error: prError } = await supabase.from('gym_prs').insert(newPrs);
          if (prError) throw prError;
        }
      }

      await loadAllData(user);
      return { success: true, message: "Dados importados com sucesso!" };
    } catch (err) {
      console.error("Erro na importação:", err);
      return { success: false, message: "Erro ao importar dados. Verifique o formato do arquivo." };
    }
  };

  return (
    <AppContext.Provider value={{
      user, loading, exercisesByGroup, history, prs, runs, meals, water, waterHistory, dietGoals,
      loadAllData, saveExercises, addWorkoutRecords, updateHistoryRecord, deleteHistoryRecord, addPr, updatePr, deletePr,
      addRun, deleteRun, addMeal, deleteMeal, updateWater, updateDietGoals,
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
