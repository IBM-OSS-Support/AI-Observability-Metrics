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
import React, { Fragment, useEffect, useMemo, useState } from "react";
import PageContainer from "../../common/PageContainer";


import Policies from "../../Auditing/Policies/Policies";
import { Accordion, AccordionItem, Grid, Tile } from "@carbon/react";
import { policyData } from "../../Auditing/constants/constants";
import PolicyGraph from "../../Auditing/PolicyGraph/PolicyGraph";
import PolicyEditModal from "../../Auditing/PolicyEditModal/PolicyEditModal";
import DataClient, { dataClient } from "../../../dataClient/dataClient";
import { Column } from "@carbon/icons-react";
import { useActionData } from "react-router-dom";
import { useStoreContext } from "../../../store";
import { getAppData } from "../../../appData";


const MODALS = [{ component: PolicyEditModal, string: "PolicyEditModal" }];

const PolicyDiagram = () => {
  const [modal, setModal] = useState(false);
  const [policies, setPolicies] = useState([]);
  const { state } = useStoreContext();

  useEffect(() => {
    let newData = dataClient.fetchAppData(DataClient.params.AuditPolicy);
    if (!newData) {
      newData = policyData;
    }
    setPolicies(newData);
  }, []);

  const apps = useMemo(() => {
    if (state.status === "success") {
      const appData = getAppData();
      return appData
        .map(({ data: app }) => {
          const cpu = app.metrics
            .filter((m) => m.name === "process_cpu_usage")
            .reduce((sum, u) => sum + (u.gauge || 0), 0);
          const memory =
            app.metrics
              .filter(
                (m) =>
                  m.name === "process_memory" || m.name === "virtual_memory"
              )
              .reduce((sum, u) => sum + (u.gauge || 0), 0) / Math.pow(1024, 2);
          const token = app.metrics
            .filter((m) => m.name === "token_count")
            .reduce((sum, u) => sum + Number(u.counter || 0), 0);
          return {
            name: app["application-name"],
            cpu,
            memory,
            token,
          };
        })
        .flat();
    }

    return [];
  }, [state.status]);
  function closeModal() {
    setModal((prev) => ({
      ...prev,
      name: "",
    }));

    setTimeout(
      () =>
        setModal({
          name: "",
          props: {},
        }),
      300
    );
  }

  function savePolicy(newPolicy) {
    setPolicies((prev) => {
      const newPolicies = prev.map((p) =>
        p.id === newPolicy.id ? newPolicy : p
      );
      dataClient.saveAppData(newPolicies, DataClient.params.AuditPolicy);
      return newPolicies;
    });
    closeModal();
  }

  return (
    <>
      <PageContainer
      >
        <Policies
          policies={policies}
          onEditPolicy={(policy) =>
            setModal({
              name: "PolicyEditModal",
              props: {
                policy,
                onSave: savePolicy,
              },
            })
          }
        />
        <div className="policies-section">
          <Grid fullWidth className="policies-content">
            {policies.map((plc, i) => (
              <PolicyGraph key={`${i}_${plc.name}`} apps={apps} policy={plc} />
            ))}
          </Grid>
        </div>
      </PageContainer>
        

      {MODALS.map(({ component: Component, string: name }) => (
        <Fragment key={name}>
          <Component
            open={modal.name === name}
            close={closeModal}
            {...modal.props}
          />
        </Fragment>
      ))}
    </>
  );
};

export default PolicyDiagram;

