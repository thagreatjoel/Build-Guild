import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

const Scanner = ({ token, onSuccess }) => {
  const [scanResult, setScanResult] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 });
    scanner.render(
      (decodedText) => {
        handleScan(decodedText);
      },
      (error) => console.error(error)
    );
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) scannerRef.current.clear();
    };
  }, []);

  const handleScan = async (qrToken) => {
    try {
      const res = await axios.post('http://localhost:5000/api/admin/scan', { token: qrToken }, {
        headers: { 'x-auth-token': token },
      });
      setScanResult({ success: true, msg: res.data.msg });
      onSuccess();
    } catch (err) {
      setScanResult({ success: false, msg: err.response?.data?.msg || 'Error' });
    }
    setTimeout(() => setScanResult(null), 3000);
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Scan QR Code</h2>
      <div id="reader" className="w-full"></div>
      {scanResult && (
        <div className={`mt-4 p-2 rounded text-center ${scanResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {scanResult.msg}
        </div>
      )}
    </div>
  );
};

export default Scanner;
