import { AlertCircle, CheckCircle, Users } from 'lucide-react'

export default function SkillMatcher({ team, availableStudents }) {
  const requiredSkills = ['React', 'Node.js', 'Python', 'ML', 'UI/UX']
  const teamSkills = team.members?.flatMap(m => m.skills || []) || []
  
  const missingSkills = requiredSkills.filter(skill => 
    !teamSkills.some(ts => ts.toLowerCase().includes(skill.toLowerCase()))
  )
  
  const matchedStudents = availableStudents
    .map(student => {
      const matchCount = missingSkills.filter(skill =>
        student.skills?.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      ).length
      
      return {
        ...student,
        matchCount,
        matchedSkills: missingSkills.filter(skill =>
          student.skills?.some(s => s.toLowerCase().includes(skill.toLowerCase()))
        )
      }
    })
    .filter(s => s.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 5)
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Skill Gap Analysis</h3>
      
      {/* Missing Skills */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="text-orange-500" size={20} />
          <h4 className="font-medium">Missing Skills</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {missingSkills.map(skill => (
            <span key={skill} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      {/* Current Skills */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="text-green-500" size={20} />
          <h4 className="font-medium">Team Skills</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {[...new Set(teamSkills)].map(skill => (
            <span key={skill} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      {/* Suggested Teammates */}
      {matchedStudents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="text-primary-600" size={20} />
            <h4 className="font-medium">Suggested Teammates</h4>
          </div>
          <div className="space-y-3">
            {matchedStudents.map(student => (
              <div key={student.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{student.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {student.matchedSkills.map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                  Invite
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
