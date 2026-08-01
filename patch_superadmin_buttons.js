const fs = require('fs');
let content = fs.readFileSync('src/components/SuperAdminPortal.tsx', 'utf8');
const replacement = `          <Cpu className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
          Enterprise AI-OS
        </button>
        <button
          onClick={() => setSaTab('restaurant_os')}
          className={\`py-2 px-4 text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition \${
            saTab === 'restaurant_os'
              ? 'bg-gradient-to-tr from-orange-700 to-red-700 text-white font-bold border border-red-600'
              : 'text-orange-600 hover:text-orange-950 hover:bg-orange-50/60 border border-orange-500/20'
          }\`}
        >
          <Building2 className="w-3.5 h-3.5 text-orange-500" />
          Restaurant OS
        </button>
        <button
          onClick={() => setSaTab('tours_os')}
          className={\`py-2 px-4 text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition \${
            saTab === 'tours_os'
              ? 'bg-gradient-to-tr from-teal-700 to-green-700 text-white font-bold border border-green-600'
              : 'text-teal-600 hover:text-teal-950 hover:bg-teal-50/60 border border-teal-500/20'
          }\`}
        >
          <Globe className="w-3.5 h-3.5 text-teal-500" />
          Tours OS
        </button>
        <button
          onClick={() => setSaTab('website_builder')}
          className={\`py-2 px-4 text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition \${
            saTab === 'website_builder'
              ? 'bg-gradient-to-tr from-pink-700 to-rose-700 text-white font-bold border border-rose-600'
              : 'text-pink-600 hover:text-pink-950 hover:bg-pink-50/60 border border-pink-500/20'
          }\`}
        >
          <Terminal className="w-3.5 h-3.5 text-pink-500" />
          Website Builder
        </button>
        <button
          onClick={() => setSaTab('business_ops')}
          className={\`py-2 px-4 text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition \${
            saTab === 'business_ops'
              ? 'bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-bold border border-slate-600'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50/60 border border-slate-500/20'
          }\`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
          Business Ops
        </button>
      </div>`;

content = content.replace(/          <Cpu className="w-3\.5 h-3\.5 text-cyan-500 animate-pulse" \/>\n          Enterprise AI-OS\n        <\/button>\n      <\/div>/g, replacement);
fs.writeFileSync('src/components/SuperAdminPortal.tsx', content);
