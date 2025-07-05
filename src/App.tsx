import React, { useState } from "react";

// Mock data for DAG
const formDAG = {
  "Form A": [],
  "Form B": ["Form A"],
  "Form C": ["Form A"],
  "Form D": ["Form B"],
  "Form E": ["Form C"],
};

const formFields: Record<string, string[]> = {
  "Form A": ["email", "name"],
  "Form B": ["email", "dynamic_checkbox_group"],
  "Form C": ["email"],
  "Form D": ["email", "dynamic_checkbox_group", "dynamic_object"],
  "Form E": ["email"],
};

const globalFields = ["Global.clientId", "Global.timestamp"];

function getAllUpstreamForms(form: string, dag: Record<string, string[]>): string[] {
  const visited = new Set<string>();
  const result: string[] = [];

  function dfs(node: string) {
    if (visited.has(node)) return;
    visited.add(node);
    const parents = dag[node] || [];
    for (const parent of parents) {
      result.push(parent);
      dfs(parent);
    }
  }

  dfs(form);
  return result;
}

const App: React.FC = () => {
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [prefillMap, setPrefillMap] = useState<Record<string, string>>({});

  const handlePrefillClick = (field: string) => {
    const upstreamForms = selectedForm ? getAllUpstreamForms(selectedForm, formDAG) : [];
    const options: string[] = [];

    upstreamForms.forEach((form) => {
      formFields[form].forEach((fieldName) => {
        options.push(`${form}.${fieldName}`);
      });
    });

    globalFields.forEach((globalField) => options.push(globalField));

    const choice = prompt(
      `Choose prefill for ${field}:\n` +
        options.map((opt, i) => `${i + 1}. ${opt}`).join("\n")
    );

    const index = parseInt(choice || "", 10) - 1;
    if (index >= 0 && index < options.length) {
      setPrefillMap({ ...prefillMap, [field]: options[index] });
    }
  };

  const handleClear = (field: string) => {
    const newMap = { ...prefillMap };
    delete newMap[field];
    setPrefillMap(newMap);
  };

  return (
    <div className="p-4 font-sans">
      <h1 className="text-2xl font-bold mb-4">Form List</h1>
      <ul className="mb-6">
        {Object.keys(formDAG).map((form) => (
          <li key={form}>
            <button
              className="text-blue-600 underline"
              onClick={() => {
                setSelectedForm(form);
                setPrefillMap({});
              }}
            >
              {form}
            </button>
          </li>
        ))}
      </ul>

      {selectedForm && (
        <div className="border p-4 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-2">Prefill Mapping for {selectedForm}</h2>
          {formFields[selectedForm].map((field) => (
            <div
              key={field}
              className="flex items-center justify-between border-b py-2"
            >
              <div>
                <strong>{field}:</strong>{" "}
                {prefillMap[field] || <em>not mapped</em>}
              </div>
              <div>
                {prefillMap[field] ? (
                  <button
                    className="text-red-500"
                    onClick={() => handleClear(field)}
                  >
                    ✕
                  </button>
                ) : (
                  <button
                    className="text-green-600"
                    onClick={() => handlePrefillClick(field)}
                  >
                    + Set
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;