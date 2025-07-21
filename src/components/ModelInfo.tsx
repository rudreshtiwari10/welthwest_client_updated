import React from 'react';

interface ModelInfoProps {
  model: string;
  modelError?: string;
}

const ModelInfo: React.FC<ModelInfoProps> = ({ model, modelError }) => {
  // Map model IDs to more user-friendly names
  const modelNames: Record<string, string> = {
    'llama': 'Llama (Local)',
    'openai': 'OpenAI',
    'openrouter': 'OpenRouter'
  };

  const displayName = modelNames[model] || model;
  
  return (
    <div className="model-info text-xs">
      <span className="font-medium">Model: {displayName}</span>
      
      {modelError && (
        <div className="text-red-500 mt-1">
          <span className="font-medium">Error:</span> {modelError}
        </div>
      )}
    </div>
  );
};

export default ModelInfo; 