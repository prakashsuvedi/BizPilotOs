import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Code, 
  Sliders, 
  LayoutGrid, 
  ShieldAlert, 
  Compass, 
  CheckSquare, 
  Lightbulb, 
  ArrowRightLeft,
  ChevronRight,
  Search,
  BookOpen,
  Zap,
  Info
} from 'lucide-react';
import blueprintData from '../../firebase-blueprint.json';

interface EntityProperty {
  type: string;
  description?: string;
  format?: string;
  enum?: string[];
  items?: { type: string };
  properties?: Record<string, any>;
}

interface EntitySchema {
  title: string;
  description: string;
  type: string;
  properties: Record<string, EntityProperty>;
  required?: string[];
}

export default function FirebaseSqlSchemaGenerator() {
  const [dialect, setDialect] = useState<'postgresql' | 'mysql' | 'sqlite' | 'sqlserver'>('postgresql');
  const [arrayStrategy, setArrayStrategy] = useState<'jsonb' | 'junction_tables'>('jsonb');
  const [enableRLS, setEnableRLS] = useState<boolean>(true);
  const [selectedEntity, setSelectedEntity] = useState<string>('Tenant');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedConsole, setCopiedConsole] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'ddl' | 'seeder' | 'erd' | 'comparison'>('ddl');
  const [sandboxSqlInput, setSandboxSqlInput] = useState<string>('SELECT * FROM campaigns WHERE tenant_id = \'demo-tenant\' AND duration_weeks > 2;');
  const [sandboxFirestoreOutput, setSandboxFirestoreOutput] = useState<string>('');

  const entities = (blueprintData?.entities || {}) as Record<string, EntitySchema>;

  // Filter entities list
  const filteredEntityKeys = Object.keys(entities).filter(key => 
    key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entities[key].title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entities[key].description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto compile SQL parser sandbox on keystroke
  useEffect(() => {
    translateSqlToFirestore(sandboxSqlInput);
  }, [sandboxSqlInput]);

  const handleCopy = (text: string, setCopiedState: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const handleDownload = (filename: string, text: string) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Convert CamelCase to snake_case for standard relational naming
  const toSnakeCase = (str: string) => {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  };

  // Maps JSON Schema properties to robust SQL properties depending on SQL dialect
  const getSqlType = (propName: string, prop: EntityProperty, targetDialect: string) => {
    const name = toSnakeCase(propName);
    
    if (prop.enum) {
      if (targetDialect === 'postgresql') {
        const enumName = `${name}_enum`;
        return { type: `VARCHAR(50)`, constraints: `CHECK (${toSnakeCase(propName)} IN (${prop.enum.map(e => `'${e}'`).join(', ')}))` };
      }
      return { type: `VARCHAR(50)`, constraints: `CHECK (${toSnakeCase(propName)} IN (${prop.enum.map(e => `'${e}'`).join(', ')}))` };
    }

    if (prop.type === 'array') {
      if (targetDialect === 'postgresql' && arrayStrategy === 'jsonb') {
        return { type: 'JSONB', constraints: 'DEFAULT \'[]\'::jsonb' };
      } else if (targetDialect === 'mysql' && arrayStrategy === 'jsonb') {
        return { type: 'JSON', constraints: '' };
      } else {
        return { type: 'TEXT', constraints: '' }; // Text representation of arrays for backup
      }
    }

    if (prop.type === 'object') {
      if (targetDialect === 'postgresql') return { type: 'JSONB', constraints: 'DEFAULT \'{}\'::jsonb' };
      if (targetDialect === 'mysql') return { type: 'JSON', constraints: '' };
      return { type: 'TEXT', constraints: '' };
    }

    if (prop.type === 'integer') {
      if (targetDialect === 'sqlite') return { type: 'INTEGER', constraints: '' };
      return { type: 'INT', constraints: '' };
    }

    if (prop.type === 'number') {
      return { type: 'NUMERIC(12,2)', constraints: '' };
    }

    if (prop.type === 'boolean') {
      if (targetDialect === 'sqlite') return { type: 'INTEGER', constraints: 'DEFAULT 0' };
      if (targetDialect === 'sqlserver') return { type: 'BIT', constraints: 'DEFAULT 0' };
      return { type: 'BOOLEAN', constraints: 'DEFAULT FALSE' };
    }

    // Handles text formats
    if (prop.format === 'date-time') {
      if (targetDialect === 'postgresql') return { type: 'TIMESTAMP WITH TIME ZONE', constraints: 'DEFAULT CURRENT_TIMESTAMP' };
      if (targetDialect === 'sqlite') return { type: 'TEXT', constraints: 'DEFAULT CURRENT_TIMESTAMP' };
      return { type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP' };
    }

    // Handle common fields
    if (name === 'id' || name === 'uid' || name === 'tenant_id' || name.endsWith('_id')) {
      return { type: 'VARCHAR(64)', constraints: '' };
    }

    if (name === 'description' || name === 'body' || name === 'pixel_code') {
      return { type: 'TEXT', constraints: '' };
    }

    return { type: 'VARCHAR(255)', constraints: '' };
  };

  // Generate DDL statements for a single entity or all entities
  const generateDdl = (entityName: string, all: boolean = false): string => {
    let result = '';
    const keys = all ? Object.keys(entities) : [entityName];

    if (all) {
      result += `-- ========================================== \n`;
      result += `--  MARKETFORGE OS ENTERPRISE RELATION DATA BLUEPRINT  \n`;
      result += `--  Target Dialect: ${dialect.toUpperCase()} | Array Strategy: ${arrayStrategy === 'jsonb' ? 'NATIVE_JSON' : 'JUNCTION_TABLES'}\n`;
      result += `--  Generated on: ${new Date().toLocaleDateString()} via Cloud Native Orchestrator\n`;
      result += `-- ========================================== \n\n`;

      if (dialect === 'postgresql') {
        result += `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n`;
      }
    }

    keys.forEach(key => {
      const entity = entities[key];
      if (!entity) return;

      const tableName = toSnakeCase(key);
      const isTenantTable = key === 'Tenant';
      const isUserTable = key === 'User';

      result += `-- Schema: ${entity.title}\n`;
      result += `-- Description: ${entity.description}\n`;
      result += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;

      const cols: string[] = [];
      const pkField = key === 'User' ? 'uid' : 'id';
      const properties = entity.properties || {};

      // Primary key column first
      const pkObj = properties[pkField] || { type: 'string' };
      const snakePkName = toSnakeCase(pkField);
      let pkTypeStr = getSqlType(pkField, pkObj, dialect).type;

      cols.push(`  ${snakePkName} ${pkTypeStr} PRIMARY KEY`);

      // Other columns
      Object.keys(properties).forEach(propName => {
        if (propName === pkField) return; // Skip primary key as it's already added list

        const propObj = properties[propName];
        if (propObj.type === 'array' && arrayStrategy === 'junction_tables') {
          // Skip array mapping for junction tables
          return;
        }

        const snakeColName = toSnakeCase(propName);
        const typeInfo = getSqlType(propName, propObj, dialect);
        let columnDef = `  ${snakeColName} ${typeInfo.type}`;

        // Handle constraints and defaults
        if (typeInfo.constraints) {
          columnDef += ` ${typeInfo.constraints}`;
        }

        // Check required fields
        if (entity.required?.includes(propName)) {
          columnDef += ` NOT NULL`;
        }

        // Manage foreign keys
        if (propName === 'tenantId' && !isTenantTable) {
          columnDef += ` REFERENCES tenants(id) ON DELETE CASCADE`;
        } else if (propName === 'profileId') {
          columnDef += ` REFERENCES campaign_profiles(id) ON DELETE SET NULL`;
        } else if (propName === 'campaignId') {
          columnDef += ` REFERENCES campaigns(id) ON DELETE SET NULL`;
        } else if (propName === 'userId') {
          columnDef += ` REFERENCES users(uid) ON DELETE SET NULL`;
        }

        cols.push(columnDef);
      });

      result += cols.join(',\n') + '\n);\n\n';

      // Generate secondary helper indices for queries isolation performance
      if (properties.tenantId && !isTenantTable) {
        result += `CREATE INDEX IF NOT EXISTS idx_${tableName}_tenant ON ${tableName}(tenant_id);\n`;
      }
      if (properties.campaignId) {
        result += `CREATE INDEX IF NOT EXISTS idx_${tableName}_campaign ON ${tableName}(campaign_id);\n`;
      }
      result += '\n';

      // Junction tables strategy mappings for nested arrays
      if (arrayStrategy === 'junction_tables') {
        Object.keys(properties).forEach(propName => {
          const propObj = properties[propName];
          if (propObj.type === 'array') {
            const arrayTableName = `${tableName}_${toSnakeCase(propName)}`;
            const itemType = propObj.items?.type === 'integer' ? 'INT' : 'VARCHAR(255)';
            result += `-- Junction table representing secondary relations mapping for ${tableName}.${propName}\n`;
            result += `CREATE TABLE IF NOT EXISTS ${arrayTableName} (\n`;
            result += `  ${snakePkName} ${pkTypeStr} REFERENCES ${tableName}(${snakePkName}) ON DELETE CASCADE,\n`;
            result += `  val ${itemType} NOT NULL,\n`;
            result += `  PRIMARY KEY (${snakePkName}, val)\n`;
            result += `);\n\n`;
          }
        });
      }

      // Add PostgreSQL RLS Security Statements
      if (dialect === 'postgresql' && enableRLS && properties.tenantId && !isTenantTable) {
        result += `-- Enable Row-Level Isolation Security (RLS) policies matching tenant rules\n`;
        result += `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;\n\n`;
        result += `CREATE POLICY tenant_${tableName}_isolation_policy ON ${tableName}\n`;
        result += `  FOR ALL \n`;
        result += `  USING (tenant_id = current_setting('app.current_tenant_id', true));\n\n`;
      }
    });

    return result.trim();
  };

  // Generate complete Mock inserts DML statements for testing environment
  const generateSeeder = (entityName: string): string => {
    const entity = entities[entityName];
    if (!entity) return '-- Selected schema doesn\'t exist.';

    const tableName = toSnakeCase(entityName);
    const properties = entity.properties || {};
    const pkField = entityName === 'User' ? 'uid' : 'id';

    const columns: string[] = [];
    const snakeColumns: string[] = [];

    // Map column properties
    Object.keys(properties).forEach(p => {
      if (properties[p].type === 'array' && arrayStrategy === 'junction_tables') return;
      columns.push(p);
      snakeColumns.push(toSnakeCase(p));
    });

    const getMockVal = (col: string, prop: EntityProperty, index: number) => {
      const type = prop.type;
      const fmt = prop.format;
      const snakeName = toSnakeCase(col);

      if (prop.enum) {
        return `'${prop.enum[index % prop.enum.length]}'`;
      }

      if (snakeName === 'id' || snakeName === 'uid' || snakeName.endsWith('_id') || snakeName === 'pixel_id') {
        if (snakeName === 'tenant_id') return `'demo-tenant'`;
        if (snakeName === 'profile_id') return `'prof_aeroflow_9901'`;
        if (snakeName === 'campaign_id') return `'camp_launch_0012'`;
        if (snakeName === 'user_id') return `'owner-uid-1'`;
        return `'${snakeName.replace('_id', '')}_mock_id_${index + 1000}'`;
      }

      if (type === 'string') {
        if (fmt === 'date-time') {
          const date = new Date();
          date.setDate(date.getDate() - (5 - index));
          return `'${date.toISOString()}'`;
        }
        if (snakeName === 'name' && entityName === 'Tenant') return index === 0 ? `'DemoCorp'` : `'Sienna Agency'`;
        if (snakeName === 'name') return index === 0 ? `'John Doe'` : `'Alice Vance'`;
        if (snakeName === 'email') return index === 0 ? `'owner@democorp.com'` : `'manager@sienna.com'`;
        if (snakeName === 'industry') return `'Workspace Software'`;
        if (snakeName === 'category') return `'operations'`;
        if (snakeName === 'title') return index === 0 ? `'Q3 Product Launch Ad Brief'` : `'Enterprise Integration Guide'`;
        if (snakeName === 'headline') return `'Ditch Manual Status Reports Forever!'`;
        if (snakeName === 'body') return `'Learn how AeroFlow connects engineering pipelines to executive boards instantly, saving hours.'`;
        if (snakeName === 'call_to_action') return `'Claim Your Free Trial'`;
        if (snakeName === 'channel_name') return `'LinkedIn Promoted Ads'`;
        return `'Sample template data description for ${snakeName}'`;
      }

      if (type === 'integer' || type === 'number') {
        if (snakeName === 'duration_weeks') return `${4 + index}`;
        if (snakeName === 'completion_percentage') return `${45 + (index * 20)}`;
        if (snakeName === 'current_step') return `${index + 1}`;
        if (snakeName === 'accuracy_score') return `${0.85 + (index * 0.05)}`;
        return `${100 + index * 50}`;
      }

      if (type === 'boolean') {
        return index === 0 ? 'TRUE' : 'FALSE';
      }

      if (type === 'array') {
        if (col === 'stepsCompleted') {
          return dialect === 'postgresql' ? '\'["workspace_created", "brand_ingested"]\'::jsonb' : '\'["workspace_created", "brand_ingested"]\'';
        }
        if (col === 'platforms') {
          return dialect === 'postgresql' ? '\'["FACEBOOK", "INSTAGRAM"]\'::jsonb' : '\'["FACEBOOK", "INSTAGRAM"]\'';
        }
        return dialect === 'postgresql' ? '\'[]\'::jsonb' : '\'[]\'';
      }

      if (type === 'object') {
        return dialect === 'postgresql' ? '\'{"status": "initialized", "source": "pipeline"}\'::jsonb' : '\'{"status": "initialized", "source": "pipeline"}\'';
      }

      return '\'\'';
    };

    let seeds = `-- Seed values for: ${entity.title}\n`;
    for (let i = 0; i < 2; i++) {
      const vals = columns.map(c => getMockVal(c, properties[c], i));
      seeds += `INSERT INTO ${tableName} (${snakeColumns.join(', ')}) \nVALUES (${vals.join(', ')});\n\n`;
    }

    return seeds.trim();
  };

  // Live SQL interpreter sandbox parser
  const translateSqlToFirestore = (sqlInput: string) => {
    try {
      const trimmed = sqlInput.trim().toLowerCase().replace(/\s+/g, ' ');
      
      if (!trimmed.includes('select')) {
        setSandboxFirestoreOutput('// ONLY SELECT statements can be mapped dynamically here.');
        return;
      }

      // Extract table/collection
      const fromMatch = trimmed.match(/from ([a-zA-Z0-9_\-]+)/);
      if (!fromMatch) {
        setSandboxFirestoreOutput('// Error: Could not determine FROM source collection.');
        return;
      }

      const rawTable = fromMatch[1];
      // Convert standard snake_case tabular name to Firestore camelCase collections
      const camelCaseCollection = rawTable.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      let firestoreRef = `import { query, collection, where, getDocs } from 'firebase/firestore';\nimport { clientDb } from './src/lib/firebase';\n\n`;
      firestoreRef += `const collectionRef = collection(clientDb, '${camelCaseCollection}');\n`;

      // Extract simple WHERE constraints
      const clauses: string[] = [];
      if (trimmed.includes('where')) {
        const afterWhere = sqlInput.substring(sqlInput.toLowerCase().indexOf('where') + 5).trim();
        const conditions = afterWhere.split(/\s+and\s+/i);

        conditions.forEach(cond => {
          let clean = cond.trim();
          if (clean.endsWith(';')) clean = clean.slice(0, -1);

          // Test simple mapping
          const parts = clean.split(/\s*(=|!=|>|<|>=|<=)\s*/);
          if (parts.length >= 3) {
            const rawCol = parts[0].trim();
            const operator = parts[1].trim();
            const rawVal = parts[2].trim();

            const camelProp = rawCol.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            const fbOp = operator === '=' ? '==' : operator;

            clauses.push(`where('${camelProp}', '${fbOp}', ${rawVal})`);
          }
        });
      }

      if (clauses.length > 0) {
        firestoreRef += `const q = query(\n  collectionRef,\n  ${clauses.join(',\n  ')}\n);\n\n`;
      } else {
        firestoreRef += `const q = query(collectionRef);\n\n`;
      }

      firestoreRef += `// Execute query and extract records\n`;
      firestoreRef += `const querySnapshot = await getDocs(q);\n`;
      firestoreRef += `const records = querySnapshot.docs.map(doc => ({\n  id: doc.id,\n  ...doc.data()\n}));\n`;
      firestoreRef += `console.log('Query fetched:', records);`;

      setSandboxFirestoreOutput(firestoreRef);
    } catch (e: any) {
      setSandboxFirestoreOutput(`// Parsing Exception: Unable to logically convert query.\n// ${e.message}`);
    }
  };

  const getFullProjectDdl = () => {
    let output = '';
    output += `-- ========================================== \n`;
    output += `--  MARKETFORGE ENTERPRISE RELATIONAL SCHEMA BLUEPRINT  \n`;
    output += `--  Dialect: ${dialect.toUpperCase()} | Full DB Migration DDL\n`;
    output += `-- ========================================== \n\n`;

    Object.keys(entities).forEach(key => {
      output += generateDdl(key) + '\n\n';
    });

    return output;
  };

  return (
    <div id="firebase-sql-schema-generator" className="space-y-6 animate-fade-in bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-100">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Database className="w-6 h-6 animate-[pulse_3s_infinite]" />
            </span>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                SQL & NO-SQL BRIDGING ENGINE
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Firebase Firestore ⇆ Relational SQL Schema Orchestrator
              </h2>
            </div>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm max-w-3xl">
            SaaS multi-tenant sandboxes run natively inside a document NoSQL architecture. 
            Use this compiler and generator to analyze schemas, export optimized DDL tables, isolate tenants via Row-Level Security policy structures, and translate queries dynamically.
          </p>
        </div>

        {/* EXPORT OPTIONS */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button 
            onClick={() => handleDownload(`${dialect}_complete_schema.sql`, getFullProjectDdl())}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition duration-150"
          >
            <Download className="w-3.5 h-3.5" />
            Export Complete Relational DDL
          </button>
        </div>
      </div>

      {/* CORE CONTROLS DRAWER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        
        {/* Dialect */}
        <div className="space-y-2">
          <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Sliders className="w-3 h-3 text-indigo-400" />
            Target SQL Dialect
          </label>
          <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['postgresql', 'mysql', 'sqlite', 'sqlserver'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDialect(d)}
                className={`py-1.5 px-2 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer ${
                  dialect === d 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {d === 'sqlserver' ? 'T-SQL' : d}
              </button>
            ))}
          </div>
        </div>

        {/* Arrays Handling */}
        <div className="space-y-2">
          <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <LayoutGrid className="w-3 h-3 text-emerald-400" />
            NoSQL Nested Array Map
          </label>
          <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setArrayStrategy('jsonb')}
              disabled={dialect === 'sqlite'}
              className={`py-1.5 px-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer disabled:opacity-40 select-none ${
                arrayStrategy === 'jsonb' && dialect !== 'sqlite'
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-800 disabled:hover:bg-transparent'
              }`}
            >
              JSONB Column
            </button>
            <button
              onClick={() => setArrayStrategy('junction_tables')}
              className={`py-1.5 px-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer select-none ${
                arrayStrategy === 'junction_tables' || dialect === 'sqlite'
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              1:N Sub-Tables
            </button>
          </div>
        </div>

        {/* Postgre RLS Policy */}
        <div className="space-y-2">
          <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-red-400" />
            Row Security Isolations
          </label>
          <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800 h-10">
            <input 
              type="checkbox" 
              id="enable-rls-check" 
              checked={enableRLS && dialect === 'postgresql'}
              disabled={dialect !== 'postgresql'}
              onChange={(e) => setEnableRLS(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer disabled:opacity-40"
            />
            <label htmlFor="enable-rls-check" className={`text-[10px] font-semibold cursor-pointer select-none ${dialect !== 'postgresql' ? 'text-slate-600' : 'text-slate-300'}`}>
              Tenant Isolation DDL (RLS)
            </label>
          </div>
        </div>

        {/* Dialect Details */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 text-[11px] text-slate-300 leading-normal">
          <Info className="w-4 h-4 shrink-0 text-indigo-400" />
          <span>
            {dialect === 'postgresql' && "Export includes custom triggers and policies checking 'app.current_tenant_id' context."}
            {dialect === 'mysql' && "Uses standard native JSON columns. Subcollection associations are governed by explicit constraints."}
            {dialect === 'sqlite' && "Perfect for local developer workspace testing. Arrays are automatically denormalized to sub-tables."}
            {dialect === 'sqlserver' && "T-SQL compatible types. Multi-tenant context isolations are handled via structured indices."}
          </span>
        </div>

      </div>

      {/* THREE-PANEL SANDBOX STAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ENTITIES LIST SECTION */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Blueprint Entities ({filteredEntityKeys.length})
              </h3>
              <Zap className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
            </div>

            {/* Entity search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 placeholder-slate-500"
              />
            </div>

            {/* List container */}
            <div className="space-y-1 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
              {filteredEntityKeys.map(key => {
                const entity = entities[key];
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedEntity(key)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between group transition duration-150 cursor-pointer ${
                      selectedEntity === key 
                        ? 'bg-indigo-600 text-white font-bold' 
                        : 'bg-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate font-sans font-semibold">{entity.title}</div>
                      <div className={`text-[10px] truncate ${selectedEntity === key ? 'text-indigo-200' : 'text-slate-500'}`}>
                        /{toSnakeCase(key)}
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${selectedEntity === key ? 'text-indigo-200' : 'text-slate-600 group-hover:translate-x-0.5'}`} />
                  </button>
                );
              })}
              {filteredEntityKeys.length === 0 && (
                <div className="text-center p-6 text-slate-600 font-mono text-xs">
                  No entities match queries.
                </div>
              )}
            </div>
          </div>

          {/* NO-SQL TO SQL STRATEGIC RULES */}
          <div className="bg-gradient-to-tr from-slate-950 to-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Relational Modeling Rules
            </h4>
            <ul className="text-[10px] text-slate-400 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1">
                <span className="text-indigo-400 mt-0.5 font-bold">1.</span>
                <span>Each document ID acts as a VARCHAR(64) primary key.</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-indigo-400 mt-0.5 font-bold">2.</span>
                <span>Reference keys (e.g. `tenantId`) map to Foreign Key restraints.</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-indigo-400 mt-0.5 font-bold">3.</span>
                <span>Enum strings are controlled via SQL CHECK restraints.</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-indigo-400 mt-0.5 font-bold">4.</span>
                <span>ISO 8601 string stamps convert into database timestamps.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* WORK BENCH DISPLAY */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* TABS SELECTOR */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('ddl')}
                className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'ddl' 
                    ? 'bg-slate-800 text-white font-black' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                DDL Statements
              </button>
              <button
                onClick={() => setViewMode('seeder')}
                className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'seeder' 
                    ? 'bg-slate-800 text-white font-black' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                DML Seeders
              </button>
              <button
                onClick={() => setViewMode('erd')}
                className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'erd' 
                    ? 'bg-slate-800 text-white font-black' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                ERD Map
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'comparison' 
                    ? 'bg-slate-800 text-white font-black' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Query Translator
              </button>
            </div>
            
            {/* Copy / Action utilities */}
            {viewMode !== 'erd' && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const code = viewMode === 'ddl' ? generateDdl(selectedEntity) : viewMode === 'seeder' ? generateSeeder(selectedEntity) : sandboxFirestoreOutput;
                    handleCopy(code, setCopied);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-blue-400 rounded-lg text-[10px] font-bold text-slate-400 cursor-pointer transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    const code = viewMode === 'ddl' ? generateDdl(selectedEntity) : generateSeeder(selectedEntity);
                    handleDownload(`${toSnakeCase(selectedEntity)}_${viewMode}.sql`, code);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-emerald-400 rounded-lg text-[10px] font-bold text-slate-400 cursor-pointer transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .sql</span>
                </button>
              </div>
            )}
          </div>

          {/* VIEW DDL MODE */}
          {viewMode === 'ddl' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-indigo-300">Selected: {entities[selectedEntity]?.title}</span>
                  <p className="text-slate-400 text-[11px] leading-normal mt-1">{entities[selectedEntity]?.description}</p>
                </div>
                <div className="shrink-0 bg-indigo-950 px-2 py-0.5 text-[9px] font-bold text-indigo-300 rounded border border-indigo-800">
                  /{toSnakeCase(selectedEntity)}
                </div>
              </div>

              {/* DDL Code Box */}
              <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 font-mono text-xs overflow-auto max-h-[30rem] scrollbar-thin leading-relaxed">
                <div className="absolute right-3 top-3 text-[10px] uppercase font-bold text-slate-600 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {dialect}
                </div>
                <pre className="text-sky-400 whitespace-pre">{generateDdl(selectedEntity)}</pre>
              </div>
            </div>
          )}

          {/* VIEW SEEDER MODE */}
          {viewMode === 'seeder' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs">
                <span className="font-bold text-indigo-300">Relational Seeding Data Playbook</span>
                <p className="text-slate-400 text-[11px] mt-1">Automatic generation of mock variables matching the selected blueprint. Seed data can be directly executed against a PostgreSQL/MySQL database instance.</p>
              </div>

              {/* Seeder Code Box */}
              <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 font-mono text-xs overflow-auto max-h-[30rem] scrollbar-thin leading-relaxed">
                <div className="absolute right-3 top-3 text-[10px] uppercase font-bold text-slate-600 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {dialect} DML
                </div>
                <pre className="text-emerald-400 whitespace-pre">{generateSeeder(selectedEntity)}</pre>
              </div>
            </div>
          )}

          {/* VIEW ERD SCHEMATICS MAP */}
          {viewMode === 'erd' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <span className="font-bold text-indigo-300 text-sm">Visual Relational Schema Mapping Blueprint</span>
                <p className="text-slate-400 text-xs mt-1">Shows how isolated Firestore collections are mapped into a standardized Star/Snowflake Relational Schema.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                
                {/* Center Tenant isolation table */}
                <div className="border border-indigo-500 bg-indigo-950/20 rounded-xl p-4.5 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-indigo-900 pb-2">
                    <span className="text-xs font-extrabold text-indigo-300 flex items-center gap-1">
                      <Database className="w-3.5 h-3.5" />
                      tenants [Master Entity]
                    </span>
                    <span className="text-[9px] bg-indigo-900 border border-indigo-700 text-indigo-200 uppercase font-black tracking-wider px-1.5 rounded">PK</span>
                  </div>
                  <div className="text-[10px] space-y-1 font-mono text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-100 italic">id</span>
                      <span>VARCHAR(64)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>name</span>
                      <span>VARCHAR(255)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>plan</span>
                      <span>VARCHAR(32)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>created_at</span>
                      <span>TIMESTAMP</span>
                    </div>
                  </div>
                </div>

                {/* Users association table */}
                <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-4.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-extrabold text-sky-400 flex items-center gap-1">
                      <Database className="w-3.5 h-3.5" />
                      users [Role Isolation]
                    </span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 uppercase font-bold tracking-wider px-1 rounded">RBAC</span>
                  </div>
                  <div className="text-[10px] space-y-1 font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-100 italic">uid</span>
                      <span>VARCHAR(64) <b className="text-indigo-400">[PK]</b></span>
                    </div>
                    <div className="flex justify-between text-yellow-300">
                      <span>tenant_id</span>
                      <span>VARCHAR(64) <b className="text-indigo-400">[FK]</b></span>
                    </div>
                    <div className="flex justify-between">
                      <span>email</span>
                      <span>VARCHAR(255)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>role</span>
                      <span>VARCHAR(32) [Enum]</span>
                    </div>
                  </div>
                </div>

                {/* Campaigns / Campaigns profiles connection */}
                <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-4.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                      <Database className="w-3.5 h-3.5" />
                      campaigns [Asset Tree]
                    </span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 uppercase font-bold tracking-wider px-1 rounded">1:N</span>
                  </div>
                  <div className="text-[10px] space-y-1 font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-100 italic">id</span>
                      <span>VARCHAR(64) <b className="text-indigo-400">[PK]</b></span>
                    </div>
                    <div className="flex justify-between text-yellow-300">
                      <span>tenant_id</span>
                      <span>VARCHAR(64) <b className="text-indigo-400">[FK]</b></span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>profile_id</span>
                      <span>VARCHAR(64) <b className="text-indigo-400">[FK]</b></span>
                    </div>
                    <div className="flex justify-between">
                      <span>duration_weeks</span>
                      <span>INTEGER</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Isolation policy overview */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" />
                  NoSQL Tenant Isolation translates into PostgreSQL Row-Level Security
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  In Firestore, multitenancy is isolated by either custom rules matching the auth token schema (e.g. <code>request.auth.token.tenantId == tenantId</code>) or explicit field checks in the query. 
                  In a PostgreSQL migration, we apply the identical security standard using <b>RLS (Row-Level Security)</b>. Applying RLS automatically filters all queries dynamically without requiring manual developer filters.
                </p>
              </div>
            </div>
          )}

          {/* QUERY TRANSLATOR INTEGRATED SANDBOX */}
          {viewMode === 'comparison' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 text-xs text-slate-300">
                <span className="font-extrabold text-indigo-300">Live Firebase ⇆ SQL Query Adapter Console</span>
                <p className="text-slate-400 text-[11px]">Type an ANSI-SQL select statement inside the console. The sandbox will dynamically translate constraints, selectors, and entities into native Firestore SDK configuration code.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Input SQL tab */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-slate-900 p-2 rounded-t-xl border border-b-0 border-slate-800">
                    <span className="text-[11px] font-bold text-sky-400 font-mono flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5" />
                      SQL INPUT CODEBLOCK
                    </span>
                  </div>
                  <textarea
                    value={sandboxSqlInput}
                    onChange={(e) => setSandboxSqlInput(e.target.value)}
                    className="w-full bg-slate-950 text-sky-300 font-mono text-xs rounded-b-xl border border-slate-800 p-4 h-64 focus:border-sky-500 outline-none resize-none focus:ring-0 leading-relaxed"
                    spellCheck="false"
                  />
                </div>

                {/* Output Firestore code */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-slate-900 p-2 rounded-t-xl border border-b-0 border-slate-800">
                    <span className="text-[11px] font-bold text-emerald-400 font-mono flex items-center gap-1">
                      <Code className="w-3.5 h-3.5" />
                      FIRESTORE SDK EQUIVALENT (JS/TS)
                    </span>
                    <button
                      onClick={() => handleCopy(sandboxFirestoreOutput, setCopiedConsole)}
                      className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer font-bold"
                    >
                      {copiedConsole ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy SDK Code</span>
                    </button>
                  </div>
                  <pre className="w-full bg-slate-950 text-emerald-400 font-mono text-xs rounded-b-xl border border-slate-800 p-4 h-64 overflow-auto scrollbar-thin whitespace-pre leading-relaxed">
                    {sandboxFirestoreOutput}
                  </pre>
                </div>
              </div>

              {/* Sample conversions library */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <span className="font-bold text-slate-200">Interactive Query Presets</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setSandboxSqlInput(`SELECT * FROM campaign_profiles WHERE tenant_id = 'demo-tenant' AND category = 'operations';`)}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-[10.5px] font-mono text-slate-400 hover:text-white transition text-left cursor-pointer border border-slate-800"
                  >
                    -- Filter Campaign Profiles
                  </button>
                  <button
                    onClick={() => setSandboxSqlInput(`SELECT * FROM social_posts WHERE tenant_id = 'sienna-agency' AND status = 'PUBLISHED';`)}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-[10.5px] font-mono text-slate-400 hover:text-white transition text-left cursor-pointer border border-slate-800"
                  >
                    -- Filter Social Posts
                  </button>
                  <button
                    onClick={() => setSandboxSqlInput(`SELECT * FROM audit_logs WHERE user_id = 'owner-uid-1' AND timestamp > '2026-06-20T00:00:00Z';`)}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-[10.5px] font-mono text-slate-400 hover:text-white transition text-left cursor-pointer border border-slate-800"
                  >
                    -- Filter Security Audit Logs
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
