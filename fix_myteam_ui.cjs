const fs = require('fs');
const filePath = 'src/pages/HackathonTeammateFinder.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldLeadUI = `                      <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">L</div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Team Lead</p>
                      </div>`;
                      
const newLeadUI = `                      <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {String(myTeam.owner?.name || myTeam.createdBy?.name || '?').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{String(myTeam.owner?.name || myTeam.createdBy?.name || 'Unknown Lead')}</p>
                        <p className="text-xs text-gray-500">{String(myTeam.owner?.email || myTeam.createdBy?.email || '')}</p>
                      </div>`;

content = content.replace(oldLeadUI, newLeadUI);
fs.writeFileSync(filePath, content);
console.log("Updated My Team Lead UI");
