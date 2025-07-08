import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BarChart, Droplet, Beaker, FlaskConical, Sun, Moon, FileText, Bot, Plus, X, ChevronDown, Book, Package, SlidersHorizontal, Settings, Trash2, Upload, Download, AlertCircle, CheckCircle, Info, Wind, Sparkles, Calculator, Percent, TestTube2, ClipboardList, LogIn, LogOut, RefreshCw, Edit, Save, Thermometer, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar } from 'recharts';

// --- HOOK FOR LOCALSTORAGE PERSISTENCE ---
function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null
        ? JSON.parse(stickyValue)
        : defaultValue;
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return defaultValue;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);
  return [value, setValue];
}


// --- INITIAL EXAMPLE DATA (FOR FIRST USE ONLY) ---
const initialInventory = [
  { id: 1, name: 'Nutriente (Fermaid K)', brand: 'Scott Labs', quantity: 100, unit: 'g', expiry: '2026-06-30' },
  { id: 2, name: 'Uva Merlot', brand: 'Viñedo Local', quantity: 25, unit: 'kg', expiry: '2025-09-15' },
  { id: 3, name: 'Azúcar Refinada', brand: 'Genérico', quantity: 5, unit: 'kg', expiry: '2027-01-01' },
];

const initialLots = [
  {
    id: 1,
    name: 'Merlot Experimental 2025',
    creationDate: '2025-07-01',
    yeast: 'EC-1118',
    mosto: { pulpa: 20, pulpaBrix: 22, agua: 5, ph: 3.5 },
    ajustes: { azucar: 1, sgInicial: 1.090, bxInicial: 21.8, tempInicial: 22 },
    ingredientes: [
      { name: 'Nutriente (Fermaid K)', quantity: 5, unit: 'g' },
    ],
    fermentationLog: [
      { id: 1, date: '2025-07-01', sg: 1.090, brix: 21.8, temp: 22, notes: 'Mosto preparado y levadura inoculada.' },
      { id: 2, date: '2025-07-03', sg: 1.075, brix: 18.8, temp: 24, notes: 'Fermentación activa, burbujeo constante.' },
      { id: 3, date: '2025-07-05', sg: 1.050, brix: 12.8, temp: 25, notes: 'Aromas frutales intensos.' },
      { id: 4, date: '2025-07-08', sg: 1.025, brix: 6.5, temp: 23, notes: 'La actividad ha disminuido un poco.' },
      { id: 5, date: '2025-07-12', sg: 1.010, brix: 2.6, temp: 21, notes: 'Fermentación casi completa.' },
      { id: 6, date: '2025-07-15', sg: 0.998, brix: -0.5, temp: 20, notes: 'Fermentación finalizada. Se prepara para el primer trasiego.' },
    ],
    status: 'Completado',
  },
];

// --- UTILITIES ---
const parseNumericInput = (value) => {
    if (typeof value !== 'string') return value;
    let parsed = value.replace(',', '.');
    if (parsed.startsWith('.')) parsed = '0' + parsed;
    return isNaN(parseFloat(parsed)) ? '' : parsed;
};

// --- UI COMPONENTS ---

const Modal = ({ children, isOpen, onClose, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X size={24} />
          </button>
        </header>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const CrearItemInventarioModal = ({ onSave, onClose, itemToEdit }) => {
    const [item, setItem] = useState({ name: '', brand: '', quantity: '', unit: 'g', expiry: '' });

    useEffect(() => {
        if (itemToEdit) setItem(itemToEdit);
    }, [itemToEdit]);
    
    const handleSave = (e) => {
        e.preventDefault();
        onSave({ ...item, id: item.id || `item-${Date.now()}` });
    };

    return (
        <form onSubmit={handleSave} className="space-y-4">
            <input type="text" placeholder="Nombre del ingrediente" value={item.name} onChange={e => setItem({...item, name: e.target.value})} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2" required/>
            <input type="text" placeholder="Marca (opcional)" value={item.brand} onChange={e => setItem({...item, brand: e.target.value})} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2"/>
            <div className="flex gap-2">
                <input type="number" placeholder="Cantidad en stock" value={item.quantity} onChange={e => setItem({...item, quantity: parseNumericInput(e.target.value)})} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2" required/>
                <select value={item.unit} onChange={e => setItem({...item, unit: e.target.value})} className="bg-gray-100 dark:bg-gray-700 rounded-md p-2">
                    <option>g</option><option>kg</option><option>mL</option><option>L</option><option>unidades</option>
                </select>
            </div>
            <input type="date" value={item.expiry} onChange={e => setItem({...item, expiry: e.target.value})} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2" />
            <div className="flex justify-end gap-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Guardar</button>
            </div>
        </form>
    );
};


const CrearLoteForm = ({ onSave, onClose, inventory, batchToEdit }) => {
  const [lote, setLote] = useState({
    name: '',
    creationDate: new Date().toISOString().split('T')[0],
    mosto: { pulpa: '', pulpaBrix: '', agua: '', ph: '' },
    ajustes: { azucar: '', sgInicial: '', bxInicial: '', tempInicial: '' },
    ingredientes: [],
    yeast: '',
  });

  useEffect(() => {
    if (batchToEdit) {
        setLote(batchToEdit);
    }
  }, [batchToEdit]);

  const handleInputChange = (category, field, value) => {
    const parsedValue = parseNumericInput(value);
    setLote(prev => ({ ...prev, [category]: { ...prev[category], [field]: parsedValue } }));
  };
  
  const handleAddIngrediente = () => {
    setLote(prev => ({ ...prev, ingredientes: [...prev.ingredientes, { id: Date.now(), name: '', quantity: '', unit: 'g' }] }));
  };

  const handleIngredienteChange = (index, field, value) => {
    const newIngredientes = [...lote.ingredientes];
    newIngredientes[index][field] = value;
    const selectedItem = inventory.find(item => item.name === value);
    if (selectedItem) newIngredientes[index].unit = selectedItem.unit;
    setLote(prev => ({ ...prev, ingredientes: newIngredientes }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const loteData = batchToEdit ? { ...lote } : {
        ...lote,
        id: lote.id || Date.now(),
        fermentationLog: lote.fermentationLog && lote.fermentationLog.length > 0 ? lote.fermentationLog : [{
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            sg: lote.ajustes.sgInicial,
            brix: lote.ajustes.bxInicial,
            temp: lote.ajustes.tempInicial,
            notes: 'Lote creado.'
        }],
        status: lote.status || 'En Preparación'
    };
    onSave(loteData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium">Nombre del Lote</label>
          <input type="text" value={lote.name} onChange={e => setLote({...lote, name: e.target.value})} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2" required />
        </div>
        <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Composición del Mosto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Pulpa/Fruta (kg)" value={lote.mosto.pulpa} onChange={e => handleInputChange('mosto', 'pulpa', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2" />
                <input type="text" placeholder="°Brix de la pulpa" value={lote.mosto.pulpaBrix} onChange={e => handleInputChange('mosto', 'pulpaBrix', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2" />
                <input type="text" placeholder="Agua añadida (L)" value={lote.mosto.agua} onChange={e => handleInputChange('mosto', 'agua', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2" />
                <input type="text" placeholder="pH inicial" value={lote.mosto.ph} onChange={e => handleInputChange('mosto', 'ph', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2" />
            </div>
        </div>
        
        <div className="p-4 border rounded-lg space-y-2">
            <h3 className="text-lg font-semibold">Levadura</h3>
            <input type="text" placeholder="Nombre de la levadura (ej. EC-1118)" value={lote.yeast} onChange={e => setLote(prev => ({...prev, yeast: e.target.value}))} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2" required/>
        </div>

        <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Otros Ingredientes</h3>
            {lote.ingredientes.map((ing, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                    <select value={ing.name} onChange={e => handleIngredienteChange(index, 'name', e.target.value)} className="flex-grow bg-gray-100 dark:bg-gray-700 rounded-md p-2">
                        <option value="">Seleccionar ingrediente</option>
                        {inventory.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                    </select>
                    <input type="text" placeholder="Cant." value={ing.quantity} onChange={e => handleIngredienteChange(index, 'quantity', e.target.value)} className="w-20 bg-gray-100 dark:bg-gray-700 rounded-md p-2" />
                    <input type="text" value={ing.unit} readOnly className="w-16 bg-gray-200 dark:bg-gray-600 rounded-md p-2 text-center" />
                    <button type="button" onClick={() => setLote(prev => ({...prev, ingredientes: prev.ingredientes.filter((_, i) => i !== index)}))} className="text-red-500 p-2"><Trash2 size={18}/></button>
                </div>
            ))}
            <button type="button" onClick={handleAddIngrediente} className="mt-2 text-sm text-indigo-600">Añadir Ingrediente</button>
        </div>
        <div className="mt-8 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white">{batchToEdit ? 'Actualizar Lote' : 'Guardar Lote'}</button>
        </div>
    </form>
  );
};


const LoteDetalle = ({ lote, onUpdate, onClose, onAnalyze, onEdit, onDelete }) => {
  const [newLog, setNewLog] = useState({ date: new Date().toISOString().split('T')[0], sg: '', brix: '', temp: '', notes: '' });
  const [editingLog, setEditingLog] = useState(null);
  const [activeTab, setActiveTab] = useState('grafica');
  const [graphMode, setGraphMode] = useState('sg');

  const formulation = useMemo(() => {
    const pulpaKg = parseFloat(lote.mosto.pulpa) || 0;
    const aguaL = parseFloat(lote.mosto.agua) || 0;
    const azucarKg = parseFloat(lote.ajustes.azucar) || 0;
    const totalVolumeL = aguaL + (pulpaKg * 0.7); // Approximation: 1kg fruit ~ 0.7L volume
    const totalWeightKg = pulpaKg + aguaL + azucarKg;
    
    const pulpaPercent = totalWeightKg > 0 ? (pulpaKg / totalWeightKg) * 100 : 0;

    const getConcentration = (item) => {
        if (!item || totalVolumeL === 0) return 'N/A';
        let amountInGrams = parseFloat(item.quantity) || 0;
        if (item.unit === 'kg') amountInGrams *= 1000;
        return `${(amountInGrams / totalVolumeL).toFixed(2)} g/L`;
    };

    return { pulpaPercent, totalVolumeL, getConcentration };
  }, [lote]);

  const handleLogChange = (field, value) => {
    const stateToUpdate = editingLog ? setEditingLog : setNewLog;
    const originalLog = editingLog || newLog;
    const updatedLog = { ...originalLog, [field]: parseNumericInput(value) };
    stateToUpdate(updatedLog);
  };

  const handleSaveLog = (e) => {
    e.preventDefault();
    let updatedLogs;
    if (editingLog) {
        updatedLogs = lote.fermentationLog.map(log => log.id === editingLog.id ? editingLog : log);
        setEditingLog(null);
    } else {
        const logToAdd = { ...newLog, id: Date.now() };
        updatedLogs = [...lote.fermentationLog, logToAdd];
    }
    onUpdate({ ...lote, fermentationLog: updatedLogs.sort((a,b) => new Date(a.date) - new Date(b.date)) });
    setNewLog({ date: new Date().toISOString().split('T')[0], sg: '', brix: '', temp: '', notes: '' });
  };

  const handleDeleteLog = (logId) => {
    if (window.confirm('¿Seguro que quieres eliminar este registro?')) {
        const updatedLogs = lote.fermentationLog.filter(log => log.id !== logId);
        onUpdate({ ...lote, fermentationLog: updatedLogs });
    }
  };
  
  const handleStatusChange = (e) => {
    onUpdate({ ...lote, status: e.target.value });
  };
  
  const graphData = useMemo(() => {
    if (!lote || !lote.fermentationLog) return [];
    return lote.fermentationLog.map(log => ({
        ...log,
        sg: parseFloat(log.sg) || 0,
        brix: parseFloat(log.brix) || 0,
        temp: parseFloat(log.temp) || 0
    }));
  }, [lote.fermentationLog]);

  const TabButton = ({ id, label }) => (
    <button onClick={() => setActiveTab(id)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
        {label}
    </button>
  );

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Estado del Lote</h3>
            <select value={lote.status} onChange={handleStatusChange} className="bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-sm">
                <option>En Preparación</option><option>En Fermentación</option><option>Completado</option>
            </select>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
            <nav className="-mb-px flex space-x-4"><TabButton id="grafica" label="Gráfica"/><TabButton id="formulacion" label="Formulación"/><TabButton id="registros" label="Registros"/></nav>
        </div>

        {activeTab === 'grafica' && (
            <div className="w-full h-64 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                <div className="flex justify-end mb-2">
                    <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                        <button onClick={() => setGraphMode('sg')} className={`px-2 py-1 text-xs rounded-md ${graphMode === 'sg' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>SG</button>
                        <button onClick={() => setGraphMode('brix')} className={`px-2 py-1 text-xs rounded-md ${graphMode === 'brix' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>Brix</button>
                    </div>
                </div>
                <LineChart width={550} height={230} data={graphData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                    <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
                    <YAxis yAxisId="left" dataKey={graphMode} tick={{ fill: '#8884d8' }} />
                    <YAxis yAxisId="right" orientation="right" dataKey="temp" tick={{ fill: '#82ca9d' }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey={graphMode} name={graphMode.toUpperCase()} stroke="#8884d8" dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="temp" name="Temp (°C)" stroke="#82ca9d" dot={false} />
                </LineChart>
            </div>
        )}

        {activeTab === 'formulacion' && (
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg space-y-3">
                <h4 className="text-lg font-semibold">Receta del Lote (Vol. ~{formulation.totalVolumeL.toFixed(2)}L)</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    <li><b>Pulpa:</b> {lote.mosto.pulpa} kg ({formulation.pulpaPercent.toFixed(1)}% del peso)</li>
                    <li><b>Agua:</b> {lote.mosto.agua} L</li>
                    <li><b>Azúcar:</b> {lote.ajustes.azucar} kg</li>
                    <li><b>Levadura:</b> {lote.yeast}</li>
                    {lote.ingredientes.map((ing, i) => (
                        <li key={i}><b>{ing.name}:</b> {ing.quantity} {ing.unit} ({formulation.getConcentration(ing)})</li>
                    ))}
                </ul>
            </div>
        )}

        {activeTab === 'registros' && (
            <>
            <div className="mb-6">
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {lote.fermentationLog.map((log) => (
                        <div key={log.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{new Date(log.date).toLocaleDateString()} - SG: {log.sg}, Brix: {log.brix}, Temp: {log.temp}°C</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{log.notes}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingLog(log)} className="p-1 text-blue-500 hover:text-blue-700"><Edit size={16}/></button>
                                <button onClick={() => handleDeleteLog(log.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <form onSubmit={handleSaveLog} className="p-4 border border-dashed rounded-lg space-y-3">
                <h4 className="font-semibold">{editingLog ? 'Editando Registro' : 'Añadir Nuevo Registro'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input type="date" value={editingLog ? editingLog.date : newLog.date} onChange={e => handleLogChange('date', e.target.value)} className="bg-gray-100 dark:bg-gray-700 rounded-md p-2" />
                    <input type="text" placeholder="SG" value={editingLog ? editingLog.sg : newLog.sg} onChange={e => handleLogChange('sg', e.target.value)} className="bg-gray-100 dark:bg-gray-700 rounded-md p-2" />
                    <input type="text" placeholder="Brix" value={editingLog ? editingLog.brix : newLog.brix} onChange={e => handleLogChange('brix', e.target.value)} className="bg-gray-100 dark:bg-gray-700 rounded-md p-2" />
                    <input type="text" placeholder="Temp °C" value={editingLog ? editingLog.temp : newLog.temp} onChange={e => handleLogChange('temp', e.target.value)} className="bg-gray-100 dark:bg-gray-700 rounded-md p-2" required />
                </div>
                <textarea placeholder="Notas..." value={editingLog ? editingLog.notes : newLog.notes} onChange={e => handleLogChange('notes', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2 h-16"></textarea>
                <div className="flex justify-end gap-2">
                    {editingLog && <button type="button" onClick={() => setEditingLog(null)} className="px-4 py-2 text-sm rounded-lg bg-gray-300 dark:bg-gray-600">Cancelar Edición</button>}
                    <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white flex items-center gap-2"><Save size={16}/> {editingLog ? 'Actualizar' : 'Añadir'}</button>
                </div>
            </form>
            </>
        )}
        
        <div className="mt-8 flex flex-wrap justify-end gap-3">
            <button onClick={() => onAnalyze(lote)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white"><Bot size={18} /> Analizar</button>
            <button onClick={() => onEdit(lote)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 text-white"><Edit size={18} /> Editar</button>
            <button onClick={() => onDelete(lote)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white"><Trash2 size={18} /> Eliminar</button>
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600">Cerrar</button>
        </div>
    </div>
  )
}

const LotesView = ({ lotes, setLotes, inventory, onAnalyze }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBatch, setEditingBatch] = useState(null);
    const [selectedLote, setSelectedLote] = useState(null);

    const handleSaveLote = (loteData) => {
        if (lotes.some(l => l.id === loteData.id)) {
            setLotes(lotes.map(l => l.id === loteData.id ? loteData : l));
        } else {
            setLotes([...lotes, loteData]);
        }
        setIsFormOpen(false);
        setEditingBatch(null);
    };

    const handleEdit = (batch) => {
        setEditingBatch(batch);
        setSelectedLote(null);
        setIsFormOpen(true);
    };

    const handleDelete = (batch) => {
        if (window.confirm(`¿Seguro que quieres eliminar el lote "${batch.name}"?`)) {
            setLotes(lotes.filter(l => l.id !== batch.id));
            setSelectedLote(null);
        }
    };
    
    const handleUpdateLote = (updatedLote) => {
        const newLotes = lotes.map(l => l.id === updatedLote.id ? updatedLote : l);
        setLotes(newLotes);
        if (selectedLote && selectedLote.id === updatedLote.id) {
            setSelectedLote(updatedLote);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'En Fermentación': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'Completado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'En Preparación': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gestión de Lotes</h1>
                <button onClick={() => { setEditingBatch(null); setIsFormOpen(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700">
                    <Plus size={20} /> Crear Lote
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lotes.map(lote => {
                    const lastLog = lote.fermentationLog && lote.fermentationLog.length > 0
                        ? lote.fermentationLog[lote.fermentationLog.length - 1]
                        : null;
                    
                    return (
                        <div key={lote.id} onClick={() => setSelectedLote(lote)} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg hover:shadow-xl cursor-pointer flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white w-2/3">{lote.name}</h2>
                                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full h-min ${getStatusColor(lote.status)}`}>{lote.status}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Levadura: <span className="font-semibold">{lote.yeast || 'N/A'}</span></p>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 flex justify-around text-center">
                                <div>
                                    <p className="text-xs text-gray-500">SG Actual</p>
                                    <p className="font-bold text-lg">{lastLog ? lastLog.sg : 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Brix Actual</p>
                                    <p className="font-bold text-lg">{lastLog ? lastLog.brix : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <Modal isOpen={isFormOpen} onClose={() => {setIsFormOpen(false); setEditingBatch(null);}} title={editingBatch ? "Editar Lote" : "Crear Nuevo Lote"}>
                <CrearLoteForm onSave={handleSaveLote} onClose={() => {setIsFormOpen(false); setEditingBatch(null);}} inventory={inventory} batchToEdit={editingBatch} />
            </Modal>
            <Modal isOpen={!!selectedLote} onClose={() => setSelectedLote(null)} title={`Detalle: ${selectedLote?.name}`}>
                {selectedLote && <LoteDetalle lote={selectedLote} onUpdate={handleUpdateLote} onClose={() => setSelectedLote(null)} onAnalyze={onAnalyze} onEdit={handleEdit} onDelete={handleDelete} />}
            </Modal>
        </div>
    );
};

const InventarioView = ({ inventory, setInventory }) => {
    const [isAdding, setIsAdding] = useState(false);

    const handleSaveItem = (item) => {
        setInventory(prev => [...prev.filter(i => i.id !== item.id), item]);
        setIsAdding(false);
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Inventario</h1>
                <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700">
                    <Plus size={20} /> Añadir Artículo
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700"><tr className="bg-gray-50 dark:bg-gray-700"><th className="p-4">Artículo</th><th className="p-4">Marca</th><th className="p-4">Cantidad</th><th className="p-4">Vencimiento</th></tr></thead>
                    <tbody>{inventory.map(item => (<tr key={item.id} className="border-b"><td className="p-4">{item.name}</td><td className="p-4">{item.brand}</td><td className="p-4">{item.quantity} {item.unit}</td><td className="p-4">{item.expiry}</td></tr>))}</tbody>
                </table>
            </div>
            <Modal isOpen={isAdding} onClose={() => setIsAdding(false)} title="Añadir Artículo al Inventario">
                <CrearItemInventarioModal onSave={handleSaveItem} onClose={() => setIsAdding(false)} />
            </Modal>
        </div>
    );
};

const VinopediaView = () => {
    const glossary = {
        "Vino": "Bebida resultante de la fermentación alcohólica (total o parcial) de la uva fresca o de sus mostos. Grado alcohólico entre 7° y 14° G.L.",
        "Mosto": "Jugo de uva obtenido por medios físicos, que aún no ha fermentado o cuya fermentación ha sido detenida.",
        "Acidez Total": "Medida de todos los ácidos presentes en el vino (tartárico, málico, cítrico, etc.). Mínimo 4.00 g/L (expresado en Ác. Tartárico).",
        "Acidez Volátil": "Ácidos volátiles, principalmente ácido acético. Un exceso indica contaminación. Máximo 1.00 g/L para vinos de mesa y 1.20 g/L para vinos licorosos.",
        "Anhídrido Sulfuroso (SO2)": "Conservante y antioxidante. Máximo total de 0.25 g/L.",
        "Trasiego": "Transferir el vino de un recipiente a otro para separarlo de los sedimentos (lías), clarificándolo.",
        "Lías": "Levaduras muertas y otros sólidos que se depositan en el fondo tras la fermentación.",
        "Licor de Tiraje": "Mezcla de vino, azúcar y levaduras que se añade para iniciar la segunda fermentación en botella (vinos espumosos).",
        "Licor de Expedición": "Dosis de vino y azúcar que se añade tras el degüelle para ajustar el dulzor final de un vino espumoso.",
    };

    const sugarClassifications = [
        { name: 'Seco', range: 'Hasta 5 g/L' },
        { name: 'Semiseco o Abocado', range: '> 5 a 55 g/L' },
        { name: 'Dulce o Generoso', range: '> 55 g/L' },
    ];
     const sparklingClassifications = [
        { name: 'Natural o Nature', range: '0 a 6 g/L' },
        { name: 'Brut', range: '> 6 a 15 g/L' },
        { name: 'Semiseco o Demi-Sec', range: '> 15 a 45 g/L' },
        { name: 'Dulce', range: '> 45 g/L' },
    ];
    const alcoholClassifications = [
        { name: 'Vino de Mesa', range: '7° a 14° G.L.'},
        { name: 'Vino Desalcoholizado', range: 'Hasta 5° G.L.'},
        { name: 'Vino Soda', range: '3° a 5° G.L.'},
        { name: 'Vino Licoroso', range: '> 14° a 20° G.L.'},
        { name: 'Vino Compuesto', range: '> 14° a 20° G.L.'},
        { name: 'Destilado de Uva', range: '30° a 43° G.L.'},
        { name: 'Brandy', range: '40° a 50° G.L.'},
    ];

    const ClassificationTable = ({ title, data, icon }) => (
        <div>
            <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{icon}{title}</h3>
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Clasificación</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Rango</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                        {data.map(c => (
                            <tr key={c.name} className="border-t border-gray-200 dark:border-gray-700">
                                <td className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200">{c.name}</td>
                                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{c.range}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Vinopedia (Basado en COVENIN 3342-97)</h1>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Glosario del Enólogo</h2>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-3">
                    {Object.entries(glossary).map(([term, definition]) => (
                        <div key={term}>
                            <h3 className="font-bold text-gray-900 dark:text-white">{term}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{definition}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <ClassificationTable title="Clasificación por Azúcar" data={sugarClassifications} icon={<Percent size={22} className="text-purple-500"/>} />
               <ClassificationTable title="Clasificación por Azúcar (Espumosos)" data={sparklingClassifications} icon={<Sparkles size={22} className="text-amber-500"/>} />
            </div>
            <ClassificationTable title="Clasificación por Grado Alcohólico" data={alcoholClassifications} icon={<TestTube2 size={22} className="text-red-500"/>} />
        </div>
    );
};

const AjustesView = ({ theme, setTheme, onImport, onExport }) => {
    const fileInputRef = useRef(null);

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                onImport(data);
            } catch (error) {
                alert(`Error al leer el archivo JSON: ${error.message}`);
            }
        };
        reader.readAsText(file);
        event.target.value = null; // Reset input
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Ajustes</h1>
            <div className="space-y-6 max-w-2xl">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Tema de la Aplicación</h2>
                    <div className="flex items-center gap-4">
                        <p className="text-gray-600 dark:text-gray-300">Selecciona tu tema preferido:</p>
                        <button onClick={() => setTheme('light')} className={`p-2 rounded-full ${theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}><Sun /></button>
                        <button onClick={() => setTheme('dark')} className={`p-2 rounded-full ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}><Moon /></button>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Portabilidad de Datos</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Importa o exporta todos tus datos (lotes e inventario) en formato JSON.</p>
                    <div className="flex gap-4">
                         <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                        <button onClick={handleImportClick} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            <Upload size={18} /> Importar desde JSON
                        </button>
                        <button onClick={onExport} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            <Download size={18} /> Exportar a JSON
                        </button>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Almacenamiento de Datos</h2>
                    <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                         <Info size={20} className="text-blue-500 flex-shrink-0 mt-1" />
                         <p className="text-sm text-blue-800 dark:text-blue-200">
                             Tus datos se guardan automáticamente en el almacenamiento de tu navegador. No es necesario seleccionar una carpeta. Para crear copias de seguridad o mover tus datos a otro dispositivo, utiliza la función de "Exportar a JSON".
                         </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AIReportView = ({ response }) => {
    const sections = useMemo(() => {
        if (!response) return [];
        const parsed = {
            estado: { title: "Estado Actual", icon: <CheckCircle className="text-green-500"/>, content: "No disponible." },
            cata: { title: "Notas de Cata", icon: <Beaker className="text-yellow-500"/>, content: "No disponible." },
            pasos: { title: "Próximos Pasos", icon: <SlidersHorizontal className="text-blue-500"/>, content: "No disponible." },
            consejos: { title: "Consejo del Enólogo", icon: <Info className="text-purple-500"/>, content: "No disponible." }
        };
        
        const lines = response.split('\n');
        let currentSection = null;

        lines.forEach(line => {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes("análisis del estado actual") || lowerLine.includes("estado actual")) currentSection = "estado";
            else if (lowerLine.includes("notas de cata")) currentSection = "cata";
            else if (lowerLine.includes("próximos pasos")) currentSection = "pasos";
            else if (lowerLine.includes("consejo") || lowerLine.includes("maridajes")) currentSection = "consejos";
            
            if (currentSection && line.trim().length > 0 && !line.includes("**")) {
                if (parsed[currentSection].content === "No disponible.") parsed[currentSection].content = "";
                parsed[currentSection].content += line.replace(/(\*|-)\s*/g, '') + "\n";
            }
        });
        
        return Object.values(parsed);
    }, [response]);

    return (
        <div className="space-y-4">
            {sections.map((section, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        {section.icon} {section.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap text-sm">{section.content.trim()}</p>
                </div>
            ))}
        </div>
    );
};


// --- MAIN APP COMPONENT ---
export default function App() {
  const [theme, setTheme] = useStickyState('light', 'vinoapp-theme');
  const [view, setView] = useState('lotes');
  const [lotes, setLotes] = useStickyState(initialLots, "vinoapp-lotes");
  const [inventory, setInventory] = useStickyState(initialInventory, "vinoapp-inventory");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [aiResponse, setAiResponse] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleAnalyzeWithAI = async (lote) => {
    setIsAiModalOpen(true);
    setIsLoadingAi(true);
    setAiResponse('');

    const prompt = `
      Eres un enólogo experto y asistente de IA. Tu tono es amigable y educativo.
      Analiza el siguiente lote de vino y proporciona un informe conciso y moderno en secciones claras.
      
      **Formato de Respuesta Requerido:**
      **Análisis del Estado Actual:** Breve resumen del progreso. ¿Va bien? ¿Hay alertas?
      **Notas de Cata Sugeridas:** Describe el perfil de aroma y sabor esperado (frutas, especias, notas terrosas, etc.) y la posible sensación en boca (cuerpo, acidez, taninos) basado en los ingredientes.
      **Próximos Pasos:** Recomendación clara y directa.
      **Consejo del Enólogo:** Un consejo educativo o un dato interesante relacionado con el estado o los ingredientes del lote.

      **Datos del Lote:**
      - Nombre: ${lote.name}
      - Estado: ${lote.status}
      - Registro de Fermentación más reciente: SG: ${lote.fermentationLog[lote.fermentationLog.length - 1].sg}, Temp: ${lote.fermentationLog[lote.fermentationLog.length - 1].temp}°C
      - Ingredientes: ${lote.ingredientes.map(i => i.name).join(', ')}.
    `;

    try {
        const payload = { contents: [{ parts: [{ text: prompt }] }] };
        const apiKey = ""; // La API Key se gestiona automáticamente en el entorno de ejecución
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Error en la API: ${response.statusText}`);
        const result = await response.json();
        
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            setAiResponse(result.candidates[0].content.parts[0].text);
        } else {
            setAiResponse("No se pudo obtener una respuesta de la IA. Inténtalo de nuevo.");
        }
    } catch (error) {
        setAiResponse(`Error al contactar la IA: ${error.message}.`);
    } finally {
        setIsLoadingAi(false);
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleImportData = (data) => {
    if (data.lotes) setLotes(data.lotes);
    if (data.inventory) setInventory(data.inventory);
    alert("Datos importados con éxito.");
  };

  const handleExportData = () => {
    const data = { lotes, inventory, exportDate: new Date().toISOString() };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `vinoapp_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const menuItems = [
    { id: 'lotes', label: 'Lotes', icon: BarChart },
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'vinopedia', label: 'Vinopedia', icon: Book },
    { id: 'ajustes', label: 'Ajustes', icon: Settings },
  ];

  const renderView = () => {
    switch (view) {
      case 'lotes': return <LotesView lotes={lotes} setLotes={setLotes} inventory={inventory} onAnalyze={handleAnalyzeWithAI} />;
      case 'inventario': return <InventarioView inventory={inventory} setInventory={setInventory} />;
      case 'vinopedia': return <VinopediaView />;
      case 'ajustes': return <AjustesView theme={theme} setTheme={setTheme} onImport={handleImportData} onExport={handleExportData} />;
      default: return <LotesView lotes={lotes} setLotes={setLotes} inventory={inventory} onAnalyze={handleAnalyzeWithAI} />;
    }
  };

  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans`}>
      <aside className={`bg-white dark:bg-gray-800 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className={`flex items-center p-4 h-16 border-b border-gray-200 dark:border-gray-700 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          <div className={`flex items-center gap-2 ${!isSidebarOpen && 'hidden'}`}>
            <Droplet className="text-indigo-500" />
            <span className="text-xl font-bold">VinoApp</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"><SlidersHorizontal size={20} /></button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {menuItems.map(item => (
            <a key={item.id} href="#" onClick={(e) => { e.preventDefault(); setView(item.id); }}
              className={`flex items-center gap-3 p-3 rounded-lg ${view === item.id ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <item.icon size={22} />
              <span className={`${!isSidebarOpen && 'hidden'}`}>{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {renderView()}
      </main>
       <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="Análisis con IA de Gemini">
        {isLoadingAi ? (
          <div className="text-center p-8">
            <Bot size={48} className="animate-pulse text-purple-500 mx-auto mb-4" />
            <p className="text-lg">Consultando al enólogo virtual...</p>
          </div>
        ) : (
          <AIReportView response={aiResponse} />
        )}
      </Modal>
    </div>
  );
}
