// Composition Root (Browser): একমাত্র জায়গা যেখানে সব অংশ জোড়া লাগে।
import { createVisaService } from './app/service.mjs';
import { createEventBus } from './app/events.mjs';
import { createStorageRepository } from './infra/storage-repository.mjs';
import { renderApplications, renderSummary } from './ui/view.mjs';
import { sequenceAfter } from './app/ids.mjs';

const $ = (selector) => document.querySelector(selector);
const repository = createStorageRepository(localStorage);
const events = createEventBus({ onError: (error) => console.error(error) });
const service = createVisaService({
  repository,
  events,
  nextId: sequenceAfter('VF', repository.list().map((item) => item.id)),
});

function refresh() {
  renderApplications($('#applications'), service.list(), handleAction);
  renderSummary($('#summary'), service.summary());
}

function handleAction(id, action) {
  try {
    service.act(id, action);
  } catch (error) {
    $('#message').textContent = error.message;
  }
}

// তিনজন Subscriber, একে অপরকে না চিনে: Console Log, পর্দা, বার্তা।
events.on('application:created', (e) => {
  console.log(`নতুন ${e.id} ৳${e.fee}`);
});
events.on('application:changed', (e) => {
  console.log(`${e.id}: ${e.from} থেকে ${e.to}`);
});
for (const type of ['application:created', 'application:changed']) {
  events.on(type, refresh);
  events.on(type, () => {
    $('#message').textContent = '';
  });
}

$('#new-application').addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    service.create({
      applicant: $('#applicant').value,
      country: $('#country').value,
      visaType: $('#visa-type').value,
      travelers: Number($('#travelers').value),
      express: $('#express').checked,
    });
    event.target.reset();
  } catch (error) {
    $('#message').textContent = error.message;
  }
});

refresh();
