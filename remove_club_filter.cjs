const fs = require('fs');
const path = 'src/pages/HackathonPage.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove from activeFiltersCount
content = content.replace(
`    filters.teamSize.length + 
    filters.status.length + 
    filters.club.length`,
`    filters.teamSize.length + 
    filters.status.length`
);

// 2. Remove allClubs block
content = content.replace(
`  const allClubs = useMemo(() => {
    const clubs = new Set()
    all.forEach(h => { if(h.club) clubs.add(h.club) })
    return Array.from(clubs).sort()
  }, [all])`,
``
);

// 3. Remove club from filtering logic
content = content.replace(
`      // 7. Club
      if (filters.club.length > 0) {
        if (!filters.club.includes(h.club)) return false
      }`,
``
);

// 4. Remove Chip rendering
content = content.replace(
`              {filters.status.map(v => <Chip key={v} label={v} onRemove={() => removeFilter('status', v)} />)}
              {filters.club.map(v => <Chip key={v} label={v} onRemove={() => removeFilter('club', v)} />)}`,
`              {filters.status.map(v => <Chip key={v} label={v} onRemove={() => removeFilter('status', v)} />)}`
);

// 5. Remove Checkbox rendering
const organizerSection = `              {/* Club / Organizer */}
              {allClubs.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center justify-between">
                    Organizer
                    {filters.club.length > 0 && <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">{filters.club.length}</span>}
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {allClubs.map(club => (
                      <Checkbox key={club} label={club} checked={filters.club.includes(club)} onChange={() => toggleArrayFilter('club', club)} />
                    ))}
                  </div>
                </div>
              )}`;

content = content.replace(organizerSection, ``);

fs.writeFileSync(path, content);
console.log("Successfully removed club/organizer filters");
