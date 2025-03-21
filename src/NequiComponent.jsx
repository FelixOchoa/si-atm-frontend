import { useEffect, useState } from "react";

// Constantes
const NEQUI_AUTH = 1;
const NEQUI_TAKE_MONEY = 2;
const NEQUI_REPORT = 3;
const IS_PHONE_NUMBER = 1;
const IS_DYNAMIC_KEY = 2;
const IS_CUSTOM_AMOUNT = 3;

const NEQUI_OPTIONS_TAKE_MONEY = [
  20000,
  50000,
  100000,
  200000,
  300000,
  500000
];

function NequiComponent({ requestDynamicKey, goBack }) {
  const [nequiState, setNequiState] = useState(NEQUI_AUTH);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dynamicKey, setDynamicKey] = useState('');
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
      if (/^3\d{0,9}$/.test(value)) {
        setPhoneNumber(value);
      } else if (value === '') {
        setPhoneNumber(value);
      }
    } else if (typeInput === IS_DYNAMIC_KEY) {
      if (/^\d{0,6}$/.test(value)) {
        setDynamicKey(value);
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
        numero_celular: phoneNumber,
        clave: dynamicKey,
        monto: amountToWithdraw
      };

      const response = await fetch('http://127.0.0.1:8000/retiro/nequi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(withdrawalData),
      });

      const result = await response.json();
      
      if (result.exito) {
        setNequiState(NEQUI_REPORT);
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
    if (!phoneNumber || !dynamicKey) {
      setErrorMessage('Debes ingresar el número de celular y la clave dinámica');
      return;
    }
    
    if (dynamicKey !== requestDynamicKey) {
      setErrorMessage('Clave dinámica incorrecta');
      return;
    }

    setNequiState(NEQUI_TAKE_MONEY);
  }
  const handleGoBack = () => {
    setNequiState(NEQUI_AUTH);
    setPhoneNumber('');
    setDynamicKey('');
    setSelectedAmount(null);
    setCustomAmount('');
    setIsValidAmount(false);
    setErrorMessage('');
    setResponseTakeMoney('');
    goBack();
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-[#FBE5F2] px-5">
      <span className="text-sm font-bold text-center text-white bg-[#100010] py-2 px-4 absolute rounded-md top-4 right-2">Clave dinámica: {requestDynamicKey}</span>
      <span className="text-sm font-bold text-center text-white bg-[#100010] py-2 px-4 absolute rounded-md top-4 left-2 cursor-pointer" onClick={handleGoBack}>Volver</span>

      {nequiState === NEQUI_AUTH && (
        <div className="flex flex-col items-center justify-center w-full max-w-md bg-white p-4 rounded-md">
          <h1 className="font-bold text-2xl text-center">Entra a tu Nequi</h1>
          <p className="mt-4">Podrás bloquear tu Nequi, consultar tus datos.</p>

          <div className="flex flex-col items-center justify-center w-full mt-4">
            <input placeholder="Número de celular" className="px-4 py-3 w-full bg-[#FBF7FB] rounded-md" onChange={(e) => isValueNumber(e.target.value, IS_PHONE_NUMBER)} value={phoneNumber} />
            <input placeholder="Clave dinámica" className="px-4 py-3 mt-4 w-full bg-[#FBF7FB] rounded-md" onChange={(e) => isValueNumber(e.target.value, IS_DYNAMIC_KEY)} value={dynamicKey} />
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}
            <button className="px-4 py-2 my-8 text-white bg-[#DA2680] rounded-md w-full cursor-pointer" onClick={() => handleLogin()}>Entra</button>
          </div>
        </div>
      )}

      {nequiState === NEQUI_TAKE_MONEY && (
        <div className="flex flex-col items-center justify-center w-full max-w-md bg-white p-4 rounded-md">
          <h1 className="font-bold text-2xl text-center">Retiro de dinero</h1>
          <p className="mt-4">Ingresa el valor a retirar</p>

          <div className="grid grid-cols-2 gap-4 items-center justify-center w-full mt-4">
            {NEQUI_OPTIONS_TAKE_MONEY.map((option, index) => (
              <button 
                key={index} 
                className={`px-4 py-2 my-2 text-black rounded-md w-full cursor-pointer ${selectedAmount === option ? 'bg-[#DA2680] text-white' : 'bg-[#faf2f6]'}`}
                onClick={() => handleSelectAmount(option)}
              >
                ${option.toLocaleString()}
              </button>
            ))}
          </div>
          
          <div className="w-full mt-4">
            <input 
              placeholder="Otro valor" 
              className={`px-4 py-3 w-full rounded-md ${customAmount && !selectedAmount ? 'bg-[#DA2680] text-white' : 'bg-[#FBF7FB]'}`}
              onChange={(e) => isValueNumber(e.target.value, IS_CUSTOM_AMOUNT)} 
              value={customAmount} 
            />
            
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}
            
            <button 
              className={`px-4 py-2 my-8 text-white rounded-md w-full ${isValidAmount ? 'bg-[#DA2680] cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
              disabled={!isValidAmount}
              onClick={handleWithdrawal}
            >
              Retirar
            </button>
          </div>
        </div>
      )}
      
      {nequiState === NEQUI_REPORT && (
        <div className="flex flex-col justify-center w-full max-w-md bg-white p-4 rounded-md">
          <h1 className="font-bold text-2xl text-center">Transacción Exitosa</h1>
          <p className="mt-4 text-sm font-semibold">Retiro: <span className="text-xs font-normal">${(selectedAmount || parseInt(customAmount)).toLocaleString()}</span></p>
          <p className="mt-2 text-sm font-semibold">Mensaje: <span className="text-xs font-normal">{responseTakeMoney.mensaje}</span></p>
          <p className="mt-2 text-sm font-semibold">Retiros posibles: <span className="text-xs font-normal">{responseTakeMoney.retiros_posibles}</span></p>
          
          <button 
            className="px-4 py-2 my-8 text-white bg-[#DA2680] rounded-md w-full cursor-pointer"
            onClick={goBack}
          >
            Volver al inicio
          </button>
        </div>
      )}
    </main>
  );
}

export default NequiComponent;