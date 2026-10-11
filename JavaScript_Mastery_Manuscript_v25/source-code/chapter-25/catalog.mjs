export const packages=Object.freeze([{id:'sylhet',title:'Sylhet Escape',price:7500},{id:'cox',title:'Cox’s Bazar Weekend',price:12000},{id:'sreemangal',title:'Sreemangal Retreat',price:9000}]);
export const findPackage=id=>packages.find(item=>item.id===id);
