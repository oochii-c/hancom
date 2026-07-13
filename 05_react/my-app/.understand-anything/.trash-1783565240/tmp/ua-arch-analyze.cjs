const fs = require('fs');

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error('Usage: node ua-arch-analyze.js <input.json> <output.json>');
  process.exit(1);
}

let input;
try {
  input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
} catch (e) {
  console.error('Failed to read input:', e.message);
  process.exit(1);
}

const { fileNodes, importEdges, allEdges } = input;

// A. Directory Grouping
function getDirectoryGroup(filePath) {
  const parts = filePath.replace(/\\/g, '/').split('/');
  if (parts.length === 1) return 'root';
  // Check common prefix
  return parts[0];
}

// Find common prefix
const allParts = fileNodes.map(n => n.filePath.replace(/\\/g, '/').split('/'));
let commonPrefix = [];
const minLen = Math.min(...allParts.map(p => p.length));
for (let i = 0; i < minLen - 1; i++) {
  const segment = allParts[0][i];
  if (allParts.every(p => p[i] === segment)) {
    commonPrefix.push(segment);
  } else {
    break;
  }
}

const directoryGroups = {};
for (const node of fileNodes) {
  const parts = node.filePath.replace(/\\/g, '/').split('/');
  const afterPrefix = parts.slice(commonPrefix.length);
  let group;
  if (afterPrefix.length === 1) {
    group = 'root';
  } else {
    group = afterPrefix[0];
  }
  if (!directoryGroups[group]) directoryGroups[group] = [];
  directoryGroups[group].push(node.id);
}

// B. Node Type Grouping
const nodeTypeGroups = {};
for (const node of fileNodes) {
  if (!nodeTypeGroups[node.type]) nodeTypeGroups[node.type] = [];
  nodeTypeGroups[node.type].push(node.id);
}

// C. Fan-in / Fan-out
const fanIn = {};
const fanOut = {};
for (const node of fileNodes) {
  fanIn[node.id] = 0;
  fanOut[node.id] = 0;
}
for (const edge of importEdges) {
  if (fanOut[edge.source] !== undefined) fanOut[edge.source]++;
  if (fanIn[edge.target] !== undefined) fanIn[edge.target]++;
}

// D. Cross-category edges
const crossCategoryMap = {};
for (const edge of allEdges) {
  const srcNode = fileNodes.find(n => n.id === edge.source);
  const tgtNode = fileNodes.find(n => n.id === edge.target);
  if (!srcNode || !tgtNode) continue;
  const key = `${srcNode.type}->${tgtNode.type}:${edge.type}`;
  crossCategoryMap[key] = (crossCategoryMap[key] || 0) + 1;
}
const crossCategoryEdges = Object.entries(crossCategoryMap).map(([key, count]) => {
  const [types, edgeType] = key.split(':');
  const [fromType, toType] = types.split('->');
  return { fromType, toType, edgeType, count };
});

// E. Inter-group import frequency
function nodeGroup(nodeId) {
  const node = fileNodes.find(n => n.id === nodeId);
  if (!node) return null;
  const parts = node.filePath.replace(/\\/g, '/').split('/');
  const afterPrefix = parts.slice(commonPrefix.length);
  if (afterPrefix.length === 1) return 'root';
  return afterPrefix[0];
}

const interGroupMap = {};
for (const edge of importEdges) {
  const srcGroup = nodeGroup(edge.source);
  const tgtGroup = nodeGroup(edge.target);
  if (!srcGroup || !tgtGroup || srcGroup === tgtGroup) continue;
  const key = `${srcGroup}->${tgtGroup}`;
  interGroupMap[key] = (interGroupMap[key] || 0) + 1;
}
const interGroupImports = Object.entries(interGroupMap).map(([key, count]) => {
  const [from, to] = key.split('->');
  return { from, to, count };
});

// F. Intra-group density
const intraGroupDensity = {};
for (const group of Object.keys(directoryGroups)) {
  const members = new Set(directoryGroups[group]);
  let internalEdges = 0;
  let totalEdges = 0;
  for (const edge of importEdges) {
    const srcIn = members.has(edge.source);
    const tgtIn = members.has(edge.target);
    if (srcIn || tgtIn) totalEdges++;
    if (srcIn && tgtIn) internalEdges++;
  }
  intraGroupDensity[group] = {
    internalEdges,
    totalEdges,
    density: totalEdges > 0 ? internalEdges / totalEdges : 0
  };
}

// G. Directory pattern matching
const patternMap = {
  routes: 'api', api: 'api', controllers: 'api', endpoints: 'api', handlers: 'api',
  services: 'service', core: 'service', lib: 'service', domain: 'service', logic: 'service',
  models: 'data', db: 'data', data: 'data', persistence: 'data', repository: 'data', entities: 'data',
  components: 'ui', views: 'ui', pages: 'ui', ui: 'ui', layouts: 'ui', screens: 'ui',
  middleware: 'middleware', plugins: 'middleware', interceptors: 'middleware', guards: 'middleware',
  utils: 'utility', helpers: 'utility', common: 'utility', shared: 'utility', tools: 'utility',
  config: 'config', constants: 'config', env: 'config', settings: 'config',
  '__tests__': 'test', test: 'test', tests: 'test', spec: 'test', specs: 'test',
  types: 'types', interfaces: 'types', schemas: 'types', contracts: 'types', dtos: 'types',
  hooks: 'hooks',
  store: 'state', state: 'state', reducers: 'state', actions: 'state', slices: 'state',
  assets: 'assets', static: 'assets', public: 'assets',
  src: 'service',
  root: 'entry'
};

const patternMatches = {};
for (const group of Object.keys(directoryGroups)) {
  patternMatches[group] = patternMap[group.toLowerCase()] || 'unknown';
}

// H. Deployment topology
const infraPatterns = [/dockerfile/i, /docker-compose/i, /\.tf$/, /\.tfvars$/, /k8s/, /kubernetes/, /helm/];
const ciPatterns = [/\.github\/workflows/, /\.gitlab-ci/, /jenkinsfile/i];
const infraFiles = [];
let hasDockerfile = false, hasCompose = false, hasK8s = false, hasTerraform = false, hasCI = false;

for (const node of fileNodes) {
  const fp = node.filePath.replace(/\\/g, '/');
  if (/dockerfile/i.test(fp)) { hasDockerfile = true; infraFiles.push(fp); }
  if (/docker-compose/i.test(fp)) { hasCompose = true; infraFiles.push(fp); }
  if (/\.tf$|\.tfvars$/.test(fp)) { hasTerraform = true; infraFiles.push(fp); }
  if (/k8s|kubernetes|helm/.test(fp)) { hasK8s = true; infraFiles.push(fp); }
  if (/\.github\/workflows|\.gitlab-ci|jenkinsfile/i.test(fp)) { hasCI = true; infraFiles.push(fp); }
}

const deploymentTopology = { hasDockerfile, hasCompose, hasK8s, hasTerraform, hasCI, infraFiles };

// I. Data pipeline detection
const schemaFiles = fileNodes.filter(n => /\.(graphql|gql|proto|sql|prisma)$/.test(n.filePath)).map(n => n.filePath);
const migrationFiles = fileNodes.filter(n => /migration/i.test(n.filePath)).map(n => n.filePath);
const dataModelFiles = fileNodes.filter(n => /model|entity/i.test(n.filePath)).map(n => n.filePath);
const apiHandlerFiles = fileNodes.filter(n => /route|controller|handler|endpoint/i.test(n.filePath)).map(n => n.filePath);
const dataPipeline = { schemaFiles, migrationFiles, dataModelFiles, apiHandlerFiles };

// J. Documentation coverage
const docFiles = fileNodes.filter(n => /\.(md|rst)$/i.test(n.filePath));
const groupsWithDocs = new Set();
for (const doc of docFiles) {
  const group = nodeGroup(doc.id) || 'root';
  groupsWithDocs.add(group);
}
const allGroups = Object.keys(directoryGroups);
const undocumentedGroups = allGroups.filter(g => !groupsWithDocs.has(g));
const docCoverage = {
  groupsWithDocs: groupsWithDocs.size,
  totalGroups: allGroups.length,
  coverageRatio: allGroups.length > 0 ? groupsWithDocs.size / allGroups.length : 0,
  undocumentedGroups
};

// K. Dependency direction
const dependencyDirection = interGroupImports.map(({ from, to, count }) => ({
  dependent: from,
  dependsOn: to
}));

// File stats
const filesPerGroup = {};
for (const [group, ids] of Object.entries(directoryGroups)) {
  filesPerGroup[group] = ids.length;
}
const nodeTypeCounts = {};
for (const [type, ids] of Object.entries(nodeTypeGroups)) {
  nodeTypeCounts[type] = ids.length;
}

const results = {
  scriptCompleted: true,
  directoryGroups,
  nodeTypeGroups,
  crossCategoryEdges,
  interGroupImports,
  intraGroupDensity,
  patternMatches,
  deploymentTopology,
  dataPipeline,
  docCoverage,
  dependencyDirection,
  fileStats: {
    totalFileNodes: fileNodes.length,
    filesPerGroup,
    nodeTypeCounts
  },
  fileFanIn: fanIn,
  fileFanOut: fanOut
};

try {
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
  console.log('Analysis complete. Results written to', outputPath);
} catch (e) {
  console.error('Failed to write output:', e.message);
  process.exit(1);
}
