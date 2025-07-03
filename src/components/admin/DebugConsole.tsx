
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertTriangle, Info, X, Bug } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  message: string;
  details?: any;
  module: string;
}

interface DebugConsoleProps {
  module: string;
  className?: string;
  logs?: string[];
  onClear?: () => void;
}

const DebugConsole = ({ module, className, logs: externalLogs, onClear: externalOnClear }: DebugConsoleProps) => {
  const [internalLogs, setInternalLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const displayLogs = externalLogs || internalLogs.map(log => 
    `[${log.timestamp.toLocaleTimeString()}] ${log.level.toUpperCase()}: ${log.message}${log.details ? ` | ${JSON.stringify(log.details)}` : ''}`
  );
  
  const clearLogs = externalOnClear || (() => {
    console.log(`[${module}] Clearing debug logs`);
    setInternalLogs([]);
  });

  const addLog = useCallback((level: LogEntry['level'], message: string, details?: any) => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      level,
      message,
      details,
      module
    };
    
    // Always log to browser console
    const consoleMethod = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;
    consoleMethod(`[${module}] ${level.toUpperCase()}: ${message}`, details || '');
    
    setInternalLogs(prev => [newLog, ...prev].slice(0, 100));
  }, [module]);

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return <X className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
    }
  };

  // Initialize debug logger only once
  useEffect(() => {
    try {
      const loggerKey = `debugLogger_${module}`;
      const logger = {
        error: (message: string, details?: any) => addLog('error', message, details),
        warning: (message: string, details?: any) => addLog('warning', message, details),
        info: (message: string, details?: any) => addLog('info', message, details)
      };
      
      // Ensure window object exists and is accessible
      if (typeof window !== 'undefined') {
        (window as any)[loggerKey] = logger;
        
        // Log successful initialization
        console.log(`🐛 Debug console for ${module} initialized successfully`);
        logger.info(`Debug console initialized for ${module} module`);
        
        // Test the logger immediately
        setTimeout(() => {
          logger.info(`Debug console for ${module} is ready and functional`);
        }, 100);
      }
    } catch (error) {
      console.error(`Failed to initialize debug console for ${module}:`, error);
    }

    return () => {
      try {
        if (typeof window !== 'undefined') {
          const loggerKey = `debugLogger_${module}`;
          delete (window as any)[loggerKey];
        }
      } catch (error) {
        console.error(`Error cleaning up debug console for ${module}:`, error);
      }
    };
  }, [module, addLog]); // Include addLog in dependencies since it's now memoized

  // Auto-expand console if there are errors
  useEffect(() => {
    const hasErrors = internalLogs.some(log => log.level === 'error');
    if (hasErrors && !isExpanded) {
      setIsExpanded(true);
    }
  }, [internalLogs, isExpanded]);

  if (!isExpanded) {
    const errorCount = internalLogs.filter(log => log.level === 'error').length;
    const warningCount = internalLogs.filter(log => log.level === 'warning').length;
    
    return (
      <div className={className}>
        <Button 
          variant={errorCount > 0 ? "destructive" : warningCount > 0 ? "secondary" : "outline"} 
          size="sm" 
          onClick={() => setIsExpanded(true)} 
          className="mb-4"
        >
          <Bug className="w-4 h-4 mr-2" />
          Debug Console - {module} ({displayLogs.length} logs)
          {errorCount > 0 && <Badge variant="destructive" className="ml-2">{errorCount} errors</Badge>}
          {warningCount > 0 && <Badge variant="secondary" className="ml-2">{warningCount} warnings</Badge>}
        </Button>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between py-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bug className="w-4 h-4" />
          Debug Console - {module}
        </CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={clearLogs}>
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setIsExpanded(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {displayLogs.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  No logs yet 😊
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try performing some actions to see debug info.
                </p>
              </div>
            ) : (
              <>
                {internalLogs.length > 0 ? (
                  internalLogs.map((log) => (
                    <div key={log.id} className={`flex items-start gap-2 text-xs border-l-2 pl-3 py-2 rounded-r ${
                      log.level === 'error' ? 'border-red-500 bg-red-50' :
                      log.level === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}>
                      {getLevelIcon(log.level)}
                      <div className="flex-1 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">[{log.timestamp.toLocaleTimeString()}]</span>
                          <Badge variant={getLevelColor(log.level)} className="text-xs">{log.level}</Badge>
                        </div>
                        <p className="mt-1 break-all">{log.message}</p>
                        {log.details && (
                          <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  displayLogs.map((log, index) => (
                    <div key={index} className="text-xs border-l-2 border-muted pl-3 py-1 font-mono">
                      <p className="break-all">{log}</p>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DebugConsole;
