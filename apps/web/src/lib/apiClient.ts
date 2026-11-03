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
    const contentType = response.headers.get('content-type');
    if (
      contentType?.includes('application/pdf') ||
      contentType?.includes('application/vnd.openxmlformats')
    ) {
      const blob = await response.blob();
      return { success: response.ok, data: blob as any };
    }

    const result = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Request failed with status ${response.status}`,
      };
    }

    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error connecting to Pragyam Server' };
  }
}
