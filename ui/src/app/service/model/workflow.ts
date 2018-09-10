export interface Workflow {
  roles: Array<string>;
  nodes: Array<Node>;
  edges: Array<Edge>;
}

export interface Node {
  id: string,
  privileges: Array<Privilege>
}

export interface Edge {
  role: string,
  source: string,
  target: string,
  label: string
}

export interface Privilege {
  role: string,
  privilege: Array<string>
}