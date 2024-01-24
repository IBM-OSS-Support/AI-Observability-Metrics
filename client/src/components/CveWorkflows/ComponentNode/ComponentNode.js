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
import React from 'react';

// Components ----------------------------------------------------------------->
import {
  Button,
} from '@carbon/react';
import {
  Handle,
  Position
} from 'reactflow';

const ComponentNode = ({
  data: {
    className,
    onClick,
    component
  }
}) => {
  if (!component) {
    return null;
  }
 
  return (
    <div
      key={component.id}
      className={`
        component-node
        nodrag
        ${className || ''}
      `}
    >
      {component.isSource && (
        <Handle
          tabIndex={-1}
          id={`${component.id}~right`}
          className="right"
          type='source'
          position={Position.Right}
        />
      )}
      
      <Button
        title={component.name}
        className="node"
        onClick={event => {
          document?.activeElement?.blur();
          onClick(component.id);
        }}
      >
        <div className="content">
          <h6 className="primary">
            {component.name}
          </h6>
          <div className="secondary">
            {component.subText}
          </div>
        </div>
      </Button>

      {component.isTarget && (
        <Handle
          tabIndex={-1}
          id={`${component.id}~left`}
          className="left"
          type='target'
          position={Position.Left}
        />
      )}
    </div>
  );
};

export default ComponentNode;
