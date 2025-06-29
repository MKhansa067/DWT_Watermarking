import React, { useState } from 'react';

function App() {
  const [embedCover, setEmbedCover] = useState(null);
  const [embedWatermark, setEmbedWatermark] = useState(null);
  const [stegoImageSrc, setStegoImageSrc] = useState(null);
  const [embedLoading, setEmbedLoading] = useState(false);
  const [embedError, setEmbedError] = useState(null);
  const [embedPsnr, setEmbedPsnr] = useState(null);

  const [extractStego, setExtractStego] = useState(null);
  const [extractedWmSrc, setExtractedWmSrc] = useState(null);
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractError, setExtractError] = useState(null);

  const handleEmbedSubmit = async (e) => {
    e.preventDefault();
    setEmbedLoading(true);
    setEmbedError(null);
    setStegoImageSrc(null);
    setEmbedPsnr(null);

    if (!embedCover || !embedWatermark) {
      setEmbedError("Please select both cover and watermark images.");
      setEmbedLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("cover", embedCover);
    formData.append("watermark", embedWatermark);
    formData.append("alpha", 0.4);
    formData.append("level", 1);

    try {
      const response = await fetch("/api/embed", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setStegoImageSrc(imageUrl);
        setEmbedPsnr(response.headers.get("PSNR"));
        alert(`Embedding successful! PSNR: ${response.headers.get("PSNR")}`);
        // Optional: Trigger download
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = 'stego.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

      } else {
        const errorData = await response.json();
        setEmbedError(errorData.error || "Failed to embed watermark.");
      }
    } catch (error) {
      console.error("Embedding API error:", error);
      setEmbedError("An unexpected error occurred during embedding.");
    } finally {
      setEmbedLoading(false);
    }
  };

  const handleExtractSubmit = async (e) => {
    e.preventDefault();
    setExtractLoading(true);
    setExtractError(null);
    setExtractedWmSrc(null);

    if (!extractStego) {
      setExtractError("Please select a stego image.");
      setExtractLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("stego", extractStego);
    formData.append("alpha", 0.4);
    formData.append("level", 1);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setExtractedWmSrc(imageUrl);
        alert("Extraction successful!");
        
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = 'watermark.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        setExtractError(errorData.error || "Failed to extract watermark.");
      }
    } catch (error) {
      console.error("Extraction API error:", error);
      setExtractError("An unexpected error occurred during extraction.");
    } finally {
      setExtractLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', margin: '20px' }}>
      <h1>DWT Watermarking Demo (JavaScript)</h1>

      <section>
        <h2>Embed Watermark</h2>
        <form onSubmit={handleEmbedSubmit}>
          <div>
            <label>Cover Image:</label>
            <input type="file" accept="image/*" onChange={(e) => setEmbedCover(e.target.files[0])} />
          </div>
          <div>
            <label>Watermark Image:</label>
            <input type="file" accept="image/*" onChange={(e) => setEmbedWatermark(e.target.files[0])} />
          </div>
          <button type="submit" disabled={embedLoading}>
            {embedLoading ? "Embedding..." : "Embed & Download Stego"}
          </button>
          {embedError && <p style={{ color: 'red' }}>Error: {embedError}</p>}
          {stegoImageSrc && (
            <div>
              <h3>Stego Image:</h3>
              <img src={stegoImageSrc} alt="Stego" style={{ maxWidth: '300px', maxHeight: '300px', border: '1px solid #ccc' }} />
              {embedPsnr && <p>PSNR: {embedPsnr} dB</p>}
            </div>
          )}
        </form>
      </section>

      <hr style={{ margin: '40px 0' }} />

      <section>
        <h2>Extract Watermark</h2>
        <form onSubmit={handleExtractSubmit}>
          <div>
            <label>Stego Image:</label>
            <input type="file" accept="image/*" onChange={(e) => setExtractStego(e.target.files[0])} />
          </div>
          <button type="submit" disabled={extractLoading}>
            {extractLoading ? "Extracting..." : "Extract & Download Watermark"}
          </button>
          {extractError && <p style={{ color: 'red' }}>Error: {extractError}</p>}
          {extractedWmSrc && (
            <div>
              <h3>Extracted Watermark:</h3>
              <img src={extractedWmSrc} alt="Extracted Watermark" style={{ maxWidth: '300px', maxHeight: '300px', border: '1px solid #ccc' }} />
            </div>
          )}
        </form>
      </section>
    </div>
  );
}

export default App;
