const API_BASE_URL = typeof window !== 'undefined' ? '/api' : 'http://localhost:4000/api';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('pragyam_token') : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle binary responses (PDF or Excel)
    const contentType = response.headers.get('content-type') || '';
    if (
      contentType.includes('application/pdf') ||
      contentType.includes('application/vnd.openxmlformats') ||
      contentType.includes('application/octet-stream') ||
      contentType.includes('text/csv')
    ) {
      if (!response.ok) {
        return {
          success: false,
          error: `Download failed with server status ${response.status}`
        };
      }
      const blob = await response.blob();
      return { success: true, data: blob as any };
    }

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const result = await response.json();
        errorMessage = result.error || errorMessage;
      } catch {
        // Not valid JSON
      }
      return {
        success: false,
        error: errorMessage,
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error connecting to Pragyam Server' };
  }
}
