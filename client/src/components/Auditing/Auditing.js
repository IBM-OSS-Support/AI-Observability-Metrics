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
import React, { Fragment, useState } from "react";
import PageContainer from "../common/PageContainer";

import Transactions from "../Traces/Transactions/Transactions";
import Policies from "./Policies/Policies";
import { Column, Grid, Tile } from "@carbon/react";
import { policyData } from "./constants/constants";
import PolicyGraph from "./PolicyGraph/PolicyGraph";
import PolicyEditModal from "./PolicyEditModal/PolicyEditModal";

const MODALS = [
  { component: PolicyEditModal, string: 'PolicyEditModal' },
];

const Auditing = () => {
  const [modal, setModal] = useState(false);
  const [policies, setPolicies] = useState(policyData);

  function closeModal() {
    setModal(prev => ({
      ...prev,
      name: ''
    }));
  
    setTimeout(() =>
      setModal({
        name: '',
        props: {}
      })
    , 300);
  };

	return (
    <>
      <PageContainer
        className="auditing-container"
        header={{
          title: "Auditing",
          subtitle: "Policies",
        }}
      >
        <Policies
          policies={policies}
          onEditPolicy={(policy) => setModal({
                  name: 'PolicyEditModal',
                  props: {
                    policy,
                    onSave: (newPolicy) => {
                      setPolicies(prev => prev.map(p => p.id === newPolicy.id ? newPolicy : p))
                      closeModal()
                    },
                  }
                })}/>
        <div className="policies-section">
          <Grid fullWidth className="policies-content">
            {
              policies.map((plc, i) => (
                <PolicyGraph key={`${i}_${plc.name}`} policy={plc}/>
              ))
            }
          </Grid>
        </div>
        <Transactions
          showColors
          component='audit'
        />
      </PageContainer>

      {MODALS.map(({ component: Component, string: name }) =>
        <Fragment key={name}>
          <Component
            open={modal.name === name}
            close={closeModal}
            {...modal.props}
          />
        </Fragment>
      )}
    </>
	);
}

export default Auditing;