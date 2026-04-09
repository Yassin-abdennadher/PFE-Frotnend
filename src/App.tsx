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


function AppContent() {
  const isLogged = useSelector((state: any) => state.user.isLogged);

  return (
    <BrowserRouter>

      {isLogged && <Navbar />}

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
        <Route path='Piece/:id' element={<PieceForm/>} />
        <Route path='/taches/preventive/ajouter' element = {<TachePreventiveForm/>}/>
        <Route path='/taches/preventive/:id' element = {<TachePreventiveForm/>}/>
        <Route path='/taches/curative/ajouter' element = {<TacheCurativeForm/>}/>
        <Route path='/taches/curative/:id' element = {<TacheCurativeForm/>}/>
        <Route path='/Interventions' element={<Interventions />} />
        <Route path='/Techniciens' element={<Techniciens />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
