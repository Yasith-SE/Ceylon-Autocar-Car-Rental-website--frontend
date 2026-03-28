import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const UploadCar = () => {
  // 1. Individual states for each field to match the FormData logic
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Handle file selection and create a local preview for the Admin
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file)); // This creates a temporary URL for the preview <img>
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation to ensure a file is selected
    if (!imageFile) {
      alert("Please select an image file first.");
      return;
    }

    setLoading(true);

    // 2. Using FormData is mandatory for Multipart/Form-Data (File Uploads)
    const formData = new FormData();
    formData.append('name', name);
    formData.append('year', year);
    formData.append('price', price);
    formData.append('imageFile', imageFile); // 'imageFile' matches the MultipartFile field in your Java DTO

    try {
      const response = await fetch('http://localhost:8080/api/uploadcars', {
        method: 'POST',
        // Important: Do NOT set 'Content-Type' headers. 
        // The browser automatically sets it to multipart/form-data with the correct boundary.
        body: formData,
      });

      if (response.ok) {
        alert("Car published successfully!");
        navigate('/available');
      } else {
        const errorData = await response.text();
        console.error("Backend Error:", errorData);
        alert("Failed to upload. Check backend console for Media Type errors.");
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Error connecting to server. Make sure Spring Boot is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ marginTop: '120px', maxWidth: '600px' }}>
        <div className="card shadow border-0 p-4">
          <h3 className="fw-bold mb-4 text-center">Upload New Car</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold">Car Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Nissan GTR Nismo" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>

            <div className="row mb-3">
              <div className="col">
                <label className="form-label small fw-bold">Year</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="2024" 
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required 
                />
              </div>
              <div className="col">
                <label className="form-label small fw-bold">Price / Day ($)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="150" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold">Select Car Image</label>
              <input 
                type="file" 
                className="form-control" 
                accept="image/*" 
                onChange={handleFileChange} 
                required 
              />
              
              {/* Image Preview Area */}
              {preview && (
                <div className="mt-3 text-center">
                  <p className="small text-muted mb-1">Image Preview:</p>
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="rounded shadow-sm" 
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} 
                  />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-danger w-100 rounded-pill fw-bold py-2 shadow-sm" 
              disabled={loading}
            >
              {loading ? (
                <span><span className="spinner-border spinner-border-sm me-2"></span>Uploading to System...</span>
              ) : (
                "Publish Car Listing"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default UploadCar;