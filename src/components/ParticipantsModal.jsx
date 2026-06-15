import React, { useEffect, useState } from 'react'
import { X, Users, Mail, Building, Calendar, Medal } from 'lucide-react'
import { useRegistrationStore } from '../store/registrationStore'
import { format } from 'date-fns'

export default function ParticipantsModal({ event, onClose }) {
  const { eventRegistrations, fetchEventRegistrations, isLoading } = useRegistrationStore()
  
  useEffect(() => {
    if (event?.id || event?._id) {
      fetchEventRegistrations(event.id || event._id)
    }
  }, [event, fetchEventRegistrations])

  const individualRegs = eventRegistrations?.filter(r => r.participationType === 'Individual') || []
  const teamRegs = eventRegistrations?.filter(r => r.participationType === 'Team') || []

  const isTeamEvent = event?.category === 'Hackathon' || teamRegs.length > 0 || event?.participationType === 'Team'

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Participants List</h2>
            <p className="text-sm text-gray-500 mt-1">{event.title} • {event.attendees || 0} Total Attendees</p>
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
          ) : isTeamEvent ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Users size={18} /> Team Registrations ({teamRegs.length})
              </h3>
              {teamRegs.length === 0 ? (
                <p className="text-gray-500 bg-white p-4 rounded-xl border border-gray-100">No teams registered yet.</p>
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-medium">Team Name</th>
                        <th className="px-6 py-4 font-medium">Team Lead</th>
                        <th className="px-6 py-4 font-medium">Members</th>
                        <th className="px-6 py-4 font-medium">Member Emails</th>
                        <th className="px-6 py-4 font-medium">Reg Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {teamRegs.map(reg => (
                        <tr key={reg._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-800">{reg.teamId?.name || 'Unknown Team'}</td>
                          <td className="px-6 py-4">
                            <div className="font-medium">{reg.teamId?.owner?.name || 'N/A'}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Mail size={10}/>{reg.teamId?.owner?.email}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            <ul className="list-disc pl-4 text-xs space-y-1">
                              {reg.teamId?.members?.map((m, i) => (
                                <li key={i}>{m.name || 'Unknown'}</li>
                              ))}
                              {!reg.teamId?.members?.length && <span className="text-gray-400 italic">No additional members</span>}
                            </ul>
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-xs">
                             <ul className="space-y-1">
                              {reg.teamId?.members?.map((m, i) => (
                                <li key={i}>{m.email || 'N/A'}</li>
                              ))}
                            </ul>
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
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Users size={18} /> Individual Registrations ({individualRegs.length})
              </h3>
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
                        <th className="px-6 py-4 font-medium">Reg Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {individualRegs.map(reg => (
                        <tr key={reg._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-800">{reg.studentId?.name || reg.formData?.name || 'Unknown'}</td>
                          <td className="px-6 py-4 flex items-center gap-2 text-gray-600">
                            <Mail size={14} className="text-gray-400" />
                            {reg.studentId?.email || reg.formData?.email || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                            <Building size={14} className="text-gray-400" />
                            {reg.studentId?.department || reg.formData?.department || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {reg.studentId?.year || reg.formData?.year || 'N/A'}
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
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
