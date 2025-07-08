import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { BarChart, Droplet, Beaker, FlaskConical, Sun, Moon, FileText, Bot, Plus, X, ChevronDown, Book, Package, SlidersHorizontal, Settings, Trash2, Upload, Download, AlertCircle, CheckCircle, Info, Wind, Sparkles, Calculator, Percent, TestTube2, ClipboardList, LogIn, LogOut, RefreshCw, Edit } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- DATOS INICIALES DE EJEMPLO ---
const initialInventory = [
  { id: 1, name: 'Levadura EC-1118', brand: 'Lalvin', quantity: 50, unit: 'g', expiry: '2025-12-31' },
  { id: 2, name: 'Nutriente (Fermaid K)', brand: 'Scott Labs', quantity: 100, unit: 'g', expiry: '2026-06-30' },
  { id: 3, name: 'Uva Merlot', brand: 'Viñedo Local', quantity: 25, unit: 'kg', expiry: '2025-09-15' },
  { id: 4, name: 'Azúcar Refinada', brand: 'Genérico', quantity: 5, unit: 'kg', expiry: '2027-01-01' },
  { id: 5, name: 'Ácido Cítrico', brand: 'Genérico', quantity: 200, unit: 'g', expiry: '2026-01-01' },
  { id: 6, name: 'Enzima Péctica', brand: 'Genérico', quantity: 50, unit: 'g', expiry: '2026-01-01' },
];

const initialLots = [
  {
    id: 1,
    name: 'Merlot Experimental 2025',
    creationDate: '2025-07-01',
    mosto: { pulpa: 20, pulpaBrix: 22, agua: 5, ph: 3.5 },
    ajustes: { azucar: 1, sgInicial: 1.090, bxInicial: 21.8, tempInicial: 22 },
    ingredientes: [
      { name: 'Levadura EC-1118', quantity: 10, unit: 'g' },
      { name: 'Nutriente (Fermaid K)', quantity: 5, unit: 'g' },
    ],
    fermentationLog: [
      { date: '2025-07-01', sg: 1.090, temp: 22, notes: 'Mosto preparado y levadura inoculada.' },
      { date: '2025-07-03', sg: 1.075, temp: 24, notes: 'Fermentación activa, burbujeo constante.' },
      { date: '2025-07-05', sg: 1.050, temp: 25, notes: 'Aromas frutales intensos.' },
      { date: '2025-07-08', sg: 1.025, temp: 23, notes: 'La actividad ha disminuido un poco.' },
      { date: '2025-07-12', sg: 1.010, temp: 21, notes: 'Fermentación casi completa.' },
      { date: '2025-07-15', sg: 0.998, temp: 20, notes: 'Fermentación finalizada. Se prepara para el primer trasiego.' },
    ],
    status: 'Completado',
  },
  {
    id: 2,
    name: 'Hidromiel con Naranja',
    creationDate: '2025-07-10',
    mosto: { pulpa: 0, pulpaBrix: 0, agua: 18, ph: 4.0 },
    ajustes: { azucar: 5, sgInicial: 1.105, bxInicial: 25, tempInicial: 20 },
    ingredientes: [
        { name: 'Miel Pura', quantity: 5, unit: 'kg' },
        { name: 'Levadura D-47', quantity: 8, unit: 'g' },
    ],
    fermentationLog: [
      { date: '2025-07-10', sg: 1.105, temp: 20, notes: 'Iniciado.' },
      { date: '2025-07-14', sg: 1.088, temp: 21, notes: 'Actividad vigorosa.' },
    ],
    status: 'En Fermentación',
  }
];

// --- UTILIDADES ---
const parseNumericInput = (value) => {
    if (typeof value !== 'string') return value;
    let parsed = value.replace(',', '.');
    if (parsed.startsWith('.')) {
        parsed = '0' + parsed;
    }
    return parsed;
};

const sgToBrix = (sg) => (259.3 * sg - 259.3) / sg;
const brixToSg = (brix) => (brix / (259.3 - 0.8493 * brix)) + 1;

// --- COMPONENTES DE LA UI ---

const WelcomeScreen = ({ theme }) => {
    return (
        <div className={`fixed inset-0 z-[100] flex flex-col justify-end items-center text-white overflow-hidden`}>
            <style>{`
                .welcome-container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    background-color: ${theme === 'dark' ? '#111827' : '#f9fafb'};
                    animation: fade-out-container 1s ease-out 4.5s forwards;
                }
                .wine-svg {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                .wine-fill {
                    fill: #701a2e;
                    transform-origin: bottom;
                    animation: fill-up 3s ease-in-out forwards;
                }
                @keyframes fill-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0%); }
                }
                .welcome-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    color: rgba(255, 255, 255, 0.9);
                    animation: text-fade-in 2s ease-in 1.5s forwards;
                    opacity: 0;
                }
                @keyframes text-fade-in {
                    to { opacity: 1; }
                }
                @keyframes fade-out-container {
                    to { opacity: 0; pointer-events: none; }
                }
            `}</style>
            <div className="welcome-container">
                <svg className="wine-svg" preserveAspectRatio="none" viewBox="0 0 1440 800">
                    <path className="wine-fill" transform="translate(0, 0)">
                         <animate attributeName="d" dur="4s" repeatCount="indefinite" values="M0,800 L1440,800 L1440,100 C1120,140 800,60 480,100 C160,140 0,60 0,100 Z; M0,800 L1440,800 L1440,100 C1120,60 800,140 480,100 C160,60 0,140 0,100 Z; M0,800 L1440,800 L1440,100 C1120,140 800,60 480,100 C160,140 0,60 0,100 Z;" />
                    </path>
                </svg>
                <div className="welcome-text">
                    <h1 className="text-6xl font-bold mb-2">VinoApp</h1>
                    <p className="text-2xl">Tu asistente de vinificación</p>
                </div>
            </div>
        </div>
    );
};

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

const CrearIngredienteModal = ({ onSave, onClose }) => {
    const [item, setItem] = useState({ name: '', brand: '', quantity: '', unit: 'g', expiry: '' });
    
    const handleSave = (e) => {
        e.preventDefault();
        onSave({ ...item, id: Date.now() });
    };

    return (
        <form onSubmit={handleSave} className="space-y-4">
            <input type="text" placeholder="Nombre del ingrediente" value={item.name} onChange={e => setItem({...item, name: e.target.value})} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2" required/>
            <input type="text" placeholder="Marca (opcional)" value={item.brand} onChange={e => setItem({...item, brand: e.target.value})} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2"/>
            <div className="flex gap-2">
                <input type="number" placeholder="Cantidad en stock" value={item.quantity} onChange={e => setItem({...item, quantity: parseNumericInput(e.target.value)})} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2" required/>
                <select value={item.unit} onChange={e => setItem({...item, unit: e.target.value})} className="bg-gray-100 dark:bg-gray-700 rounded-md p-2">
                    <option>g</option><option>kg</option><option>mL</option><option>L</option>
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

const CrearLoteForm = ({ onSave, onClose, inventory, onInventoryUpdate, batchToEdit }) => {
  const [lote, setLote] = useState({
    name: '',
    creationDate: new Date().toISOString().split('T')[0],
    mosto: { pulpa: '', pulpaBrix: '', agua: '', ph: '' },
    ajustes: { azucar: '', sgInicial: '', bxInicial: '', tempInicial: '' },
    ingredientes: [],
  });
  const [isCreatingIngredient, setIsCreatingIngredient] = useState(false);

  useEffect(() => {
    if (batchToEdit) {
        setLote(batchToEdit);
    }
  }, [batchToEdit]);

  const handleInputChange = (category, field, value) => {
    const parsedValue = parseNumericInput(value);
    setLote(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: parsedValue }
    }));
  };
  
  const handleAddIngrediente = () => {
    setLote(prev => ({
      ...prev,
      ingredientes: [...prev.ingredientes, { id: Date.now(), name: '', quantity: '', unit: 'g' }]
    }));
  };

  const handleIngredienteChange = (index, field, value) => {
    const newIngredientes = [...lote.ingredientes];
    newIngredientes[index][field] = value;
    if (field === 'name') {
        if (value === 'CREATE_NEW') {
            setIsCreatingIngredient(true);
            newIngredientes[index].name = ''; // Reset selection
        } else {
            const selectedItem = inventory.find(item => item.name === value);
            if (selectedItem) {
                newIngredientes[index].unit = selectedItem.unit;
            }
        }
    }
    setLote(prev => ({ ...prev, ingredientes: newIngredientes }));
  };
  
  const handleSaveNewIngredient = (newIngredient) => {
    onInventoryUpdate(prev => [...prev, newIngredient]);
    setIsCreatingIngredient(false);
  };

  const handleRemoveIngrediente = (index) => {
    const newIngredientes = lote.ingredientes.filter((_, i) => i !== index);
    setLote(prev => ({ ...prev, ingredientes: newIngredientes }));
  };

  const { brixFinalEstimado, alcoholPotencial } = useMemo(() => {
    const pulpaKg = parseFloat(lote.mosto.pulpa) || 0;
    const pulpaBrix = parseFloat(lote.mosto.pulpaBrix) || 0;
    const aguaL = parseFloat(lote.mosto.agua) || 0;
    const azucarKg = parseFloat(lote.ajustes.azucar) || 0;

    const azucarEnPulpaKg = pulpaKg * (pulpaBrix / 100);
    const azucarTotalKg = azucarEnPulpaKg + azucarKg;

    const pesoTotalKg = pulpaKg + aguaL;

    if (pesoTotalKg === 0) return { brixFinalEstimado: 0, alcoholPotencial: 0 };
    
    const pesoSolucionFinalKg = pesoTotalKg + azucarKg;

    const brixFinal = (azucarTotalKg / pesoSolucionFinalKg) * 100;
    const alcohol = brixFinal * 0.57;

    return {
      brixFinalEstimado: brixFinal.toFixed(2),
      alcoholPotencial: alcohol.toFixed(2)
    };
  }, [lote.mosto, lote.ajustes.azucar]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const loteData = batchToEdit ? { ...lote } : {
        ...lote,
        id: Date.now(),
        fermentationLog: [{
            date: new Date().toISOString().split('T')[0],
            sg: lote.ajustes.sgInicial || (lote.ajustes.bxInicial ? brixToSg(lote.ajustes.bxInicial).toFixed(3) : ''),
            temp: lote.ajustes.tempInicial,
            notes: 'Lote creado.'
        }],
        status: 'En Preparación'
    };
    onSave(loteData);
  };

  return (
    <>
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Lote</label>
          <input type="text" value={lote.name} onChange={e => setLote({...lote, name: e.target.value})} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2" required />
        </div>

        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Composición del Mosto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Pulpa/Fruta (kg)" value={lote.mosto.pulpa} onChange={e => handleInputChange('mosto', 'pulpa', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2" />
                <input type="text" placeholder="°Brix de la pulpa" value={lote.mosto.pulpaBrix} onChange={e => handleInputChange('mosto', 'pulpaBrix', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2" />
                <input type="text" placeholder="Agua añadida (L)" value={lote.mosto.agua} onChange={e => handleInputChange('mosto', 'agua', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2" />
                <input type="text" placeholder="pH inicial" value={lote.mosto.ph} onChange={e => handleInputChange('mosto', 'ph', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2" />
            </div>
        </div>
        
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Ajustes y Objetivos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Azúcar añadido (kg)" value={lote.ajustes.azucar} onChange={e => handleInputChange('ajustes', 'azucar', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2" />
                <input type="text" placeholder="SG Inicial (ej. 1.090)" value={lote.ajustes.sgInicial} onChange={e => handleInputChange('ajustes', 'sgInicial', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2" />
                <input type="text" placeholder="Brix Inicial (ej. 21.8)" value={lote.ajustes.bxInicial} onChange={e => handleInputChange('ajustes', 'bxInicial', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2" />
                <input type="text" placeholder="Temp. Inicial (°C)" value={lote.ajustes.tempInicial} onChange={e => handleInputChange('ajustes', 'tempInicial', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div className="bg-indigo-50 dark:bg-indigo-900/50 p-3 rounded-lg">
                    <p className="text-sm text-indigo-800 dark:text-indigo-200">Brix Final Estimado</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">{brixFinalEstimado}°</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/50 p-3 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">Alcohol Potencial</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-300">{alcoholPotencial}%</p>
                </div>
            </div>
        </div>

        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Ingredientes</h3>
            {lote.ingredientes.map((ing, index) => (
                <div key={ing.id} className="flex items-center gap-2 mb-2">
                    <select value={ing.name} onChange={e => handleIngredienteChange(index, 'name', e.target.value)} className="flex-grow bg-gray-100 dark:bg-gray-700 rounded-md p-2">
                        <option value="">Seleccionar del inventario</option>
                        {inventory.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                        <option value="CREATE_NEW" className="font-bold text-indigo-600">--- Crear Nuevo Ingrediente ---</option>
                    </select>
                    <input type="text" placeholder="Cant." value={ing.quantity} onChange={e => handleIngredienteChange(index, 'quantity', e.target.value)} className="w-20 bg-gray-100 dark:bg-gray-700 rounded-md p-2" />
                    <input type="text" value={ing.unit} readOnly className="w-16 bg-gray-200 dark:bg-gray-600 rounded-md p-2 text-center" />
                    <button type="button" onClick={() => handleRemoveIngrediente(index)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18}/></button>
                </div>
            ))}
            <button type="button" onClick={handleAddIngrediente} className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Añadir Ingrediente</button>
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-4">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">{batchToEdit ? 'Actualizar Lote' : 'Guardar Lote'}</button>
      </div>
    </form>
    <Modal isOpen={isCreatingIngredient} onClose={() => setIsCreatingIngredient(false)} title="Crear Nuevo Ingrediente">
        <CrearIngredienteModal onSave={handleSaveNewIngredient} onClose={() => setIsCreatingIngredient(false)} />
    </Modal>
    </>
  );
};

const LoteDetalle = ({ lote, onUpdate, onClose, onAnalyze, onEdit, onDelete }) => {
  const [newLog, setNewLog] = useState({ date: new Date().toISOString().split('T')[0], value: '', temp: '', notes: '' });
  const [newLogMode, setNewLogMode] = useState('sg');
  const [activeTab, setActiveTab] = useState('grafica');
  const [graphMode, setGraphMode] = useState('sg');

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!newLog.value || !newLog.temp) return;
    
    let sgValue;
    if (newLogMode === 'bx') {
        sgValue = brixToSg(parseFloat(newLog.value)).toFixed(3);
    } else {
        sgValue = parseNumericInput(newLog.value);
    }

    const updatedLote = {
      ...lote,
      fermentationLog: [...lote.fermentationLog, { date: newLog.date, sg: sgValue, temp: newLog.temp, notes: newLog.notes }].sort((a,b) => new Date(a.date) - new Date(b.date)),
    };
    onUpdate(updatedLote);
    setNewLog({ date: new Date().toISOString().split('T')[0], value: '', temp: '', notes: '' });
  };
  
  const handleStatusChange = (e) => {
    onUpdate({ ...lote, status: e.target.value });
  };

  const alcoholActual = useMemo(() => {
    const og = lote.ajustes.sgInicial;
    const fg = lote.fermentationLog[lote.fermentationLog.length - 1].sg;
    if (og && fg) {
      return ((og - fg) * 131.25).toFixed(2);
    }
    return '0.00';
  }, [lote]);

  const graphData = useMemo(() => {
    return lote.fermentationLog.map(log => ({
        ...log,
        sg: parseFloat(log.sg),
        brix: parseFloat(sgToBrix(log.sg).toFixed(1)),
        temp: parseFloat(log.temp)
    }));
  }, [lote.fermentationLog]);

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Estado del Lote</h3>
            <select value={lote.status} onChange={handleStatusChange} className="bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-sm">
                <option>En Preparación</option>
                <option>En Fermentación</option>
                <option>Completado</option>
            </select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">SG Inicial</p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{lote.ajustes.sgInicial || 'N/A'}</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">SG Actual</p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{lote.fermentationLog[lote.fermentationLog.length - 1].sg || 'N/A'}</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Temp. Actual</p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{lote.fermentationLog[lote.fermentationLog.length - 1].temp}°C</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">Alcohol Actual (ABV)</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-300">{alcoholActual}%</p>
            </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
            <nav className="-mb-px flex space-x-4">
                <button onClick={() => setActiveTab('grafica')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'grafica' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Gráfica</button>
                <button onClick={() => setActiveTab('informe')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'informe' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Informe</button>
            </nav>
        </div>

        {activeTab === 'grafica' && (
            <div className="w-full h-64 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                <div className="flex justify-end mb-2">
                    <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                        <button onClick={() => setGraphMode('sg')} className={`px-2 py-1 text-xs rounded-md ${graphMode === 'sg' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>SG</button>
                        <button onClick={() => setGraphMode('brix')} className={`px-2 py-1 text-xs rounded-md ${graphMode === 'brix' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>Brix</button>
                    </div>
                </div>
                <ResponsiveContainer>
                    <LineChart data={graphData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                        <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} tick={{ fill: 'var(--text-color-secondary)' }} />
                        <YAxis yAxisId="left" dataKey={graphMode} domain={['dataMin - 0.005', 'dataMax + 0.005']} allowDataOverflow tick={{ fill: '#8884d8' }} />
                        <YAxis yAxisId="right" orientation="right" dataKey="temp" domain={['dataMin - 2', 'dataMax + 2']} allowDataOverflow tick={{ fill: '#82ca9d' }} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--background-color)', border: '1px solid var(--border-color)' }} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey={graphMode} name={graphMode.toUpperCase()} stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="temp" name="Temp (°C)" stroke="#82ca9d" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )}

        {activeTab === 'informe' && (
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Informe de Aditivos</h3>
                <table className="w-full text-left">
                     <thead className="bg-gray-200 dark:bg-gray-700">
                        <tr>
                            <th className="p-2">Ingrediente</th>
                            <th className="p-2">Cantidad</th>
                            <th className="p-2">Concentración</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lote.ingredientes.map((ing, index) => {
                            const totalVolume = (parseFloat(lote.mosto.agua) || 0) + (parseFloat(lote.mosto.pulpa) || 0);
                            let concentration = 'N/A';
                            let concentrationUnit = '';
                            if (totalVolume > 0) {
                                const amount = parseFloat(ing.quantity) || 0;
                                if (ing.unit.toLowerCase() === 'ml' || ing.unit.toLowerCase() === 'l') {
                                    let amountInMl = amount;
                                    if (ing.unit.toLowerCase() === 'l') amountInMl *= 1000;
                                    concentration = (amountInMl / totalVolume).toFixed(2);
                                    concentrationUnit = 'mL/L';
                                } else {
                                    let amountInG = amount;
                                    if (ing.unit.toLowerCase() === 'kg') amountInG *= 1000;
                                    concentration = (amountInG / totalVolume).toFixed(2);
                                    concentrationUnit = 'g/L';
                                }
                            }
                            return (
                                <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                                    <td className="p-2">{ing.name}</td>
                                    <td className="p-2">{ing.quantity} {ing.unit}</td>
                                    <td className="p-2">{`${concentration} ${concentrationUnit}`}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}

        <div className="mt-6 mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Registro de Fermentación</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {lote.fermentationLog.map((log, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <p className="font-semibold">{new Date(log.date).toLocaleString()} - SG: {log.sg}, Temp: {log.temp}°C</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{log.notes}</p>
                    </div>
                ))}
            </div>
        </div>

        <form onSubmit={handleAddLog} className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg space-y-3">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Añadir Nuevo Registro</h4>
             <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg w-min">
                <button type="button" onClick={() => setNewLogMode('sg')} className={`px-2 py-1 text-xs rounded-md ${newLogMode === 'sg' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>SG</button>
                <button type="button" onClick={() => setNewLogMode('bx')} className={`px-2 py-1 text-xs rounded-md ${newLogMode === 'bx' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>Brix</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input type="date" value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})} className="bg-gray-100 dark:bg-gray-700 rounded-md p-2" />
                <input type="text" placeholder={newLogMode.toUpperCase()} value={newLog.value} onChange={e => setNewLog({...newLog, value: e.target.value})} className="bg-gray-100 dark:bg-gray-700 rounded-md p-2" required />
                <input type="text" placeholder="Temp °C" value={newLog.temp} onChange={e => setNewLog({...newLog, temp: parseNumericInput(e.target.value)})} className="bg-gray-100 dark:bg-gray-700 rounded-md p-2" required />
            </div>
            <textarea placeholder="Notas..." value={newLog.notes} onChange={e => setNewLog({...newLog, notes: e.target.value})} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2 h-16"></textarea>
            <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 w-full">Añadir Registro</button>
        </form>

        <div className="mt-8 flex flex-wrap justify-end gap-3">
            <button onClick={() => onAnalyze(lote)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700">
                <Bot size={18} /> Analizar con IA
            </button>
            <button onClick={() => onEdit(lote)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600">
                <Edit size={18} /> Editar
            </button>
            <button onClick={() => onDelete(lote)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
                <Trash2 size={18} /> Eliminar
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500">Cerrar</button>
        </div>
    </div>
  )
}

const AIReportView = ({ response }) => {
    const sections = useMemo(() => {
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


// --- VISTAS PRINCIPALES ---
const LotesView = ({ lotes, setLotes, inventory, setInventory, onAnalyze }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBatch, setEditingBatch] = useState(null);
    const [selectedLote, setSelectedLote] = useState(null);
    const [batchToDelete, setBatchToDelete] = useState(null);

    const handleSaveLote = (loteData) => {
        if (loteData.id && lotes.some(l => l.id === loteData.id)) {
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

    const handleDeleteRequest = (batch) => {
        setBatchToDelete(batch);
        setSelectedLote(null);
    };

    const handleConfirmDelete = () => {
        setLotes(lotes.filter(l => l.id !== batchToDelete.id));
        setBatchToDelete(null);
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
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Gestión de Lotes</h1>
                <button onClick={() => { setEditingBatch(null); setIsFormOpen(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                    <Plus size={20} /> Crear Lote
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lotes.map(lote => (
                    <div key={lote.id} onClick={() => setSelectedLote(lote)} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer">
                        <div className="flex justify-between items-start">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{lote.name}</h2>
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(lote.status)}`}>{lote.status}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Creado: {lote.creationDate}</p>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-300">SG Actual: <span className="font-semibold">{lote.fermentationLog[lote.fermentationLog.length - 1].sg}</span></span>
                            <span className="text-gray-600 dark:text-gray-300">Temp: <span className="font-semibold">{lote.fermentationLog[lote.fermentationLog.length - 1].temp}°C</span></span>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingBatch ? "Editar Lote" : "Crear Nuevo Lote"}>
                <CrearLoteForm onSave={handleSaveLote} onClose={() => setIsFormOpen(false)} inventory={inventory} onInventoryUpdate={setInventory} batchToEdit={editingBatch} />
            </Modal>
            
            <Modal isOpen={!!selectedLote} onClose={() => setSelectedLote(null)} title={`Detalle del Lote: ${selectedLote?.name}`}>
                {selectedLote && <LoteDetalle lote={selectedLote} onUpdate={(updated) => setLotes(lotes.map(l => l.id === updated.id ? updated : l))} onClose={() => setSelectedLote(null)} onAnalyze={onAnalyze} onEdit={handleEdit} onDelete={handleDeleteRequest} />}
            </Modal>

            <Modal isOpen={!!batchToDelete} onClose={() => setBatchToDelete(null)} title="Confirmar Eliminación">
                <p>¿Estás seguro de que quieres eliminar el lote "{batchToDelete?.name}"? Esta acción no se puede deshacer.</p>
                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={() => setBatchToDelete(null)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600">Cancelar</button>
                    <button onClick={handleConfirmDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white">Eliminar</button>
                </div>
            </Modal>
        </div>
    );
};

const InventarioView = ({ inventory, setInventory }) => {
    const [isAdding, setIsAdding] = useState(false);

    const handleSaveNewIngredient = (newItem) => {
        setInventory(prev => [...prev, newItem]);
        setIsAdding(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Inventario</h1>
                <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                    <Plus size={20} /> Añadir Artículo
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Artículo</th>
                            <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Marca</th>
                            <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Cantidad</th>
                            <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Vencimiento</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                        {inventory.map(item => (
                            <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700">
                                <td className="p-4 text-gray-900 dark:text-white">{item.name}</td>
                                <td className="p-4 text-gray-600 dark:text-gray-300">{item.brand}</td>
                                <td className="p-4 text-gray-600 dark:text-gray-300">{item.quantity} {item.unit}</td>
                                <td className="p-4 text-gray-600 dark:text-gray-300">{item.expiry}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isAdding} onClose={() => setIsAdding(false)} title="Añadir Artículo al Inventario">
                <CrearIngredienteModal onSave={handleSaveNewIngredient} onClose={() => setIsAdding(false)} />
            </Modal>
        </div>
    );
};

const LevadurasView = () => (
    <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Análisis de Levaduras</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <p className="text-gray-600 dark:text-gray-300">Esta sección permitirá analizar y predecir el comportamiento de diferentes cepas de levadura. Podrás registrar datos de tus fermentaciones para construir un perfil histórico de cada cepa, o introducir datos manualmente para simular resultados teóricos. Es una herramienta educativa y de planificación para optimizar tus vinos.</p>
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg text-center">
                <FlaskConical className="mx-auto text-indigo-500 mb-2" size={40} />
                <p className="font-semibold text-indigo-800 dark:text-indigo-200">Característica en desarrollo.</p>
            </div>
        </div>
    </div>
);

const PrimingCalculator = () => {
    const [volume, setVolume] = useState('');
    const [temp, setTemp] = useState('');
    const [co2, setCo2] = useState('');
    const [sugarNeeded, setSugarNeeded] = useState(null);

    const calculateSugar = () => {
        const vol = parseFloat(volume);
        const t = parseFloat(temp);
        const targetCO2 = parseFloat(co2);

        if (vol > 0 && t >= 0 && targetCO2 > 0) {
            const residualCO2 = 3.0378 - (0.050062 * t) + (0.00026555 * t * t);
            const co2ToAdd = targetCO2 - residualCO2;
            const sugar = co2ToAdd * 4 * vol;
            setSugarNeeded(sugar.toFixed(2));
        } else {
            setSugarNeeded(null);
        }
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Calcula la cantidad de azúcar necesaria para la segunda fermentación en botella y lograr el nivel de carbonatación deseado.</p>
            <input type="text" placeholder="Volumen del lote (L)" value={volume} onChange={e => setVolume(parseNumericInput(e.target.value))} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2"/>
            <input type="text" placeholder="Temperatura del vino (°C)" value={temp} onChange={e => setTemp(parseNumericInput(e.target.value))} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2"/>
            <input type="text" placeholder="Volúmenes de CO2 deseados (ej. 2.5)" value={co2} onChange={e => setCo2(parseNumericInput(e.target.value))} className="w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2"/>
            <button onClick={calculateSugar} className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white">Calcular</button>
            {sugarNeeded !== null && (
                <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg text-center">
                    <p className="text-green-800 dark:text-green-200">Necesitarás aproximadamente</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-300">{sugarNeeded} gramos</p>
                    <p className="text-green-800 dark:text-green-200">de azúcar de maíz (dextrosa).</p>
                </div>
            )}
        </div>
    );
};

const VinopediaView = () => {
    const [activeTab, setActiveTab] = useState('glosario');
    const glossary = {
        "Mosto": "Zumo de fruta (generalmente uva) que aún no ha fermentado. Es la base de cualquier vino.",
        "Brix (°Bx)": "Medida del contenido de azúcar en una solución. Fundamental para estimar el alcohol potencial.",
        "Gravedad Específica (SG)": "Densidad de un líquido en comparación con la del agua. Disminuye a medida que el azúcar se convierte en alcohol.",
        "Trasiego": "Transferir el vino de un recipiente a otro para separarlo de los sedimentos (lías), clarificándolo.",
        "Lías": "Levaduras muertas y otros sólidos que se depositan en el fondo tras la fermentación. Pueden aportar complejidad si se gestionan bien (bâtonnage).",
        "Enzima Péctica": "Aditivo que se usa en vinos de frutas para romper la pectina, clarificar el mosto y mejorar la extracción de jugo y color.",
        "Acidez Total (AT)": "Medida de todos los ácidos presentes en el vino (tartárico, málico, cítrico, etc.). Es crucial para el equilibrio, sabor y estabilidad del vino.",
        "Taninos": "Compuestos que aportan estructura, amargor y astringencia (sensación de sequedad en la boca). Provienen de las pieles y semillas de las uvas, o de frutas como la granada o el caqui.",
        "Licor de Tiraje": "(Vinos espumosos) Mezcla de vino base, azúcar y levaduras que se añade para iniciar la segunda fermentación en botella, creando la carbonatación.",
        "Licor de Expedición": "(Vinos espumosos) Dosis de vino y azúcar que se añade tras el degüelle para ajustar el nivel de dulzor final del vino espumoso (Brut, Sec, etc.).",
        "Degüelle": "(Vinos espumosos) Proceso de expulsar las lías congeladas del cuello de la botella después de la segunda fermentación."
    };
    const fruitWineTips = [
        "Usa siempre enzima péctica con frutas como manzanas, peras o bayas para evitar turbidez.",
        "Mide y ajusta la acidez. Muchas frutas no tienen la acidez natural de la uva, por lo que necesitarás añadir ácido tartárico, cítrico o una mezcla.",
        "No temas añadir taninos. Un poco de tanino en polvo (o incluso té negro fuerte) puede dar a un vino de frutas el cuerpo que le falta.",
        "La nutrición de la levadura es clave. Los mostos de frutas a menudo carecen de los nutrientes necesarios para una fermentación saludable. Usa un buen nutriente."
    ];
    const coveninParams = {
        "Acidez Volátil (expresada en Ácido Acético)": "Máximo 1.00 g/L para vinos de mesa, y 1.20 g/L para vinos licorosos. Una acidez volátil alta puede indicar contaminación por bacterias acéticas (vinagre).",
        "Anhídrido Sulfuroso Total (SO2)": "Máximo 0.25 g/L (250 mg/L). El SO2 es un conservante y antioxidante crucial, pero en exceso puede causar aromas desagradables y dolores de cabeza.",
        "Ácido Sórbico": "Máximo 0.20 g/L. Se usa como conservante para inhibir la refermentación de levaduras en vinos dulces, pero no es efectivo contra bacterias.",
        "Grado Alcohólico (Vinos de Mesa)": "Debe estar entre 7° y 14° G.L. (Gay-Lussac), que equivale a % de alcohol por volumen."
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
        { name: 'Vino Licoroso', range: '> 14° a 20° G.L.'},
        { name: 'Vino Compuesto', range: '> 14° a 20° G.L.'},
        { name: 'Vino Desalcoholizado', range: 'Hasta 5° G.L.'},
        { name: 'Vino Soda', range: '3° a 5° G.L.'},
    ];

    const TabButton = ({ id, label }) => (
        <button onClick={() => setActiveTab(id)} className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === id ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
            {label}
        </button>
    );
    
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
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Vinopedia</h1>
            <div className="flex space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4 overflow-x-auto">
                <TabButton id="glosario" label="Glosario"/>
                <TabButton id="consejos" label="Consejos"/>
                <TabButton id="calculadoras" label="Calculadoras"/>
                <TabButton id="normativa" label="Normativa"/>
            </div>

            {activeTab === 'glosario' && (
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
            )}
            {activeTab === 'consejos' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Consejos para Vinos de Frutas</h2>
                     <ul className="space-y-4">
                        {fruitWineTips.map((tip, index) => (
                            <li key={index} className="flex gap-3">
                                <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={20}/>
                                <span className="text-gray-600 dark:text-gray-400">{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {activeTab === 'calculadoras' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h2 className="flex items-center gap-2 text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4"><Calculator size={24}/>Calculadora de Taponado (Priming)</h2>
                        <PrimingCalculator />
                    </div>
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h2 className="flex items-center gap-2 text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4"><Sparkles size={24}/>Guía de Degüelle</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">El degüelle es el proceso de quitar el sedimento de levadura de la botella después de la segunda fermentación. Sigue estos pasos:</p>
                        <ol className="list-decimal list-inside space-y-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
                            <li>Enfría las botellas boca abajo a casi punto de congelación (2-4°C) durante varias horas. Esto compacta el sedimento en el tapón.</li>
                            <li>Manteniendo la botella invertida, sumerge el cuello en una solución de salmuera congelante (-20°C) por unos minutos para congelar el sedimento en un tapón de hielo.</li>
                            <li>Voltea la botella a su posición normal y quita con cuidado el tapón corona. La presión interna expulsará el tapón de hielo con el sedimento.</li>
                            <li>Rellena rápidamente el espacio vacío con el licor de expedición y coloca el corcho y bozal definitivos.</li>
                        </ol>
                    </div>
                </div>
            )}
             {activeTab === 'normativa' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Parámetros y Clasificación (Según COVENIN 3342-97)</h2>
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <ClassificationTable title="Por Azúcar (Vinos Tranquilos)" data={sugarClassifications} icon={<Percent size={22} className="text-purple-500"/>} />
                           <ClassificationTable title="Por Azúcar (Vinos Espumosos)" data={sparklingClassifications} icon={<Sparkles size={22} className="text-amber-500"/>} />
                        </div>
                        <ClassificationTable title="Por Grado Alcohólico" data={alcoholClassifications} icon={<TestTube2 size={22} className="text-red-500"/>} />
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Otros Parámetros Clave</h3>
                             <div className="space-y-4">
                                {Object.entries(coveninParams).map(([param, desc]) => (
                                    <div key={param}>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{param}</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">{desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
                if (data.lotes && data.inventory) {
                    onImport(data);
                    alert("Datos importados con éxito!");
                } else {
                    alert("Error: El archivo JSON no tiene el formato esperado (necesita las claves 'lotes' e 'inventory').");
                }
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
            <div className="space-y-6">
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
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DE LA APP ---
export default function App() {
  const [theme, setTheme] = useState('light');
  const [view, setView] = useState('lotes');
  const [lotes, setLotes] = useState(initialLots);
  const [inventory, setInventory] = useState(initialInventory);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [aiResponse, setAiResponse] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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
  
  const handleImportData = (data) => {
    setLotes(data.lotes);
    setInventory(data.inventory);
  };

  const handleExportData = () => {
    const data = {
        lotes,
        inventory,
        exportDate: new Date().toISOString()
    };
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
    { id: 'levaduras', label: 'Levaduras', icon: FlaskConical },
    { id: 'vinopedia', label: 'Vinopedia', icon: Book },
    { id: 'ajustes', label: 'Ajustes', icon: Settings },
  ];

  const renderView = () => {
    switch (view) {
      case 'lotes': return <LotesView lotes={lotes} setLotes={setLotes} inventory={inventory} setInventory={setInventory} onAnalyze={handleAnalyzeWithAI} />;
      case 'inventario': return <InventarioView inventory={inventory} setInventory={setInventory} />;
      case 'levaduras': return <LevadurasView />;
      case 'vinopedia': return <VinopediaView />;
      case 'ajustes': return <AjustesView theme={theme} setTheme={setTheme} onImport={handleImportData} onExport={handleExportData} />;
      default: return <LotesView lotes={lotes} setLotes={setLotes} inventory={inventory} setInventory={setInventory} onAnalyze={handleAnalyzeWithAI} />;
    }
  };

  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300`}>
      {showWelcome && <WelcomeScreen theme={theme} />}
      <aside className={`bg-white dark:bg-gray-800 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className={`flex items-center p-4 h-16 border-b border-gray-200 dark:border-gray-700 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          <div className={`flex items-center gap-2 ${!isSidebarOpen && 'hidden'}`}>
            <Droplet className="text-indigo-500" />
            <span className="text-xl font-bold">VinoApp</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
            <SlidersHorizontal size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {menuItems.map(item => (
            <a
              key={item.id}
              href="#"
              onClick={(e) => { e.preventDefault(); setView(item.id); }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${view === item.id ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <item.icon size={22} />
              <span className={`${!isSidebarOpen && 'hidden'}`}>{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {renderView()}
        </div>
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
