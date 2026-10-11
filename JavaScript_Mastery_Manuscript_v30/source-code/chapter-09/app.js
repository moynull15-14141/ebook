(() => {
'use strict';
const KEY='javascript-mastery-ch09-tasks-v1';
const $=id=>document.getElementById(id);
const form=$('taskForm'),title=$('taskTitle'),list=$('taskList'),notice=$('notice'),search=$('search'),filter=$('filter');
let tasks=TaskCore.parseStored(read());
function read(){try{return localStorage.getItem(KEY);}catch{return null;}}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(tasks));return true;}catch{notice.textContent='Storage unavailable. Changes work until this page reloads.';return false;}}
function render(){const shown=TaskCore.filterTasks(tasks,filter.value,search.value);list.replaceChildren();const count=TaskCore.stats(tasks);$('summary').textContent=`Total ${count.total} • Active ${count.active} • Completed ${count.completed}`;$('empty').hidden=shown.length>0;
for(const task of shown){const li=document.createElement('li');li.dataset.id=task.id;if(task.completed)li.classList.add('done');const check=document.createElement('input');check.type='checkbox';check.checked=task.completed;check.setAttribute('aria-label',`Complete ${task.title}`);check.dataset.action='toggle';const span=document.createElement('span');span.className='task-title';span.textContent=task.title;const edit=document.createElement('button');edit.type='button';edit.textContent='Edit';edit.dataset.action='edit';const del=document.createElement('button');del.type='button';del.textContent='Delete';del.className='delete';del.dataset.action='delete';li.append(check,span,edit,del);list.append(li);}}
function commit(next){tasks=next;notice.textContent='';persist();render();}
form.addEventListener('submit',event=>{event.preventDefault();try{const id=globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random()}`;commit(TaskCore.addTask(tasks,title.value,id));form.reset();title.focus();}catch(err){notice.textContent=err.message;}});
list.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;const li=button.closest('li');if(!li)return;const id=li.dataset.id;if(button.dataset.action==='delete')commit(TaskCore.deleteTask(tasks,id));if(button.dataset.action==='edit'){const old=tasks.find(t=>t.id===id);const updated=prompt('Edit task',old.title);if(updated===null)return;try{commit(TaskCore.editTask(tasks,id,updated));}catch(err){notice.textContent=err.message;}}});
list.addEventListener('change',event=>{if(event.target.matches('input[data-action="toggle"]')){const li=event.target.closest('li');if(li)commit(TaskCore.toggleTask(tasks,li.dataset.id));}});
search.addEventListener('input',render);filter.addEventListener('change',render);
$('clearCompleted').addEventListener('click',()=>commit(TaskCore.clearCompleted(tasks)));
render();
})();
