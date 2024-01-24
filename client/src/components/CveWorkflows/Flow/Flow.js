/* ******************************************************************************
 * IBM Confidential
 *
 * OCO Source Materials
 *
 *  Copyright IBM Corp. 2023  All Rights Reserved.
 *
 * The source code for this program is not published or otherwise divested
 * of its trade secrets, irrespective of what has been deposited with
 * the U.S. Copyright Office.
 ****************************************************************************** */
import React, { useEffect } from 'react';

import ReactFlow, {
  Background,
  ReactFlowProvider,
  useEdgesState,
  useNodesState
} from 'reactflow';

import 'reactflow/dist/style.css';

import { CVE_EDGES, CVE_NODES } from './constants';
import ComponentNode from '../ComponentNode';

const NODE_TYPES = {
  component: ComponentNode
};

const Flow = (props) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(CVE_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(CVE_EDGES);

  useEffect(() => {
    const newNodes = nodes.map(n => {
      const className = n.id === props.hoveredNode ? 'highlight' : '';
    
      return {
        ...n,
        data: {
          ...n.data,
          className
        }
      };
    });

    const newEdges = edges.map(e => {
      return {
        ...e,
        animated: props.hoveredNode ? e.id.includes(`${props.hoveredNode}-`) : false
      };
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [props.hoveredNode]);

  return (
    <div className="cve-flow">
      <ReactFlow
        panOnScroll
        panOnScrollMode="free"
        nodeTypes={NODE_TYPES}
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

const FlowProvider = (props) => (
  <ReactFlowProvider>
    <Flow {...props} />
  </ReactFlowProvider>
);

export default FlowProvider;
