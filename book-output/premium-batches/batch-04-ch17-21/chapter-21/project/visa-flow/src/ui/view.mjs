import { availableActions } from '../domain/workflow.mjs';

const LABELS = {
  submit: 'জমা দিন',
  requestDocuments: 'কাগজ চাই',
  resubmit: 'আবার জমা',
  approve: 'অনুমোদন',
  reject: 'প্রত্যাখ্যান',
  withdraw: 'প্রত্যাহার',
};

// View শুধু আঁকে; কোন কাজ চলবে তা State Machine বলে, কী ঘটবে তা onAction।
export function renderApplications(list, applications, onAction) {
  list.replaceChildren(...applications.map((application) => {
    const row = document.createElement('li');
    row.dataset.id = application.id;
    const text = document.createElement('span');
    text.textContent = `${application.id} · ${application.applicant} · `
      + `${application.country} ${application.visaType} · ৳${application.fee}`
      + ` · ${application.status}`;
    row.append(text);
    for (const action of availableActions(application.status)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `act-${action}`;
      button.textContent = LABELS[action] ?? action;
      button.addEventListener('click', () => onAction(application.id, action));
      row.append(button);
    }
    return row;
  }));
}

export function renderSummary(element, { counts, approvedFees }) {
  const parts = Object.entries(counts).map(([status, n]) => `${status} ${n}`);
  element.textContent = `${parts.join(', ') || 'কোনো আবেদন নেই'}`
    + ` · অনুমোদিত Fee ৳${approvedFees}`;
}
