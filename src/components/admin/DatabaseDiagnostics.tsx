
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDatabaseDiagnostics } from '@/hooks/useDatabaseDiagnostics';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const DatabaseDiagnostics = () => {
  const { diagnostics, loading, runDiagnostics } = useDatabaseDiagnostics();

  const renderTestResult = (testName: string, result: any) => {
    const hasError = result?.error;
    const hasData = result?.data || result?.count !== undefined;

    return (
      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          {hasError ? (
            <XCircle className="w-5 h-5 text-red-500" />
          ) : hasData ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          )}
          <h4 className="font-medium">{testName}</h4>
        </div>
        
        {hasError && (
          <div className="mb-2">
            <Badge variant="destructive">Error</Badge>
            <p className="text-sm text-red-600 mt-1">{result.error}</p>
          </div>
        )}
        
        {hasData && (
          <div className="mb-2">
            <Badge variant="default">Success</Badge>
            {result.count !== undefined && (
              <p className="text-sm text-green-600 mt-1">Count: {result.count}</p>
            )}
            {result.data && (
              <p className="text-sm text-green-600 mt-1">
                Records found: {Array.isArray(result.data) ? result.data.length : 1}
              </p>
            )}
          </div>
        )}
        
        <details className="mt-2">
          <summary className="text-sm text-gray-600 cursor-pointer">View Details</summary>
          <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto max-h-32">
            {JSON.stringify(result, null, 2)}
          </pre>
        </details>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Database Diagnostics
          <Button onClick={runDiagnostics} disabled={loading} size="sm">
            {loading ? 'Running...' : 'Run Diagnostics'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!diagnostics && (
          <p className="text-gray-600">Click "Run Diagnostics" to check database connectivity and schema.</p>
        )}
        
        {diagnostics && (
          <div className="space-y-4">
            {diagnostics.error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800">Critical Error</h4>
                <p className="text-red-600">{diagnostics.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {renderTestResult('Product Count', diagnostics.count)}
                {renderTestResult('Minimal Query', diagnostics.minimal)}
                {renderTestResult('Boolean Columns', diagnostics.booleanColumns)}
                {renderTestResult('Full Admin Query', diagnostics.fullAdmin)}
                {renderTestResult('Public Query', diagnostics.public)}
                {renderTestResult('Developmental Levels', diagnostics.levels)}
                {renderTestResult('Developmental Goals', diagnostics.goals)}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseDiagnostics;
