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
import React from "react";

import {
  FilterableMultiSelect,
  Accordion,
  AccordionItem,
  Layer
} from "@carbon/react";

function Filters(props) {
  return (
    <div className="filters-container">
    <Accordion>
      <AccordionItem title="Filter by">
          <div className="filters">
            {
              Object.entries(props.items).map(([filterName, item]) => (
                <div key={filterName} className="filter">
                  <Layer level={0}>
                    <FilterableMultiSelect
                      size="sm"
                      label={item.label}
                      titleText={item.label}
                      useTitleInItem
                      disabled={!item.options.length}
                      selectedItems={item.selected || []}
                      items={item.options}
                      onChange={e => props.onFilterChange(filterName, e.selectedItems)}
                    />
                  </Layer>
                </div>
              ))
            }
          </div>
      </AccordionItem>
    </Accordion>
    </div>
  );
}

export default Filters;
