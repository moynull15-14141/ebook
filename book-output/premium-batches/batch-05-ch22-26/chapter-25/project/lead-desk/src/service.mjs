import { validateNewLead, assertTransition, STATUSES } from './leads.mjs';
import {
  badRequest, forbidden, notFound, conflict, preconditionFailed,
} from './errors.mjs';

// অনুমতির নিয়ম এক জায়গায়। Agent দেখেন নিজের ও কারও-না-দেওয়া Lead;
// বদলাতে পারেন শুধু নিজেরটি। Manager সব।
const canSee = (user, lead) => user.role === 'manager'
  || lead.assignee === user.id || lead.assignee === null;
const canEdit = (user, lead) =>
  user.role === 'manager' || lead.assignee === user.id;

export function createLeadService({ repository, now = () => new Date() }) {
  const idempotency = new Map();

  async function create(user, body, idempotencyKey) {
    const input = validateNewLead(body);
    const key = idempotencyKey ? `${user.id}:${idempotencyKey}` : null;
    const fingerprint = JSON.stringify(input);
    const previous = key ? idempotency.get(key) : undefined;
    if (previous) {
      if (previous.fingerprint !== fingerprint) {
        throw conflict('IDEMPOTENCY_MISMATCH', 'একই Key, ভিন্ন অনুরোধ');
      }
      return { lead: await repository.get(previous.leadId), replayed: true };
    }
    const lead = {
      id: await repository.nextId(), ...input, status: 'new',
      assignee: user.role === 'agent' ? user.id : null,
      version: 1, createdAt: now().toISOString(),
    };
    await repository.insert(lead);
    if (key) {
      idempotency.set(key, { fingerprint, leadId: lead.id });
    }
    return { lead, replayed: false };
  }

  async function get(user, id) {
    const lead = await repository.get(id);
    if (!lead || !canSee(user, lead)) {
      throw notFound('Lead');
    }
    return lead;
  }

  async function list(user, { status, after = '', limit = '20' }) {
    const size = Number(limit);
    if (!Number.isInteger(size) || size < 1 || size > 100) {
      throw badRequest('limit ১ থেকে ১০০');
    }
    if (status !== undefined && !STATUSES.includes(status)) {
      throw badRequest(`অজানা status: ${status}`);
    }
    const where = (lead) =>
      canSee(user, lead) && (!status || lead.status === status);
    return repository.list({ where, after: String(after), limit: size });
  }

  async function update(user, id, patch, expectedVersion) {
    const lead = await get(user, id);
    if (!canEdit(user, lead)) {
      throw forbidden();
    }
    if (expectedVersion !== undefined && expectedVersion !== lead.version) {
      throw preconditionFailed();
    }
    const fields = Object.keys(patch ?? {});
    const unknown = fields.filter((k) => !['status', 'assignee'].includes(k));
    if (unknown.length > 0 || fields.length === 0) {
      throw badRequest('শুধু status বা assignee বদলানো যায়', unknown);
    }
    const next = { ...lead, version: lead.version + 1 };
    if ('status' in patch) {
      assertTransition(lead.status, patch.status);
      next.status = patch.status;
    }
    if ('assignee' in patch) {
      if (user.role !== 'manager') {
        throw forbidden();
      }
      const { assignee } = patch;
      next.assignee = typeof assignee === 'string' ? assignee : null;
    }
    if (!(await repository.replace(next, lead.version))) {
      throw preconditionFailed();
    }
    return next;
  }

  async function remove(user, id) {
    await get(user, id);
    if (user.role !== 'manager') {
      throw forbidden();
    }
    await repository.remove(id);
  }

  return { create, get, list, update, remove };
}
