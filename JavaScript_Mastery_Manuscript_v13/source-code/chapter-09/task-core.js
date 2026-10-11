/* Task Manager: pure data logic. Browser and Node compatible. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.TaskCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const STATUSES=['active','completed'];
function assertText(text){if(typeof text!=='string'||!text.trim())throw new Error('Task title is required');const value=text.trim();if(value.length>120)throw new Error('Task title must be 120 characters or fewer');return value;}
function makeTask(title,id,now=new Date().toISOString()){return {id:String(id),title:assertText(title),completed:false,createdAt:now};}
function addTask(tasks,title,id,now){if(tasks.some(t=>t.id===String(id)))throw new Error('Duplicate task id');return [...tasks,makeTask(title,id,now)];}
function toggleTask(tasks,id){return tasks.map(t=>t.id===id?{...t,completed:!t.completed}:t);}
function editTask(tasks,id,title){const clean=assertText(title);return tasks.map(t=>t.id===id?{...t,title:clean}:t);}
function deleteTask(tasks,id){return tasks.filter(t=>t.id!==id);}
function clearCompleted(tasks){return tasks.filter(t=>!t.completed);}
function filterTasks(tasks,filter='all',query=''){if(!['all',...STATUSES].includes(filter))throw new Error('Unknown filter');const needle=String(query).trim().toLocaleLowerCase();return tasks.filter(t=>(filter==='all'||(filter==='completed'?t.completed:!t.completed))&&t.title.toLocaleLowerCase().includes(needle));}
function stats(tasks){return {total:tasks.length,active:tasks.filter(t=>!t.completed).length,completed:tasks.filter(t=>t.completed).length};}
function isTask(t){return t&&typeof t==='object'&&typeof t.id==='string'&&t.id.length>0&&typeof t.title==='string'&&t.title.trim().length>0&&t.title.length<=120&&typeof t.completed==='boolean'&&typeof t.createdAt==='string';}
function parseStored(raw){if(raw==null)return [];try{const data=JSON.parse(raw);return Array.isArray(data)?data.filter(isTask).map(t=>({id:t.id,title:t.title,completed:t.completed,createdAt:t.createdAt})):[];}catch{return [];}}
return {assertText,makeTask,addTask,toggleTask,editTask,deleteTask,clearCompleted,filterTasks,stats,parseStored};
});
