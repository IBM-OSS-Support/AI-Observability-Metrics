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
import React, { Fragment, useMemo, useState } from "react";
import PageContainer from "../common/PageContainer";

import Transactions from "../Traces/Transactions/Transactions";
import Policies from "./Policies/Policies";
import { Grid } from "@carbon/react";
import { policyData } from "./constants/constants";
import PolicyGraph from "./PolicyGraph/PolicyGraph";
import PolicyEditModal from "./PolicyEditModal/PolicyEditModal";
import { useStoreContext } from "../../store";
import { getAppData } from "../../appData";

const MODALS = [
  { component: PolicyEditModal, string: 'PolicyEditModal' },
];

const Auditing = () => {
  const [modal, setModal] = useState(false);
  const [policies, setPolicies] = useState(policyData);
  const { state } = useStoreContext()

  const apps = useMemo(() => {
    if (state.status === 'success') {
      const appData = getAppData();

      return appData
        .map(({data: app}) => {
        const cpu = app.metrics.filter(m => m.name === 'process_cpu_usage').reduce((sum, u) => sum + (u.gauge || 0), 0);
        const memory = app.metrics.filter(m => m.name === 'process_memory' || m.name === 'virtual_memory').reduce((sum, u) => sum + (u.gauge || 0), 0) / Math.pow(1024, 2);
        const token = app.metrics.filter(m => m.name === 'token_count').reduce((sum, u) => sum + Number(u.counter || 0), 0);
        return {
          name: app['application-name'],
          cpu,
          memory,
          token
        }
      })
        .flat();
    }

    return [];
  }, [state.status])

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
                <PolicyGraph
                  key={`${i}_${plc.name}`}
                  apps={apps}
                  policy={plc}
                />
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