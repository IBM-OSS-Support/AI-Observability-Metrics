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
import React, { useEffect, useState } from 'react';

// Components ----------------------------------------------------------------->
import {
  Modal,
  TextInput,
  Dropdown,
  NumberInput,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  Layer
} from '@carbon/react';

import {
  cyan60,
  yellow30,
  red50,
  teal30,
  teal50,
  teal70,
  green30,
  orange30,
} from '@carbon/colors';

const colorOptions = [
  {
    id: cyan60,
    text: cyan60,
    value: cyan60
  },
  {
    id: teal30,
    text: teal30,
    value: teal30
  },
  {
    id: teal50,
    text: teal50,
    value: teal50
  },
  {
    id: teal70,
    text: teal70,
    value: teal70
  },
  {
    id: green30,
    text: green30,
    value: green30
  },
  {
    id: orange30,
    text: orange30,
    value: orange30
  },
  {
    id: yellow30,
    text: yellow30,
    value: yellow30
  },
  {
    id: red50,
    text: red50,
    value: red50
  },
]

const PolicyEditModal = (props) => {

  const [policy, setPolicy] = useState({})

  useEffect(() => {
    setPolicy(props.policy || {});
  }, [props.policy]);

  function save() {
    props.onSave(policy);
  }

  return (
    <Modal
      preventCloseOnClickOutside
      className="policy-edit-modal"
      size="sm"
      open={props.open}
      onRequestClose={props.close}
      modalLabel={`Edit ${policy?.policyOn} policy`}
      modalHeading={props.name}
      onSecondarySubmit={props.close}
      secondaryButtonText="Close"
      primaryButtonText="Save"
      onRequestSubmit={save}
      selectorPrimaryFocus="#add-column-name"
    >
      <TextInput
        id="Name"
        title="Name"
        labelText="Name"
        value={policy?.name || ''}
        onChange={(e) => setPolicy(prev => ({
          ...prev,
          name: e.target.value
        }))}
      />
      <Layer className="criteria-list">
        <label className="cds--label">
          Criteria list
        </label>
        <Table size="sm">
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Low limit {policy?.unit ? `(${policy?.unit})` : ''}</TableHeader>
              <TableHeader>Color</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              policy?.policy?.map(criteria =>
                <TableRow key={criteria.name}>
                  <TableCell>{criteria.name}</TableCell>
                  <TableCell>
                    <NumberInput
                      id={criteria.name}
                      title={criteria.name}
                      disableWheel
                      hideSteppers
                      // labelText={criteria.name}
                      value={criteria.value}
                      className="criteria-value"
                      onChange={(e) => setPolicy(prev => ({
                        ...prev,
                        policy: prev.policy.map(p => p.name === criteria.name ? {...p, value: Number(e.target.value)} : p)
                      }))}
                    />
                  </TableCell>
                  <TableCell>
                    <Dropdown
                      id={`inline-${criteria.name}`}
                      titleText="Select Color"
                      initialSelectedItem={criteria.color}
                      hideLabel
                      label="Select Color"
                      // type="inline"
                      items={colorOptions}
                      renderSelectedItem={item =>
                        <div className="option-color" style={{ backgroundColor: item.value || item }}></div>
                      }
                      itemToElement={item => 
                        <div className="option-color" style={{ backgroundColor: item.value }}></div>
                      }
                      onChange={({selectedItem}) => setPolicy(prev => ({
                        ...prev,
                        policy: prev.policy.map(p => p.name === criteria.name ? {...p, color: selectedItem.value} : p)
                      }))}
                    />
                  </TableCell>
                </TableRow>)
            }
          </TableBody>
        </Table>
      </Layer>

    </Modal>
  );
};

export default PolicyEditModal;
