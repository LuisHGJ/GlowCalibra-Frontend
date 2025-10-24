"use client";
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [imagemPreview, setImagemPreview] = useState<string>();
  const [arquivo, setArquivo] = useState<File>();
  const [status, setStatus] = useState<string>();
  const [resultados, setResultados] = useState<string[]>([]);
  const [csvUrl, setCsvUrl] = useState<string>();
  const [isLargeViewOpen, setIsLargeViewOpen] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setImagemPreview(URL.createObjectURL(file));
      setArquivo(file);
      console.log("Arquivo selecionado:", event.target.files?.[0]);
    }
  }

  function openLargeView(e: React.MouseEvent) {
    e.preventDefault(); 
    if (imagemPreview) {
      setIsLargeViewOpen(true);
    }
  }

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault(); 

    if (!arquivo) {
      setStatus("Selecione um arquivo antes de enviar!");
      return;
    }

    const formData = new FormData();
    formData.append("file", arquivo);

    try {
      console.log("Upload iniciado");
      const response = await fetch("http://localhost:5000/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Falha no upload");

      const data = await response.json();
      console.log("Resposta:", data);
      console.log(data);
      setStatus("Upload realizado com sucesso!");

      const imagens: string[] = [];
      let csv: string = "";
      data.results.forEach((url: string) => {
        if (url.endsWith(".csv")) {
          csv = url;
        } else {
          imagens.push(url);
        }
      });

      setResultados(imagens);
      setCsvUrl(csv);

    } catch (err) {
      console.error(err);
      setStatus("Erro ao enviar a imagem");
    }

  }

  return (
    <div className="main">
      <div className="titleBox">
        <Image
        src="/assets/logo.png"
        height={300}
        width={300}
        alt="Logo"
        className='logoImg'
        />
        <h1 className="title">Glow Calibra</h1>
      </div>

      {/* Área de upload */}
      {resultados.length === 0 && (
        <form onSubmit={handleUpload} className="uploadFotoForm">
          <input
            id="uploadFoto"
            name="uploadFoto"
            type="file"
            accept="image/*"
            className="inputForm"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <label
            htmlFor="uploadFoto"
            className={`labelForm ${imagemPreview ? 'hasImage' : ''}`}
          >
            {!imagemPreview ? (
              "Selecione a imagem"
            ) : (
              <>
                <div className="PreviewBox" onClick={openLargeView}>
                  <img
                    src={imagemPreview}
                    alt="Pré-visualização (Clique para ampliar)"
                    className="imgPreview"
                  />
                </div>
                <h2 className="previewTitle">Trocar imagem</h2>
              </>
            )}
          </label>
          <div className='buttonContainer'>
            <button type="submit" className="btEnviar">Enviar</button>
          </div>
          {status && <p>{status}</p>}
        </form>
      )}

      {/* Modal da imagem */}
      {isLargeViewOpen && imagemPreview && (
      <div className="largeViewModal" onClick={() => setIsLargeViewOpen(false)}>
          <div className="modalContent" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsLargeViewOpen(false)}>
              &times;
            </button>
            <img src={imagemPreview} alt="Visualização Grande" className="largeImage" />
          </div>
      </div>
      )}
      
      {/* Resultados */}
      <div className='resultadosContainer'>
        {resultados.length > 0 && (
          <div className="resultadosCard">
            <h2>Imagens Processadas:</h2>
            <div className="resultadosGrid">
              {resultados.map((url, index) => (
                <div key={index} className="imgBox">
                  <img src={url} alt={`Processado ${index}`} />
                </div>
              ))}
            </div>
            <div className='buttonDownloadContainer'>
              {csvUrl && (
                <div className="csvDownload">
                  <a href={csvUrl} download className='buttonDownload'>
                    Baixar CSV com resultados
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
