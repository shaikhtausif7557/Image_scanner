import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [barcodeData, setBarcodeData] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus(`Upload successful: ${response.data.message}`);
      setExtractedText(response.data.text);
      setBarcodeData(response.data.barcodes);
    } catch (error) {
      setUploadStatus(`Upload failed: ${error.response?.data?.error || error.message}`);
      setExtractedText(''); // Clear any previously extracted text
      setBarcodeData([]); // Clear any previously extracted barcode data
    }
  };

  return (
    <div>
      <h2>Upload Image</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {uploadStatus && <p>{uploadStatus}</p>}
      {extractedText && (
        <div>
          <h3>Extracted Text:</h3>
          <p>{extractedText}</p>
        </div>
      )}
      {barcodeData.length > 0 && (
        <div>
          <h3>Detected Barcodes/QR Codes:</h3>
          <ul>
            {barcodeData.map((barcode, index) => (
              <li key={index}>
                <strong>Type:</strong> {barcode.type} <br />
                <strong>Data:</strong> {barcode.data}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;