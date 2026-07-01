import React, { useState, useEffect, useRef, useContext } from 'react';
import { ArrowLeft, Calendar, Plus, ListTodo, History, CheckCircle2, Circle, Sprout, Tag, CalendarClock, LeafyGreen, Leaf, Flower, Apple, X, Droplet, Bug, Wind, Power, CalendarDays, Trash2, Edit2, FileText, ChevronDown, Check, AlertTriangle, Copy } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { supabase } from '../supabaseClient';
import { UserContext } from '../App';
import CustomSelect from './CustomSelect';

export default function PlantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const plantId = parseInt(id, 10);
  const { user } = useContext(UserContext);
  const isGuest = user?.role === 'guest';

  const plant = useSupabaseQuery('plants', { eq: { id: plantId } }, [plantId], true);
  const events = useSupabaseQuery('events', { eq: { plantId: plantId, userId: user.id } }, [plantId, user.id]) || [];
  const inventory = useSupabaseQuery('inventory', { eq: { userId: user.id } }, [user.id]) || [];
  const pests = useSupabaseQuery('pests', { eq: { userId: user.id } }, [user.id]) || [];
  const locationData = useSupabaseQuery(
    'locations',
    plant?.locationId ? { eq: { id: parseInt(plant.locationId) } } : {},
    [plant?.locationId],
    true
  );
  const allPlants = useSupabaseQuery('plants', { eq: { userId: user.id } }, [user.id]) || [];

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    const fixOverdueTodos = async () => {
      const { data: overdue } = await supabase
        .from('events')
        .select('*')
        .eq('plantId', plantId)
        .eq('type', 'todo')
        .eq('completed', false)
        .lt('date', todayStr);
      if (!overdue) return;
      for (const e of overdue) {
        if (e.activities && e.activities.some(a => a.title === 'Evaluasi Hama/Penyakit')) {
          await supabase.from('events').update({ date: todayStr }).eq('id', e.id);
        }
      }
    };
    fixOverdueTodos();
  }, [todayStr, plantId]);

  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const minDate = (plant && plant.sownDate && plant.sownDate !== '-') ? new Date(plant.sownDate) : today;
  const minYear = minDate.getFullYear();
  const minMonthIndex = minDate.getMonth();
  const maxYear = minYear + 3;
  const maxMonthIndex = minMonthIndex;

  
  const isPrevDisabled = currentYear < minYear || (currentYear === minYear && currentMonth <= minMonthIndex);
  const isNextDisabled = currentYear > maxYear || (currentYear === maxYear && currentMonth >= maxMonthIndex);

  const handlePrevMonth = () => {
    if (isPrevDisabled) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (isNextDisabled) return;
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isCopyScheduleModalOpen, setIsCopyScheduleModalOpen] = useState(false);
  const [copyScheduleSourceEvent, setCopyScheduleSourceEvent] = useState(null);
  const [copyTargetPlantId, setCopyTargetPlantId] = useState('');
  const [copyTargetDate, setCopyTargetDate] = useState('');
  const [copySelectedActivities, setCopySelectedActivities] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);
  const [generalNote, setGeneralNote] = useState('');
  const [activities, setActivities] = useState([]);
  
  const [activityType, setActivityType] = useState('perlakuan'); // 'perlakuan' | 'produk' | 'panen'
  const [actTitle, setActTitle] = useState('Pruning');
  const [actTitleCustom, setActTitleCustom] = useState('');
  const [actNote, setActNote] = useState('');
  
  const [panenYield, setPanenYield] = useState('');
  const [panenUnit, setPanenUnit] = useState('kg');
  
  const [prodCategoryFilter, setProdCategoryFilter] = useState('Pupuk');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [calcType, setCalcType] = useState('per_plant'); // 'per_plant' | 'total'
  const [doseInput, setDoseInput] = useState('');

  const [selectedPestId, setSelectedPestId] = useState('');
  const [pestSeverity, setPestSeverity] = useState('Ringan');

  const [editingEventId, setEditingEventId] = useState(null);
  const [showReport, setShowReport] = useState(false);

  const [productCategories, setProductCategories] = useState(['Pupuk', 'Insektisida', 'Fungisida', 'Herbisida', 'ZPT', 'Lainnya']);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase.from('categories').select('name').eq('userId', user.id);
        if (!error && data && data.length > 0) {
          const names = data.map(c => c.name).sort((a, b) => a.localeCompare(b));
          setProductCategories(names);
        }
      } catch (e) {
        console.error("Failed to load categories in PlantDetail:", e);
      }
    };
    loadCategories();
  }, [user.id]);

  let calculatedTotal = 0;
  let inventoryWarning = '';

  if (activityType === 'produk' && selectedProductId && doseInput) {
    const prod = inventory.find(i => i.id === parseInt(selectedProductId));
    const val = parseFloat(doseInput) || 0;
    calculatedTotal = calcType === 'per_plant' ? val * (plant?.plantCount || 1) : val;

    if (prod && calculatedTotal > prod.stock) {
      inventoryWarning = `Peringatan: Stok ${prod.name} tidak mencukupi! Kebutuhan ${calculatedTotal} ${prod.unit}, sisa gudang ${prod.stock} ${prod.unit}.`;
    }
  }

  if (!plant) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
          <Leaf className="w-6 h-6 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <span className="text-sm font-semibold animate-pulse text-emerald-400/80">Memuat profil tanaman...</span>
      </div>
    );
  }
  const filteredInventory = inventory.filter(i => i.category === prodCategoryFilter);

  // Compute Last Fertilized
  const computeLastFertilized = () => {
    const historyEvents = events.filter(e => e.type === 'history' || e.completed === true);
    // Sort by date descending
    historyEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    for (const e of historyEvents) {
      if (e.activities && e.activities.some(act => act.type === 'produk' && act.category === 'Pupuk')) {
        return e.date;
      }
    }
    return 'Belum pernah';
  };
  const lastFertilizedDate = computeLastFertilized();

  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const isPastOrToday = selectedDate <= today;
  const eventType = isPastOrToday ? 'history' : 'todo';
  
  const allEvents = [...events];
  
  if (plant) {
    if (plant.sownDate && plant.sownDate !== '-') {
      const hasSemai = allEvents.some(e => e.date === plant.sownDate && e.activities && e.activities.some(a => a.title === 'Semai'));
      if (!hasSemai) {
        allEvents.push({
          id: 'virtual-semai',
          date: plant.sownDate,
          type: 'history',
          completed: true,
          isVirtual: true,
          activities: [{ type: 'perlakuan', title: 'Semai', note: 'Otomatis dari profil' }]
        });
      }
    }
    if (plant.plantedDate && plant.plantedDate !== '-') {
      const hasTanam = allEvents.some(e => e.date === plant.plantedDate && e.activities && e.activities.some(a => a.title === 'Pindah Tanam'));
      if (!hasTanam) {
        allEvents.push({
          id: 'virtual-tanam',
          date: plant.plantedDate,
          type: 'history',
          completed: true,
          isVirtual: true,
          activities: [{ type: 'perlakuan', title: 'Pindah Tanam', note: 'Otomatis dari profil' }]
        });
      }
    }
  }

  const eventsOnSelectedDate = allEvents.filter(e => e.date === selectedDateStr);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days = [];
  
  for (let i = 0; i < firstDay; i++) days.push({ empty: true });
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ date: i, fullDate: dateStr, events: allEvents.filter(e => e.date === dateStr) });
  }

  const parseLocalDate = (dateVal) => {
    if (!dateVal || dateVal === '-') return null;
    if (dateVal instanceof Date) return new Date(dateVal.getFullYear(), dateVal.getMonth(), dateVal.getDate());
    const parts = dateVal.split('T')[0].split('-');
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  };

  const getDayDifference = (d1, d2) => {
    const date1 = parseLocalDate(d1);
    const date2 = parseLocalDate(d2);
    if (!date1 || !date2) return 0;
    const timeDiff = date2.getTime() - date1.getTime();
    return Math.round(timeDiff / (1000 * 60 * 60 * 24));
  };

  const calculateAge = (plant) => {
    if (!plant) return '-';
    const today = new Date();

    if (plant.phase === 'Selesai Masa Tanam') {
      if (!plant.completedDate) return 'Selesai';
      const end = plant.completedDate;
      if (plant.sownDate && plant.sownDate !== '-') {
         if (!plant.plantedDate || plant.plantedDate === '-') {
           const diffDays = getDayDifference(plant.sownDate, end);
           return `${diffDays} HSS (Selesai)`;
         } else {
           const diffDays = getDayDifference(plant.plantedDate, end);
           return `${diffDays} HST (Selesai)`;
         }
      }
      return 'Selesai';
    }

    // Jika sudah ada tanggal tanam dan tanggal tersebut sudah lewat atau hari ini, gunakan HST
    if (plant.plantedDate && plant.plantedDate !== '-') {
      const plantedDateObj = parseLocalDate(plant.plantedDate);
      const todayMidnight = parseLocalDate(today);
      if (plantedDateObj && plantedDateObj <= todayMidnight) {
        const diffDays = getDayDifference(plant.plantedDate, today); 
        return `${diffDays} HST`;
      }
    }

    // Fallback ke HSS jika belum pindah tanam
    if (!plant.sownDate || plant.sownDate === '-') return '0 HSS';
    const diffDays = getDayDifference(plant.sownDate, today); 
    return `${diffDays} HSS`;
  };

  const calculateSemaiDuration = (plant) => {
    if (!plant.sownDate || plant.sownDate === '-') return 0;
    const end = (plant.plantedDate && plant.plantedDate !== '-') ? plant.plantedDate : (plant.completedDate ? plant.completedDate : new Date());
    return getDayDifference(plant.sownDate, end);
  };

  const calculateTanamDuration = (plant) => {
    if (!plant.plantedDate || plant.plantedDate === '-') return 0;
    const end = plant.completedDate ? plant.completedDate : new Date();
    return getDayDifference(plant.plantedDate, end);
  };

  const calculateTotalHSS = (plant) => {
    if (!plant.sownDate || plant.sownDate === '-') return 0;
    const end = plant.completedDate ? plant.completedDate : new Date();
    return getDayDifference(plant.sownDate, end);
  };

  const getReportData = () => {
    const historyEvents = allEvents.filter(e => e.type === 'history');
    const perlakuanMap = {};
    const produk = {};
    const panen = [];
    const hamaMap = {};

    historyEvents.forEach(e => {
      if (e.activities) {
        e.activities.forEach(act => {
          if (act.type === 'perlakuan') {
            if (!perlakuanMap[act.title]) perlakuanMap[act.title] = { count: 0, firstDate: e.date };
            perlakuanMap[act.title].count += 1;
            if (new Date(e.date) < new Date(perlakuanMap[act.title].firstDate)) {
               perlakuanMap[act.title].firstDate = e.date;
            }
          } else if (act.type === 'produk') {
            const name = act.name || 'Produk Gudang';
            if (!produk[name]) produk[name] = { count: 0, dates: [] };
            produk[name].count += 1;
            if (!produk[name].dates.includes(e.date)) produk[name].dates.push(e.date);
          } else if (act.type === 'panen') {
            panen.push({ date: e.date, title: act.title, yield: act.yield, unit: act.unit });
          } else if (act.type === 'hama') {
            const pestName = act.name || 'Hama/Penyakit';
            if (!hamaMap[pestName]) hamaMap[pestName] = { count: 0, severities: [], dates: [] };
            hamaMap[pestName].count += 1;
            if (!hamaMap[pestName].dates.includes(e.date)) hamaMap[pestName].dates.push(e.date);
            if (act.severity && !hamaMap[pestName].severities.includes(act.severity)) hamaMap[pestName].severities.push(act.severity);
          }
        });
      }
    });

    const perlakuan = Object.entries(perlakuanMap)
      .map(([title, data]) => ({ title, count: data.count, firstDate: data.firstDate }))
      .sort((a, b) => new Date(a.firstDate) - new Date(b.firstDate));

    return { perlakuan, produk, panen, hama: hamaMap };
  };

  const handleAddActivity = () => {
    if (activityType === 'perlakuan' && !actTitle) return;
    
    if (activityType === 'hama') {
      if (!selectedPestId) return;
      const pest = pests.find(p => p.id === parseInt(selectedPestId));
      if (!pest) return;

      setActivities([...activities, {
        type: 'hama',
        pestId: pest.id,
        name: pest.name,
        severity: pestSeverity,
        note: actNote
      }]);
      setSelectedPestId('');
      setActNote('');
      return;
    }

    if (activityType === 'produk') {
      if (!selectedProductId || !doseInput) return;
      const prod = inventory.find(i => i.id === parseInt(selectedProductId));
      if (!prod) return;
      if (calculatedTotal <= 0) {
        alert("Jumlah dosis tidak valid! Harus lebih besar dari 0.");
        return;
      }
      if (calculatedTotal > prod.stock) {
        alert("Gagal menambahkan! Stok gudang tidak mencukupi untuk jumlah ini.");
        return;
      }
      
      setActivities([...activities, {
        type: 'produk',
        productId: prod.id,
        name: prod.name,
        category: prod.category,
        unit: prod.unit,
        calcType: calcType,
        dosePerPlant: calcType === 'per_plant' ? parseFloat(doseInput) : 0,
        totalDose: calculatedTotal,
        note: actNote
      }]);
      setSelectedProductId('');
      setDoseInput('');
      setActNote('');
      return;
    }

    if (activityType === 'perlakuan') {
      const isPanen = actTitle === 'Panen';
      const finalTitle = isPanen ? (actTitleCustom || 'Panen') : (actTitle === 'Lainnya' ? actTitleCustom : actTitle);
      if (!finalTitle) return;

      if (finalTitle === 'Pindah Tanam' && (!plant.sownDate || plant.sownDate === '-')) {
        alert("Gagal: Tanaman harus dicatat 'Semai' terlebih dahulu!");
        return;
      }
      if (finalTitle === 'Fase Generatif' && plant.phase !== 'Vegetatif') {
        alert("Gagal: Tanaman harus melewati Pindah Tanam (Fase Vegetatif) terlebih dahulu!");
        return;
      }
      if (isPanen && plant.phase !== 'Generatif' && plant.phase !== 'Selesai Masa Tanam') {
        alert("Gagal: Tanaman harus berada di Fase Generatif untuk bisa dicatat Panen!");
        return;
      }

      if (isPanen) {
        setActivities([...activities, { type: 'panen', title: finalTitle, note: actNote, yield: parseFloat(panenYield) || 0, unit: panenUnit }]);
      } else {
        setActivities([...activities, { type: 'perlakuan', title: finalTitle, note: actNote }]);
      }
      setActTitleCustom(''); setActNote(''); setPanenYield('');
      return;
    }
  };

  const handleRemoveActivity = (index) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (activities.length === 0 && !generalNote) return;
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);

    try {
      // Strict Date Validation (Can't log before sowing)
      if (new Date(selectedDateStr) < new Date(plant.sownDate)) {
        alert("Tanggal tidak valid: Tidak bisa mencatat sebelum tanggal semai!");
        isSavingRef.current = false;
        setIsSaving(false);
        return;
      }

      // Failsafe: Tidak bisa mencatat Panen atau Fase Generatif sebelum tanggal Pindah Tanam
      if (plant.plantedDate && plant.plantedDate !== '-') {
        if (new Date(selectedDateStr) < new Date(plant.plantedDate)) {
          const hasPostPlanted = activities.some(act => 
            act.type === 'panen' || 
            (act.type === 'perlakuan' && ['Fase Generatif', 'Panen'].includes(act.title))
          );
          if (hasPostPlanted) {
            alert("Tanggal tidak valid: Tidak bisa mencatat Panen atau Fase Generatif sebelum tanggal Pindah Tanam!");
            isSavingRef.current = false;
            setIsSaving(false);
            return;
          }
        }
      }

      // Handle Editing: Refund old stock, delete old event
      if (editingEventId) {
        const oldEvent = await db.events.get(editingEventId);
        if (oldEvent && (oldEvent.type === 'history' || oldEvent.completed)) {
          if (oldEvent.activities) {
            for (const act of oldEvent.activities) {
              if (act.type === 'produk' && act.productId) {
                const item = await db.inventory.get(act.productId);
                if (item) {
                  await db.inventory.update(item.id, { stock: item.stock + act.totalDose });
                }
              }
            }
          }
        }
        await db.events.delete(editingEventId);
      }

      // Auto Deduct Inventory if it's a history event (meaning we actually applied it)
      if (eventType === 'history') {
        for (const act of activities) {
          if (act.type === 'produk' && act.productId) {
            const item = await db.inventory.get(act.productId);
            if (item) {
              await db.inventory.update(item.id, { stock: Math.max(0, item.stock - act.totalDose) });
            }
          }
        }
      }

      let updatedPlantData = {};

      for (const act of activities) {
        if (act.type === 'hama') {
          updatedPlantData.status = 'pest';
          updatedPlantData.statusText = 'Terkena Hama/Penyakit';
        }
        
        if (act.type === 'produk' && ['Insektisida', 'Pestisida', 'Fungisida', 'Herbisida', 'Bakterisida'].includes(act.category)) {
          // Hapus to-do evaluasi yang belum selesai sebelumnya
          const existingEvals = events.filter(e => e.type === 'todo' && !e.completed && e.activities && e.activities.some(a => a.title === 'Evaluasi Hama/Penyakit'));
          for (const ev of existingEvals) {
            await db.events.delete(ev.id);
          }

          const checkDate = new Date(new Date(selectedDateStr).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          await db.events.add({
            userId: user.id,
            plantId: plant.id,
            date: checkDate,
            type: 'todo',
            generalNote: '',
            completed: false,
            activities: [{
              type: 'perlakuan', 
              title: `Evaluasi Hama/Penyakit`, 
              note: `Cek kondisi tanaman: Apakah serangan hama/penyakit sudah teratasi setelah aplikasi produk ${act.name} pada ${selectedDateStr}?`
            }]
          });
        }

        if (act.type === 'perlakuan' || act.type === 'panen') {
          const title = act.title;
          // Identify milestones
          const milestoneKey = title === 'Semai' ? 'sownDate' : title === 'Pindah Tanam' ? 'plantedDate' : null;
          const newPhase = title === 'Pindah Tanam' ? 'Vegetatif' : title === 'Fase Generatif' ? 'Generatif' : act.type === 'panen' ? 'Panen' : null;

          if (['Semai', 'Pindah Tanam', 'Fase Generatif'].includes(title)) {
            const existing = events.find(e => e.activities && e.activities.some(a => a.title === title));
            if (existing && existing.date !== selectedDateStr) {
              if (!window.confirm(`Anda sudah mencatat "${title}" di tanggal ${existing.date}. Pindahkan ke tanggal ini dan hapus catatan lama?`)) {
                isSavingRef.current = false;
                setIsSaving(false);
                return; // abort save entirely
              } else {
                const filteredActs = existing.activities.filter(a => a.title !== title);
                if (filteredActs.length === 0 && !existing.generalNote) {
                  // Delete event if no other activities
                  await db.events.delete(existing.id);
                } else {
                  await db.events.update(existing.id, { activities: filteredActs });
                }
              }
            }
          }

          if (milestoneKey) updatedPlantData[milestoneKey] = selectedDateStr;
          if (newPhase) updatedPlantData.phase = newPhase;
        }
      }

      await db.events.add({
        userId: user.id,
        plantId: plant.id,
        date: selectedDateStr,
        type: eventType,
        generalNote: generalNote,
        completed: false,
        activities: activities
      });

      if (updatedPlantData && Object.keys(updatedPlantData).length > 0) {
        await db.plants.update(plant.id, updatedPlantData);
      }

      setGeneralNote(''); setActivities([]); setIsAddingEvent(false); setEditingEventId(null);
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Gagal menyimpan riwayat/jadwal. Silakan coba lagi.");
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleEditEvent = (event) => {
    setSelectedDate(new Date(event.date));
    setActivities([...(event.activities || [])]);
    setGeneralNote(event.generalNote || '');
    setEditingEventId(event.id);
    setIsAddingEvent(true);
  };

  const handleOpenCopySchedule = (event) => {
    setCopyScheduleSourceEvent(event);
    setCopyTargetDate(event.date);
    setCopyTargetPlantId('');
    setCopySelectedActivities(event.activities ? event.activities.map((_, i) => i) : []);
    setIsCopyScheduleModalOpen(true);
  };

  const handleSaveCopySchedule = async () => {
    if (!copyTargetPlantId) return alert("Pilih tanaman target.");
    if (!copyTargetDate) return alert("Pilih tanggal target.");
    if (copySelectedActivities.length === 0) return alert("Pilih setidaknya satu aktivitas untuk disalin.");
    
    setIsSaving(true);
    try {
      const targetPlant = allPlants.find(p => p.id === parseInt(copyTargetPlantId));
      if (!targetPlant) throw new Error("Tanaman target tidak ditemukan.");

      const activitiesToCopy = copySelectedActivities.map(idx => copyScheduleSourceEvent.activities[idx]);
      
      const { data: existingTargetEvents } = await supabase
        .from('events')
        .select('*')
        .eq('plantId', targetPlant.id)
        .eq('date', copyTargetDate);
      
      const existingTodo = existingTargetEvents?.find(e => e.type === 'todo');

      if (existingTodo) {
        const combined = [...(existingTodo.activities || []), ...activitiesToCopy];
        await db.events.update(existingTodo.id, { activities: combined });
      } else {
        await db.events.add({
          userId: user.id,
          plantId: targetPlant.id,
          date: copyTargetDate,
          type: 'todo',
          generalNote: '',
          completed: false,
          activities: activitiesToCopy
        });
      }
      setIsCopyScheduleModalOpen(false);
      alert("Jadwal berhasil disalin!");
    } catch (e) {
      console.error(e);
      alert("Gagal menyalin jadwal.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (event) => {
    if (!window.confirm("Yakin ingin menghapus riwayat ini? Data inventaris yang terpakai akan dikembalikan.")) return;
    if (event.type === 'history' || event.completed) {
      if (event.activities) {
        for (const act of event.activities) {
          if (act.type === 'produk' && act.productId) {
            const item = await db.inventory.get(act.productId);
            if (item) await db.inventory.update(item.id, { stock: item.stock + act.totalDose });
          }
        }
      }
    }
    await db.events.delete(event.id);
  };

  const handleMoveDate = async (eventId, currentTitle) => {
    const newDateStr = window.prompt(`Pindahkan jadwal "${currentTitle}" ke tanggal (YYYY-MM-DD):`, selectedDateStr);
    if (!newDateStr) return;
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDateStr)) {
      alert("Format tanggal salah! Gunakan format YYYY-MM-DD.");
      return;
    }
    
    const isPast = new Date(newDateStr) <= today;
    const newType = isPast ? 'history' : 'todo';
    
    if (window.confirm(`Yakin ingin memindahkan jadwal ini ke tanggal ${newDateStr}?`)) {
      await db.events.update(eventId, { date: newDateStr, type: newType, completed: false });
    }
  };

  const toggleTodoComplete = async (eventId, currentStatus) => {
    const event = await db.events.get(eventId);
    if (!event) return;

    const newStatus = !currentStatus;
    
    // Deduct stock if marking as complete, refund if marking as incomplete
    if (event.activities) {
      for (const act of event.activities) {
        if (act.type === 'produk' && act.productId) {
          const item = await db.inventory.get(act.productId);
          if (item) {
            let newStock = item.stock;
            if (newStatus === true) {
              // Deduct
              if (item.stock < act.totalDose) {
                alert(`Tidak dapat menyelesaikan tugas: Stok ${item.name} kurang! Butuh ${act.totalDose}, sisa ${item.stock}. Restock gudang terlebih dahulu.`);
                return; // Abort toggle
              }
              newStock = item.stock - act.totalDose;
            } else {
              // Refund
              newStock = item.stock + act.totalDose;
            }
            await db.inventory.update(item.id, { stock: newStock });
          }
        }
        if (act.title === 'Evaluasi Hama/Penyakit' && newStatus === true) {
          if (window.confirm("Apakah serangan hama/penyakit sudah teratasi sepenuhnya? Jika 'OK', status tanaman akan dikembalikan menjadi sehat.")) {
             await db.plants.update(plant.id, { status: 'healthy', statusText: 'Sehat' });
          } else {
             return; // Batalkan centang jika user klik Batal
          }
        }
      }
    }

    await db.events.update(eventId, { completed: newStatus });
  };

  const toggleLifecycle = async () => {
    if (plant.phase !== 'Selesai Masa Tanam') {
      if (!window.confirm("Apakah Anda yakin ingin mengakhiri masa tanam? Tanaman akan dipindahkan ke Arsip dan status hama akan dihapus.")) {
        return;
      }
      const completedDate = new Date().toISOString().split('T')[0];
      await db.plants.update(plant.id, { phase: 'Selesai Masa Tanam', status: '', statusText: '', completedDate });
    } else {
      await db.plants.update(plant.id, { phase: 'Vegetatif', completedDate: null });
    }
  };

  const getCategoryColor = (cat) => {
    if (['Pestisida', 'Fungisida', 'Herbisida', 'Insektisida'].includes(cat)) return 'bg-red-500/20 text-red-400';
    if (['Pupuk'].includes(cat)) return 'bg-emerald-500/20 text-emerald-400';
    if (['ZPT', 'ZAT'].includes(cat)) return 'bg-purple-500/20 text-purple-400';
    return 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-10 flex flex-col h-full">
      <header className="flex items-start gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 mt-1 rounded-full bg-forest-surface border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-forest-surface/80 transition-all shrink-0">
          <ArrowLeft size={20} />
        </button>
        <div className="w-full flex justify-between items-start gap-4">
          <div className="flex flex-col">
            <h1 className="text-3xl font-semibold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent pb-2">Profil Tanaman: {plant.name}</h1>
            <p className="text-gray-400 mt-1 mb-4">Varietas: {plant.varietas}</p>
            
            <div className="flex flex-wrap gap-2.5">
              <span className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg text-sm text-blue-400">
                <ArrowLeft size={16} className="rotate-180" /> Lokasi: <span className="text-white">{locationData ? `${locationData.name} (${plant.plantCount} Pohon)` : 'Belum ditentukan'}</span>
              </span>
              <span className={`flex items-center gap-2 border px-3 py-1.5 rounded-lg text-sm ${plant.phase === 'Selesai Masa Tanam' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : plant.phase === 'Panen' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : plant.phase === 'Generatif' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                {plant.phase === 'Semai' && <Sprout size={16} />}
                {plant.phase === 'Vegetatif' && <Leaf size={16} />}
                {plant.phase === 'Generatif' && <Flower size={16} />}
                {plant.phase === 'Panen' && <Apple size={16} />}
                {plant.phase === 'Selesai Masa Tanam' && <CheckCircle2 size={16} />}
                Fase: <span className="font-medium text-white">{plant.phase}</span>
              </span>
              <span className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg text-sm text-amber-400">
                <CalendarClock size={16} /> Umur: <span className="font-medium text-white">{calculateAge(plant)}</span>
              </span>
              <span className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-sm text-emerald-400">
                <Sprout size={16} /> Semai: <span className="text-white">{plant.sownDate}</span>
              </span>
              <span className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-sm text-emerald-400">
                <Leaf size={16} /> Tanam: <span className="text-white">{plant.plantedDate}</span>
              </span>
              <button onClick={() => setShowReport(true)} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-sm text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-md">
                <FileText size={16} /> Riwayat Lengkap
              </button>
            </div>
          </div>
          
          {!isGuest && (
            <div className="flex flex-col items-end shrink-0">
                <button onClick={toggleLifecycle} className={`flex items-center gap-2 border-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg ${plant.phase === 'Selesai Masa Tanam' ? 'bg-forest-surface border-gray-500/30 text-gray-400 hover:text-white' : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500 hover:scale-105'}`}>
                  {plant.phase === 'Selesai Masa Tanam' ? <ArrowLeft size={18} /> : <CheckCircle2 size={18} />} 
                  {plant.phase === 'Selesai Masa Tanam' ? 'Kembalikan Aktif' : 'Tandai Selesai'}
                </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-stretch pb-10">
        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="card-glass p-6 pb-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <button onClick={handlePrevMonth} disabled={isPrevDisabled} className={`p-1.5 rounded-lg transition-colors ${isPrevDisabled ? 'text-gray-600 cursor-not-allowed' : 'text-emerald-400 hover:bg-emerald-500/20'}`}>
                  <ArrowLeft size={20} />
                </button>
                
                <div className="flex justify-center items-center gap-2">
                  <Calendar className="text-emerald-500 shrink-0" />
                  <CustomSelect
                    value={currentMonth}
                    onChange={(val) => {
                      setCurrentMonth(val);
                      if (currentYear === minYear && val < minMonthIndex) setCurrentYear(minYear + 1);
                    }}
                    options={monthNames.map((name, idx) => ({ 
                      value: idx, 
                      label: name,
                      disabled: (currentYear === minYear && idx < minMonthIndex) || (currentYear === maxYear && idx > maxMonthIndex)
                    }))}
                    className="w-[110px]"
                  />
                  <CustomSelect
                    value={currentYear}
                    onChange={(val) => {
                       setCurrentYear(val);
                       if (val === minYear && currentMonth < minMonthIndex) setCurrentMonth(minMonthIndex);
                       if (val === maxYear && currentMonth > maxMonthIndex) setCurrentMonth(maxMonthIndex);
                    }}
                    options={Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map(y => ({
                      value: y, label: y.toString()
                    }))}
                    className="w-24"
                  />
                </div>

                <button onClick={handleNextMonth} disabled={isNextDisabled} className={`p-1.5 rounded-lg transition-colors ${isNextDisabled ? 'text-gray-600 cursor-not-allowed' : 'text-emerald-400 hover:bg-emerald-500/20'}`}>
                  <ArrowLeft size={20} className="rotate-180" />
                </button>
              </div>
              <div className="flex gap-4 text-xs font-medium">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Riwayat</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> To-Do</span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center flex-1">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                <div key={day} className="text-xs font-semibold text-gray-400 mb-2 uppercase">{day}</div>
              ))}
              
              {days.map((dayObj, index) => {
                if (dayObj.empty) return <div key={`empty-${index}`} className="h-20"></div>;
                
                const isSelected = selectedDateStr === dayObj.fullDate;
                const isTodayStr = dayObj.fullDate === todayStr;
                const hasHistory = dayObj.events.some(e => e.type === 'history');
                const hasTodo = dayObj.events.some(e => e.type === 'todo');
                const hasHama = dayObj.events.some(e => e.type === 'history' && e.activities && e.activities.some(a => a.type === 'hama'));

                return (
                  <button
                    key={index}
                    onClick={() => { setSelectedDate(new Date(currentYear, currentMonth, dayObj.date)); setIsAddingEvent(false); }}
                    className={`min-h-[80px] sm:min-h-[96px] rounded-xl border relative p-2 flex flex-col items-start transition-all hover:border-emerald-500/50 
                      ${isSelected ? 'bg-emerald-900/30 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-forest-bg border-white/5'}
                      ${isTodayStr && !isSelected ? 'border-emerald-500/40 border-2' : ''}
                    `}
                  >
                    <span className={`text-sm font-semibold ${isTodayStr ? 'text-emerald-400' : 'text-gray-300'}`}>{dayObj.date}</span>
                    <div className="mt-auto w-full flex flex-col gap-1">
                      {hasHama && <div className="h-1.5 w-full bg-red-500 rounded-full opacity-80"></div>}
                      {hasHistory && !hasHama && <div className="h-1.5 w-full bg-emerald-500 rounded-full opacity-80"></div>}
                      {hasTodo && <div className="h-1.5 w-full bg-amber-500 rounded-full opacity-80"></div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Event Panel */}
        <div className="w-full lg:w-96 xl:w-[450px] flex flex-col gap-4">
          <div className="card-glass p-6 flex-1 flex flex-col overflow-hidden">
            <h3 className="text-lg font-semibold mb-4 flex items-center justify-between border-b border-white/10 pb-4">
              {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {selectedDateStr === todayStr && <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-md">Hari Ini</span>}
            </h3>

            {!isAddingEvent ? (
              <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-5">
                {eventsOnSelectedDate.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10">
                    <Wind size={40} className="mx-auto mb-3 opacity-20" />
                    <p>Tidak ada catatan untuk tanggal ini.</p>
                  </div>
                ) : (
                  eventsOnSelectedDate.map(event => (
                    <div key={event.id} className={`bg-forest-bg rounded-xl p-4 border transition-colors ${event.completed ? 'border-emerald-500/50 bg-emerald-900/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-white/5'}`}>
                      {event.type === 'history' ? (
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2 text-emerald-500">
                            <History size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Riwayat Tercatat</span>
                          </div>
                          {!event.isVirtual && !isGuest && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleEditEvent(event)} className="text-blue-500/50 hover:text-blue-400 transition-colors" title="Edit Riwayat">
                                <Edit2 size={18} />
                              </button>
                              <button onClick={() => handleDeleteEvent(event)} className="text-red-500/50 hover:text-red-400 transition-colors" title="Hapus Riwayat">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2 text-amber-500">
                            <ListTodo size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">To-Do List</span>
                          </div>
                          {!isGuest && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleOpenCopySchedule(event)} className="text-blue-500/50 hover:text-blue-400 transition-colors" title="Salin Jadwal">
                                <Copy size={18} />
                              </button>
                              <button onClick={() => handleMoveDate(event.id, event.activities?.[0]?.title || event.activities?.[0]?.name || 'Tugas')} className="text-amber-500/50 hover:text-amber-400 transition-colors" title="Pindah Tanggal">
                                <CalendarDays size={18} />
                              </button>
                              <button onClick={async () => { if(window.confirm('Hapus jadwal ini?')) await db.events.delete(event.id); }} className="text-red-500/50 hover:text-red-400 transition-colors" title="Hapus Jadwal">
                                <Trash2 size={18} />
                              </button>
                              <button onClick={() => toggleTodoComplete(event.id, !event.completed)} className="text-gray-500 hover:text-emerald-400 transition-colors" title="Tandai Selesai/Belum">
                                {event.completed ? <CheckCircle2 size={22} className="text-emerald-500" /> : <Circle size={22} />}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {event.generalNote && <p className={`text-sm mb-4 italic ${event.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>"{event.generalNote}"</p>}
                      
                      {event.activities && event.activities.length > 0 && (
                        <div className="flex flex-col gap-2">
                          {event.activities.map((act, i) => (
                            <div key={i} className={`p-3 rounded-lg border border-white/5 bg-white/5 flex flex-col gap-1 ${event.completed ? 'opacity-50 grayscale' : ''}`}>
                              {act.type === 'produk' ? (
                                <>
                                  <div className="flex justify-between items-start">
                                    <span className="font-semibold text-gray-100">{act.name}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getCategoryColor(act.category)}`}>{act.category}</span>
                                  </div>
                                  <div className="text-sm text-emerald-400 font-medium">Total: {act.totalDose} {act.unit} {act.calcType === 'per_plant' ? `(${act.dosePerPlant} per pohon)` : '(Input Total)'}</div>
                                </>
                              ) : act.type === 'panen' ? (
                                <>
                                  <span className="font-semibold text-amber-400">{act.title}</span>
                                  <div className="flex gap-2 items-center">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 w-fit">Catatan Panen</span>
                                    {act.yield > 0 && <span className="text-xs text-amber-300 font-medium">Hasil: {act.yield} {act.unit}</span>}
                                  </div>
                                </>
                              ) : act.type === 'hama' ? (
                                <>
                                  <span className="font-semibold text-red-400">{act.name}</span>
                                  <div className="flex gap-2 items-center">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 w-fit">Hama/Penyakit</span>
                                    <span className="text-xs text-red-300 font-medium ml-1">Keparahan: {act.severity}</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <span className="font-semibold text-gray-100">{act.title}</span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 w-fit">Perlakuan</span>
                                </>
                              )}
                              {act.note && <div className="text-xs text-gray-400 mt-1">{act.note}</div>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4">
                {inventoryWarning && (
                  <div className="bg-amber-500/20 border border-amber-500/50 text-amber-400 p-3 rounded-lg text-sm flex items-start gap-2">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" /> {inventoryWarning}
                  </div>
                )}
                <div className="bg-forest-bg p-4 rounded-xl border border-white/5">
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Catatan Umum / Cuaca Harian</label>
                  <textarea value={generalNote} onChange={e => setGeneralNote(e.target.value)} className="w-full bg-forest-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none resize-none h-16" />
                </div>
                {activities.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-semibold text-emerald-400 uppercase">Aktivitas Ditambahkan:</h4>
                    {activities.map((act, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-emerald-900/20 border border-emerald-500/20">
                        <div>
                          <span className="font-semibold">{act.type === 'produk' ? act.name : act.type === 'hama' ? act.name : act.title}</span>
                          <span className="text-xs text-gray-400 ml-2">({act.type === 'produk' ? act.totalDose : act.type === 'hama' ? act.severity : 'Perlakuan'})</span>
                        </div>
                        <button onClick={() => handleRemoveActivity(i)} className="text-red-400 hover:text-red-300 p-1"><X size={14}/></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="bg-forest-surface p-4 rounded-xl border border-white/10 border-dashed">
                  <div className="flex gap-2 mb-4 p-1 bg-forest-bg rounded-lg overflow-x-auto">
                    <button onClick={() => {setActivityType('perlakuan'); setActTitle('Pruning');}} className={`shrink-0 flex-1 px-2 py-1.5 text-[10px] sm:text-xs font-bold uppercase rounded-md transition-all ${activityType === 'perlakuan' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>Perlakuan</button>
                    <button onClick={() => setActivityType('produk')} className={`shrink-0 flex-1 px-2 py-1.5 text-[10px] sm:text-xs font-bold uppercase rounded-md transition-all ${activityType === 'produk' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>Produk</button>
                    <button onClick={() => setActivityType('hama')} className={`shrink-0 flex-1 px-2 py-1.5 text-[10px] sm:text-xs font-bold uppercase rounded-md transition-all ${activityType === 'hama' ? 'bg-red-500/20 text-red-400' : 'text-gray-500'}`}>Hama</button>
                  </div>
                  
                  {activityType === 'hama' ? (
                    <div className="flex flex-col gap-3">
                      <CustomSelect 
                        value={selectedPestId} 
                        onChange={setSelectedPestId} 
                        options={pests.map(p => ({ value: p.id.toString(), label: p.name }))}
                        placeholder="Pilih Hama/Penyakit"
                        className="w-full"
                      />
                      {selectedPestId && (
                        <div className="flex flex-col gap-2 p-3 bg-red-900/10 rounded-lg border border-red-500/20">
                          <label className="text-xs text-red-400/80 uppercase font-semibold">Tingkat Keparahan Serangan</label>
                          <CustomSelect 
                            value={pestSeverity} 
                            onChange={setPestSeverity} 
                            options={[
                              { value: 'Ringan', label: 'Ringan' },
                              { value: 'Menengah', label: 'Menengah' },
                              { value: 'Berat', label: 'Berat' }
                            ]}
                            className="w-full text-red-400"
                          />
                        </div>
                      )}
                      <input type="text" placeholder="Catatan tambahan (Opsional)" value={actNote} onChange={e => setActNote(e.target.value)} className="w-full bg-forest-bg border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"/>
                    </div>
                  ) : activityType === 'perlakuan' ? (
                    <div className="flex flex-col gap-3">
                      <CustomSelect 
                        value={actTitle} 
                        onChange={setActTitle} 
                        options={[
                          { value: 'Pruning', label: 'Pruning' },
                          { value: 'Fase Generatif', label: 'Fase Generatif' },
                          { value: 'Panen', label: 'Panen' },
                          { value: 'Lainnya', label: 'Lainnya...' }
                        ]}
                        className="w-full"
                      />
                      {(actTitle === 'Lainnya' || actTitle === 'Panen') && (
                        <input type="text" placeholder={actTitle === 'Panen' ? "Nama Panen (Misal: Panen Ke-1)" : "Masukkan perlakuan lain..."} value={actTitleCustom} onChange={e => setActTitleCustom(e.target.value)} className="w-full bg-forest-bg border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 text-white"/>
                      )}
                      {actTitle === 'Panen' && (
                        <div className="flex gap-2">
                          <input type="number" placeholder="Hasil (Angka)" value={panenYield} onChange={e => setPanenYield(e.target.value)} className="flex-1 bg-forest-bg border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 text-white font-mono"/>
                          <CustomSelect 
                            value={panenUnit} 
                            onChange={setPanenUnit} 
                            options={[
                              { value: 'kg', label: 'kg' },
                              { value: 'g', label: 'g' },
                              { value: 'buah', label: 'buah' }
                            ]}
                            className="w-24"
                          />
                        </div>
                      )}
                      <input type="text" placeholder="Catatan tambahan (opsional)..." value={actNote} onChange={e => setActNote(e.target.value)} className="w-full bg-forest-bg border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"/>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-2">
                        <CustomSelect 
                          value={prodCategoryFilter} 
                          onChange={val => {setProdCategoryFilter(val); setSelectedProductId('');}} 
                          options={productCategories.map(cat => ({ value: cat, label: cat }))}
                          className="w-full"
                        />
                        <CustomSelect 
                          value={selectedProductId} 
                          onChange={setSelectedProductId} 
                          options={filteredInventory.map(inv => ({
                            value: inv.id.toString(),
                            label: `${inv.name} (Sisa: ${inv.stock} ${inv.unit})`
                          }))}
                          placeholder="Pilih Produk"
                          className="w-full"
                        />
                      </div>
                      
                      {selectedProductId && (
                        <div className="flex flex-col gap-2 p-3 bg-black/20 rounded-lg border border-white/5">
                          <label className="text-xs text-gray-400 uppercase font-semibold">Metode Kalkulasi Dosis</label>
                          <div className="flex gap-2">
                            <button onClick={() => setCalcType('per_plant')} className={`flex-1 py-1.5 text-xs rounded border transition-colors ${calcType === 'per_plant' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-transparent border-white/10 text-gray-500 hover:text-white'}`}>Per Pohon</button>
                            <button onClick={() => setCalcType('total')} className={`flex-1 py-1.5 text-xs rounded border transition-colors ${calcType === 'total' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-transparent border-white/10 text-gray-500 hover:text-white'}`}>Total Langsung</button>
                          </div>
                          
                          <div className="mt-2 relative">
                            <input 
                              type="number" 
                              step="0.1"
                              min="0"
                              placeholder={calcType === 'per_plant' ? "Dosis untuk 1 pohon..." : "Total yang digunakan..."} 
                              value={doseInput} 
                              onChange={e => {
                                const val = e.target.value;
                                if (val === '' || parseFloat(val) >= 0) setDoseInput(val);
                              }} 
                              className="w-full bg-forest-bg border border-white/10 rounded-lg pl-3 pr-16 py-2 text-sm outline-none focus:border-emerald-500 font-mono"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">{inventory.find(i=>i.id===parseInt(selectedProductId))?.unit}</span>
                          </div>
                          
                          {doseInput && (
                            <div className="mt-2 text-xs flex justify-between items-center bg-white/5 p-2 rounded">
                              <span className="text-gray-400">Total Kebutuhan:</span>
                              <span className="font-bold text-emerald-400">{calculatedTotal} {inventory.find(i=>i.id===parseInt(selectedProductId))?.unit}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <input type="text" placeholder="Catatan tambahan (Opsional)" value={actNote} onChange={e => setActNote(e.target.value)} className="w-full bg-forest-bg border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"/>
                    </div>
                  )}
                  <button onClick={handleAddActivity} className="w-full mt-3 bg-white/5 border border-white/10 py-2 rounded-lg text-sm text-emerald-400">Tambah</button>
                </div>
              </div>
            )}
            {!isGuest && (
              <div className="mt-4 pt-4 border-t border-white/10 shrink-0">
                {isAddingEvent ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSaveEvent} 
                      disabled={isSaving}
                      className="flex-1 bg-emerald-600 disabled:bg-emerald-800/80 text-white rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin"></span>
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        `Simpan ${isPastOrToday ? 'Riwayat' : 'To-Do'}`
                      )}
                    </button>
                    <button 
                      onClick={() => {setIsAddingEvent(false); setActivities([]); setGeneralNote(''); setEditingEventId(null);}} 
                      disabled={isSaving}
                      className="px-5 bg-forest-bg border border-white/10 text-white rounded-lg py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsAddingEvent(true)} className={`w-full py-3 border border-dashed rounded-xl flex items-center justify-center gap-2 font-medium ${isPastOrToday ? 'border-emerald-500/50 text-emerald-400' : 'border-amber-500/50 text-amber-400'}`}>
                    <Plus size={18} /> {isPastOrToday ? 'Catat Riwayat' : 'Buat To-Do'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 overflow-y-auto py-10" onClick={() => setShowReport(false)}>
          <div className="bg-forest-surface border border-emerald-500/30 rounded-2xl w-full max-w-3xl p-6 shadow-2xl relative mt-auto mb-auto" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowReport(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24}/></button>
            <div className="mb-6 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                <FileText /> Laporan Riwayat Tanaman
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
               <div className="bg-forest-bg p-4 rounded-xl border border-white/5">
                 <h3 className="text-gray-400 text-sm font-semibold mb-2">Identitas</h3>
                 <p className="text-white font-medium mb-1"><span className="text-gray-500 mr-2 text-sm">Nama:</span>{plant.name}</p>
                 <p className="text-white font-medium mb-1"><span className="text-gray-500 mr-2 text-sm">Varietas:</span>{plant.varietas || '-'}</p>
                 <p className="text-white font-medium mb-1"><span className="text-gray-500 mr-2 text-sm">Lokasi:</span>{locationData?.name || 'Belum ditentukan'}</p>
                 <p className="text-white font-medium"><span className="text-gray-500 mr-2 text-sm">Populasi:</span>{plant.plantCount} Pohon</p>
               </div>
               <div className="bg-forest-bg p-4 rounded-xl border border-white/5">
                  <h3 className="text-gray-400 text-sm font-semibold mb-2">Siklus Hidup</h3>
                  <p className="text-white font-medium mb-1"><span className="text-gray-500 mr-2 text-sm">Semai:</span>{plant.sownDate && plant.sownDate !== '-' ? `${plant.sownDate} (${calculateSemaiDuration(plant)} Hari)` : 'Tidak dicatat'}</p>
                  <p className="text-white font-medium mb-1"><span className="text-gray-500 mr-2 text-sm">Tanam:</span>{plant.plantedDate && plant.plantedDate !== '-' ? `${plant.plantedDate} (${calculateTanamDuration(plant)} HST)` : 'Belum/Tidak dicatat'}</p>
                  {plant.plantedDate && plant.plantedDate !== '-' && plant.sownDate && plant.sownDate !== '-' && (
                    <p className="text-white font-medium mb-1"><span className="text-gray-500 mr-2 text-sm">Total Umur:</span>{calculateTotalHSS(plant)} HSS</p>
                  )}
                  <p className="text-white font-medium"><span className="text-gray-500 mr-2 text-sm">Selesai:</span>{plant.completedDate || 'Belum selesai'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Perlakuan */}
              <div className="bg-forest-bg p-4 rounded-xl border border-white/5 max-h-64 overflow-y-auto">
                 <h3 className="text-emerald-400 text-sm font-semibold mb-3 flex items-center gap-2"><Tag size={16}/> Rekap Perlakuan</h3>
                 {getReportData().perlakuan.length === 0 ? <p className="text-gray-500 text-sm">Tidak ada data.</p> : (
                   <ul className="flex flex-col gap-2">
                     {getReportData().perlakuan.map((p) => (
                       <li key={p.title} className="flex justify-between text-sm border-b border-white/5 pb-1 text-gray-300">
                         <span>{p.title}</span>
                         <span className="font-bold text-white">{p.count} kali</span>
                       </li>
                     ))}
                   </ul>
                 )}
              </div>

              {/* Produk */}
              <div className="bg-forest-bg p-4 rounded-xl border border-white/5 max-h-64 overflow-y-auto">
                 <h3 className="text-blue-400 text-sm font-semibold mb-3 flex items-center gap-2"><Droplet size={16}/> Penggunaan Produk</h3>
                 {Object.keys(getReportData().produk).length === 0 ? <p className="text-gray-500 text-sm">Tidak ada data.</p> : (
                   <ul className="flex flex-col gap-3">
                     {Object.entries(getReportData().produk).map(([key, data]) => (
                       <li key={key} className="flex flex-col text-sm border-b border-white/5 pb-2 text-gray-300">
                         <div className="flex justify-between mb-1">
                           <span className="font-semibold text-emerald-300">{key}</span>
                           <span className="font-bold text-white">{data.count} kali</span>
                         </div>
                         <span className="text-[10px] text-gray-500">Tgl: {data.dates.join(', ')}</span>
                       </li>
                     ))}
                   </ul>
                 )}
              </div>

              {/* Panen */}
              <div className="bg-forest-bg p-4 rounded-xl border border-white/5 md:col-span-2">
                 <h3 className="text-orange-400 text-sm font-semibold mb-3 flex items-center gap-2"><Apple size={16}/> Rekap Panen</h3>
                 {getReportData().panen.length === 0 ? <p className="text-gray-500 text-sm">Belum ada panen.</p> : (
                   <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                       <thead>
                         <tr className="text-gray-400 border-b border-white/10">
                           <th className="pb-2">Tanggal</th>
                           <th className="pb-2">Keterangan</th>
                           <th className="pb-2">Hasil Bobot</th>
                         </tr>
                       </thead>
                       <tbody>
                         {getReportData().panen.map((p, idx) => (
                           <tr key={idx} className="border-b border-white/5">
                             <td className="py-2 text-gray-300">{p.date}</td>
                             <td className="py-2 text-gray-300">{p.title}</td>
                             <td className="py-2 font-bold text-orange-400">{p.yield} {p.unit}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                     <div className="mt-3 text-right">
                       <span className="text-gray-400 text-sm">Total Frekuensi Panen: <span className="font-bold text-white">{getReportData().panen.length} kali</span></span>
                       <br/>
                       <span className="text-gray-400 text-sm">Total Hasil Panen: </span>
                       <span className="text-lg font-bold text-orange-500">
                         {getReportData().panen.reduce((sum, p) => sum + parseFloat(p.yield || 0), 0).toFixed(2)}
                       </span>
                     </div>
                   </div>
                 )}
              </div>
              {/* Hama & Penyakit */}
              <div className="bg-forest-bg p-4 rounded-xl border border-white/5 max-h-64 overflow-y-auto">
                 <h3 className="text-red-400 text-sm font-semibold mb-3 flex items-center gap-2"><Bug size={16}/> Serangan Hama/Penyakit</h3>
                 {Object.keys(getReportData().hama || {}).length === 0 ? <p className="text-gray-500 text-sm">Tidak ada data.</p> : (
                   <ul className="flex flex-col gap-3">
                     {Object.entries(getReportData().hama).map(([key, data]) => (
                       <li key={key} className="flex flex-col text-sm border-b border-white/5 pb-2 text-gray-300">
                         <div className="flex justify-between mb-1">
                           <span className="font-semibold text-red-300">{key}</span>
                           <span className="font-bold text-white">{data.count} kali</span>
                         </div>
                         <span className="text-[10px] text-gray-400">Keparahan: {data.severities.join(', ')}</span>
                         <span className="text-[10px] text-gray-500">Tgl: {data.dates.join(', ')}</span>
                       </li>
                     ))}
                   </ul>
                 )}
              </div>
            </div>

          </div>
        </div>
      )}
      {/* Modal Copy Schedule */}
      {isCopyScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-forest-bg border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-blue-400 flex items-center gap-2">
                <Copy size={20} /> Salin Jadwal
              </h3>
              <button onClick={() => setIsCopyScheduleModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">Pilih Tanaman Target</label>
                <CustomSelect
                  value={copyTargetPlantId}
                  onChange={setCopyTargetPlantId}
                  options={[
                    { value: '', label: '-- Pilih Tanaman --' },
                    ...allPlants.filter(p => p.id !== plantId).map(p => ({ value: String(p.id), label: `${p.name} (${p.variety})` }))
                  ]}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">Pilih Tanggal Target</label>
                <input
                  type="date"
                  value={copyTargetDate}
                  onChange={(e) => setCopyTargetDate(e.target.value)}
                  className="w-full bg-forest-surface border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">Pilih Aktivitas yang Disalin</label>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
                  {copyScheduleSourceEvent?.activities?.map((act, idx) => (
                    <label key={idx} className="flex items-start gap-3 p-2 bg-black/20 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={copySelectedActivities.includes(idx)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCopySelectedActivities([...copySelectedActivities, idx]);
                          } else {
                            setCopySelectedActivities(copySelectedActivities.filter(i => i !== idx));
                          }
                        }}
                        className="mt-1 rounded bg-forest-bg border-white/10 text-blue-600 focus:ring-0 w-4 h-4 accent-blue-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-200">{act.title || act.name}</div>
                        {act.notes && <div className="text-xs text-gray-400 truncate">{act.notes}</div>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCopyScheduleModalOpen(false)}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-forest-surface text-gray-300 font-semibold rounded-lg hover:bg-white/5 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveCopySchedule}
                  disabled={isSaving || !copyTargetPlantId || !copyTargetDate || copySelectedActivities.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  {isSaving ? 'Menyimpan...' : 'Salin Jadwal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
