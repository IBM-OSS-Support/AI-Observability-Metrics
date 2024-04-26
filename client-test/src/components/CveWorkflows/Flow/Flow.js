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
      const isHovered = !!props.hoveredNode;
      let className = n.id === props.hoveredNode ? 'highlight' : '';

      if (props.selectedNode === n.id) {
        className = `${className} selected`;
      }
    
      return {
        ...n,
        data: {
          ...n.data,
          className,
          onClick: props.onNodeClick
        },
        style: {
          ...n.style,
          opacity: className || !isHovered ? 1 : 0.5
        }
      };
    });

    const newEdges = edges.map(e => {
      const isHovered = !!props.hoveredNode;
      const isHighlighted = props.hoveredNode ? e.id.includes(`${props.hoveredNode}-`) : false;
      return {
        ...e,
        animated: isHighlighted,
        style: {
          ...e.style,
          opacity: isHighlighted || !isHovered ? 1 : 0.5
        }
      };
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [props.hoveredNode, props.selectedNode]);

  return (
    <div className="cve-flow">
      <ReactFlow
        zoomOnScroll={false}
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
