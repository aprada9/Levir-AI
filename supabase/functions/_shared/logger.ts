import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

export interface LogEntry {
  function_name: string;
  message: string;
  data?: any;
}

/**
 * Persistent logger that stores logs in the database
 * for debugging Edge Functions
 */
export class EdgeLogger {
  private supabase: SupabaseClient;
  private functionName: string;
  private enabled: boolean;

  constructor(supabase: SupabaseClient, functionName: string, enabled = true) {
    this.supabase = supabase;
    this.functionName = functionName;
    this.enabled = enabled;
  }

  /**
   * Log a message with optional data to the console and database
   */
  async log(message: string, data?: any): Promise<void> {
    if (!this.enabled) return;
    
    // Always log to console
    console.log(`[${this.functionName}] ${message}`, data !== undefined ? data : '');
    
    try {
      // Sanitize data for database storage
      let sanitizedData = null;
      if (data !== undefined) {
        // Sanitize sensitive data (like full user IDs)
        const sanitized = this.sanitizeData(data);
        sanitizedData = JSON.stringify(sanitized);
      }
      
      // Log to database
      const logEntry: LogEntry = {
        function_name: this.functionName,
        message,
        data: sanitizedData
      };
      
      const { error } = await this.supabase
        .from('debug_logs')
        .insert(logEntry);
      
      if (error) {
        console.error('Failed to persist log:', error);
      }
    } catch (err) {
      // Don't let logging errors break the main function
      console.error('Error in logger:', err);
    }
  }
  
  /**
   * Log an error with stack trace
   */
  async error(message: string, error: Error): Promise<void> {
    await this.log(`ERROR: ${message}`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }
  
  /**
   * Sanitize data for database storage
   * Masks sensitive fields like user IDs and API keys
   */
  private sanitizeData(data: any): any {
    if (!data) return null;
    
    // Handle primitive types
    if (typeof data !== 'object') return data;
    
    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }
    
    // Clone the object to avoid modifying the original
    const result = { ...data };
    
    // Mask sensitive fields
    for (const [key, value] of Object.entries(result)) {
      // Mask user IDs, API keys, and tokens
      if (
        key.toLowerCase().includes('user_id') || 
        key.toLowerCase().includes('userid') ||
        key.toLowerCase() === 'id' && typeof value === 'string' && value.length > 20 ||
        key.toLowerCase().includes('key') || 
        key.toLowerCase().includes('token') || 
        key.toLowerCase().includes('password')
      ) {
        if (typeof value === 'string' && value.length > 6) {
          result[key] = `${value.substring(0, 3)}...${value.substring(value.length - 3)}`;
        }
      } 
      // Recursively sanitize nested objects
      else if (typeof value === 'object' && value !== null) {
        result[key] = this.sanitizeData(value);
      }
    }
    
    return result;
  }
} 