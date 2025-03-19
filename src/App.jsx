import { useEffect, useState } from "react";
import NequiComponent from "./NequiComponent.jsx";
import AhorroManoComponent from "./AhorroMano.jsx";
import CuentaAhorrosComponent from "./CuentaAhorro.jsx";

const NEQUI = 1;
const AHORRO_MANO = 2;
const CUENTA_AHORROS = 3;
const INICIO = 4;

function App() {
  const [initialStateApp, setInitialStateApp] = useState(INICIO);
  const [requestDynamicKey, setRequestDynamicKey] = useState('');

  useEffect(() => {
    getRequestDynamicKey();

    const interval = setInterval(() => {
      getRequestDynamicKey();
    }, 65000);

    return () => clearInterval(interval);
  }, []);

  const getRequestDynamicKey = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/generar-clave-temporal');
      const {clave} = await response.json();
      setRequestDynamicKey(clave);
    } catch (error) {
      console.error("Error al obtener clave temporal:", error);
    }
  };

  const handleGoBack = () => {
    setInitialStateApp(INICIO);
  }

  return (
    <>
      {initialStateApp === INICIO && (
        <main className="flex flex-col items-center justify-center h-screen bg-gray-100 px-5">
          <h1 className="text-4xl font-bold text-center text-gray-800">Simulación ATM - Sistemas de Información</h1>

          <div className="flex flex-col items-center justify-center w-full max-w-md font-bold mt-56">
            <span className="px-4 py-4 text-white bg-[#DA2680] rounded-md w-full text-center cursor-pointer" onClick={() => setInitialStateApp(NEQUI)}>Nequi</span>
            <span className="px-4 py-4 mt-4 text-black bg-[#fdda23] rounded-md w-full text-center cursor-pointer" onClick={() => setInitialStateApp(AHORRO_MANO)}>Ahorro a la mano</span>
            <span className="px-4 py-4 mt-4 text-white bg-blue-500 rounded-md w-full text-center cursor-pointer" onClick={() => setInitialStateApp(CUENTA_AHORROS)}>Retiro cuenta de ahorros</span>
          </div>
        </main>
      )}

      {initialStateApp === NEQUI && (
        <NequiComponent 
          requestDynamicKey={requestDynamicKey} 
          goBack={handleGoBack}
        />
      )}

      {initialStateApp === AHORRO_MANO && (
        <AhorroManoComponent goBack={handleGoBack} />
      )}

      {initialStateApp === CUENTA_AHORROS && (
        <CuentaAhorrosComponent goBack={handleGoBack} />
      )}
    </>
  );
}

export default App;