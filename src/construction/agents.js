export const agents = [
  {id:'architect',name:'Architect',color:'#a78bfa'},
  {id:'designer',name:'Designer',color:'#f38bab'},
  {id:'developer',name:'Developer',color:'#79a8f5'},
  {id:'ai',name:'AI Agent',color:'#80d4a0'},
  {id:'researcher',name:'Researcher',color:'#f2b177'},
  {id:'ml',name:'ML Engineer',color:'#6ad2dd'},
  {id:'writer',name:'Content Agent',color:'#c5acf1'},
  {id:'qa',name:'QA Agent',color:'#e5ce7a'},
  {id:'layout',name:'Layout Agent',color:'#c29bfb'},
  {id:'systems',name:'Systems Agent',color:'#7cc9e8'},
  {id:'frontend',name:'Frontend Agent',color:'#ee8c99'},
  {id:'backend',name:'Backend Agent',color:'#8fcaac'},
  {id:'accessibility',name:'Accessibility',color:'#e2b38a'},
  {id:'integration',name:'Integration',color:'#98c7ed'},
  {id:'motion',name:'Motion Agent',color:'#c8a9df'},
  {id:'tools',name:'Tool Builder',color:'#b1d68b'},
  {id:'data',name:'Data Agent',color:'#73d0c8'},
  {id:'review',name:'Review Agent',color:'#e1bd76'},
];

export function shuffled(items){
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
