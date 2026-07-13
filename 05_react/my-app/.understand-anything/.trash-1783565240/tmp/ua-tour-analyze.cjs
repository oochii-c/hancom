const fs = require('fs');

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error('Usage: node ua-tour-analyze.js <input.json> <output.json>');
  process.exit(1);
}

let input;
try {
  input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
} catch (e) {
  console.error('Failed to read input:', e.message);
  process.exit(1);
}

const { nodes, edges, layers } = input;

// A. Fan-In Ranking
const fanInMap = {};
nodes.forEach(n => { fanInMap[n.id] = 0; });
edges.forEach(e => {
  if (fanInMap[e.target] !== undefined) fanInMap[e.target]++;
});
const fanInRanking = Object.entries(fanInMap)
  .map(([id, fanIn]) => {
    const node = nodes.find(n => n.id === id);
    return { id, fanIn, name: node ? node.name : id };
  })
  .sort((a, b) => b.fanIn - a.fanIn)
  .slice(0, 20);

// B. Fan-Out Ranking
const fanOutMap = {};
nodes.forEach(n => { fanOutMap[n.id] = 0; });
edges.forEach(e => {
  if (fanOutMap[e.source] !== undefined) fanOutMap[e.source]++;
});
const fanOutRanking = Object.entries(fanOutMap)
  .map(([id, fanOut]) => {
    const node = nodes.find(n => n.id === id);
    return { id, fanOut, name: node ? node.name : id };
  })
  .sort((a, b) => b.fanOut - a.fanOut)
  .slice(0, 20);

// C. Entry Point Candidates
const entryFileNames = [
  'index.ts','index.js','main.ts','main.js','app.ts','app.js',
  'server.ts','server.js','mod.rs','main.go','main.py','main.rs',
  'manage.py','app.py','wsgi.py','asgi.py','run.py','__main__.py',
  'Application.java','Main.java','Program.cs','config.ru','index.php',
  'App.swift','Application.kt','main.cpp','main.c',
  'main.jsx','index.jsx','app.jsx'
];

const totalNodes = nodes.length;
const fanOutValues = Object.values(fanOutMap).sort((a, b) => a - b);
const fanInValues = Object.values(fanInMap).sort((a, b) => a - b);
const top10PctFanOut = fanOutValues[Math.floor(fanOutValues.length * 0.9)] || 0;
const bottom25PctFanIn = fanInValues[Math.floor(fanInValues.length * 0.25)] || 0;

const candidateScores = nodes.map(node => {
  let score = 0;

  if (node.type === 'document') {
    if (node.name === 'README.md' && (node.filePath === 'README.md' || node.filePath.split('/').length === 1)) {
      score += 5;
    } else if (node.name.endsWith('.md') && node.filePath.split('/').length === 1) {
      score += 2;
    }
  } else {
    const baseName = node.name;
    if (entryFileNames.includes(baseName)) score += 3;

    const depth = node.filePath ? node.filePath.split('/').length : 99;
    if (depth <= 2) score += 1;

    if (fanOutMap[node.id] >= top10PctFanOut) score += 1;
    if (fanInMap[node.id] <= bottom25PctFanIn) score += 1;
  }

  return { id: node.id, score, name: node.name, summary: node.summary || '' };
});

const entryPointCandidates = candidateScores
  .sort((a, b) => b.score - a.score)
  .slice(0, 5);

// D. BFS Traversal — start from top code entry point (skip documents)
const topCodeEntry = entryPointCandidates.find(c => {
  const node = nodes.find(n => n.id === c.id);
  return node && node.type !== 'document';
});

const bfsResult = { startNode: null, order: [], depthMap: {}, byDepth: {} };

if (topCodeEntry) {
  const startId = topCodeEntry.id;
  bfsResult.startNode = startId;

  const bfsEdgeTypes = new Set(['imports', 'calls']);
  const adjacency = {};
  nodes.forEach(n => { adjacency[n.id] = []; });
  edges.forEach(e => {
    if (bfsEdgeTypes.has(e.type) && adjacency[e.source] !== undefined) {
      adjacency[e.source].push(e.target);
    }
  });

  const visited = new Set();
  const queue = [{ id: startId, depth: 0 }];
  visited.add(startId);

  while (queue.length > 0) {
    const { id, depth } = queue.shift();
    bfsResult.order.push(id);
    bfsResult.depthMap[id] = depth;
    if (!bfsResult.byDepth[depth]) bfsResult.byDepth[depth] = [];
    bfsResult.byDepth[depth].push(id);

    for (const neighbor of (adjacency[id] || [])) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ id: neighbor, depth: depth + 1 });
      }
    }
  }
}

// E. Non-Code File Inventory
const nonCodeFiles = { documentation: [], infrastructure: [], data: [], config: [] };
const infraTypes = new Set(['service', 'pipeline', 'resource']);
const dataTypes = new Set(['table', 'schema', 'endpoint']);

nodes.forEach(node => {
  const entry = { id: node.id, name: node.name, type: node.type, summary: node.summary || '' };
  if (node.type === 'document') {
    nonCodeFiles.documentation.push(entry);
  } else if (infraTypes.has(node.type)) {
    nonCodeFiles.infrastructure.push(entry);
  } else if (dataTypes.has(node.type)) {
    nonCodeFiles.data.push(entry);
  } else if (node.type === 'config') {
    nonCodeFiles.config.push(entry);
  }
});

// F. Tightly Coupled Clusters
const edgeSet = new Set(edges.map(e => `${e.source}||${e.target}`));
const clusters = [];

// Find bidirectional pairs
const bidirectionalPairs = [];
edges.forEach(e => {
  if (edgeSet.has(`${e.target}||${e.source}`) && e.source < e.target) {
    bidirectionalPairs.push([e.source, e.target]);
  }
});

// Build clusters from pairs, expand by shared connections
const clusterMap = new Map();
bidirectionalPairs.forEach(([a, b]) => {
  let merged = false;
  for (const [key, cluster] of clusterMap.entries()) {
    if (cluster.nodes.has(a) || cluster.nodes.has(b)) {
      cluster.nodes.add(a);
      cluster.nodes.add(b);
      merged = true;
      break;
    }
  }
  if (!merged) {
    clusterMap.set(`${a}::${b}`, { nodes: new Set([a, b]) });
  }
});

// Also find nodes connecting to 2+ cluster members
clusterMap.forEach((cluster) => {
  nodes.forEach(node => {
    if (cluster.nodes.has(node.id)) return;
    const connections = [...cluster.nodes].filter(member =>
      edgeSet.has(`${node.id}||${member}`) || edgeSet.has(`${member}||${node.id}`)
    );
    if (connections.length >= 2) cluster.nodes.add(node.id);
  });
});

clusterMap.forEach((cluster) => {
  if (cluster.nodes.size >= 2) {
    const nodeList = [...cluster.nodes];
    let edgeCount = 0;
    nodeList.forEach(a => {
      nodeList.forEach(b => {
        if (a !== b && edgeSet.has(`${a}||${b}`)) edgeCount++;
      });
    });
    clusters.push({ nodes: nodeList, edgeCount });
  }
});

clusters.sort((a, b) => b.edgeCount - a.edgeCount);
const topClusters = clusters.slice(0, 10);

// G. Layer List
const layerInfo = {
  count: layers.length,
  list: layers.map(l => ({ id: l.id, name: l.name, description: l.description }))
};

// H. Node Summary Index
const nodeSummaryIndex = {};
nodes.forEach(node => {
  nodeSummaryIndex[node.id] = {
    name: node.name,
    type: node.type,
    summary: node.summary || ''
  };
});

const result = {
  scriptCompleted: true,
  entryPointCandidates,
  fanInRanking,
  fanOutRanking,
  bfsTraversal: bfsResult,
  nonCodeFiles,
  clusters: topClusters,
  layers: layerInfo,
  nodeSummaryIndex,
  totalNodes: nodes.length,
  totalEdges: edges.length
};

try {
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
  console.log('Analysis complete. Results written to', outputPath);
  process.exit(0);
} catch (e) {
  console.error('Failed to write output:', e.message);
  process.exit(1);
}
