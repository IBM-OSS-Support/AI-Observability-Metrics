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
import { Button, Column, Grid } from "@carbon/react";
import CustomDataTable from "../../common/CustomDataTable";
import { Add, Edit } from "@carbon/icons-react";
import { policyData } from "../constants/constants";

const headers = [
  {
    key: "policyName",
    header: "Policy name",
    checked: true,
  },
  {
    key: "policyOn",
    header: "Based on",
    checked: true,
  },
  {
    key: "policy",
    header: "Policy criteria",
    checked: true,
  },
  {
    key: "edit",
    header: "",
    checked: true,
  },
];

const Policies = ({policies, onEditPolicy}) => {
  
  const [searchText, setSearchText] = useState("");
  
  function formatPolicyData(policies) {
    return policies.map((p, i) => {
      return {
        id: `${i}_${p.name}`,
        policyName: p.name,
        description: p.description,
        policyOn: `${p.policyOn}${p.unit ? ` (${p.unit})` : ''}`,
        policy: <div className="policy-item">
          {
            p.policy.map((plc, k, arr) => <Fragment key={`key_${k}`}>
              <span className="policy-value">{plc.value}</span>
              <span className="policy-operator">{'<--'}</span>
              <span className="policy-item-color" style={{backgroundColor: plc.color}}></span>
              <span className="policy-operator">{'-->'}</span>
            </Fragment>)
            
          }
        </div>,
        edit: <Button size="sm" renderIcon={Edit} iconDescription="Edit" kind="ghost" hasIconOnly title="Edit" onClick={() => onEditPolicy(p)}/>
      };
    })
  }

  return (
    <div className="policies-section">
      <Grid fullWidth className="policies-content">
        <Column max={16} xlg={16} lg={16} md={8} sm={4} >
            <CustomDataTable 
              headers={headers}
              rows={formatPolicyData(policies)}
              search={{
                searchText: searchText,
                persistent: true,
                placeholder: "Search for queries",
                onChange: setSearchText,
              }}
              primaryButton={{
                kind: "primary",
                renderIcon: Add,
                children: "Add Policy",
                onClick: () => {},
                disabled: true,
              }}
              emptyState={
                !policyData.length && {
                  type: false ? "NotFound" : "NoData",
                  title: "No policies yet.",
                  noDataSubtitle: "",
                }
              }
            />
        </Column>
      </Grid>
    </div>
  );
}

export default Policies;