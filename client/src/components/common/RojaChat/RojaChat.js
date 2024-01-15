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
  Button,
  TextInput,
} from '@carbon/react';
import {
  Send
} from '@carbon/react/icons';

const RojaChat = () => {

  return (
    <div className="chat-container">
      <div className="chat-box">
        <h5 className="title">Talk to Roja</h5>
        <div className="input-container">

          <TextInput placeholder="What do you want to ask?"></TextInput>
          <div className="button-wrapper">

            <Button className="button-go" size="sm" hasIconOnly renderIcon={Send} kind="ghost" />
          </div>
        </div>
        <label className="chat-info">
          Roja may generate incorrect information. <br />
          Verify important information.
        </label>
      </div>
    </div>
  );
};

export default RojaChat;
