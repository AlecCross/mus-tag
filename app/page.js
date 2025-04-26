'use client';

import { useState } from 'react';
import { parseBlob } from 'music-metadata';

export default function Page() {
  const [files, setFiles] = useState([]);
  const [tags, setTags] = useState({});

  async function readTags(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const metadata = await parseBlob(file);
          resolve({
            title: metadata.common.title,
            artist: metadata.common.artist,
            album: metadata.common.album,
            // Додайте інші потрібні вам властивості
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  async function handleDirectoryOpen() {
    try {
      const directoryHandle = await window.showDirectoryPicker();
      const filesInDirectory = [];

      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file' && entry.name.match(/\.(mp3|ogg|wav|flac|aac)$/i)) {
          const file = await entry.getFile();
          filesInDirectory.push(file);
        }
      }

      setFiles(filesInDirectory);
      const tagsData = {};
      for (const file of filesInDirectory) {
        const tag = await readTags(file);
        tagsData[file.name] = tag;
      }
      setTags(tagsData);

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Помилка при виборі каталогу:', error);
      }
    }
  }

  return (
    <>
      <h1>Next.js + Serwist</h1>
      <button onClick={handleDirectoryOpen}>Обрати папку з аудіофайлами</button>
      {files.length > 0 && (
        <div>
          <h2>Обрані аудіофайли:</h2>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
      {Object.keys(tags).length > 0 && (
        <div>
          <h2>Теги файлів:</h2>
          <pre>{JSON.stringify(tags, null, 2)}</pre>
        </div>
      )}
    </>
  );
}
