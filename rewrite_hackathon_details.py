import re

with open('src/pages/HackathonDetails.jsx', 'r') as f:
    content = f.read()

# 1. Remove states
content = re.sub(
    r"  const \[showTeamSection, setShowTeamSection\] = useState\(false\)\n"
    r"  const \[showPostForm, setShowPostForm\]       = useState\(false\)\n"
    r"  const \[showInbox, setShowInbox\]             = useState\(true\)\n"
    r"  const \[joinMsg, setJoinMsg\]                 = useState\(\{\}\)\n"
    r"  const syncedNotifIds = useRef\(new Set\(\)\)\n",
    "",
    content
)

# 2. Remove imports not needed (Link is needed for teammates button)
content = content.replace("import { useParams, useNavigate } from 'react-router-dom'", "import { useParams, useNavigate, Link } from 'react-router-dom'")
content = content.replace("const ROLES = ['Frontend','Backend','Full-Stack','ML Engineer','Designer','DevOps','Mobile Dev']\nconst SKILLS = ['React','Node.js','Python','TensorFlow','Figma','MongoDB','AWS','Flutter','Django','UI/UX']\n", "")

# 3. Replace the block from `const requests = ...` to `const updateJoinDetails = ... }`
# We'll use regex to match exactly up to `const { registrations }` and then from `const handleSendJoin` to the end of `updateJoinDetails`
content = re.sub(
    r"  const requests = store\.getTeamRequestsForHackathon.*?const hMaxTeamSize = .*?;\n",
    "",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"  const handleSendJoin = \(reqId, details\) => \{.*?const updateJoinDetails = \(reqId, field, value\) => \{.*?\}\n",
    "",
    content,
    flags=re.DOTALL
)

# 4. Replace the Team Actions section
new_actions = """        {/* Team Actions */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
          <h2 className="text-xl font-bold mb-6">Registration & Teams</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={handleRegister} disabled={isRegisteredBackend}
              className={`flex-1 py-3 rounded-xl font-bold transition ${isRegisteredBackend ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-green-600 text-white hover:bg-green-700'}`}>
              {isRegisteredBackend ? '✓ Registered' : 'Register'}
            </button>
            <Link to={`/hackathons/${h.id || h._id}/teammates`}
              className="flex-1 py-3 text-center bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700">
              Find Teammates
            </Link>
          </div>
        </div>"""

content = re.sub(
    r"        \{\/\* Team Actions \*\/\}.*?<\/div>\n\n      \{\/\* showPostForm \*\/\}\n",
    new_actions + "\n      </div>\n",
    content,
    flags=re.DOTALL
)

# Actually, the replacement for Team Actions to the end of the return statement
content = re.sub(
    r"        \{\/\* Team Actions \*\/}.*?<\/div>\n\n      \{showPostForm && \(\n        <PostRequestModal.*?<\/div>\n  \)\n\}",
    new_actions + "\n      </div>\n    </div>\n  )\n}",
    content,
    flags=re.DOTALL
)

# 5. Remove the PostRequestModal
content = re.sub(
    r"function PostRequestModal\(\{ onClose, onSubmit \}\) \{.*?\n\}\n\n",
    "",
    content,
    flags=re.DOTALL
)

with open('src/pages/HackathonDetails.jsx', 'w') as f:
    f.write(content)
