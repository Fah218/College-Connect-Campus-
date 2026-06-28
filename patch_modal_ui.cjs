const fs = require('fs');
const file = 'src/components/ParticipantsModal.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldTr = `<tr key={reg._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-800">{reg.teamId?.title || reg.teamId?.name || 'Unknown Team'}</td>
                              <td className="px-6 py-4">
                                <div className="font-medium">{reg.teamId?.createdBy?.name || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Mail size={14} className="text-gray-400" />
                                  {reg.teamId?.createdBy?.email || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {reg.teamId?.currentMembers ? reg.teamId.currentMembers.length + 1 : 1}
                              </td>
                              <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                {format(new Date(reg.createdAt), 'MMM dd, yyyy')}
                              </td>`;

const newTr = `<tr key={reg._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-800">{reg.teamDetails?.teamName || reg.teamId?.title || reg.teamId?.name || 'Unknown Team'}</td>
                              <td className="px-6 py-4">
                                <div className="font-medium">{reg.teamDetails ? (reg.teamDetails.members?.find(m => m.role === 'Leader')?.name || 'N/A') : (reg.teamId?.createdBy?.name || 'N/A')}</div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Mail size={14} className="text-gray-400" />
                                  {reg.teamDetails ? (reg.teamDetails.members?.find(m => m.role === 'Leader')?.email || 'N/A') : (reg.teamId?.createdBy?.email || 'N/A')}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {reg.teamDetails ? (reg.teamDetails.members?.length || 1) : (reg.teamId?.currentMembers ? reg.teamId.currentMembers.length + 1 : 1)}
                              </td>
                              <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                {format(new Date(reg.createdAt), 'MMM dd, yyyy')}
                              </td>`;

content = content.replace(oldTr, newTr);

const oldModalContent = `                  <p className="font-semibold text-gray-800">{selectedTeam.teamId?.title || selectedTeam.teamId?.name || 'Unknown Team'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Registration Date</p>
                  <p className="font-semibold text-gray-800">{format(new Date(selectedTeam.createdAt), 'MMMM dd, yyyy')}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Team Size</p>
                  <p className="font-semibold text-gray-800">{selectedTeam.teamId?.currentMembers ? selectedTeam.teamId.currentMembers.length + 1 : 1} Members</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-2">Team Lead</h4>
                <div className="flex flex-col gap-2 p-3 bg-primary-50 rounded-lg border border-primary-100">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-primary-900">{selectedTeam.teamId?.createdBy?.name || 'N/A'}</span>
                    <div className="flex items-center gap-2 text-primary-700 text-sm">
                      <Mail size={14} />
                      {selectedTeam.teamId?.createdBy?.email || 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-primary-700 text-sm">
                    <Phone size={14} />
                    {selectedTeam.teamId?.createdBy?.phone ? selectedTeam.teamId.createdBy.phone : 'Phone: —'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-2">Team Members</h4>
                {selectedTeam.teamId?.currentMembers && selectedTeam.teamId.currentMembers.length > 0 ? (
                  <ul className="space-y-3">
                    {selectedTeam.teamId.currentMembers.map((m, idx) => (`;

const newModalContent = `                  <p className="font-semibold text-gray-800">{selectedTeam.teamDetails?.teamName || selectedTeam.teamId?.title || selectedTeam.teamId?.name || 'Unknown Team'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Registration Date</p>
                  <p className="font-semibold text-gray-800">{format(new Date(selectedTeam.createdAt), 'MMMM dd, yyyy')}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Team Size</p>
                  <p className="font-semibold text-gray-800">{selectedTeam.teamDetails ? selectedTeam.teamDetails.members?.length || 1 : selectedTeam.teamId?.currentMembers ? selectedTeam.teamId.currentMembers.length + 1 : 1} Members</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-2">Team Lead</h4>
                <div className="flex flex-col gap-2 p-3 bg-primary-50 rounded-lg border border-primary-100">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-primary-900">{selectedTeam.teamDetails ? (selectedTeam.teamDetails.members?.find(m => m.role === 'Leader')?.name || 'N/A') : (selectedTeam.teamId?.createdBy?.name || 'N/A')}</span>
                    <div className="flex items-center gap-2 text-primary-700 text-sm">
                      <Mail size={14} />
                      {selectedTeam.teamDetails ? (selectedTeam.teamDetails.members?.find(m => m.role === 'Leader')?.email || 'N/A') : (selectedTeam.teamId?.createdBy?.email || 'N/A')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-primary-700 text-sm">
                    <Phone size={14} />
                    {selectedTeam.teamDetails ? (selectedTeam.teamDetails.members?.find(m => m.role === 'Leader')?.phone || 'Phone: —') : (selectedTeam.teamId?.createdBy?.phone ? selectedTeam.teamId.createdBy.phone : 'Phone: —')}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-2">Team Members</h4>
                {(selectedTeam.teamDetails ? (selectedTeam.teamDetails.members?.filter(m => m.role !== 'Leader') || []) : (selectedTeam.teamId?.currentMembers || [])).length > 0 ? (
                  <ul className="space-y-3">
                    {(selectedTeam.teamDetails ? (selectedTeam.teamDetails.members?.filter(m => m.role !== 'Leader') || []) : (selectedTeam.teamId?.currentMembers || [])).map((m, idx) => (`;

content = content.replace(oldModalContent, newModalContent);

fs.writeFileSync(file, content);
console.log("Patched ParticipantsModal UI");
