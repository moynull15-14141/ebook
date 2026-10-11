// Repository pattern: storage details are hidden behind a narrow interface.
export function createMemoryRepository(initial=[]){
  const records=new Map(initial.map(x=>[x.id,structuredClone(x)]));
  return {
    async list(){return [...records.values()].map(x=>structuredClone(x))},
    async get(id){const item=records.get(id);return item?structuredClone(item):null},
    async save(booking){records.set(booking.id,structuredClone(booking));return structuredClone(booking)}
  };
}
export function createBrowserRepository(storage,key='travel-flow-bookings'){
  function read(){try{const raw=JSON.parse(storage.getItem(key)||'[]');return Array.isArray(raw)?raw:[]}catch{return []}}
  function write(records){storage.setItem(key,JSON.stringify(records))}
  return {
    async list(){return read()},
    async get(id){return read().find(x=>x.id===id)||null},
    async save(booking){const records=read().filter(x=>x.id!==booking.id);records.push(booking);write(records);return booking}
  };
}
