import { Camera, ScanLine } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button, Card, Field, FormSection, Input, PageHeader, Select } from '../components/ui.jsx';
import { api } from '../services/api.js';

export default function QrScanner() {
  const [qrCode, setQrCode] = useState('');
  const [type, setType] = useState('CHECK_IN');
  const scannerRef = useRef(null);
  const client = useQueryClient();
  const mutation = useMutation(() => api.post('/attendance/scan', { qrCode, type }), {
    onSuccess: () => {
      toast.success(type === 'CHECK_IN' ? 'Checked in' : 'Checked out');
      setQrCode('');
      client.invalidateQueries('attendance');
      client.invalidateQueries('reports');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Scan failed')
  });

  useEffect(() => {
    if (scannerRef.current) return;
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 8, qrbox: { width: 220, height: 220 } }, false);
    scannerRef.current = scanner;
    scanner.render((decodedText) => setQrCode(decodedText), () => {});
    return () => {
      scanner.clear().catch(() => {});
      scannerRef.current = null;
    };
  }, []);

  return (
    <>
      <PageHeader title="QR Scanner" subtitle="Scan employee QR cards or enter QR values manually" />
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card className="flex min-h-96 items-center justify-center overflow-hidden p-6">
          <div className="w-full">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-primary"><Camera size={28} /></div>
            <div id="qr-reader" className="mx-auto max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white text-sm" />
          </div>
        </Card>
        <FormSection title="Manual Scan" actions={null}>
          <form className="space-y-3 md:col-span-2 xl:col-span-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
            <Field label="Scan Type" required><Select value={type} onChange={(event) => setType(event.target.value)}>
              <option value="CHECK_IN">Check In</option>
              <option value="CHECK_OUT">Check Out</option>
            </Select></Field>
            <Field label="Employee QR Code" required><Input placeholder="Employee QR code" value={qrCode} onChange={(event) => setQrCode(event.target.value)} /></Field>
            <Button className="w-full" disabled={!qrCode || mutation.isLoading}><ScanLine size={16} />Submit Scan</Button>
          </form>
        </FormSection>
      </div>
    </>
  );
}
