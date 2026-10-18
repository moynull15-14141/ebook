import { createApplication }
  from '../../project/visa-flow/src/domain/application.mjs';
import { applyAction, isFinal }
  from '../../project/visa-flow/src/domain/workflow.mjs';

function undo(application) {
  if (isFinal(application.status) || application.history.length < 2) {
    throw new Error(`${application.status} থেকে Undo করা যায় না`);
  }
  const history = application.history.slice(0, -1);
  const { status } = history.at(-1);
  return Object.freeze({ ...application, status, history });
}

const now = new Date('2026-10-15T10:00:00Z');
const draft = createApplication(
  { applicant: 'Rafi', country: 'Malaysia', visaType: 'tourist', travelers: 1 },
  { newId: () => 'VF-001', now });
const submitted = applyAction(draft, 'submit', now);
const asked = applyAction(submitted, 'requestDocuments', now);

console.log(undo(asked).status, undo(undo(asked)).status);
for (const app of [draft, applyAction(draft, 'withdraw', now)]) {
  try {
    undo(app);
  } catch (error) {
    console.log(error.message);
  }
}
