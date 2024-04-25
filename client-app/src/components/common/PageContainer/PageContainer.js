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
import React from "react";

// Components ----------------------------------------------------------------->
import { Content } from "@carbon/react";
import { PageHeader } from "@carbon/ibm-products";

const PageContainer = ({
  className,

  // See PageHeader for prop structure
  header,

  children,
}) => (
  <Content className={`page-container ${className}`}>
    {!!header && (
      <PageHeader
        collapseHeader={false}
        collapseTitle={false}
        fullWidthGrid
        {...header}
      />
    )}
    <div className="body">{children}</div>
  </Content>
);

export default PageContainer;
