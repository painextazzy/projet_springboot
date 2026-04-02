// src/components/manager/Sauvegarde.jsx
import React, { useState, useEffect } from "react";
import { api } from "../../services/api";

const Sauvegarde = () => {
  const [tables, setTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [allTables, setAllTables] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [importFile, setImportFile] = useState(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const tablesList = await api.getSauvegardeTables();
      setTables(tablesList);
      setSelectedTables(tablesList);
    } catch (error) {
      console.error("Erreur chargement tables:", error);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const exportData = await api.exportDatabase({
        allTables: allTables,
        tables: selectedTables,
      });

      // Créer le fichier JSON à télécharger
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_petitebouffe_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setMessage({
        type: "success",
        text: "Sauvegarde exportée avec succès !",
      });
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de l'exportation" });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      setMessage({ type: "error", text: "Veuillez sélectionner un fichier" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const text = await importFile.text();
      const data = JSON.parse(text);
      await api.importDatabase(data);
      setMessage({ type: "success", text: "Import effectué avec succès !" });
      setImportFile(null);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors de l'importation: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTable = (tableName) => {
    if (selectedTables.includes(tableName)) {
      setSelectedTables(selectedTables.filter((t) => t !== tableName));
    } else {
      setSelectedTables([...selectedTables, tableName]);
    }
  };

  const selectAllTables = () => {
    setSelectedTables([...tables]);
  };

  const deselectAllTables = () => {
    setSelectedTables([]);
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <main className="flex-grow max-w-5xl mx-auto px-6 pt-12 pb-24 w-full">
        {/* Header */}
        <header className="mb-12">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">
            Sauvegarde & Restauration
          </h1>
          <p className="text-secondary font-medium">
            Exportez ou importez vos données
          </p>
        </header>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export Card */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl text-primary">
                backup
              </span>
            </div>
            <h2 className="text-xl font-bold mb-2">Exporter les données</h2>
            <p className="text-secondary text-sm mb-6">
              Téléchargez une sauvegarde de vos données
            </p>

            {/* Options d'export */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={allTables}
                    onChange={() => setAllTables(true)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">Toutes les tables</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!allTables}
                    onChange={() => setAllTables(false)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">Sélectionner les tables</span>
                </label>
              </div>

              {!allTables && (
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-medium">
                      Tables disponibles
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllTables}
                        className="text-xs text-primary hover:underline"
                      >
                        Tout sélectionner
                      </button>
                      <button
                        onClick={deselectAllTables}
                        className="text-xs text-secondary hover:underline"
                      >
                        Tout désélectionner
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {tables.map((table) => (
                      <label
                        key={table}
                        className="flex items-center gap-2 cursor-pointer p-2 hover:bg-surface-container rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTables.includes(table)}
                          onChange={() => toggleTable(table)}
                          className="w-4 h-4 text-primary rounded"
                        />
                        <span className="text-sm">{table}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleExport}
              disabled={loading || (!allTables && selectedTables.length === 0)}
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Export en cours...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">
                    download
                  </span>
                  Télécharger la sauvegarde
                </>
              )}
            </button>
          </div>

          {/* Import Card */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl text-primary">
                restore
              </span>
            </div>
            <h2 className="text-xl font-bold mb-2">Restaurer les données</h2>
            <p className="text-secondary text-sm mb-6">
              Importez un fichier de sauvegarde JSON
            </p>

            <div className="mb-6">
              <label className="block w-full p-4 border-2 border-dashed border-outline-variant rounded-lg cursor-pointer hover:border-primary transition-all text-center">
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  className="hidden"
                />
                <span className="material-symbols-outlined text-3xl text-secondary mb-2">
                  upload_file
                </span>
                <p className="text-sm text-secondary">
                  {importFile
                    ? importFile.name
                    : "Cliquez ou glissez un fichier JSON"}
                </p>
              </label>
            </div>

            <button
              onClick={handleImport}
              disabled={loading || !importFile}
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Import en cours...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">
                    upload
                  </span>
                  Restaurer les données
                </>
              )}
            </button>
          </div>
        </div>

        {/* Warning */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-yellow-600">
              warning
            </span>
            <span className="font-semibold text-yellow-800">Attention</span>
          </div>
          <ul className="text-sm text-yellow-700 space-y-1 ml-6 list-disc">
            <li>
              La restauration remplacera TOUTES les données existantes dans les
              tables sélectionnées
            </li>
            <li>
              Il est recommandé de faire une sauvegarde avant toute restauration
            </li>
            <li>Le fichier de sauvegarde doit être au format JSON</li>
            <li>
              La restauration peut prendre quelques secondes selon la taille des
              données
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Sauvegarde;
