import api from './api';

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  status: 'online' | 'offline' | 'busy' | 'active';
  lastActiveAt: string;
}

/**
 * 获取团队成员列表
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  const response = await api.get('/api/team/members');
  return response.data.items;
}
