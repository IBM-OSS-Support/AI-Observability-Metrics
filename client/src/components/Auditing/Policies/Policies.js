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
import { Column, Grid, Tag, Tile } from "@carbon/react";
import { MeterChart } from "@carbon/charts-react";
import { UserAvatar } from "@carbon/icons-react";

const data =[
  {
    group: 'Token',
    value: 81
  }
]
const data2 =[
  {
    group: 'CPU',
    value: 56
  }
]
const data3 =[
  {
    group: 'Memory',
    value: 40
  }
]

const options = {
  theme: 'g90',
  title: 'App 1',
  legend: {
    enabled: false
  },
  toolbar: {
    enabled: false,
  },
  color: {
    gradient: {
        colors: ['red', 'green', 'yellow'],
        enabled: true,
    },
    // pairing: {
    //     numberOfVariants: 1,
    //     option: 1,
    // },
    // scale: 1,
  },
  meter: {
    peak: 40,
    status: {
      // showLabels: true,
      // title: {
      //   percentageIndicator: {
      //     enabled: true
      //   }
      // },
      ranges: [
        {
          range: [
            0,
            50
          ],
          status: 'success'
        },
        {
          range: [
            50,
            60
          ],
          status: 'warning'
        },
        {
          range: [
            60,
            100
          ],
          status: 'danger'
        }
      ]
    }
  },
  height: '100px'
}

const Policies = () => {
  return (
    <div className="policies-section">
      <Grid fullWidth className="policies-content">
        <Column max={4} xlg={4} lg={4} md={2} sm={2} span={4} >
          <Tile title="Token consumption" className="policy-tile">
            <h5>Token consumption</h5>
            <MeterChart data={data} options={options} />
          </Tile>
        </Column>
        <Column max={4} xlg={4} lg={4} md={2} sm={2} span={4} >
          <Tile title="CPU consumption" className="policy-tile">
            <h5>CPU consumption</h5>
            <MeterChart data={data2} options={options} />
          </Tile>
        </Column>
        <Column max={4} xlg={4} lg={4} md={2} sm={2} span={4} >
          <Tile title="Memory consumption" className="policy-tile">
            <h5>Memory consumption</h5>
            <MeterChart data={data3} options={options} />
          </Tile>
        </Column>
        <Column max={4} xlg={4} lg={4} md={2} sm={2} span={4} >
          <Tile title="Blocked users" className="policy-tile">
            <h5>Blocked users</h5>
            <Tag renderIcon={UserAvatar} >
              Vikram
            </Tag>
          </Tile>
        </Column>
      </Grid>
    </div>
  );
}

export default Policies;