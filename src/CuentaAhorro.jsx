import { useEffect, useState } from "react";

// Constantes
const AHORRO_MANO_AUTH = 1;
const AHORRO_MANO_TAKE_MONEY = 2;
const AHORRO_MANO_REPORT = 3;
const IS_PHONE_NUMBER = 1;
const IS_DYNAMIC_KEY = 2;
const IS_CUSTOM_AMOUNT = 3;

const AHORRO_MANO_OPTIONS_TAKE_MONEY = [
  20000,
  50000,
  100000,
  200000,
  300000,
  500000
];

function CuentaAhorrosComponent({ goBack }) {
  const [ahorroManoState, setAhorroManoState] = useState(AHORRO_MANO_AUTH);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isValidAmount, setIsValidAmount] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [responseTakeMoney, setResponseTakeMoney] = useState('');

  useEffect(() => {
    if (selectedAmount) {
      validateAmount(selectedAmount);
    } else if (customAmount) {
      validateAmount(parseInt(customAmount));
    } else {
      setIsValidAmount(false);
      setErrorMessage('');
    }
  }, [selectedAmount, customAmount]);

  const isValueNumber = (value, typeInput) => {
    setErrorMessage('');
    if (typeInput === IS_PHONE_NUMBER) {
      if (/^\d{0,11}$/.test(value)) {
        setPhoneNumber(value);
      }
    } else if (typeInput === IS_DYNAMIC_KEY) {
      if (/^\d{0,4}$/.test(value)) {
        setPassword(value);
      }
    } else if (typeInput === IS_CUSTOM_AMOUNT) {
      if (/^\d*$/.test(value)) {
        setCustomAmount(value);
        setSelectedAmount(null);
      }
    }
  };

  const validateAmount = async (amount) => {
    if (!amount) {
      setIsValidAmount(false);
      setErrorMessage('');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/validar-monto/${amount}`);
      const data = await response.json();
      
      setIsValidAmount(data.valido);
      setErrorMessage(data.valido ? '' : data.mensaje);
      
    } catch (error) {
      console.error("Error al validar monto:", error);
      setIsValidAmount(false);
      setErrorMessage('Error al validar el monto');
    }
  };

  const handleSelectAmount = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleWithdrawal = async () => {
    const amountToWithdraw = selectedAmount || parseInt(customAmount);
    
    if (!isValidAmount) {
      return;
    }

    try {
      const withdrawalData = {
        numero_cuenta: phoneNumber,
        clave: password,
        monto: amountToWithdraw
      };

      const response = await fetch('http://127.0.0.1:8000/retiro/cuenta-ahorros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(withdrawalData),
      });

      const result = await response.json();
      
      if (result.exito) {
        setAhorroManoState(AHORRO_MANO_REPORT);
        setResponseTakeMoney(result);
      } else {
        setErrorMessage(result.mensaje);
      }
      
    } catch (error) {
      console.error("Error al procesar retiro:", error);
      setErrorMessage('Error al procesar el retiro');
    }
  };

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      setErrorMessage('Debes ingresar el número de celular y la clave');
      return;
    }

    setAhorroManoState(AHORRO_MANO_TAKE_MONEY);
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-[#e5f3ff] px-5">
      
      {ahorroManoState === AHORRO_MANO_AUTH && (
        <div className="flex flex-col items-center justify-center w-full max-w-md bg-white p-4 rounded-md">
          <h1 className="font-bold text-2xl text-center px-5">Entra a Retiros por Cuenta de Ahorro</h1>
          <p className="mt-4">Accede a tu cuenta para realizar tus transacciones.</p>

          <div className="flex flex-col items-center justify-center w-full mt-4">
            <input placeholder="Número de cuenta de ahorros" className="px-4 py-3 w-full bg-[#e5f3ff] rounded-md" onChange={(e) => isValueNumber(e.target.value, IS_PHONE_NUMBER)} value={phoneNumber} />
            <input type="password" placeholder="Clave" className="px-4 py-3 mt-4 w-full bg-[#e5f3ff] rounded-md" onChange={(e) => isValueNumber(e.target.value, IS_DYNAMIC_KEY)} value={password} />
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}
            <button className="px-4 py-2 my-8 text-black bg-blue-300 rounded-md w-full cursor-pointer" onClick={() => handleLogin()}>Ingresar</button>
          </div>
        </div>
      )}

      {ahorroManoState === AHORRO_MANO_TAKE_MONEY && (
        <div className="flex flex-col items-center justify-center w-full max-w-md bg-white p-4 rounded-md">
          <h1 className="font-bold text-2xl text-center">Retiro de dinero</h1>
          <p className="mt-4">Ingresa el valor a retirar</p>

          <div className="grid grid-cols-2 gap-4 items-center justify-center w-full mt-4">
            {AHORRO_MANO_OPTIONS_TAKE_MONEY.map((option, index) => (
              <button 
                key={index} 
                className={`px-4 py-2 my-2 text-black rounded-md w-full cursor-pointer ${selectedAmount === option ? 'bg-blue-300' : 'bg-[#e5f3ff]'}`}
                onClick={() => handleSelectAmount(option)}
              >
                ${option.toLocaleString()}
              </button>
            ))}
          </div>
          
          <div className="w-full mt-4">
            <input 
              placeholder="Otro valor" 
              className={`px-4 py-3 w-full rounded-md ${customAmount && !selectedAmount ? 'bg-[#e5f3ff]' : 'bg-[#f0f4f8]'}`}
              onChange={(e) => isValueNumber(e.target.value, IS_CUSTOM_AMOUNT)} 
              value={customAmount} 
            />
            
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}
            
            <button 
              className={`px-4 py-2 my-8 text-black rounded-md w-full ${isValidAmount ? 'bg-blue-300 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
              disabled={!isValidAmount}
              onClick={handleWithdrawal}
            >
              Retirar
            </button>
          </div>
        </div>
      )}
      
      {ahorroManoState === AHORRO_MANO_REPORT && (
        <div className="flex flex-col justify-center w-full max-w-md bg-white p-4 rounded-md">
          <h1 className="font-bold text-2xl text-center">Transacción Exitosa</h1>
          <p className="mt-4 text-sm font-semibold">Retiro: <span className="text-xs font-normal">${(selectedAmount || parseInt(customAmount)).toLocaleString()}</span></p>
          <p className="mt-2 text-sm font-semibold">Mensaje: <span className="text-xs font-normal">{responseTakeMoney.mensaje}</span></p>
          <p className="mt-2 text-sm font-semibold">Retiros posibles: <span className="text-xs font-normal">{responseTakeMoney.retiros_posibles}</span></p>
          
          <button 
            className="px-4 py-2 my-8 text-black bg-blue-300 rounded-md w-full cursor-pointer"
            onClick={goBack}
          >
            Volver al inicio
          </button>
        </div>
      )}
    </main>
  );
}

export default CuentaAhorrosComponent;