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
  const [largeImageSrc, setLargeImageSrc] = useState<string>();
  const [resumo, setResumo] = useState<any[]>([]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setImagemPreview(URL.createObjectURL(file));
      setArquivo(file);
      console.log("Arquivo selecionado:", event.target.files?.[0]);
    }
  }

  function openLargeView(e: React.MouseEvent, src: string) {
    e.preventDefault();
    setLargeImageSrc(src);
    setIsLargeViewOpen(true);
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

      const subdir = new URL(data.results[0]).pathname.split("/")[2]; 

      setResultados(imagens);
      setCsvUrl(subdir);
      setResumo(data.resumo);

    } catch (err) {
      console.error(err);
      setStatus("Erro ao enviar a imagem");
    }

  }

  function resetUpload() {
    setImagemPreview(undefined);
    setArquivo(undefined);
    setStatus(undefined);
    setResultados([]);
    setCsvUrl(undefined);
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
              "Fazer upload da imagem"
            ) : (
              <>
                <div className="PreviewBox" onClick={(e) => openLargeView(e, imagemPreview)}>
                  <img
                    src={imagemPreview}
                    alt="Pré-visualização (Clique para ampliar)"
                    className="imgPreview"
                  />
                </div>
                <h4 className="previewTitle">Trocar imagem</h4>
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
      {isLargeViewOpen && largeImageSrc && (
        <div className="largeViewModal" onClick={() => setIsLargeViewOpen(false)}>
            <div className="modalContent" onClick={e => e.stopPropagation()}>
              <button onClick={() => setIsLargeViewOpen(false)}>
                &times;
              </button>
              <img src={largeImageSrc} alt="Visualização Grande" className="largeImage" />
            </div>
        </div>
      )}
      
      {/* Resultados */}
      <div className='resultadosContainer'>
        {resultados.length > 0 && (
          <div className="resultadosCard">
            <h3>Imagens Processadas:</h3>
            <div className="resultadosGrid">
              {resultados.map((url, index) => (
                <div key={index} className="imgBox">
                  <img 
                    src={url} 
                    alt={`Processado ${index}`} 
                    className='imgResultado'
                    onClick={(e) => openLargeView(e, url)}
                  />                
                </div>
              ))}
            </div>
            
            <div className="resumoContainer">
              <h3>Resumo da Cobertura e Densidade:</h3>
              {resumo.map((row, idx) => (
                <div key={idx} className="resumoRow">
                  {Object.entries(row).map(([key, val]) => (
                    <p key={key}><strong>{key}:</strong> {String(val)}</p>
                  ))}
                </div>
              ))}
            </div>


            <div className='buttonDownloadContainer'>
            <a
              href={`http://localhost:5000/download_csvs/${csvUrl}`}
              className="buttonDownload"
              target="_blank"
              rel="noopener noreferrer"
            >
              Baixar CSVs
            </a>
            <button className="btEnviar" onClick={resetUpload}>Enviar nova imagem</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
