// /* ******************************************************************************
//  * IBM Confidential
//  *
//  * OCO Source Materials
//  *
//  *  Copyright IBM Corp. 2024  All Rights Reserved.
//  *
//  * The source code for this program is not published or otherwise divested
//  * of its trade secrets, irrespective of what has been deposited with
//  * the U.S. Copyright Office.
//  ****************************************************************************** */
// import React, { Fragment, useEffect, useMemo, useState } from "react";
// import PageContainer from "../common/PageContainer";

// import Transactions from "../Traces/Transactions/Transactions";
// import Policies from "./Policies/Policies";
// import { Accordion, AccordionItem, Grid, Tile } from "@carbon/react";
// import { policyData } from "./constants/constants";
// import PolicyGraph from "./PolicyGraph/PolicyGraph";
// import PolicyEditModal from "./PolicyEditModal/PolicyEditModal";
// import { useStoreContext } from "../../store";
// import { getAppData } from "../../appData";
// import DataClient, { dataClient } from "../../dataClient/dataClient";
// import Filter from "../common/HeaderFilter/HeaderFilter";
// import AdoptionRate from "./AdoptionRate/AdoptionRate";
// import { Column } from "@carbon/icons-react";
// import ErrorRate from "../Performance/ErrorRate/ErrorRate";
// import AbandonmentRate from "../Performance/AbandonmentRate/AbandonmentRate";

// const MODALS = [{ component: PolicyEditModal, string: "PolicyEditModal" }];

// const Auditing = () => {
//   const [modal, setModal] = useState(false);
//   const [policies, setPolicies] = useState([]);
//   const { state } = useStoreContext();

//   useEffect(() => {
//     let newData = dataClient.fetchAppData(DataClient.params.AuditPolicy);
//     if (!newData) {
//       newData = policyData;
//     }
//     setPolicies(newData);
//   }, []);

//   const apps = useMemo(() => {
//     if (state.status === "success") {
//       const appData = getAppData();
// console.log("1.appData", appData);
//       return appData
//         .map(({ data: app }) => {
//           const cpu = app.metrics
//             .filter((m) => m.name === "process_cpu_usage")
//             .reduce((sum, u) => sum + (u.gauge || 0), 0);
//           const memory =
//             app.metrics
//               .filter(
//                 (m) =>
//                   m.name === "process_memory" || m.name === "virtual_memory"
//               )
//               .reduce((sum, u) => sum + (u.gauge || 0), 0) / Math.pow(1024, 2);
//           const token = app.metrics
//             .filter((m) => m.name === "token_count")
//             .reduce((sum, u) => sum + Number(u.counter || 0), 0);
//           return {
//             name: app["application-name"],
//             cpu,
//             memory,
//             token,
//           };
//         })
//         .flat();
//     }

//     return [];
//   }, [state.status]);

//   function closeModal() {
//     setModal((prev) => ({
//       ...prev,
//       name: "",
//     }));

//     setTimeout(
//       () =>
//         setModal({
//           name: "",
//           props: {},
//         }),
//       300
//     );
//   }

//   function savePolicy(newPolicy) {
//     setPolicies((prev) => {
//       const newPolicies = prev.map((p) =>
//         p.id === newPolicy.id ? newPolicy : p
//       );
//       dataClient.saveAppData(newPolicies, DataClient.params.AuditPolicy);
//       return newPolicies;
//     });
//     closeModal();
//   }

//   return (
//     <>
//       <PageContainer
//         className="auditing-container"
//         header={{
//           title: "Auditing",
//           subtitle: "Policies",
//         }}
//       >
//         <Filter />
//         <ErrorRate />
//         <Grid fullWidth className="policies-content">
//           <Column
//             max={8}
//             xlg={8}
//             lg={8}
//             md={4}
//             sm={4}
//             className="content-tile"
//           >
//             <Tile className="chart-tile">
//               <ErrorRate />
//             </Tile>
//           </Column>
// 		  <Column
//             max={8}
//             xlg={8}
//             lg={8}
//             md={4}
//             sm={4}
//             className="content-tile"
//           >
//             <Tile className="chart-tile">
//             	<AbandonmentRate />
//             </Tile>
//           </Column>
//         </Grid>
//         <Policies
//           policies={policies}
//           onEditPolicy={(policy) =>
//             setModal({
//               name: "PolicyEditModal",
//               props: {
//                 policy,
//                 onSave: savePolicy,
//               },
//             })
//           }
//         />
//         {/* <div className="policies-section">
//           <Grid fullWidth className="policies-content">
//             {policies.map((plc, i) => (
//               <PolicyGraph key={`${i}_${plc.name}`} apps={apps} policy={plc} />
//             ))}
//           </Grid>
//         </div>
//         <Transactions showColors component="audit" />
//         <Transactions showColors component="safetyscore" />
//             <AdoptionRate /> */}
//       </PageContainer>
        

//       {MODALS.map(({ component: Component, string: name }) => (
//         <Fragment key={name}>
//           <Component
//             open={modal.name === name}
//             close={closeModal}
//             {...modal.props}
//           />
//         </Fragment>
//       ))}
//     </>
//   );
// };

// export default Auditing;

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
import React, { useEffect } from "react";
import { Accordion, AccordionItem, Column, Content, Dropdown, Grid, Tile } from "@carbon/react";

// Globals -------------------------------------------------------------------->

import PageContainer from "../common/PageContainer/PageContainer";
import ErrorRate from "../Performance/ErrorRate/ErrorRate";
import AbandonmentRate from "../Performance/AbandonmentRate/AbandonmentRate";
import Filter from "../common/HeaderFilter/HeaderFilter";
import AdoptionRate from "./AdoptionRate/AdoptionRate";
import Transactions from "../Traces/Transactions";

const Auditing = () => {
  return (
    <PageContainer
    className="auditing-container"
            header={{
              title: "Auditing",
              subtitle: "Policies",
            }}
    >
      <div className="home-container">
		<Filter/>
        <Grid fullWidth narrow id="body" className="page-content body">
          <Column max={8} xlg={8} lg={8} md={4} sm={4} className="content-tile">
          <Tile className="chart-tile">
            <ErrorRate />
            </Tile>
          </Column>
          <Column max={8} xlg={8} lg={8} md={4} sm={4} className="content-tile">
            <Tile className="chart-tile">
            <AdoptionRate />
            </Tile>
          </Column>
          <Column max={16} xlg={16} lg={16} md={4} sm={4} className="content-tile">
            <Tile className="chart-tile">
              <AbandonmentRate />
            </Tile>
          </Column>
          <Column max={16} xlg={16} lg={16} md={4} sm={4} className="content-tile">
            <Tile className="chart-tile">
            <Transactions showColors component="audit" />
            </Tile>
          </Column>
          <Column max={16} xlg={16} lg={16} md={4} sm={4} className="content-tile">
            <Tile className="chart-tile">
            <Transactions showColors component="safetyscore" />
            </Tile>
          </Column>
        </Grid>
      </div>
    </PageContainer>
  );
};

export default Auditing;
