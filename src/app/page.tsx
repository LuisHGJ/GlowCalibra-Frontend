"use client";
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [imagemPreview, setImagemPreview] = useState<string>();
  const [arquivo, setArquivo] = useState<File>();
  const [status, setStatus] = useState<string>();
  const [resultados, setResultados] = useState<string[]>([]);
  const [csvUrl, setCsvUrl] = useState<string>();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setImagemPreview(URL.createObjectURL(file));
      setArquivo(file);
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
      const response = await fetch("http://localhost:5000/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Falha no upload");

      const data = await response.json();
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
      <Image
        src="/assets/logo.png"
        height={300}
        width={300}
        alt="Logo"
      />

      <form onSubmit={handleUpload} className="uploadFotoForm">
        <input
          id="uploadFoto"
          name="uploadFoto"
          type="file"
          accept="image/*"
          className="inputForm"
          onChange={handleFileChange}
        />

        <label htmlFor="uploadFoto" className="labelForm"> Selecionar imagem </label>

        {imagemPreview && (
          <div className="PreviewBox">
            <img
              src={imagemPreview}
              alt="Pré-visualização"
              className="imgPreview"
            />
          </div>
        )}

        <button type="submit" className="btEnviar">Enviar</button>

        {status && <p>{status}</p>}
      </form>

      {resultados.length > 0 && (
        <div className="resultados">
          <h2>Imagens Processadas:</h2>
          {resultados.map((url, index) => (
            <div key={index} className="imgBox">
              <img src={url} alt={`Processado ${index}`} style={{ maxWidth: "300px", margin: "10px" }} />
            </div>
          ))}
        </div>
      )}

      {csvUrl && (
        <div className="csvDownload">
          <a href={csvUrl} download>
            Baixar CSV com resultados
          </a>
        </div>
      )}
    </div>
  );
}
