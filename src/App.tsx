import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login/login';
import Home from './components/Home/home'
import Navbar from './components/Navbar/navbar';
import { Provider , useSelector } from 'react-redux';
import { store } from './redux/store';
import Inscription from './components/Inscription/inscription';
import Profile from './components/Profile/profile';
import Equipements from './components/Equipements/equipement';

function AppContent() {
  const isLogged = useSelector((state: any) => state.user.isLogged);
  
  return (
    <BrowserRouter>
        {isLogged && <Navbar />}
        
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/Home' element={<Home />} />
          <Route path='/Inscritption' element={<Inscription />} />
          <Route path='/Profile' element={<Profile />} />
          <Route path='/Equipements' element={<Equipements />} />
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
