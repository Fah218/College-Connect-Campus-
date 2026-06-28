const fs = require('fs');
const file = 'src/pages/EventRegistrationPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// The block starts right after `{isIndividualHackathon ? (`
// Actually, it's easier to check if we can add a ternary before `isIndividualHackathon` 
// like `!isHackathon && event.participationType === 'Team' ? ( ... non hackathon team form ) : isIndividualHackathon ? ( ...`

const targetRender = `{isIndividualHackathon ? (`;

const newRender = `{!isHackathon && event.participationType === 'Team' ? (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Team Registration</h2>
                  <form onSubmit={handleNonHackathonTeamRegistration} className="space-y-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Team Name <span className="text-red-500">*</span></label>
                      <input type="text" value={offlineTeamData.title} onChange={(e) => setOfflineTeamData({ ...offlineTeamData, title: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow" required placeholder="e.g. The Innovators" />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">Team Leader</h3>
                      <div className="p-4 bg-gray-50 border rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                          <input type="text" value={user?.name || ''} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                          <input type="email" value={user?.email || ''} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                          <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
                          <input type="text" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Year</label>
                          <input type="text" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Team Members</h3>
                        <p className="text-sm text-gray-500">Size: {offlineTeamData.members.length + 1} / {event.maxTeamSize}</p>
                      </div>
                      
                      {offlineTeamData.members.map((member, index) => (
                        <div key={index} className="p-4 border rounded-xl relative bg-white">
                          <button type="button" onClick={() => removeOfflineMember(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                          </button>
                          <h4 className="font-semibold text-sm mb-3">Member {index + 1}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name <span className="text-red-500">*</span></label>
                              <input type="text" value={member.name} onChange={(e) => updateOfflineMember(index, 'name', e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Email <span className="text-red-500">*</span></label>
                              <input type="email" value={member.email} onChange={(e) => updateOfflineMember(index, 'email', e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Phone <span className="text-red-500">*</span></label>
                              <input type="tel" value={member.phone} onChange={(e) => updateOfflineMember(index, 'phone', e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Department <span className="text-red-500">*</span></label>
                              <input type="text" value={member.department} onChange={(e) => updateOfflineMember(index, 'department', e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Year <span className="text-red-500">*</span></label>
                              <input type="text" value={member.year} onChange={(e) => updateOfflineMember(index, 'year', e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                            </div>
                          </div>
                        </div>
                      ))}

                      {offlineTeamData.members.length + 1 < (event.maxTeamSize || 99) && (
                        <button type="button" onClick={addOfflineMember} className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl font-medium hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center gap-2">
                          <PlusCircle size={20} />
                          Add Team Member
                        </button>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t">
                      <button type="submit" disabled={loading || !isApproved || isPastDeadline || offlineTeamData.members.length + 1 < (event.teamSizeMin || 1)} className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Registering...' : 'Register Team'}
                      </button>
                      {offlineTeamData.members.length + 1 < (event.teamSizeMin || 1) && (
                        <p className="text-red-500 text-sm text-center mt-2">You need at least {event.teamSizeMin} members to register.</p>
                      )}
                    </div>
                  </form>
                </>
              ) : {isIndividualHackathon ? (`;

content = content.replace(targetRender, newRender);

fs.writeFileSync(file, content);
console.log("Patched render");
