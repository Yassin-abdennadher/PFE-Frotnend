import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login/login';
import Home from './components/Home/home'
import Navbar from './components/Navbar/navbar';
import { Provider, useSelector } from 'react-redux';
import { store } from './redux/store';
import Inscription from './components/Inscription/inscription';
import Profile from './components/Profile/profile';
import Equipements from './components/Equipements/equipement';
import Interventions from './components/Interventions/intervention';
import MachineForm from './components/Equipements/machineFormEdit';
import PieceForm from './components/Equipements/pieceFormEdit';
import TachePreventiveForm from './components/Interventions/tachePreventiveForm';
import TacheCurativeForm from './components/Interventions/tacheCurativeForm';
import Techniciens from './components/Techniciens/techniciens';
import { useState, useMemo, useEffect } from 'react';
import { ThemeProvider} from '@mui/material';
import { getTheme } from './theme/darkTheme';
import Dashboard from './components/dashboard/dashboard';
import Maintenance from './components/maintenance/maintenance';

function AppContent({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) {
  const isLogged = useSelector((state: any) => state.user.isLogged);
  const theme = useMemo(() => getTheme(darkMode), [darkMode]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        {isLogged && <Navbar toggleDarkMode={toggleDarkMode} darkMode={darkMode} />}
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/Login' element={<Login />} />
          <Route path='/Home' element={<Home />} />
          <Route path='/Inscription' element={<Inscription />} />
          <Route path='/Profile' element={<Profile />} />
          <Route path='/Equipements' element={<Equipements />} />
          <Route path="/machines/ajouter" element={<MachineForm />} />
          <Route path='/Machine/:id' element={<MachineForm />} />
          <Route path="/pieces/ajouter" element={<PieceForm />} />
          <Route path='Piece/:id' element={<PieceForm />} />
          <Route path='/taches/preventive/ajouter' element={<TachePreventiveForm />} />
          <Route path='/taches/preventive/:id' element={<TachePreventiveForm />} />
          <Route path='/taches/curative/ajouter' element={<TacheCurativeForm />} />
          <Route path='/taches/curative/:id' element={<TacheCurativeForm />} />
          <Route path='/Interventions' element={<Interventions />} />
          <Route path='/Techniciens' element={<Techniciens />} />
          <Route path='/Dashboard' element={<Dashboard />} />
          <Route path='/Maintenance' element={<Maintenance />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(() => 
    localStorage.getItem('darkMode') === 'true'
  );

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      localStorage.setItem('darkMode', (!prev).toString());
      return !prev;
    });
  };

  return (
    <Provider store={store}>
      <AppContent darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
    </Provider>
  );
}

export default App;