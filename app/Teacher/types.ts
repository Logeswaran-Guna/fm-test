export interface AssignedRequirement {
    id: string;
    parent_name: string;
    student_name: string;
    grade_class?: string;
    subjects_needed?: string;
    location_address?: string;
    phone_number?: string;
    status: string;
    created_at: string;
  }
  
  export type StatusType = 'pending' | 'matched' | 'demo scheduled' | 'completed';
  
  export function normalizeStatus(status?: string): StatusType {
    if (!status) return 'pending';
    const lower = status.toLowerCase().replace(/_/g, ' ');
    if (lower.includes('demo')) return 'demo scheduled';
    if (lower.includes('match')) return 'matched';
    if (lower.includes('complet')) return 'completed';
    return 'pending';
  }