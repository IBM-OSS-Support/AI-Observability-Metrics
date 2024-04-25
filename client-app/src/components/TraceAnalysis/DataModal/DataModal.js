/* ******************************************************************************
 * IBM Confidential
 *
 * OCO Source Materials
 *
 *  Copyright IBM Corp. 2024  All Rights Reserved.
 *
 * The source code for this program is not published or otherwise divested
 * of its trade secrets, irrespective of what has been deposited with
 * the U.S. Copyright Office.
 ****************************************************************************** */
import React from 'react';

// Components ----------------------------------------------------------------->
import {
  Modal,
  CodeSnippet
} from '@carbon/react';

const DataModal = (props) => {

  return (
    <Modal
      preventCloseOnClickOutside
      className="modal-with-overlay"
      size="md"
      open={props.open}
      onRequestClose={props.close}
      modalLabel="Data"
      modalHeading={props.name}
      onSecondarySubmit={props.close}
      primaryButtonText="Close"
      onRequestSubmit={props.close}
      selectorPrimaryFocus="#add-column-name"
    >
      <CodeSnippet type="multi" hideCopyButton wrapText>
        {
          JSON.stringify(props.data, undefined, 2)
        }
      </CodeSnippet>
    </Modal>
  );
};

export default DataModal;
