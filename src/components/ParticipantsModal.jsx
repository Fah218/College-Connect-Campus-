import React, { useEffect, useState } from 'react'
import { X, Users, Mail, Building, Calendar, Medal, Download, Phone, Eye } from 'lucide-react'
import { useRegistrationStore } from '../store/registrationStore'
import { format } from 'date-fns'

export default function ParticipantsModal({ event, onClose }) {
  const { eventRegistrations, fetchEventRegistrations, isLoading } = useRegistrationStore()
  const [selectedTeam, setSelectedTeam] = useState(null)
  
  useEffect(() => {
    if (event?.id || event?._id) {
      fetchEventRegistrations(event.id || event._id)
    }
  }, [event, fetchEventRegistrations])

  const individualRegs = eventRegistrations?.filter(r => r.participationType === 'Individual') || []
  const teamRegs = eventRegistrations?.filter(r => r.participationType === 'Team') || []

  const isTeamEvent = event?.maxTeamSize > 1 || event?.participationType === 'Team'

  const downloadCSV = (type) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (type === 'Individual') {
      csvContent += "Name,Email,Department,Year,Phone,Registration Date\n";
      individualRegs.forEach(reg => {
        const name = (reg.studentId?.name || reg.formData?.name || 'Unknown').replace(/,/g, ' ');
        const email = (reg.studentId?.email || reg.formData?.email || 'N/A').replace(/,/g, ' ');
        const department = (reg.studentId?.department || reg.formData?.department || 'N/A').replace(/,/g, ' ');
        const year = (reg.studentId?.year || reg.formData?.year || 'N/A').replace(/,/g, ' ');
        const phone = (reg.studentId?.phone || reg.formData?.phone || 'N/A').replace(/,/g, ' ');
        const date = format(new Date(reg.createdAt), 'MMM dd yyyy');
        csvContent += `${name},${email},${department},${year},${phone},${date}\n`;
      });
    } else {
      csvContent += "Team Name,Team Lead,Lead Email,Member Names,Member Emails,Team Size,Registration Date\n";
      teamRegs.forEach(reg => {
        let title, lead, leadEmail, members, memberEmails, size;
        
          title = (reg.teamId?.title).replace(/,/g, ' ');
          lead = (reg.teamId?.createdBy?.name || 'N/A').replace(/,/g, ' ');
          leadEmail = (reg.teamId?.createdBy?.email || 'N/A').replace(/,/g, ' ');
          members = [...(reg.teamId?.currentMembers || []), ...(reg.teamId?.offlineMembers || [])].map(m => m.name || m.email).join(' | ').replace(/,/g, ' ');
          memberEmails = [...(reg.teamId?.currentMembers || []), ...(reg.teamId?.offlineMembers || [])].map(m => m.email).join(' | ').replace(/,/g, ' ');
          size = (reg.teamId?.currentMembers ? reg.teamId.currentMembers.length + 1 : 1);
        
        const date = format(new Date(reg.createdAt), 'MMM dd yyyy');
        csvContent += `${title},${lead},${leadEmail},${members},${memberEmails},${size},${date}\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${event.title.replace(/ /g, '_')}_${type}_Registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Participants List</h2>
            <p className="text-sm text-gray-500 mt-1">
              {event.title} • {
                isTeamEvent 
                  ? `${teamRegs.length} Teams • ${teamRegs.reduce((acc, r) => acc + (r.teamId?.calculatedTeamSize || 1), 0) + individualRegs.length} Total Participants`
                  : `${individualRegs.length} Registered Students`
              }
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {(isTeamEvent || teamRegs.length > 0) && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                      <Users size={18} /> Team Registrations ({teamRegs.length})
                    </h3>
                    <button onClick={() => downloadCSV('Team')} className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg text-sm font-medium transition-colors">
                      <Download size={16} /> Export Team CSV
                    </button>
                  </div>
                  {teamRegs.length === 0 ? (
                    <p className="text-gray-500 bg-white p-4 rounded-xl border border-gray-100">No teams registered yet.</p>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-4 font-medium">Team Name</th>
                            <th className="px-6 py-4 font-medium">Team Lead</th>
                            <th className="px-6 py-4 font-medium">Lead Email</th>
                            <th className="px-6 py-4 font-medium">Team Size</th>
                            <th className="px-6 py-4 font-medium">Reg Date</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {teamRegs.map(reg => (
                            <tr key={reg._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-800">{reg.teamId?.title}</td>
                              <td className="px-6 py-4">
                                <div className="font-medium">{reg.teamId?.createdBy?.name}</div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Mail size={14} className="text-gray-400" />
                                  {reg.teamId?.createdBy?.email}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {reg.teamId?.calculatedTeamSize}
                              </td>
                              <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                {format(new Date(reg.createdAt), 'MMM dd, yyyy')}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => setSelectedTeam(reg)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                                >
                                  <Eye size={14} />
                                  View Team
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {(!isTeamEvent || individualRegs.length > 0) && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                      <Users size={18} /> Individual Registrations ({individualRegs.length})
                    </h3>
                    <button onClick={() => downloadCSV('Individual')} className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg text-sm font-medium transition-colors">
                      <Download size={16} /> Export Individual CSV
                    </button>
                  </div>
                  {individualRegs.length === 0 ? (
                    <p className="text-gray-500 bg-white p-4 rounded-xl border border-gray-100">No students registered yet.</p>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-4 font-medium">Full Name</th>
                            <th className="px-6 py-4 font-medium">Email</th>
                            <th className="px-6 py-4 font-medium">Department</th>
                            <th className="px-6 py-4 font-medium">Year</th>
                            <th className="px-6 py-4 font-medium">Phone Number</th>
                            <th className="px-6 py-4 font-medium">Reg Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {individualRegs.map(reg => (
                            <tr key={reg._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-800">{reg.studentId?.name || reg.formData?.name || 'Unknown'}</td>
                              <td className="px-6 py-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Mail size={14} className="text-gray-400" />
                                  {reg.studentId?.email || reg.formData?.email || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Building size={14} className="text-gray-400" />
                                  {reg.studentId?.department || reg.formData?.department || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {reg.studentId?.year || reg.formData?.year || 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Phone size={14} className="text-gray-400" />
                                  {reg.studentId?.phone || reg.formData?.phone || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                {format(new Date(reg.createdAt), 'MMM dd, yyyy')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors">
            Close
          </button>
        </div>
      </div>

      {selectedTeam && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Team Details</h3>
              <button onClick={() => setSelectedTeam(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Team Name</p>
                  <p className="font-semibold text-gray-800">{selectedTeam.teamId?.title}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Registration Date</p>
                  <p className="font-semibold text-gray-800">{format(new Date(selectedTeam.createdAt), 'MMMM dd, yyyy')}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Team Size</p>
                  <p className="font-semibold text-gray-800">{selectedTeam.teamId?.calculatedTeamSize} Members</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-2">Team Lead</h4>
                <div className="flex flex-col gap-2 p-3 bg-primary-50 rounded-lg border border-primary-100">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-primary-900">{selectedTeam.teamId?.createdBy?.name}</span>
                    <div className="flex items-center gap-2 text-primary-700 text-sm">
                      <Mail size={14} />
                      {selectedTeam.teamId?.createdBy?.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-primary-700 text-sm">
                    <Phone size={14} />
                    {selectedTeam.teamId?.createdBy?.phone || 'Phone: —'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-2">Team Members</h4>
                {[...(selectedTeam.teamId?.currentMembers || []), ...(selectedTeam.teamId?.offlineMembers || [])].length > 0 ? (
                  <ul className="space-y-3">
                    {[...(selectedTeam.teamId?.currentMembers || []), ...(selectedTeam.teamId?.offlineMembers || [])].map((m, idx) => (
                      <li key={idx} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{m.name || 'N/A'}</span>
                            {m.joinedVia && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${m.joinedVia === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
                                {m.joinedVia}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Mail size={14} />
                            {m.email || 'N/A'}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-gray-500 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Phone size={14} />
                            {m.phone ? m.phone : 'Phone: —'}
                          </div>
                          {(m.department || m.year) && (
                            <div className="flex items-center gap-1.5">
                              <Building size={14} />
                              {m.department || '—'} {m.year ? `(${m.year})` : ''}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic text-sm">No additional members.</p>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button onClick={() => setSelectedTeam(null)} className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
