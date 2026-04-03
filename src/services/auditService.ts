import { supabaseAdmin } from '../supabase';
import { UserRole } from '../types/auth';

const DEFAULT_ACTOR_ROLE: UserRole = UserRole.Teacher;

export type AuditAction =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.role_changed'
  | 'user.status_changed'
  | 'user.password_reset'
  | 'auth.login'
  | 'auth.logout'
  | 'auth.failed_login'
  | 'class.created'
  | 'class.updated'
  | 'class.deleted'
  | 'enrollment.created'
  | 'enrollment.deleted'
  | 'attendance.marked'
  | 'homework.graded'
  | 'exam.graded'
  | 'announcement.created'
  | 'message.sent'
  | 'data.exported'
  | 'data.bulk_operation';

export interface AuditLogEntry {
  id?: string;
  action: AuditAction;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole;
  targetType: 'user' | 'class' | 'enrollment' | 'attendance' | 'homework' | 'exam' | 'announcement' | 'message' | 'system';
  targetId: string;
  targetLabel?: string;
  changes?: Array<{
    field: string;
    oldValue: string;
    newValue: string;
  }>;
  metadata?: Record<string, unknown>;
  timestamp?: string;
  ipAddress?: string;
}

class AuditService {
  private enabled = true;

  disable() {
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }

  async log(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<string | null> {
    if (!this.enabled) return null;

    try {
      const { data, error } = await supabaseAdmin
        .from('audit_logs')
        .insert({
          actor_id: entry.actorId,
          actor_email: entry.actorEmail,
          action: entry.action,
          resource_type: entry.targetType,
          resource_id: entry.targetId,
          details: {
            target_label: entry.targetLabel,
            changes: entry.changes,
            ...entry.metadata,
          },
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('[AuditService] Failed to write audit log:', error);
      return null;
    }
  }

  async logUserAction(
    action: AuditAction,
    actor: { id: string; email: string; role: UserRole },
    target: { id: string; type: AuditLogEntry['targetType']; label?: string },
    changes?: AuditLogEntry['changes'],
    metadata?: Record<string, unknown>
  ) {
    return this.log({
      action,
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      targetType: target.type,
      targetId: target.id,
      targetLabel: target.label,
      changes,
      metadata,
    });
  }

  async getRecentLogs(count = 50): Promise<AuditLogEntry[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(count);

      if (error) {
        throw error;
      }

      return (data || []).map(log => ({
        id: log.id,
        actorId: log.actor_id,
        actorEmail: log.actor_email,
        actorRole: DEFAULT_ACTOR_ROLE,
        action: log.action as AuditAction,
        targetType: log.resource_type as AuditLogEntry['targetType'],
        targetId: log.resource_id,
        targetLabel: log.details?.target_label as string,
        changes: log.details?.changes as AuditLogEntry['changes'],
        metadata: log.details,
        timestamp: log.created_at,
      }));
    } catch (error) {
      console.error('[AuditService] Failed to fetch audit logs:', error);
      return [];
    }
  }

  async getLogsByTarget(targetType: AuditLogEntry['targetType'], targetId: string): Promise<AuditLogEntry[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('audit_logs')
        .select('*')
        .eq('resource_type', targetType)
        .eq('resource_id', targetId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      return (data || []).map(log => ({
        id: log.id,
        actorId: log.actor_id,
        actorEmail: log.actor_email,
        actorRole: DEFAULT_ACTOR_ROLE,
        action: log.action as AuditAction,
        targetType: log.resource_type as AuditLogEntry['targetType'],
        targetId: log.resource_id,
        targetLabel: log.details?.target_label as string,
        changes: log.details?.changes as AuditLogEntry['changes'],
        metadata: log.details,
        timestamp: log.created_at,
      }));
    } catch (error) {
      console.error('[AuditService] Failed to fetch target logs:', error);
      return [];
    }
  }

  async getLogsByActor(actorId: string): Promise<AuditLogEntry[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('audit_logs')
        .select('*')
        .eq('actor_id', actorId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      return (data || []).map(log => ({
        id: log.id,
        actorId: log.actor_id,
        actorEmail: log.actor_email,
        actorRole: DEFAULT_ACTOR_ROLE,
        action: log.action as AuditAction,
        targetType: log.resource_type as AuditLogEntry['targetType'],
        targetId: log.resource_id,
        targetLabel: log.details?.target_label as string,
        changes: log.details?.changes as AuditLogEntry['changes'],
        metadata: log.details,
        timestamp: log.created_at,
      }));
    } catch (error) {
      console.error('[AuditService] Failed to fetch actor logs:', error);
      return [];
    }
  }
}

export const auditService = new AuditService();

export function formatAuditAction(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    'user.created': 'Created user',
    'user.updated': 'Updated user',
    'user.deleted': 'Deleted user',
    'user.role_changed': 'Changed user role',
    'user.status_changed': 'Changed user status',
    'user.password_reset': 'Reset user password',
    'auth.login': 'User logged in',
    'auth.logout': 'User logged out',
    'auth.failed_login': 'Failed login attempt',
    'class.created': 'Created class',
    'class.updated': 'Updated class',
    'class.deleted': 'Deleted class',
    'enrollment.created': 'Enrolled student',
    'enrollment.deleted': 'Removed enrollment',
    'attendance.marked': 'Marked attendance',
    'homework.graded': 'Graded homework',
    'exam.graded': 'Graded exam',
    'announcement.created': 'Posted announcement',
    'message.sent': 'Sent message',
    'data.exported': 'Exported data',
    'data.bulk_operation': 'Bulk operation performed',
  };
  return labels[action] ?? action;
}
